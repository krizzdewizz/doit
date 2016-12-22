import { Event, EventType, TaskActionEvent, AllTasksEvent, TaskEvent, TaskLogEvent, DOIT } from '../model';
import * as task from './task';

export function taskSocket(io: SocketIO.Server) {

    task.taskChanged$.subscribe(task => io.sockets.emit(DOIT, { type: EventType.TASK, task } as TaskEvent));
    task.taskLogChanged$.subscribe(taskLog => io.sockets.emit(DOIT, { type: EventType.TASK_LOG, taskLog } as TaskLogEvent));

    return socket => {
        task.load().subscribe((taskMap: task.TaskMap) => {
            const tasks = Object.keys(taskMap).map(k => taskMap[k].toJSON());
            socket.emit(DOIT, { type: EventType.ALL_TASKS, tasks } as AllTasksEvent);
        });

        socket.on(DOIT, (e: Event<any>) => {
            switch (e.type) {
                case EventType.TASK_ACTION_START:
                case EventType.TASK_ACTION_STOP: {
                    const taskId = (e as TaskActionEvent).taskId;
                    const t = task.get(taskId);
                    t.startStop();
                    break;
                }
            }
        });
    };
}