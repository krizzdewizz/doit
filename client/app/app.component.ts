import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { TaskService } from './task/task.service';
import { Task, TaskLog, Config, LogType } from './model';

const MAX_LINES = 30;

interface LogLine {
    line: string;
    type: LogType;
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

    LogType = LogType;

    tasks: Task[];
    selection: Task;
    config: Config;
    private logPaused: boolean;
    private subscriptions: any[];

    taskLogData: TaskLogData = {};

    constructor(private elRef: ElementRef, private taskService: TaskService, private sanitizer: DomSanitizer) {

    }

    ngOnInit() {
        this.subscriptions = [
            this.taskService.allTasks.subscribe((tasks: Task[]) => {
                this.tasks = tasks;
                this.initSelection();
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
                const chunkLine: LogLine = { line: taskLog.chunk, type: taskLog.type };

                let newLines = [...logData.lines, chunkLine];
                if (newLines.length > MAX_LINES) {
                    newLines = newLines.slice(newLines.length - MAX_LINES, newLines.length);
                }

                logData.lines = newLines;
                this.updateLogData(taskLog.taskId);
            }),

            this.taskService.config.subscribe((config: Config) => this.config = config)

        ];
        this.taskService.init();
    }

    private initSelection() {
        const hash = window.location.hash;
        if (hash.startsWith('#') && hash.length > 1) {
            const taskId = Number(hash.substring(1));
            this.selection = this.tasks.find(it => it.id === taskId);
        }

        if (!this.selection) {
            this.selection = this.tasks[0];
        }
    }

    ngOnDestroy() {
        this.taskService.destroy();
        this.subscriptions.forEach(it => it.unsubscribe());
    }

    startStopClass(task: Task) {
        return { button: true, glyphicon: true, 'glyphicon-stop': task.running, 'glyphicon-play': !task.running };
    }

    startStop(task: Task) {
        if (!task.running) {
            this.taskLogData[task.id] = undefined;
            this.logPaused = false;
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
            setTimeout(() => $('.doit-log', this.elRef.nativeElement).scrollTop(10000), 0);
        }
    }

    get configFile() {
        if (!this.config) {
            return undefined;
        }
        return this.sanitizer.bypassSecurityTrustUrl(`doit-open:${this.config.path}`);
    }
}