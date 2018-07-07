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
const vscode_jsonrpc_1 = require("vscode-jsonrpc");
const checkArg_1 = require("./checkArg");
/**
 * RPC variables are intentionally NOT private members of public API objects,
 * to prevent extensions from trivially using the private members to make
 * arbitrary RPC calls.
 */
const rpc = {
    client: null,
};
/**
 * Implements both the service and service proxy interfaces.
 */
class SharedServiceApi {
    constructor(name, rpcClient, trace) {
        this.name = name;
        this.trace = trace;
        this.isAvailable = false;
        this.isAvailableChange = new vscode_1.EventEmitter();
        // Ensure the name property cannot be modified.
        Object.defineProperty(this, 'name', {
            enumerable: false,
            configurable: false,
            writable: false,
        });
        rpc.client = rpcClient;
    }
    get isServiceAvailable() { return this.isAvailable; }
    get onDidChangeIsServiceAvailable() {
        return this.isAvailableChange.event;
    }
    /* internal */ set _isServiceAvailable(value) {
        this.isAvailable = value;
    }
    /* internal */ _fireIsAvailableChange() {
        this.trace.verbose(`^onDidChangeIsServiceAvailable(${this.name}, ${this.isAvailable})`);
        this.isAvailableChange.fire(this.isAvailable);
    }
    onRequest(name, handler) {
        checkArg_1.default(name, 'name', 'string');
        checkArg_1.default(handler, 'handler', 'function');
        const rpcName = this.makeRpcName(name);
        this.trace.verbose(`onRequest(${rpcName})`);
        rpc.client.ensureConnectionAsync().then((connection) => {
            connection.onRequest(rpcName, (...args) => __awaiter(this, void 0, void 0, function* () {
                this.trace.verbose(`rpc.onRequest(${rpcName})`);
                try {
                    handler(args);
                }
                catch (e) {
                    this.trace.warning(`Request handler (${rpcName}) failed: ` + e.message);
                    let stack = e.stack;
                    if (stack) {
                        // Strip off the part of the stack that is not in the extension code.
                        stack = stack.replace(new RegExp('\\s+at ' + SharedServiceApi.name + '(.*\n?)+'), '');
                    }
                    return new vscode_jsonrpc_1.ResponseError(vscode_jsonrpc_1.ErrorCodes.UnknownErrorCode, e.message, stack);
                }
            }));
        }).catch(); // Agent conneciton errors will be reported elsewhere.
    }
    onNotify(name, handler) {
        checkArg_1.default(name, 'name', 'string');
        checkArg_1.default(handler, 'handler', 'function');
        const rpcName = this.makeRpcName(name);
        this.trace.verbose(`onNotify(${rpcName})`);
        rpc.client.ensureConnectionAsync().then((connection) => {
            connection.onNotification(rpcName, (...argsArray) => {
                const args = argsArray[0];
                this.trace.verbose(`rpc.onNotify(${rpcName})`);
                try {
                    handler(args);
                }
                catch (e) {
                    this.trace.warning(`Notification handler (${rpcName}) failed: ` + e.message);
                    // Notifications have no response, so no error details are returned.
                }
            });
        }).catch(); // Agent conneciton errors will be reported elsewhere.
    }
    request(name, args, cancellation) {
        return __awaiter(this, void 0, void 0, function* () {
            checkArg_1.default(name, 'name', 'string');
            checkArg_1.default(args, 'args', 'array');
            const rpcName = this.makeRpcName(name);
            if (!this.isServiceAvailable) {
                this.trace.warning(`request(${rpcName}) - service not available`);
                throw new SharedServiceProxyError('Service \'' + this.name + '\' is not available.');
            }
            this.trace.verbose(`request(${rpcName})`);
            let responsePromise;
            try {
                responsePromise = rpc.client.connection.sendRequest(rpcName, ...args);
            }
            catch (e) {
                this.trace.warning(`request(${rpcName}) failed: ` + e.message);
                throw new SharedServiceProxyError(e.message);
            }
            let response;
            try {
                response = yield responsePromise;
            }
            catch (e) {
                this.trace.warning(`request(${rpcName}) failed: ` + e.message);
                throw new SharedServiceResponseError(e.message, e.data);
            }
            this.trace.verbose(`request(${rpcName}) succeeded`);
            return response;
        });
    }
    notify(name, args) {
        checkArg_1.default(name, 'name', 'string');
        checkArg_1.default(args, 'args', 'object');
        const rpcName = this.makeRpcName(name);
        if (!this.isServiceAvailable) {
            this.trace.verbose(`notify(${rpcName}) - service not available`);
            // Notifications do nothing when the service is not available.
            return;
        }
        this.trace.verbose(`notify(${rpcName})`);
        try {
            rpc.client.connection.sendNotification(rpcName, args);
        }
        catch (e) {
            this.trace.warning(`notify(${rpcName}) failed: ` + e.message);
            throw new SharedServiceProxyError(e.message);
        }
    }
    makeRpcName(name) {
        return this.name + '.' + name;
    }
}
exports.SharedServiceApi = SharedServiceApi;
class SharedServiceProxyError extends Error {
    constructor(message) {
        super(message);
        this.name = SharedServiceProxyError.name;
    }
}
exports.SharedServiceProxyError = SharedServiceProxyError;
class SharedServiceResponseError extends Error {
    constructor(message, remoteStack) {
        super(message);
        this.remoteStack = remoteStack;
        this.name = SharedServiceResponseError.name;
    }
}
exports.SharedServiceResponseError = SharedServiceResponseError;

//# sourceMappingURL=SharedServiceApi.js.map
