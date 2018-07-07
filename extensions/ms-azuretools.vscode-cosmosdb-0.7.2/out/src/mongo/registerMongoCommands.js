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
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const vscode = require("vscode");
const MongoCollectionTreeItem_1 = require("./tree/MongoCollectionTreeItem");
const MongoDatabaseTreeItem_1 = require("./tree/MongoDatabaseTreeItem");
const MongoAccountTreeItem_1 = require("./tree/MongoAccountTreeItem");
const languageClient_1 = require("./languageClient");
const vscodeUtil = require("../utils/vscodeUtils");
const MongoDocumentTreeItem_1 = require("./tree/MongoDocumentTreeItem");
const MongoCollectionNodeEditor_1 = require("./editors/MongoCollectionNodeEditor");
const telemetry_1 = require("../utils/telemetry");
const MongoCodeLensProvider_1 = require("./services/MongoCodeLensProvider");
const extensionVariables_1 = require("../extensionVariables");
const MongoScrapbook_1 = require("./MongoScrapbook");
const connectedDBKey = 'ms-azuretools.vscode-cosmosdb.connectedDB';
function registerMongoCommands(context, actionHandler, tree, editorManager) {
    let languageClient = new languageClient_1.default(context);
    const codeLensProvider = new MongoCodeLensProvider_1.MongoCodeLensProvider();
    context.subscriptions.push(vscode.languages.registerCodeLensProvider('mongo', codeLensProvider));
    const loadPersistedMongoDBTask = loadPersistedMongoDB(context, tree, languageClient, codeLensProvider);
    actionHandler.registerCommand('cosmosDB.createMongoDatabase', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = (yield tree.showNodePicker(MongoAccountTreeItem_1.MongoAccountTreeItem.contextValue));
        }
        const childNode = yield node.createChild();
        yield vscode.commands.executeCommand('cosmosDB.connectMongoDB', childNode);
    }));
    actionHandler.registerCommand('cosmosDB.createMongoCollection', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = (yield tree.showNodePicker(MongoDatabaseTreeItem_1.MongoDatabaseTreeItem.contextValue));
        }
        const childNode = yield node.createChild();
        yield vscode.commands.executeCommand('cosmosDB.connectMongoDB', childNode.parent);
    }));
    actionHandler.registerCommand('cosmosDB.createMongoDocument', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = (yield tree.showNodePicker(MongoCollectionTreeItem_1.MongoCollectionTreeItem.contextValue));
        }
        let childNode = yield node.createChild();
        yield vscode.commands.executeCommand("cosmosDB.openDocument", childNode);
    }));
    actionHandler.registerCommand('cosmosDB.connectMongoDB', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = (yield tree.showNodePicker(MongoDatabaseTreeItem_1.MongoDatabaseTreeItem.contextValue));
        }
        const oldNodeId = extensionVariables_1.ext.connectedMongoDB && extensionVariables_1.ext.connectedMongoDB.id;
        yield languageClient.connect(node.treeItem.connectionString, node.treeItem.databaseName);
        context.globalState.update(connectedDBKey, node.id);
        setConnectedNode(node, codeLensProvider);
        yield node.refresh();
        if (oldNodeId) {
            // We have to use findNode to get the instance of the old node that's being displayed in the tree. Our specific instance might have been out-of-date
            const oldNode = yield tree.findNode(oldNodeId);
            if (oldNode) {
                yield oldNode.refresh();
            }
        }
    }));
    actionHandler.registerCommand('cosmosDB.deleteMongoDB', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = (yield tree.showNodePicker(MongoDatabaseTreeItem_1.MongoDatabaseTreeItem.contextValue));
        }
        yield node.deleteNode();
        if (extensionVariables_1.ext.connectedMongoDB && extensionVariables_1.ext.connectedMongoDB.id === node.id) {
            setConnectedNode(undefined, codeLensProvider);
            context.globalState.update(connectedDBKey, undefined);
            languageClient.disconnect();
        }
    }));
    actionHandler.registerCommand('cosmosDB.deleteMongoCollection', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = yield tree.showNodePicker(MongoCollectionTreeItem_1.MongoCollectionTreeItem.contextValue);
        }
        yield node.deleteNode();
    }));
    actionHandler.registerCommand('cosmosDB.deleteMongoDocument', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = yield tree.showNodePicker(MongoDocumentTreeItem_1.MongoDocumentTreeItem.contextValue);
        }
        yield node.deleteNode();
    }));
    actionHandler.registerCommand('cosmosDB.openCollection', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = (yield tree.showNodePicker(MongoCollectionTreeItem_1.MongoCollectionTreeItem.contextValue));
        }
        yield editorManager.showDocument(new MongoCollectionNodeEditor_1.MongoCollectionNodeEditor(node), 'cosmos-collection.json');
    }));
    actionHandler.registerCommand('cosmosDB.launchMongoShell', launchMongoShell);
    actionHandler.registerCommand('cosmosDB.newMongoScrapbook', () => __awaiter(this, void 0, void 0, function* () { return yield vscodeUtil.showNewFile('', context.extensionPath, 'Scrapbook', '.mongo'); }));
    actionHandler.registerCommand('cosmosDB.executeMongoCommand', function (commandText) {
        return __awaiter(this, void 0, void 0, function* () {
            yield loadPersistedMongoDBTask;
            if (typeof commandText === "string") {
                yield MongoScrapbook_1.executeCommandFromText(extensionVariables_1.ext.connectedMongoDB, context.extensionPath, editorManager, tree, this, commandText);
            }
            else {
                yield MongoScrapbook_1.executeCommandFromActiveEditor(extensionVariables_1.ext.connectedMongoDB, context.extensionPath, editorManager, tree, this);
            }
        });
    });
    actionHandler.registerCommand('cosmosDB.executeAllMongoCommands', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield loadPersistedMongoDBTask;
            yield MongoScrapbook_1.executeAllCommandsFromActiveEditor(extensionVariables_1.ext.connectedMongoDB, context.extensionPath, editorManager, tree, this);
        });
    });
}
exports.registerMongoCommands = registerMongoCommands;
function loadPersistedMongoDB(context, tree, languageClient, codeLensProvider) {
    return __awaiter(this, void 0, void 0, function* () {
        // NOTE: We want to make sure this function never throws or returns a rejected promise because it gets awaited multiple times
        yield vscode_azureextensionui_1.callWithTelemetryAndErrorHandling('cosmosDB.loadPersistedMongoDB', telemetry_1.reporter, undefined, function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.suppressErrorDisplay = true;
                this.properties.isActivationEvent = 'true';
                try {
                    const persistedNodeId = context.globalState.get(connectedDBKey);
                    if (persistedNodeId) {
                        const persistedNode = yield tree.findNode(persistedNodeId);
                        if (persistedNode) {
                            yield languageClient.client.onReady();
                            yield vscode.commands.executeCommand('cosmosDB.connectMongoDB', persistedNode);
                        }
                    }
                }
                finally {
                    // Get code lens provider out of initializing state if there's no connected DB
                    if (!extensionVariables_1.ext.connectedMongoDB) {
                        codeLensProvider.setConnectedDatabase(undefined);
                    }
                }
            });
        });
    });
}
function launchMongoShell() {
    const terminal = vscode.window.createTerminal('Mongo Shell');
    terminal.sendText(`mongo`);
    terminal.show();
}
function setConnectedNode(node, codeLensProvider) {
    extensionVariables_1.ext.connectedMongoDB = node;
    let dbName = node && node.treeItem.label;
    codeLensProvider.setConnectedDatabase(dbName);
}
//# sourceMappingURL=registerMongoCommands.js.map