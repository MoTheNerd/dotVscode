"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
// NOTE: This file may not take a dependencey on vscode or anything that takes a dependency on it (such as vscode-azureextensionui)
const vscode_languageserver_1 = require("vscode-languageserver");
const mongoScript_1 = require("./mongoScript");
const schemaService_1 = require("./schemaService");
const vscode_json_languageservice_1 = require("vscode-json-languageservice");
const connectToMongoClient_1 = require("../connectToMongoClient");
class LanguageService {
    constructor(connection) {
        this.textDocuments = new vscode_languageserver_1.TextDocuments();
        this.schemaService = new schemaService_1.default();
        this.textDocuments.listen(connection);
        // After the server has started the client sends an initilize request. The server receives
        // in the passed params the rootPath of the workspace plus the client capabilities.
        connection.onInitialize((_params) => {
            return {
                capabilities: {
                    textDocumentSync: this.textDocuments.syncKind,
                    completionProvider: { triggerCharacters: ['.'] },
                }
            };
        });
        connection.onCompletion(textDocumentPosition => {
            return this.provideCompletionItems(textDocumentPosition);
        });
        connection.onRequest('connect', (connectionParams) => {
            connectToMongoClient_1.connectToMongoClient(connectionParams.connectionString, connectionParams.extensionUserAgent)
                .then(account => {
                this.db = account.db(connectionParams.databaseName);
                this.schemaService.registerSchemas(this.db)
                    .then(schemas => {
                    this.configureSchemas(schemas);
                });
            });
        });
        connection.onRequest('disconnect', () => {
            this.db = null;
            for (const schema of this.schemas) {
                this.jsonLanguageService.resetSchema(schema.uri);
            }
        });
        this.jsonLanguageService = vscode_json_languageservice_1.getLanguageService({
            schemaRequestService: uri => this.schemaService.resolveSchema(uri),
            contributions: []
        });
        this.mongoDocumentsManager = new mongoScript_1.MongoScriptDocumentManager(this.schemaService, this.jsonLanguageService);
    }
    provideCompletionItems(positionParams) {
        const textDocument = this.textDocuments.get(positionParams.textDocument.uri);
        const mongoScriptDocument = this.mongoDocumentsManager.getDocument(textDocument, this.db);
        return mongoScriptDocument.provideCompletionItemsAt(positionParams.position);
    }
    resetSchema(uri) {
        this.jsonLanguageService.resetSchema(uri);
    }
    configureSchemas(schemas) {
        this.jsonLanguageService.configure({
            schemas
        });
    }
}
exports.LanguageService = LanguageService;
//# sourceMappingURL=languageService.js.map