"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Wraps SocketIO.Socket to provide type safety
 */
class GraphViewServerSocket {
    constructor(_socket) {
        this._socket = _socket;
    }
    onClientMessage(event, listener) {
        this._socket.on(event, listener);
    }
    // tslint:disable-next-line:no-any
    emitToClient(message, ...args) {
        // console.log("Message to client: " + message + " " + args.join(", "));
        return this._socket.emit(message, ...args);
    }
    disconnect() {
        this._socket.disconnect();
    }
}
exports.GraphViewServerSocket = GraphViewServerSocket;
//# sourceMappingURL=GraphViewServerSocket.js.map