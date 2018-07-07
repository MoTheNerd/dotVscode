"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const path = require("path");
const nls = require("vscode-nls");
const vscode_languageclient_1 = require("vscode-languageclient");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const localize = nls.loadMessageBundle();
// tslint:disable-next-line:no-default-export // Grandfathered in
class MongoDBLanguageClient {
    constructor(context) {
        // The server is implemented in node
        let serverModule = context.asAbsolutePath(path.join('out', 'src', 'mongo', 'languageServer.js'));
        // The debug options for the server
        let debugOptions = { execArgv: ['--nolazy', '--debug=6005', '--inspect'] };
        // If the extension is launch in debug mode the debug server options are use
        // Otherwise the run options are used
        let serverOptions = {
            run: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc, options: debugOptions },
            debug: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc, options: debugOptions }
        };
        // Options to control the language client
        let clientOptions = {
            // Register the server for mongo javascript documents
            documentSelector: [
                { language: 'mongo', scheme: 'file' },
                { language: 'mongo', scheme: 'untitled' }
            ]
        };
        // Create the language client and start the client.
        this.client = new vscode_languageclient_1.LanguageClient('mongo', localize('mongo.server.name', 'Mongo Language Server'), serverOptions, clientOptions);
        let disposable = this.client.start();
        // Push the disposable to the context's subscriptions so that the
        // client can be deactivated on extension deactivation
        context.subscriptions.push(disposable);
    }
    connect(connectionString, databaseName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.sendRequest('connect', { connectionString: connectionString, databaseName: databaseName, extensionUserAgent: vscode_azureextensionui_1.appendExtensionUserAgent() });
        });
    }
    disconnect() {
        this.client.sendRequest('disconnect');
    }
}
exports.default = MongoDBLanguageClient;
//# sourceMappingURL=languageClient.js.map