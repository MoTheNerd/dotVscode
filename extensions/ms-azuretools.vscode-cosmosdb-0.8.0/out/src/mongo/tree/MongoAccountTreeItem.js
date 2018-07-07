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
const vscode = require("vscode");
const path = require("path");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const MongoDatabaseTreeItem_1 = require("./MongoDatabaseTreeItem");
const MongoCollectionTreeItem_1 = require("./MongoCollectionTreeItem");
const MongoDocumentTreeItem_1 = require("./MongoDocumentTreeItem");
const deleteCosmosDBAccount_1 = require("../../commands/deleteCosmosDBAccount");
const mongoConnectionStrings_1 = require("../mongoConnectionStrings");
const connectToMongoClient_1 = require("../connectToMongoClient");
class MongoAccountTreeItem {
    constructor(id, label, connectionString, isEmulator) {
        this.contextValue = MongoAccountTreeItem.contextValue;
        this.childTypeLabel = "Database";
        this.id = id;
        this.label = label;
        this.connectionString = connectionString;
        this.isEmulator = isEmulator;
    }
    get iconPath() {
        return {
            light: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icons', 'light', 'CosmosDBAccount.svg'),
            dark: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icons', 'dark', 'CosmosDBAccount.svg')
        };
    }
    hasMoreChildren() {
        return false;
    }
    loadMoreChildren(node, _clearCache) {
        return __awaiter(this, void 0, void 0, function* () {
            let db;
            try {
                let databases;
                if (!this.connectionString) {
                    throw new Error('Missing connection string');
                }
                db = yield connectToMongoClient_1.connectToMongoClient(this.connectionString, vscode_azureextensionui_1.appendExtensionUserAgent());
                let databaseInConnectionString = mongoConnectionStrings_1.getDatabaseNameFromConnectionString(this.connectionString);
                if (databaseInConnectionString && !this.isEmulator) { // emulator violates the connection string format
                    // If the database is in the connection string, that's all we connect to (we might not even have permissions to list databases)
                    databases = [{
                            name: databaseInConnectionString,
                            empty: false
                        }];
                }
                else {
                    let result = yield db.admin().listDatabases();
                    databases = result.databases;
                }
                return databases
                    .filter((database) => !(database.name && database.name.toLowerCase() === "admin" && database.empty)) // Filter out the 'admin' database if it's empty
                    .map(database => new MongoDatabaseTreeItem_1.MongoDatabaseTreeItem(database.name, this.connectionString, this.isEmulator, node.id));
            }
            catch (error) {
                return [{
                        id: 'cosmosMongoError',
                        contextValue: 'cosmosMongoError',
                        label: error.message,
                    }];
            }
            finally {
                if (db) {
                    db.close();
                }
            }
        });
    }
    createChild(node, showCreatingNode) {
        return __awaiter(this, void 0, void 0, function* () {
            const databaseName = yield vscode.window.showInputBox({
                placeHolder: "Database Name",
                prompt: "Enter the name of the database",
                validateInput: validateDatabaseName,
            });
            if (databaseName) {
                const collectionName = yield vscode.window.showInputBox({
                    placeHolder: 'Collection Name',
                    prompt: 'A collection is required to create a database',
                    ignoreFocusOut: true,
                    validateInput: MongoDatabaseTreeItem_1.validateMongoCollectionName
                });
                if (collectionName) {
                    showCreatingNode(databaseName);
                    const databaseTreeItem = new MongoDatabaseTreeItem_1.MongoDatabaseTreeItem(databaseName, this.connectionString, this.isEmulator, node.id);
                    yield databaseTreeItem.createCollection(collectionName);
                    return databaseTreeItem;
                }
            }
            throw new vscode_azureextensionui_1.UserCancelledError();
        });
    }
    isAncestorOf(contextValue) {
        switch (contextValue) {
            case MongoDatabaseTreeItem_1.MongoDatabaseTreeItem.contextValue:
            case MongoCollectionTreeItem_1.MongoCollectionTreeItem.contextValue:
            case MongoDocumentTreeItem_1.MongoDocumentTreeItem.contextValue:
                return true;
            default:
                return false;
        }
    }
    deleteTreeItem(node) {
        return __awaiter(this, void 0, void 0, function* () {
            yield deleteCosmosDBAccount_1.deleteCosmosDBAccount(node);
        });
    }
}
MongoAccountTreeItem.contextValue = "cosmosDBMongoServer";
exports.MongoAccountTreeItem = MongoAccountTreeItem;
function validateDatabaseName(database) {
    // https://docs.mongodb.com/manual/reference/limits/#naming-restrictions
    const min = 1;
    const max = 63;
    if (!database || database.length < min || database.length > max) {
        return `Database name must be between ${min} and ${max} characters.`;
    }
    if (/[/\\. "$]/.test(database)) {
        return "Database name cannot contain these characters - `/\\. \"$`";
    }
    return undefined;
}
//# sourceMappingURL=MongoAccountTreeItem.js.map