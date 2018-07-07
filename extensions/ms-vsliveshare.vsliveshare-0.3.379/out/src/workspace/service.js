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
const vscode_1 = require("vscode");
const url = require("url");
const rpc = require("vscode-jsonrpc");
const net = require("net");
const traceSource_1 = require("../tracing/traceSource");
const util_1 = require("../util");
const agent_1 = require("../agent");
const telemetry_1 = require("../telemetry/telemetry");
const telemetryStrings_1 = require("../telemetry/telemetryStrings");
const rpcUtils_1 = require("../utils/rpcUtils");
class RPCClient {
    constructor() {
        this.maxRetryCount = 9;
        this.starRequests = {};
        this.starNotificationsCookies = 0;
        this.starNotifications = new Map();
        this.rpcReadFilters = [];
        this.rpcWriteFilters = [];
        this.dispose = (e) => {
            if (!this.disposed) {
                if (this.connection) {
                    this.connection.dispose();
                    this.connection = null;
                }
                if (this.socket) {
                    this.socket.destroy();
                    this.socket = null;
                }
                this.disposed = true;
                if (e) {
                    this.initPromise = Promise.reject(e);
                }
                else {
                    // The instance was disposed during extension deactivation.
                    // Create an init promise that never resolves, to block any
                    // further communication attempts during extension deactivation.
                    this.initPromise = new Promise((resolve) => { });
                }
            }
        };
        this.trace = traceSource_1.traceSource.withName(traceSource_1.TraceSources.ClientRpc);
        // Start but don't await yet. Save the promise for later.
        this.agentStarting = agent_1.Agent.startIfNotRunning();
    }
    init(retryCount = this.maxRetryCount, retryInterval = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentRetryInterval = retryInterval || (retryCount === this.maxRetryCount ? 50 : 100);
            this.agentUri = yield this.agentStarting;
            yield new Promise((resolve, reject) => {
                let startEvent = telemetry_1.Instance.startTimedEvent(telemetryStrings_1.TelemetryEventNames.START_AGENT_CONNECTION);
                startEvent.addProperty(telemetryStrings_1.TelemetryPropertyNames.AGENT_START_CONNECTION_RETRY_COUNT, (this.maxRetryCount - retryCount).toString());
                startEvent.addProperty(telemetryStrings_1.TelemetryPropertyNames.AGENT_START_CONNECTION_URI_PROTOCOL, this.agentUri.protocol);
                let didSucceed = false;
                if (this.agentUri.protocol === 'net.tcp:' &&
                    this.agentUri.hostname === 'localhost' &&
                    this.agentUri.port) {
                    const port = parseInt(this.agentUri.port, 10);
                    this.socket = net.createConnection({ port: port });
                }
                else if (this.agentUri.protocol === 'net.pipe:' && this.agentUri.hostname === 'localhost') {
                    const pipe = this.agentUri.pathname.substr(1);
                    this.socket = net.createConnection(util_1.getPipePath(pipe));
                }
                else {
                    reject(new Error('Invalid agent URI: ' + url.format(this.agentUri)));
                    return;
                }
                const messageReader = new rpcUtils_1.WrappedMessageReader(new rpc.StreamMessageReader(this.socket), (msg) => RPCClient.filterMessage(msg, this.rpcReadFilters));
                const messageWriter = new rpcUtils_1.WrappedMessageWriter(new rpc.StreamMessageWriter(this.socket), (msg) => RPCClient.filterMessage(msg, this.rpcWriteFilters));
                this.connection = rpc.createMessageConnection(messageReader, messageWriter, this);
                this.socket.on('connect', () => {
                    didSucceed = true;
                    this.trace.info('Agent connection success - ' + url.format(this.agentUri));
                    startEvent.end(telemetry_1.TelemetryResult.Success, 'Agent connection success.');
                    resolve();
                });
                this.connection.onError((error) => {
                    const e = error[0];
                    if (retryCount > 0) {
                        this.connection.dispose();
                        this.socket.destroy();
                        this.trace.verbose('Agent connection not completed: ' + e + '; Retrying...');
                        // Recursive call
                        setTimeout(() => {
                            this.init(--retryCount, retryInterval)
                                .then(() => resolve())
                                .catch(reject);
                        }, currentRetryInterval);
                    }
                    else {
                        if (!didSucceed) {
                            startEvent.end(telemetry_1.TelemetryResult.Failure, 'Agent connection failed. ' + e);
                        }
                        // No more retries. Dispose with the error from the last connection attempt.
                        this.dispose(e);
                        this.trace.error('Agent connection failed: ' + e);
                        reject(e);
                    }
                });
                this.connection.onClose(() => {
                    this.trace.info('RPC connection closed.');
                    if (!this.disposed) {
                        // The connection was closed unexpectedly (not due to extension deactivation).
                        // Dispose with an error that causes further communication attemps to be
                        // rejected with an appropriate exception.
                        this.dispose(new RpcConnectionClosedError());
                    }
                });
                // add generic request support
                this.connection.onRequest((method, ...params) => __awaiter(this, void 0, void 0, function* () {
                    if (!this.starRequests.hasOwnProperty(method)) {
                        return new rpc.ResponseError(rpc.ErrorCodes.MethodNotFound, `method:${method} not supported`);
                    }
                    return yield this.starRequests[method](...params);
                }));
                // add generic notification support
                this.connection.onNotification((method, ...params) => __awaiter(this, void 0, void 0, function* () {
                    if (this.starNotifications.has(method)) {
                        this.starNotifications.get(method).forEach((item) => __awaiter(this, void 0, void 0, function* () {
                            yield item.notificationHandler(...params);
                        }));
                    }
                }));
                this.connection.listen();
            });
        });
    }
    ensureConnectionAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!!this.initPromise) {
                // some other async caller is already connecting
                yield this.initPromise;
            }
            if (!this.connection) {
                // the caller is connecting
                this.initPromise = this.init();
                yield this.initPromise;
            }
            // connected
            return this.connection;
        });
    }
    onConnect(handler) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureConnectionAsync();
            handler();
        });
    }
    onClose(handler) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureConnectionAsync();
            this.connection.onClose(handler);
        });
    }
    error(message) {
        this.trace.error(message);
    }
    warn(message) {
        this.trace.warning(message);
    }
    info(message) {
        this.trace.info(message);
    }
    log(message) {
        this.trace.verbose(message);
    }
    sendRequest(trace, serviceAndMethodName, cancellationToken, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            const cancellationMessage = 'The request was cancelled.';
            const connection = yield Promise.race([
                this.ensureConnectionAsync(),
                new Promise((resolve, reject) => {
                    if (cancellationToken) {
                        if (cancellationToken.isCancellationRequested) {
                            return reject(new util_1.CancellationError(cancellationMessage));
                        }
                        cancellationToken.onCancellationRequested(() => {
                            reject(new util_1.CancellationError(cancellationMessage));
                        });
                    }
                })
            ]);
            let argsString = '';
            if (traceSource_1.TraceFormat.disableObfuscation) {
                // Arguments may contain sensitive data, so only trace when obfuscation is disabled.
                argsString = JSON.stringify(args);
                argsString = argsString.substr(1, argsString.length - 2);
            }
            trace.verbose(`< ${serviceAndMethodName}(${argsString})`);
            let result;
            try {
                if (cancellationToken) {
                    result = yield connection.sendRequest(serviceAndMethodName, args, cancellationToken);
                }
                else {
                    result = yield connection.sendRequest(serviceAndMethodName, args);
                }
            }
            catch (err) {
                if (this.disposed) {
                    // This will either block (during deactivation) or throw a connection-closed error.
                    yield this.initPromise;
                }
                // The error 'data' property should be the remote stack trace.
                // If it's not present just report the local stack trace.
                let errorMessage = err.data || err.stack;
                trace.error(`> ${serviceAndMethodName}() error: ` + errorMessage);
                throw err;
            }
            // Result may contain sensitive data, so only trace when obfuscation is disabled.
            if (traceSource_1.TraceFormat.disableObfuscation) {
                trace.verbose(`> ${serviceAndMethodName}() => ${JSON.stringify(result)}`);
            }
            else {
                trace.verbose(`> ${serviceAndMethodName}() succeeded`);
            }
            return result;
        });
    }
    sendNotification(trace, serviceAndName, eventArgs) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.ensureConnectionAsync();
            // Event args may contain sensitive data, so only trace when obfuscation is disabled.
            const argsString = traceSource_1.TraceFormat.disableObfuscation ? JSON.stringify(eventArgs) : '';
            trace.verbose(`sendNotification-> ${serviceAndName}: ${argsString}`);
            connection.sendNotification(serviceAndName, eventArgs);
        });
    }
    addRequestMethod(method, requestHandler) {
        this.starRequests[method] = requestHandler;
    }
    removeRequestMethod(method) {
        let val = this.starRequests[method];
        delete this.starRequests[method];
        return val;
    }
    addNotificationHandler(method, notificationHandler) {
        let entrys = this.starNotifications.get(method);
        if (!entrys) {
            entrys = [];
            this.starNotifications.set(method, entrys);
        }
        const entry = {
            cookie: ++this.starNotificationsCookies,
            notificationHandler: notificationHandler
        };
        entrys.push(entry);
        return entry.cookie;
    }
    removeNotificationHandler(method, cookie) {
        let entrys = this.starNotifications.get(method);
        if (entrys) {
            const indexEntry = entrys.findIndex(i => i.cookie === cookie);
            if (indexEntry !== -1) {
                return entrys.splice(indexEntry, 1)[0].notificationHandler;
            }
        }
        return undefined;
    }
    addReadFilter(filter) {
        this.rpcReadFilters.push(filter);
    }
    addWriteFilter(filter) {
        this.rpcWriteFilters.push(filter);
    }
    static filterMessage(msg, filters) {
        for (const filter of filters) {
            msg = filter(msg);
        }
        return msg;
    }
}
exports.RPCClient = RPCClient;
/**
 * Error thrown from RPC requests when the connection to the agent was unexpectedly
 * closed before or during the request.
 */
class RpcConnectionClosedError extends Error {
    constructor() {
        super('RPC connection closed.');
        this.code = RpcConnectionClosedError.code;
        Object.setPrototypeOf(this, RpcConnectionClosedError.prototype);
    }
}
/** One of the well-known Node.js error code strings. */
RpcConnectionClosedError.code = 'ECONNRESET';
exports.RpcConnectionClosedError = RpcConnectionClosedError;
/**
 * Base class for RPC service proxies. Traces all messages
 * and emits events for incoming notifications.
 */
class RpcProxy {
    constructor(client, serviceName, trace) {
        this.client = client;
        this.serviceName = serviceName;
        this.trace = trace;
    }
    /**
     * Creates a proxy for an RPC service.
     *
     * @param serviceInfo Information about the service contract
     * @param client RPC client
     * @param traceName Name used for tracing RPC calls
     */
    static create(serviceInfo, client, traceName) {
        if (!(serviceInfo && serviceInfo.name)) {
            throw new Error('Missing RPC service name.');
        }
        const proxy = new RpcProxy(client, serviceInfo.name, traceSource_1.traceSource.withName(traceName));
        for (let methodName of serviceInfo.methods) {
            const methodPropertyName = `${methodName}Async`;
            proxy[methodPropertyName] = function () {
                // Detect whether optional cancellation token was supplied, and if so strip from args.
                let args;
                let cancellationToken = arguments[arguments.length - 1];
                if (cancellationToken && typeof cancellationToken.isCancellationRequested === 'boolean') {
                    args = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
                }
                else {
                    args = Array.prototype.slice.call(arguments, 0, arguments.length);
                    cancellationToken = null;
                }
                const serviceAndMethodName = proxy.serviceName + '.' + methodName;
                return proxy.client.sendRequest(this.trace, serviceAndMethodName, cancellationToken, ...args);
            };
        }
        for (let eventName of serviceInfo.events) {
            const emitter = new vscode_1.EventEmitter();
            const eventPropertyName = `on${eventName.substr(0, 1).toUpperCase()}${eventName.substr(1)}`;
            proxy[eventPropertyName] = emitter.event;
            const serviceAndEventName = proxy.serviceName + '.' + eventName;
            proxy.client.ensureConnectionAsync().then((connection) => {
                connection.onNotification(serviceAndEventName, (...args) => {
                    const eventArgs = args[0];
                    // Event args may contain sensitive data, so only trace when obfuscation is disabled.
                    const argsString = traceSource_1.TraceFormat.disableObfuscation ? JSON.stringify(eventArgs) : '';
                    proxy.trace.verbose(`> ${serviceAndEventName}: ${argsString}`);
                    emitter.fire(eventArgs);
                });
            }).catch((e) => {
                // Failed to get the connection. There will already be errors traced elsewhere
                // about the connection failure, so there's no need to trace anything more here.
            });
        }
        return proxy;
    }
    /**
     * Sends a notification (event) from this client to the service.
     *
     * (This is a static method because RPC contract interfaces do not define methods
     * for reverse notifications.)
     */
    static notifyAsync(proxy, eventName, args) {
        const rpcProxy = proxy;
        const serviceAndMethodName = rpcProxy.serviceName + '.' + eventName;
        return rpcProxy.client.sendNotification(rpcProxy.trace, serviceAndMethodName, args);
    }
}
exports.RpcProxy = RpcProxy;

//# sourceMappingURL=service.js.map
