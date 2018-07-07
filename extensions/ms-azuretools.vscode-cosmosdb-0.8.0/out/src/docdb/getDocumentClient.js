"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const documentdb_1 = require("documentdb");
const DocDBLib = require("documentdb/lib");
const extensionVariables_1 = require("../extensionVariables");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
function getDocumentClient(documentEndpoint, masterKey, isEmulator) {
    const documentBase = DocDBLib.DocumentBase;
    let connectionPolicy = new documentBase.ConnectionPolicy();
    let vscodeStrictSSL = vscode.workspace.getConfiguration().get(extensionVariables_1.ext.settingsKeys.vsCode.proxyStrictSSL);
    let strictSSL = !isEmulator && vscodeStrictSSL;
    connectionPolicy.DisableSSLVerification = !strictSSL;
    const client = new documentdb_1.DocumentClient(documentEndpoint, { masterKey: masterKey }, connectionPolicy);
    // User agent isn't formally exposed on the client (https://github.com/Azure/azure-documentdb-node/issues/244) but nevertheless can be accessed via defaultHeaders
    // tslint:disable-next-line:no-any
    let defaultHeaders = client.defaultHeaders;
    if (defaultHeaders) {
        let userAgent = vscode_azureextensionui_1.appendExtensionUserAgent(defaultHeaders['User-Agent']);
        defaultHeaders['User-Agent'] = userAgent;
    }
    return client;
}
exports.getDocumentClient = getDocumentClient;
//# sourceMappingURL=getDocumentClient.js.map