//
//  Copyright (c) Microsoft Corporation. All rights reserved.
//
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_1 = require("vscode");
const url = require("url");
const semver = require("semver");
const agent_1 = require("../agent");
const config = require("../config");
const VSLS_1 = require("../workspace/contract/VSLS");
const vsls = require("../workspace/contract/VSLS");
const service_1 = require("../workspace/service");
const traceSource_1 = require("../tracing/traceSource");
const RemoteTaskProvider = require("./remoteTaskProvider");
let workspaceTaskClient;
function enable(rpcClient) {
    return __awaiter(this, void 0, void 0, function* () {
        if (config.featureFlags.workspaceTask) {
            if (semver.gte(semver.coerce(vscode.version), '1.24.0') &&
                !!vscode_1.tasks.onDidStartTask) {
                workspaceTaskClient = new WorkspaceTaskClient(rpcClient);
                yield workspaceTaskClient.initialize();
            }
        }
    });
}
exports.enable = enable;
function disable() {
    return __awaiter(this, void 0, void 0, function* () {
        if (workspaceTaskClient) {
            yield workspaceTaskClient.dispose();
            workspaceTaskClient = undefined;
        }
    });
}
exports.disable = disable;
class WorkspaceTaskClient {
    constructor(rpcClient) {
        this.rpcClient = rpcClient;
        this.subscriptions = [];
        this.deferredInit = Promise.resolve();
        this.taskCache = {};
        this.hostTaskExecutions = [];
        this.pendingTaskMonitors = [];
        this.taskOutputCache = {};
        this.workspaceTaskService = service_1.RpcProxy.create(VSLS_1.WorkspaceTaskService, this.rpcClient, vsls.TraceSources.ClientRpc);
        this.brokerManagerService = service_1.RpcProxy.create(VSLS_1.BrokerManagerService, this.rpcClient, vsls.TraceSources.ClientRpc);
        this.taskOutputService = service_1.RpcProxy.create(VSLS_1.TaskOutputService, this.rpcClient, vsls.TraceSources.ClientRpc);
        this.streamManagerService = service_1.RpcProxy.create(VSLS_1.StreamManagerService, this.rpcClient, vsls.TraceSources.ClientRpc);
        this.streamService = service_1.RpcProxy.create(VSLS_1.StreamService, this.rpcClient, vsls.TraceSources.ClientRpc);
        this.trace = traceSource_1.traceSource.withName('WorkspaceTaskClient');
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.subscriptions.push(vscode_1.tasks.onDidStartTask(e => this.handleWorkspaceTaskStarted(e.execution)), vscode_1.tasks.onDidEndTask(e => this.handleWorkspaceTaskEnded(e.execution)), vscode_1.tasks.onDidEndTaskProcess(e => this.handleWorkspaceTaskProcessEnded(e.execution, e.exitCode)), this.workspaceTaskService.onTaskStarted(e => this.handleHostTaskStarted(e.task, e.taskExecution)), this.workspaceTaskService.onTaskTerminated(e => this.handleHostTaskTerminated(e.taskExecution)));
            this.deferredInit = this.deferredInit.then(() => this.initializeContext()).catch(() => { });
        });
    }
    initializeContext() {
        return __awaiter(this, void 0, void 0, function* () {
            const taskBrokerToken = yield this.brokerManagerService.registerAsync({
                hostServices: ['workspaceTask', 'stream', 'streamManager'],
                guestServices: []
            });
            this.taskManagerContext = RemoteTaskProvider.configure(taskBrokerToken, () => this.workspaceTaskService.getSupportedTasksAsync().catch(e => []), () => this.pendingTaskMonitors);
            this.terminalBrokerToken = yield this.brokerManagerService.registerAsync({
                hostServices: ['stream', 'streamManager'],
                guestServices: []
            });
            this.taskOutputService.onTaskOutputShared(e => this.createTaskOutput(e.taskOutput));
            const sharedTaskOutputs = yield this.taskOutputService.getTaskOutputsAsync();
            for (const taskOutput of sharedTaskOutputs) {
                yield this.createTaskOutput(taskOutput);
            }
            const [hostTasks, hostTaskExecutions] = yield Promise
                .all([
                this.workspaceTaskService.getSupportedTasksAsync(),
                this.workspaceTaskService.getTaskExecutionsAsync()
            ]);
            this.hostTaskExecutions.push(...hostTaskExecutions);
            for (const taskOnHost of hostTasks) {
                this.taskCache[taskOnHost.uniqueId] = {
                    taskOnHost: taskOnHost
                };
                const hostTaskExecution = hostTaskExecutions.filter(x => x.taskUid === taskOnHost.uniqueId)[0];
                if (hostTaskExecution) {
                    // launch one (at most) monitor task on join
                    yield this.startMonitorTask(taskOnHost, hostTaskExecution);
                }
            }
        });
    }
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.deferredInit;
            this.subscriptions.forEach(d => d.dispose());
            if (this.taskManagerContext) {
                this.taskManagerContext.dispose();
            }
            Object.keys(this.taskOutputCache)
                .map((x) => this.taskOutputCache[x])
                .forEach(d => d.dispose());
        });
    }
    createTaskOutput(taskOutput) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (taskOutput.options.contentType) {
                case vsls.TaskOutputContentType.TextWithAnsiEscapeCodes:
                    this.createTaskTerminal(taskOutput);
                    break;
                case vsls.TaskOutputContentType.PlainText:
                    yield this.createOutputChannel(taskOutput);
                    break;
                default:
            }
        });
    }
    handleWorkspaceTaskStarted(execution) {
        const taskDef = WorkspaceTaskClient.getTaskDefinition(execution.task);
        const taskInfo = taskDef ? this.taskCache[taskDef.taskUid] : undefined;
        if (!taskInfo) {
            // unsupported non Live Share task
            return;
        }
        if (!!taskDef.executionId) {
            // This is a monitor task, started by us earlier.
            // Record the task execution instance.
            taskInfo.monitorTaskExecution = execution;
            taskInfo.hostTaskExecution = { taskUid: taskDef.taskUid, id: taskDef.executionId };
        }
        else {
            // User has started the task execution manually.
            // Record the task execution for bookkeeping purposes
            taskInfo.monitorTaskExecution = execution;
            // The task execution ID is unknown at this moment.
            taskInfo.hostTaskExecution = undefined;
        }
    }
    handleWorkspaceTaskEnded(execution) {
        const taskDef = WorkspaceTaskClient.getTaskDefinition(execution.task);
        const taskInfo = taskDef ? this.taskCache[taskDef.taskUid] : undefined;
        if (!taskInfo) {
            // unsupported non Live Share task
            return;
        }
        if (taskInfo.monitorTaskExecution === execution) {
            // Switching to the Idle state, resetting monitor task execution values
            taskInfo.monitorTaskExecution = undefined;
            taskInfo.hostTaskExecution = undefined;
            // Restart the monitor task if there's a pending host task execution enqueued
            // and it's not the same as the current one (no retries allowed)
            const pendingHostExecution = this.hostTaskExecutions.filter(x => x.taskUid === taskDef.taskUid)[0];
            if (pendingHostExecution && pendingHostExecution.id !== taskDef.executionId) {
                // launch another monitor task.
                Promise.resolve().then(() => this.startMonitorTask(taskInfo.taskOnHost, pendingHostExecution));
            }
        }
    }
    handleWorkspaceTaskProcessEnded(execution, exitCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const taskDef = WorkspaceTaskClient.getTaskDefinition(execution.task);
            const taskInfo = taskDef ? this.taskCache[taskDef.taskUid] : undefined;
            if (!taskInfo) {
                // unsupported non Live Share task
                return;
            }
            if (taskInfo.monitorTaskExecution !== execution) {
                // The condition is satisfied when another task has started before this monitor has stopped.
                // It means the current task state is overriden so we can ignore this event.
                return;
            }
            if (!taskInfo.hostTaskExecution) {
                // The monitor task seems to get stopped without actually starting a task execution on the host.
                return;
            }
            // check if monitored task execution finished running on the host.
            const completed = !this.hostTaskExecutions.some(x => x.id === taskInfo.hostTaskExecution.id);
            if (!completed && (!taskDef.executionId || exitCode === 0)) {
                // terminate! the host task execution only when the broker process exited with the success code (0)
                yield this.workspaceTaskService.terminateTaskAsync(taskInfo.hostTaskExecution);
            }
        });
    }
    handleHostTaskStarted(taskOnHost, taskExecution) {
        return __awaiter(this, void 0, void 0, function* () {
            let taskInfo = this.getWorkspaceTaskInfo(taskOnHost);
            if (!taskInfo.monitorTaskExecution) {
                // If idle, then simply start monitoring this execution
                taskInfo.monitorTaskExecution = yield this.startMonitorTask(taskOnHost, taskExecution);
            }
            else if (!taskInfo.hostTaskExecution) {
                // Update the host task execution once, when it's started by the broker
                taskInfo.hostTaskExecution = taskExecution;
            }
            // register the host execution for further bookkeeping and decision making
            this.hostTaskExecutions.push(taskExecution);
        });
    }
    handleHostTaskTerminated(execution) {
        return __awaiter(this, void 0, void 0, function* () {
            const index = this.hostTaskExecutions.findIndex(x => x.id === execution.id);
            if (index !== -1) {
                this.hostTaskExecutions.splice(index, 1);
            }
        });
    }
    startMonitorTask(taskOnHost, taskExecution) {
        return __awaiter(this, void 0, void 0, function* () {
            // push the given task execution into the list of pending executions so that
            // the following fetch tasks API call will return monitor tasks only.
            this.pendingTaskMonitors.push([taskOnHost, taskExecution]);
            try {
                const fetched = yield vscode_1.tasks.fetchTasks({ type: RemoteTaskProvider.liveShareTaskType });
                for (const workspaceTask of fetched.filter(x => WorkspaceTaskClient.getTaskUid(x) === taskOnHost.uniqueId)) {
                    return yield vscode_1.tasks.executeTask(workspaceTask);
                }
            }
            finally {
                // remove the task execution from the stack.
                this.pendingTaskMonitors.pop();
            }
            return undefined;
        });
    }
    createTaskTerminal(info) {
        if (this.taskOutputCache[info.id]) {
            this.taskOutputCache[info.id].terminal.show();
            return;
        }
        const diagnosticLogging = config.get(config.Key.diagnosticLogging);
        const loggingArgs = diagnosticLogging ? ['--verbosity', 'Information'] : ['--verbosity', 'Error'];
        const terminalName = `[Shared] ${info.name}`;
        const brokerArgs = [
            '--broker-token',
            this.terminalBrokerToken,
            '--agent-uri',
            url.format(agent_1.Agent.uri)
        ];
        const terminalOptions = {
            name: terminalName,
            shellPath: agent_1.Agent.getAgentPath(),
            shellArgs: [
                ...loggingArgs,
                'monitor-output',
                info.feed.streamMoniker.name,
                '--stream-id',
                info.feed.streamMoniker.condition,
                '--virtual-terminal',
                ...brokerArgs
            ],
        };
        const terminal = vscode_1.window.createTerminal(terminalOptions);
        terminal.show();
        const subscriptions = [
            this.taskOutputService.onTaskOutputClosed(e => {
                if (e.taskOutput.id === info.id) {
                    disposeTaskOutput();
                    terminal.dispose();
                }
            }),
            vscode_1.window.onDidCloseTerminal(t => {
                if (t === terminal) {
                    disposeTaskOutput();
                }
            })
        ];
        const disposeTaskOutput = () => {
            delete this.taskOutputCache[info.id];
            subscriptions.forEach(d => d.dispose());
        };
        this.taskOutputCache[info.id] = {
            taskOutput: info,
            terminal: terminal,
            dispose: () => { disposeTaskOutput(); terminal.dispose(); }
        };
    }
    createOutputChannel(info) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.taskOutputCache[info.id]) {
                this.taskOutputCache[info.id].outputChannel.show();
                return;
            }
            const sharedName = `${info.name} [Shared]`;
            const outputChannel = vscode_1.window.createOutputChannel(sharedName);
            outputChannel.show(/*preserveFocus:*/ true);
            const streamMoniker = info.feed.streamMoniker;
            const streamId = yield this.streamManagerService.getStreamAsync(streamMoniker.name, streamMoniker.condition);
            const subscription = this.taskOutputService.onTaskOutputClosed(e => {
                if (e.taskOutput.id === info.id) {
                    disposeTaskOutput();
                    outputChannel.dispose();
                }
            });
            const disposeTaskOutput = () => __awaiter(this, void 0, void 0, function* () {
                delete this.taskOutputCache[info.id];
                yield this.streamService.disposeStreamAsync(streamId);
                subscription.dispose();
            });
            const listener = Promise.resolve().then(() => this.streamPlainTextOutput(streamId, outputChannel));
            this.taskOutputCache[info.id] = {
                taskOutput: info,
                streamId: streamId,
                outputChannel: outputChannel,
                listener: listener,
                dispose: () => __awaiter(this, void 0, void 0, function* () { yield disposeTaskOutput(); outputChannel.dispose(); })
            };
        });
    }
    streamPlainTextOutput(streamId, outputChannel) {
        return __awaiter(this, void 0, void 0, function* () {
            while (true) {
                const data = yield this.rpcClient.sendRequest(this.trace, 'stream.readBytes', null, streamId, 120);
                if (!data) {
                    break;
                }
                switch (data[0]) {
                    case ' ':
                        outputChannel.append(data.substr(1));
                        break;
                    case 'x':
                        const decoded = Buffer.from(data.substr(1), 'base64').toString('utf8');
                        outputChannel.append(decoded);
                        break;
                    case 'z':
                    default:
                }
            }
        });
    }
    getWorkspaceTaskInfo(taskOnHost) {
        const taskUid = taskOnHost.uniqueId;
        let taskInfo = this.taskCache[taskUid];
        if (!taskInfo) {
            // register the new host task for the first time
            this.taskCache[taskUid] = {
                taskOnHost: taskOnHost
            };
            taskInfo = this.taskCache[taskUid];
        }
        return taskInfo;
    }
    static getTaskDefinition(task) {
        if (task.definition.type === RemoteTaskProvider.liveShareTaskType) {
            return task.definition;
        }
        return undefined;
    }
    static getTaskUid(task) {
        if (task.definition.type === RemoteTaskProvider.liveShareTaskType) {
            const taskDef = task.definition;
            return taskDef.taskUid;
        }
        return undefined;
    }
}

//# sourceMappingURL=workspaceTaskClient.js.map
