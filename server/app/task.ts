import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';
import * as stream from 'stream';

import { Observable, Subscriber, Subject } from 'rxjs/Rx';

import { Task, TaskLog } from '../model';

const taskEventSource = new Subject<Task>();
export const taskChanged$ = taskEventSource.asObservable();
function changeTask(task: Task) {
    taskEventSource.next(task);
}

const taskLogSource = new Subject<TaskLog>();
export const taskLogChanged$ = taskLogSource.asObservable();
function changeTaskLog(taskLog: TaskLog) {
    taskLogSource.next(taskLog);
}

class ToTaskLogChanged extends stream.Writable {

    constructor(private taskId: number, private stderr: boolean) {
        super();
    }

    _write(chunk, _encoding, done) {
        changeTaskLog({ taskId: this.taskId, stderr: this.stderr, chunk: String(chunk) });
        done();
    }
}

export class Taskk {

    get running(): boolean {
        return Boolean(this.process);
    }

    private process: child_process.ChildProcess;

    constructor(public task: Task) {
    }

    startStop() {
        const task = this.task;
        if (this.process) {
            changeTaskLog({ taskId: task.id, chunk: `task '${task.title}' killed by user.\n` });
            this.process.kill();
            return;
        }
        const p = child_process.spawn(task.command, task.args, { cwd: task.cwd });
        p.stdout.setEncoding('utf8');
        p.stdout.pipe(new ToTaskLogChanged(task.id, false));
        p.stderr.pipe(new ToTaskLogChanged(task.id, true));
        p.on('exit', () => {
            this.process = undefined;
            changeTask(this.toJSON());
            changeTaskLog({ taskId: task.id, chunk: `task '${task.title}' exited.\n` });
        });
        p.on('error', err => {
            this.process = undefined;
            changeTask(this.toJSON());
            changeTaskLog({ taskId: task.id, chunk: `task '${task.title}' has reported an error: ${err}.\n` });
        });
        this.process = p;
        changeTask(this.toJSON());
        changeTaskLog({ taskId: task.id, chunk: `task '${task.title}' started.\n` });
    }

    toJSON(): Task {
        return { ...this.task, running: this.running };
    }
}

export interface TaskMap {
    [id: number]: Taskk;
}

let ALL_TASKS: TaskMap;

export function get(taskId: number): Taskk {
    return ALL_TASKS[taskId];
}

export function load(): Observable<TaskMap> {
    if (ALL_TASKS) {
        return Observable.of(ALL_TASKS);
    }
    return Observable.create((subscriber: Subscriber<TaskMap>) => {
        fs.readFile(path.join(__dirname, 'tasks.json'), (err, data) => {
            if (err) {
                subscriber.error(err);
                return;
            }
            const defs: Task[] = JSON.parse(String(data));
            ALL_TASKS = {};
            defs.forEach((def, index) => {
                ALL_TASKS[index] = new Taskk({ ...def, id: index });
            });
            subscriber.next(ALL_TASKS);
        });
    });
}