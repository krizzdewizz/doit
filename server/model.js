"use strict";
exports.DOIT = 'doit';
var EventType;
(function (EventType) {
    EventType[EventType["TASK"] = 0] = "TASK";
    EventType[EventType["ALL_TASKS"] = 1] = "ALL_TASKS";
    EventType[EventType["TASK_LOG"] = 2] = "TASK_LOG";
    EventType[EventType["TASK_ACTION_START"] = 3] = "TASK_ACTION_START";
    EventType[EventType["TASK_ACTION_STOP"] = 4] = "TASK_ACTION_STOP";
    EventType[EventType["TASK_ACTION_GET_LOG"] = 5] = "TASK_ACTION_GET_LOG"; // incoming
})(EventType = exports.EventType || (exports.EventType = {}));
//# sourceMappingURL=model.js.map