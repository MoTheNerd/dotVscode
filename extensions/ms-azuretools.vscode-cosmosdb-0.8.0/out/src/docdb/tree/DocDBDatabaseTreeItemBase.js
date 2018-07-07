"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const DocDBTreeItemBase_1 = require("./DocDBTreeItemBase");
const vscode = require("vscode");
const lib_1 = require("documentdb/lib");
const minThroughput = 1000;
const maxThroughput = 100000;
/**
 * This class provides common logic for DocumentDB, Graph, and Table databases
 * (DocumentDB is the base type for all Cosmos DB accounts)
 */
class DocDBDatabaseTreeItemBase extends DocDBTreeItemBase_1.DocDBTreeItemBase {
    constructor(documentEndpoint, masterKey, database, isEmulator) {
        super(documentEndpoint, masterKey, isEmulator);
        this._database = database;
    }
    get iconPath() {
        return {
            light: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icons', 'theme-agnostic', 'Database.svg'),
            dark: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icons', 'theme-agnostic', 'Database.svg')
        };
    }
    get id() {
        return this._database.id;
    }
    get label() {
        return this._database.id;
    }
    get link() {
        return this._database._self;
    }
    getIterator(client, feedOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client.readCollections(this.link, feedOptions);
        });
    }
    // Delete the database
    deleteTreeItem(_node) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = `Are you sure you want to delete database '${this.label}' and its contents?`;
            const result = yield vscode.window.showWarningMessage(message, { modal: true }, vscode_azureextensionui_1.DialogResponses.deleteResponse, vscode_azureextensionui_1.DialogResponses.cancel);
            if (result === vscode_azureextensionui_1.DialogResponses.deleteResponse) {
                const client = this.getDocumentClient();
                yield new Promise((resolve, reject) => {
                    // tslint:disable-next-line:no-function-expression // Grandfathered in
                    client.deleteDatabase(this.link, function (err) {
                        err ? reject(err) : resolve();
                    });
                });
            }
            else {
                throw new vscode_azureextensionui_1.UserCancelledError();
            }
        });
    }
    // Create a DB collection
    createChild(_node, showCreatingNode) {
        return __awaiter(this, void 0, void 0, function* () {
            const collectionName = yield vscode.window.showInputBox({
                placeHolder: `Enter a name for your ${this.childTypeLabel}`,
                ignoreFocusOut: true,
                validateInput: DocDBDatabaseTreeItemBase.validateCollectionName
            });
            if (collectionName) {
                let partitionKey = yield vscode.window.showInputBox({
                    prompt: 'Partition Key',
                    ignoreFocusOut: true,
                    validateInput: DocDBDatabaseTreeItemBase.validatePartitionKey
                });
                if (partitionKey) {
                    if (partitionKey[0] !== '/') {
                        partitionKey = '/' + partitionKey;
                    }
                    const throughput = Number(yield vscode.window.showInputBox({
                        value: minThroughput.toString(),
                        ignoreFocusOut: true,
                        prompt: `Initial throughput capacity, between ${minThroughput} and ${maxThroughput}`,
                        validateInput: DocDBDatabaseTreeItemBase.validateThroughput
                    }));
                    if (throughput) {
                        const options = { offerThroughput: throughput };
                        const collectionDef = {
                            id: collectionName,
                            partitionKey: {
                                paths: [partitionKey],
                                kind: lib_1.DocumentBase.PartitionKind.Hash
                            }
                        };
                        showCreatingNode(collectionName);
                        const client = this.getDocumentClient();
                        const collection = yield new Promise((resolve, reject) => {
                            client.createCollection(this.link, collectionDef, options, (err, result) => {
                                err ? reject(err) : resolve(result);
                            });
                        });
                        return this.initChild(collection);
                    }
                }
            }
            throw new vscode_azureextensionui_1.UserCancelledError();
        });
    }
    static validatePartitionKey(key) {
        if (/^[#?\\]*$/.test(key)) {
            return "Cannot contain these characters - ?,#,\\, etc.";
        }
        return undefined;
    }
    static validateThroughput(input) {
        try {
            const value = Number(input);
            if (value < minThroughput || value > maxThroughput) {
                return `Value must be between ${minThroughput} and ${maxThroughput}`;
            }
        }
        catch (err) {
            return "Input must be a number";
        }
        return undefined;
    }
    static validateCollectionName(name) {
        if (!name) {
            return "Collection name cannot be empty";
        }
        if (name.endsWith(" ")) {
            return "Collection name cannot end with space";
        }
        if (/[/\\?#]/.test(name)) {
            return `Collection name cannot contain the characters '\\', '/', '#', '?'`;
        }
        return undefined;
    }
}
exports.DocDBDatabaseTreeItemBase = DocDBDatabaseTreeItemBase;
//# sourceMappingURL=DocDBDatabaseTreeItemBase.js.map