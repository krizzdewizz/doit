import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';
import * as stream from 'stream';
import { Observable, Subscriber, Subject } from 'rxjs/Rx';

import { Task, DoIt, TaskLog } from './model';
import { Varss } from './vars';

const allTasksSource = new Subject<Taskk[]>();
export const allTasksChanged$ = allTasksSource.asObservable();

const taskSource = new Subject<Task>();
export const taskChanged$ = taskSource.asObservable();

const taskLogSource = new Subject<TaskLog>();
export const taskLogChanged$ = taskLogSource.asObservable();

class ToTaskLogChanged extends stream.Writable {

    constructor(private taskId: number, private stderr: boolean) {
        super();
    }

    _write(chunk, _encoding, done) {
        taskLogSource.next({ taskId: this.taskId, stderr: this.stderr, chunk: String(chunk) });
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
            running: false
        });
    }

    private process: child_process.ChildProcess;

    constructor(public task: Task) {
    }

    startStop() {
        const task = this.task;
        if (this.process) {
            taskLogSource.next({ taskId: task.id, chunk: `doit: task '${task.title}' termination requested by user.` });
            this.process.kill();
            return;
        }
        const p = child_process.spawn(task.command, task.args, { cwd: task.cwd });
        p.stdout.setEncoding('utf8');
        p.stdout.pipe(new ToTaskLogChanged(task.id, false));
        p.stderr.pipe(new ToTaskLogChanged(task.id, true));
        p.on('exit', () => {
            this.process = undefined;
            taskSource.next(this.toJSON());
            taskLogSource.next({ taskId: task.id, chunk: `doit: task '${task.title}' exited.` });
        });
        p.on('error', err => {
            this.process = undefined;
            taskSource.next(this.toJSON());
            taskLogSource.next({ taskId: task.id, chunk: `doit: task '${task.title}' has reported an error: ${err}.` });
        });
        this.process = p;
        taskSource.next(this.toJSON());
        taskLogSource.next({ taskId: task.id, chunk: `doit: task '${task.title}' started.\n` });
    }

    get running(): boolean {
        return Boolean(this.process);
    }

    toJSON(): Task {
        return { ...this.task, running: this.running };
    }
}

export const TASKS_FILE = path.join(__dirname, 'tasks.json');

let ALL_TASKS: Taskk[];

export function get(taskId: number): Taskk {
    return ALL_TASKS.find(it => it.task.id === taskId);
}

export function setupWatcher() {
    fs.watch(TASKS_FILE, e => {
        if (e === 'change') {
            const stat = fs.lstatSync(TASKS_FILE);
            if (stat.size > 0) {
                if (ALL_TASKS) {
                    ALL_TASKS
                        .filter(task => task.running)
                        .forEach(task => task.startStop());
                    ALL_TASKS = undefined;
                }
                load().subscribe(() => allTasksSource.next(ALL_TASKS));
            }
        }
    });
}

export function load(): Observable<Taskk[]> {
    if (ALL_TASKS) {
        return Observable.of(ALL_TASKS);
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
                ALL_TASKS = doit.tasks.map((task, index) => Taskk.create(index, task, vars));
                subscriber.next(ALL_TASKS);
            } catch (err) {
                console.error(`Error while parsing '${TASKS_FILE}': ${err}`);
            }
        });
    });
}