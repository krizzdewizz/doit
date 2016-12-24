import { Component, OnInit, OnDestroy } from '@angular/core';

import { TaskService } from './task/task.service';
import { Task, TaskLog } from './model';

const MAX_LINES = 30;

interface LogLine {
    line: string;
    err: boolean;
}

interface LogData {
    lines: LogLine[];
    linesVisible: LogLine[];
}

interface TaskLogData {
    [taskId: number]: LogData;
}

@Component({
    moduleId: __moduleName,
    selector: 'doit-app',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {

    tasks: Task[];
    selection: Task;
    private logPaused: boolean;
    private subscriptions: any[];

    taskLogData: TaskLogData = {};

    constructor(private taskService: TaskService) {

    }

    ngOnInit() {
        this.subscriptions = [
            this.taskService.allTasks.subscribe((tasks: Task[]) => {
                this.tasks = tasks;
                this.selection = tasks[0];
            }),

            this.taskService.task.subscribe((task: Task) => {
                const newTasks: Task[] = [];
                this.tasks.forEach(it => {
                    if (it.id === task.id) {
                        newTasks.push(task);
                        if (this.selection && this.selection.id === task.id) {
                            this.selection = task;
                        }
                    } else {
                        newTasks.push(it);
                    }
                });

                this.tasks = newTasks;
            }),

            this.taskService.taskLog.subscribe((taskLog: TaskLog) => {
                let logData = this.taskLogData[taskLog.taskId];
                if (!logData) {
                    logData = this.taskLogData[taskLog.taskId] = { lines: [], linesVisible: [] };
                }
                const chunkLine: LogLine = { line: taskLog.chunk, err: taskLog.stderr };

                let newLines = [...logData.lines, chunkLine];
                if (newLines.length > MAX_LINES) {
                    newLines = newLines.slice(newLines.length - MAX_LINES, newLines.length);
                }

                logData.lines = newLines;
                this.updateLogData(taskLog.taskId);
            })

        ];
        this.taskService.init();
    }

    ngOnDestroy() {
        this.taskService.destroy();
        this.subscriptions.forEach(it => it.unsubscribe());
    }

    commandAndArgs(task: Task): string {
        const args = task.args.join(' ');
        return `${task.command} ${args}`;
    }

    startStopClass(task: Task) {
        return { button: true, glyphicon: true, 'glyphicon-stop': task.running, 'glyphicon-play': !task.running };
    }

    startStop(task: Task) {
        if (!task.running) {
            this.taskLogData[task.id] = undefined;
        }
        this.taskService.startStop(task);
        return false;
    }

    pauseLog() {
        if (this.logPaused) {
            this.logPaused = false;
            this.updateLogData(this.selection.id);
        } else {
            this.logPaused = true;
        }
    }

    updateLogData(taskId: number) {
        if (this.logPaused) {
            return;
        }
        const logData = this.taskLogData[taskId];
        if (logData) {
            logData.linesVisible = logData.lines;
        }
    }
}