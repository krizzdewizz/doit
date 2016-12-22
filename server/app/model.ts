export const DOIT = 'doit';

export interface Task {
    id: number;
    title: string;
    command: string;
    args: string[];
    cwd: string;
    running: boolean;
}

export interface TaskLog {
    taskId: number;
    chunk: string;
    stderr?: boolean; // if true is stderr, else stdout
}

export enum EventType {
    TASK, ALL_TASKS, TASK_LOG, // outgoing
    TASK_ACTION_START, TASK_ACTION_STOP, TASK_ACTION_GET_LOG // incoming
}

export interface Event<T extends EventType> {
    type: T;
}

export interface TaskEvent extends Event<EventType.TASK> {
    task: Task;
}

export interface AllTasksEvent extends Event<EventType.ALL_TASKS> {
    tasks: Task[];
}

export interface TaskLogEvent extends Event<EventType.TASK_LOG> {
    taskLog: TaskLog;
}

export interface TaskActionEvent extends Event<EventType.TASK_ACTION_START | EventType.TASK_ACTION_STOP | EventType.TASK_ACTION_GET_LOG> {
    taskId: number;
}

