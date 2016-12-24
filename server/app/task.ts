import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';
import * as stream from 'stream';
import { Observable, Subscriber, Subject } from 'rxjs/Rx';

import { Task, TaskLog } from './model';

function replaceVars(s: string): string {
    const npmLocal = process.env.NPM_LOCAL;
    return npmLocal ? s.replace(/\$NPM_LOCAL/g, npmLocal) : s;
}

const allTasksSource = new Subject<TaskMap>();
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

    private process: child_process.ChildProcess;

    constructor(public task: Task) {
    }

    startStop() {
        const task = this.task;
        if (this.process) {
            taskLogSource.next({ taskId: task.id, chunk: `task '${task.title}' killed by user.` });
            this.process.kill();
            return;
        }
        const p = child_process.spawn(replaceVars(task.command), task.args.map(it => replaceVars(it)), { cwd: replaceVars(task.cwd) });
        p.stdout.setEncoding('utf8');
        p.stdout.pipe(new ToTaskLogChanged(task.id, false));
        p.stderr.pipe(new ToTaskLogChanged(task.id, true));
        p.on('exit', () => {
            this.process = undefined;
            taskSource.next(this.toJSON());
            taskLogSource.next({ taskId: task.id, chunk: `task '${task.title}' exited.` });
        });
        p.on('error', err => {
            this.process = undefined;
            taskSource.next(this.toJSON());
            taskLogSource.next({ taskId: task.id, chunk: `task '${task.title}' has reported an error: ${err}.` });
        });
        this.process = p;
        taskSource.next(this.toJSON());
        taskLogSource.next({ taskId: task.id, chunk: `task '${task.title}' started.\n` });
    }

    get running(): boolean {
        return Boolean(this.process);
    }

    toJSON(): Task {
        return { ...this.task, running: this.running };
    }
}

export interface TaskMap {
    [id: number]: Taskk;
}

const TASKS_FILE = path.join(__dirname, 'tasks.json');

let ALL_TASKS: TaskMap;

export function get(taskId: number): Taskk {
    return ALL_TASKS[taskId];
}

export function setupWatcher() {
    let lastMTime;
    fs.watch(TASKS_FILE, e => {
        if (e === 'change') {
            const mtime = Number(fs.lstatSync(TASKS_FILE).mtime);
            if (!lastMTime || (mtime - lastMTime) > 100) {
                lastMTime = mtime;
                if (ALL_TASKS) {
                    Object.keys(ALL_TASKS)
                        .map(k => ALL_TASKS[k])
                        .filter(task => task.running)
                        .forEach(task => task.startStop());
                    ALL_TASKS = undefined;
                }
                load().subscribe(() => allTasksSource.next(ALL_TASKS));
            }
        }
    });
}

export function load(): Observable<TaskMap> {
    if (ALL_TASKS) {
        return Observable.of(ALL_TASKS);
    }
    return Observable.create((subscriber: Subscriber<TaskMap>) => {
        fs.readFile(TASKS_FILE, (err, data) => {
            if (err) {
                subscriber.error(err);
                return;
            }
            try {
                const defs: Task[] = JSON.parse(String(data));
                ALL_TASKS = {};
                defs.forEach((def, index) => ALL_TASKS[index] = new Taskk({ ...def, id: index }));
                subscriber.next(ALL_TASKS);
            } catch (err) {
                console.error(`Error while parsing '${TASKS_FILE}': ${err}`);
            }
        });
    });
}