import { Injectable, EventEmitter } from '@angular/core';

import { Task, TaskLog, Event, AllTasksEvent, TaskEvent, TaskLogEvent, Config, ConfigEvent } from '../model';

@Injectable()
export class TaskService {

    private socket: SocketIOClient.Socket;

    allTasks = new EventEmitter<Task[]>();
    task = new EventEmitter<Task>();
    taskLog = new EventEmitter<TaskLog>();
    config = new EventEmitter<Config>();

    init() {
        const on = (event: Event, fun: (e: any) => void) => this.socket.on(Event[event], fun);
        this.socket = io.connect();
        on(Event.ALL_TASKS, (e: AllTasksEvent) => this.allTasks.emit(e.tasks));
        on(Event.TASK, (e: TaskEvent) => this.task.emit(e.task));
        on(Event.TASK_LOG, (e: TaskLogEvent) => this.taskLog.emit(e.taskLog));
        on(Event.CONFIG, (e: ConfigEvent) => this.config.emit(e.config));
    }

    startStop(task: Task) {
        this.socket.emit(Event[Event.TASK_ACTION_START_STOP], { taskId: task.id });
    }

    destroy() {
        this.socket.close();
        this.socket = undefined;
    }
}