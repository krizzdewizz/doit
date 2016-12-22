import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';
import * as stream from 'stream';

import { Observable, Subscriber, Subject } from 'rxjs/Rx';

import { Task, TaskLog } from '../model';

const _taskEventSource = new Subject<Task>();
export const taskChanged$ = _taskEventSource.asObservable();
function changeTask(task: Task) {
    _taskEventSource.next(task);
}

const _taskLogSource = new Subject<TaskLog>();
export const taskLogChanged$ = _taskLogSource.asObservable();
function changeTaskLog(taskLog: TaskLog) {
    _taskLogSource.next(taskLog);
}

class ToTaskLogChanged extends stream.Writable {

    constructor(private taskId: number, private stderr: boolean) {
        super();
    }

    _write(chunk, _encoding, done) {
        const qqq = String(chunk);
        console.log('qqq', qqq)
        changeTaskLog({ taskId: this.taskId, stderr: this.stderr, chunk: qqq });
        done();
    }
}

export class Taskk implements Task {
    id: number;
    title: string;
    command: string;
    args: string[];
    cwd: string;
    get running(): boolean {
        return Boolean(this.process);
    }

    private process: child_process.ChildProcess;

    constructor(src: {}) {
        Object.keys(src).forEach(key => this[key] = src[key]);
    }

    startStop() {
        const self = this;
        if (this.process) {
            changeTaskLog({ taskId: this.id, chunk: `task '${self.title}' killed by user.\n` });
            this.process.kill();
            return;
        }
        // const p = child_process.spawn('cmd.exe', ['/k', this.command, ...this.args], { cwd: this.cwd });
        const p = child_process.spawn(this.command, this.args, { cwd: this.cwd });
        p.stdout.setEncoding('utf8');
        p.stdout.pipe(new ToTaskLogChanged(this.id, false));
        p.stderr.pipe(new ToTaskLogChanged(this.id, true));
        p.on('exit', () => {
            this.process = undefined;
            changeTask(this.toJSON());
            changeTaskLog({ taskId: this.id, chunk: `task '${self.title}' exited.\n` });
        });
        p.on('error', err => {
            this.process = undefined;
            changeTask(this.toJSON());
            changeTaskLog({ taskId: this.id, chunk: `task '${self.title}' has reported an error: ${err}.\n` });
        });
        this.process = p;
        changeTask(this.toJSON());
        changeTaskLog({ taskId: this.id, chunk: `task '${self.title}' started.\n` });
    }

    toJSON(): Task {
        const t: Task = { id: this.id, title: this.title, command: this.command, args: this.args, cwd: this.cwd, running: this.running };
        return t;
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