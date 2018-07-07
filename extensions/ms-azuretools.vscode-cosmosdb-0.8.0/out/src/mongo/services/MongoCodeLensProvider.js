"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const MongoScrapbook_1 = require("../MongoScrapbook");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
class MongoCodeLensProvider {
    constructor() {
        this._onDidChangeEmitter = new vscode.EventEmitter();
        this.onDidChangeCodeLenses = this._onDidChangeEmitter.event;
    }
    setConnectedDatabase(database) {
        this._connectedDatabase = database;
        this._connectedDatabaseInitialized = true;
        this._onDidChangeEmitter.fire();
    }
    provideCodeLenses(document, _token) {
        // tslint:disable-next-line:no-var-self
        const me = this;
        return vscode_azureextensionui_1.callWithTelemetryAndErrorHandling("mongo.provideCodeLenses", function () {
            // Suppress except for errors - this can fire on every keystroke
            this.suppressTelemetry = true;
            let isInitialized = me._connectedDatabaseInitialized;
            let isConnected = !!me._connectedDatabase;
            let database = isConnected && me._connectedDatabase;
            let lenses = [];
            // Allow displaying and changing connected database
            lenses.push({
                command: {
                    title: !isInitialized ?
                        'Initializing...' :
                        isConnected ?
                            `Connected to ${database}` :
                            `Connect to a database`,
                    command: isInitialized && 'cosmosDB.connectMongoDB'
                },
                range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0))
            });
            if (isConnected) {
                // Run all
                lenses.push({
                    command: {
                        title: "Execute All",
                        command: 'cosmosDB.executeAllMongoCommands'
                    },
                    range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0))
                });
                let commands = MongoScrapbook_1.getAllCommandsFromTextDocument(document);
                for (let cmd of commands) {
                    // run individual
                    lenses.push({
                        command: {
                            title: "Execute",
                            command: 'cosmosDB.executeMongoCommand',
                            arguments: [cmd.text]
                        },
                        range: cmd.range
                    });
                }
            }
            return lenses;
        });
    }
}
exports.MongoCodeLensProvider = MongoCodeLensProvider;
//# sourceMappingURL=MongoCodeLensProvider.js.map