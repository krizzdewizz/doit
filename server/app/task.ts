import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';
import * as stream from 'stream';
import { Observable, Subscriber, Subject } from 'rxjs/Rx';

import { Task, DoIt, TaskLog, LogType } from './model';
import { Varss } from './vars';
import { notify } from './notify';

const allTasksSource = new Subject<Taskk[]>();
export const allTasksChanged$ = allTasksSource.asObservable();

const taskSource = new Subject<Task>();
export const taskChanged$ = taskSource.asObservable();

const taskLogSource = new Subject<TaskLog>();
export const taskLogChanged$ = taskLogSource.asObservable();

let allTasks: Taskk[];

function autoStart() {
    allTasks.filter(it => it.task.autoStart).forEach(it => it.startStop());
}

class ToTaskLogChanged extends stream.Writable {

    constructor(private taskId: number, private logType: (chunk: string) => LogType, private onChunk: (chunk: string) => void) {
        super();
    }

    _write(chunk, _encoding, done) {
        const c = String(chunk);
        taskLogSource.next({ taskId: this.taskId, type: this.logType(c), chunk: c });
        this.onChunk(c);
        done();
    }
}

export class Taskk {

    static create(id: number, task: Task, vars: Varss): Taskk {
        return new Taskk({
            id,
            title: vars.replace(task.title),
            command: vars.replace(task.command),
            args: (task.args || []).map(it => vars.replace(it)),
            cwd: vars.replace(task.cwd),
            problemPattern: vars.replace(task.problemPattern),
            autoStart: task.autoStart
        });
    }

    private process: child_process.ChildProcess;
    private problemRegExp: RegExp;

    constructor(public task: Task) {
        this.problemRegExp = task.problemPattern ? new RegExp(task.problemPattern, 'm') : undefined;
    }

    private notifyProblem = (chunk: string) => {
        const match = chunk.match(this.problemRegExp);
        if (match) {
            notify(this.task.id, this.task.title, match[1] || match[0]);
        }
    }

    private logType(def: LogType): (chunk: string) => LogType {
        return (chunk: string) => {
            if (this.problemRegExp) {
                const match = chunk.match(this.problemRegExp);
                return match ? LogType.STDERR : def;
            }
            return def;
        };
    }

    startStop() {
        const task = this.task;
        if (this.process) {
            taskLogSource.next({ taskId: task.id, type: LogType.DOIT, chunk: `task '${task.title}' termination requested by user.` });
            this.process.kill();
            return;
        }
        const notifyProblem = this.problemRegExp ? this.notifyProblem : () => { /* nothing */ };
        const p = child_process.spawn(task.command, task.args, { cwd: task.cwd });
        p.stdout.setEncoding('utf8');

        p.stdout.pipe(new ToTaskLogChanged(task.id, this.logType(LogType.STDOUT), notifyProblem));
        p.stderr.pipe(new ToTaskLogChanged(task.id, this.logType(LogType.STDERR), notifyProblem));
        p.on('exit', code => {
            const withError = typeof code !== 'number' || code === 0 ? '' : ` with error (${code})`;
            this.process = undefined;
            taskSource.next(this.toJSON());
            taskLogSource.next({ taskId: task.id, type: LogType.DOIT, chunk: `task '${task.title}' exited${withError}.` });
            if (withError) {
                notify(this.task.id, this.task.title, `Task exited${withError}.`);
            }
        });
        p.on('error', err => {
            this.process = undefined;
            taskSource.next(this.toJSON());
            taskLogSource.next({ taskId: task.id, type: LogType.DOIT, chunk: `task '${task.title}' has reported an error: ${err}.` });
        });
        this.process = p;
        taskSource.next(this.toJSON());
        taskLogSource.next({ taskId: task.id, type: LogType.DOIT, chunk: `task '${task.title}' started.` });
    }

    get running(): boolean {
        return Boolean(this.process);
    }

    toJSON(): Task {
        return { ...this.task, running: this.running };
    }
}

export const TASKS_FILE = path.join(__dirname, 'tasks.json');

export function get(taskId: number): Taskk {
    return allTasks.find(it => it.task.id === taskId);
}

export function setupWatcher() {
    fs.watch(TASKS_FILE, e => {
        if (e === 'change') {
            const stat = fs.lstatSync(TASKS_FILE);
            if (stat.size > 0) {
                if (allTasks) {
                    allTasks.filter(task => task.running).forEach(task => task.startStop());
                    allTasks = undefined;
                }
                load().subscribe(() => allTasksSource.next(allTasks));
            }
        }
    });
}

export function load(): Observable<Taskk[]> {
    if (allTasks) {
        return Observable.of(allTasks);
    }
    return Observable.create((subscriber: Subscriber<Taskk[]>) => {
        fs.readFile(TASKS_FILE, (err, content) => {
            if (err) {
                subscriber.error(err);
                return;
            }
            try {
                const doit: DoIt = JSON.parse(String(content));
                const vars = new Varss(doit.vars);
                allTasks = doit.tasks.map((task, index) => Taskk.create(index, task, vars));
                subscriber.next(allTasks);
                autoStart();
            } catch (err) {
                console.error(`Error while parsing '${TASKS_FILE}': ${err}`);
            }
        });
    });
}