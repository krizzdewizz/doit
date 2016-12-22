import { Injectable, EventEmitter } from '@angular/core';

import { DOIT, Task, TaskLog, Event, EventType, AllTasksEvent, TaskEvent, TaskLogEvent, TaskActionEvent } from '../model';

@Injectable()
export class TaskService {

    private socket: SocketIOClient.Socket;

    allTasks = new EventEmitter<Task[]>();
    task = new EventEmitter<Task>();
    taskLog = new EventEmitter<TaskLog>();

    init() {
        this.socket = io.connect();
        this.socket.on(DOIT, (e: Event<any>) => {
            switch (e.type) {
                case EventType.ALL_TASKS:
                    this.allTasks.emit((e as AllTasksEvent).tasks);
                    break;
                case EventType.TASK:
                    this.task.emit((e as TaskEvent).task);
                    break;
                case EventType.TASK_LOG:
                    this.taskLog.emit((e as TaskLogEvent).taskLog);
                    break;
            }
        });
    }

    startStop(task: Task) {
        this.socket.emit(DOIT, { type: task.running ? EventType.TASK_ACTION_STOP : EventType.TASK_ACTION_START, taskId: task.id } as TaskActionEvent);
    }

    destroy() {
        this.socket.close();
        this.socket = undefined;
    }
}