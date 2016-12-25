export interface Vars {
    [name: string]: string;
}

export interface DoIt {
    tasks: Task[];
    vars: Vars;
}

export interface Task {
    id: number;
    title: string;
    command: string;
    args?: string[];
    cwd?: string;
    problemPattern?: string;
    running?: boolean;
}

export interface TaskLog {
    taskId: number;
    chunk: string;
    stderr?: boolean; // if true is stderr, else stdout
}

export interface Config {
    path: string;
}

export enum Event {
    TASK, ALL_TASKS, TASK_LOG, CONFIG, // outgoing
    TASK_ACTION_START_STOP // incoming
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

export interface ConfigEvent {
    config: Config;
}
