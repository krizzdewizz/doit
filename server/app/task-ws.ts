import { Event, Task, TaskActionStartStopEvent } from './model';
import * as task from './task';

function mapTasks(tasks: task.Taskk[]): Task[] {
    return tasks.map(it => it.toJSON());
}

export function taskSocket(io: SocketIO.Server) {

    function broadcast(e: Event, obj: any) {
        io.sockets.emit(Event[e], obj);
    }

    task.taskChanged$.subscribe(task => broadcast(Event.TASK, { task }));
    task.allTasksChanged$.subscribe(tasks => broadcast(Event.ALL_TASKS, { tasks: mapTasks(tasks) }));
    task.taskLogChanged$.subscribe(taskLog => broadcast(Event.TASK_LOG, { taskLog }));

    return socket => {
        socket.on(Event[Event.TASK_ACTION_START_STOP], (e: TaskActionStartStopEvent) => {
            const t = task.get(e.taskId);
            if (t) {
                t.startStop();
            }
        });
        task.load().subscribe(taskMap => socket.emit(Event[Event.ALL_TASKS], { tasks: mapTasks(taskMap) }));
    };
}