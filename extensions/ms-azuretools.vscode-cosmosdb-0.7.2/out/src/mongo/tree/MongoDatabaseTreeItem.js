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
const cpUtils = require("../../utils/cp");
const path = require("path");
const mongodb_1 = require("mongodb");
const shell_1 = require("../shell");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const MongoCollectionTreeItem_1 = require("./MongoCollectionTreeItem");
const extensionVariables_1 = require("../../extensionVariables");
class MongoDatabaseTreeItem {
    constructor(databaseName, connectionString, parentId) {
        this.contextValue = MongoDatabaseTreeItem.contextValue;
        this.childTypeLabel = "Collection";
        this.databaseName = databaseName;
        this.connectionString = connectionString;
        this._parentId = parentId;
    }
    get label() {
        return this.databaseName;
    }
    get description() {
        return extensionVariables_1.ext.connectedMongoDB && extensionVariables_1.ext.connectedMongoDB.id === `${this._parentId}/${this.id}` ? 'Connected' : '';
    }
    get id() {
        return this.databaseName;
    }
    get iconPath() {
        return {
            light: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icons', 'theme-agnostic', 'Database.svg'),
            dark: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icons', 'theme-agnostic', 'Database.svg')
        };
    }
    hasMoreChildren() {
        return false;
    }
    loadMoreChildren(_node, _clearCache) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield this.getDb();
            const collections = yield db.collections();
            return collections.map(collection => new MongoCollectionTreeItem_1.MongoCollectionTreeItem(collection));
        });
    }
    createChild(_node, showCreatingNode) {
        return __awaiter(this, void 0, void 0, function* () {
            const collectionName = yield vscode.window.showInputBox({
                placeHolder: "Collection Name",
                prompt: "Enter the name of the collection",
                validateInput: validateMongoCollectionName,
                ignoreFocusOut: true
            });
            if (collectionName) {
                showCreatingNode(collectionName);
                return yield this.createCollection(collectionName);
            }
            throw new vscode_azureextensionui_1.UserCancelledError();
        });
    }
    deleteTreeItem(_node) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = `Are you sure you want to delete database '${this.label}'?`;
            const result = yield vscode.window.showWarningMessage(message, { modal: true }, vscode_azureextensionui_1.DialogResponses.deleteResponse, vscode_azureextensionui_1.DialogResponses.cancel);
            if (result === vscode_azureextensionui_1.DialogResponses.deleteResponse) {
                const db = yield this.getDb();
                yield db.dropDatabase();
            }
            else {
                throw new vscode_azureextensionui_1.UserCancelledError();
            }
        });
    }
    getDb() {
        return __awaiter(this, void 0, void 0, function* () {
            const accountConnection = yield mongodb_1.MongoClient.connect(this.connectionString);
            return accountConnection.db(this.databaseName);
        });
    }
    executeCommand(command, context) {
        if (command.collection) {
            return this.getDb()
                .then(db => {
                const collection = db.collection(command.collection);
                if (collection) {
                    const result = new MongoCollectionTreeItem_1.MongoCollectionTreeItem(collection, command.arguments).executeCommand(command.name, command.arguments);
                    if (result) {
                        return result;
                    }
                }
                return reportProgress(this.executeCommandInShell(command, context), 'Executing command');
            });
        }
        if (command.name === 'createCollection') {
            return reportProgress(this.createCollection(stripQuotes(command.arguments.join(','))).then(() => JSON.stringify({ 'Created': 'Ok' })), 'Creating collection');
        }
        else {
            return reportProgress(this.executeCommandInShell(command, context), 'Executing command');
        }
    }
    createCollection(collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield this.getDb();
            const newCollection = db.collection(collectionName);
            // db.createCollection() doesn't create empty collections for some reason
            // However, we can 'insert' and then 'delete' a document, which has the side-effect of creating an empty collection
            const result = yield newCollection.insertOne({});
            yield newCollection.deleteOne({ _id: result.insertedId });
            return new MongoCollectionTreeItem_1.MongoCollectionTreeItem(newCollection);
        });
    }
    executeCommandInShell(command, context) {
        context.properties["executeInShell"] = "true";
        return this.getShell().then(shell => shell.exec(command.text));
    }
    getShell() {
        return __awaiter(this, void 0, void 0, function* () {
            const settingKey = extensionVariables_1.ext.settingsKeys.mongoShellPath;
            let shellPath = vscode.workspace.getConfiguration().get(settingKey);
            if (!shellPath) {
                if (yield cpUtils.commandSucceeds('mongo', '--version')) {
                    // If the user already has mongo in their system path, just use that
                    shellPath = 'mongo';
                }
                else {
                    // If all else fails, prompt the user for the mongo path
                    shellPath = yield vscode.window.showInputBox({
                        placeHolder: "Configure the path to the mongo shell executable",
                        ignoreFocusOut: true
                    });
                    if (shellPath) {
                        yield vscode.workspace.getConfiguration().update(settingKey, shellPath, vscode.ConfigurationTarget.Global);
                    }
                    else {
                        throw new vscode_azureextensionui_1.UserCancelledError();
                    }
                }
            }
            return yield this.createShell(shellPath);
        });
    }
    createShell(shellPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return shell_1.Shell.create(shellPath, this.connectionString)
                .then(shell => {
                return shell.useDatabase(this.databaseName).then(() => shell);
            }, error => vscode.window.showErrorMessage(error));
        });
    }
}
MongoDatabaseTreeItem.contextValue = "mongoDb";
exports.MongoDatabaseTreeItem = MongoDatabaseTreeItem;
function validateMongoCollectionName(collectionName) {
    // https://docs.mongodb.com/manual/reference/limits/#Restriction-on-Collection-Names
    if (!collectionName) {
        return "Collection name cannot be empty";
    }
    const systemPrefix = "system.";
    if (collectionName.startsWith(systemPrefix)) {
        return `"${systemPrefix}" prefix is reserved for internal use`;
    }
    if (/[$]/.test(collectionName)) {
        return "Collection name cannot contain $";
    }
    return undefined;
}
exports.validateMongoCollectionName = validateMongoCollectionName;
function reportProgress(promise, title) {
    return vscode.window.withProgress({
        location: vscode.ProgressLocation.Window,
        title
    }, (_progress) => {
        return promise;
    });
}
function stripQuotes(term) {
    if ((term.startsWith('\'') && term.endsWith('\''))
        || (term.startsWith('"') && term.endsWith('"'))) {
        return term.substring(1, term.length - 1);
    }
    return term;
}
//# sourceMappingURL=MongoDatabaseTreeItem.js.map