"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode_languageserver_1 = require("vscode-languageserver");
const languageService_1 = require("./services/languageService");
//
//
//
// HOW TO DEBUG THE LANGUAGE SERVER
//
//
// 1. Start the extension via F5
// 2. Under vscode Debug pane, switch to "Attach to Language Server"
// 3. F5
//
//
//
// Create a connection for the server
let connection = vscode_languageserver_1.createConnection();
console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);
// tslint:disable-next-line:no-unused-expression
new languageService_1.LanguageService(connection);
// Listen on the connection
connection.listen();
//# sourceMappingURL=languageServer.js.map