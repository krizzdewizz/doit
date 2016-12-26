export interface DoIt {
    editor?: string;
    tasks: Task[];
}

export interface Task {
    id: number;
    title: string;
    command: string;
    args?: string[];
    cwd?: string;
    problemPattern?: string;
    autoStart?: boolean;
    running?: boolean;
}

export enum LogType {
    STDOUT, STDERR, DOIT
}

export interface TaskLog {
    taskId: number;
    chunk: string;
    type: LogType;
}

export interface Config {
    path: string;
}

export enum Event {
    TASK, ALL_TASKS, TASK_LOG, // outgoing
    TASK_ACTION_START_STOP, OPEN_CONFIG // incoming
}

export interface TaskEvent {
    task: Task;
}

export interface AllTasksEvent {
    tasks: Task[];
}

export interface TaskLogEvent {
    taskLog: TaskLog;
}

export interface TaskActionStartStopEvent {
    taskId: number;
}

