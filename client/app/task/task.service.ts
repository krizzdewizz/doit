import { Injectable, EventEmitter } from '@angular/core';

import { Task, TaskLog, Event, AllTasksEvent, TaskEvent, TaskLogEvent } from '../model';

@Injectable()
export class TaskService {

    private socket: SocketIOClient.Socket;

    allTasks = new EventEmitter<Task[]>();
    task = new EventEmitter<Task>();
    taskLog = new EventEmitter<TaskLog>();

    private on(event: Event, fun: (e: any) => void) {
        this.socket.on(Event[event], fun);
        return this;
    }

    init() {
        this.socket = io.connect();
        this.on(Event.ALL_TASKS, (e: AllTasksEvent) => this.allTasks.emit(e.tasks))
            .on(Event.TASK, (e: TaskEvent) => this.task.emit(e.task))
            .on(Event.TASK_LOG, (e: TaskLogEvent) => this.taskLog.emit(e.taskLog));
    }

    startStop(task: Task) {
        this.socket.emit(Event[Event.TASK_ACTION_START_STOP], { taskId: task.id });
    }

    destroy() {
        this.socket.close();
        this.socket = undefined;
    }
}