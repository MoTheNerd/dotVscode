"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode_languageserver_1 = require("vscode-languageserver");
const mongodb_1 = require("mongodb");
const mongoScript_1 = require("./mongoScript");
const schemaService_1 = require("./schemaService");
const vscode_json_languageservice_1 = require("vscode-json-languageservice");
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
            mongodb_1.MongoClient.connect(connectionParams.connectionString)
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