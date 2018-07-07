/*--------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
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
const copypaste = require("copy-paste");
const cpUtil = require("./utils/cp");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const telemetry_1 = require("./utils/telemetry");
const CosmosEditorManager_1 = require("./CosmosEditorManager");
const CosmosDBAccountProvider_1 = require("./tree/CosmosDBAccountProvider");
const AttachedAccountsTreeItem_1 = require("./tree/AttachedAccountsTreeItem");
const MongoDocumentNodeEditor_1 = require("./mongo/editors/MongoDocumentNodeEditor");
const MongoDocumentTreeItem_1 = require("./mongo/tree/MongoDocumentTreeItem");
const DocDBDocumentTreeItem_1 = require("./docdb/tree/DocDBDocumentTreeItem");
const DocDBDocumentNodeEditor_1 = require("./docdb/editors/DocDBDocumentNodeEditor");
const registerDocDBCommands_1 = require("./docdb/registerDocDBCommands");
const registerGraphCommands_1 = require("./graph/registerGraphCommands");
const registerMongoCommands_1 = require("./mongo/registerMongoCommands");
const MongoAccountTreeItem_1 = require("./mongo/tree/MongoAccountTreeItem");
const GraphAccountTreeItem_1 = require("./graph/tree/GraphAccountTreeItem");
const DocDBAccountTreeItem_1 = require("./docdb/tree/DocDBAccountTreeItem");
const TableAccountTreeItem_1 = require("./table/tree/TableAccountTreeItem");
const extensionVariables_1 = require("./extensionVariables");
function activate(context) {
    vscode_azureextensionui_1.registerUIExtensionVariables(extensionVariables_1.ext);
    extensionVariables_1.ext.context = context;
    context.subscriptions.push(new telemetry_1.Reporter(context));
    const ui = new vscode_azureextensionui_1.AzureUserInput(context.globalState);
    extensionVariables_1.ext.ui = ui;
    const tree = new vscode_azureextensionui_1.AzureTreeDataProvider(new CosmosDBAccountProvider_1.CosmosDBAccountProvider(), 'cosmosDB.loadMore', [new AttachedAccountsTreeItem_1.AttachedAccountsTreeItem(context.globalState)]);
    context.subscriptions.push(tree);
    context.subscriptions.push(vscode.window.registerTreeDataProvider('cosmosDBExplorer', tree));
    const editorManager = new CosmosEditorManager_1.CosmosEditorManager(context.globalState);
    extensionVariables_1.ext.outputChannel = vscode.window.createOutputChannel("Azure Cosmos DB");
    context.subscriptions.push(extensionVariables_1.ext.outputChannel);
    registerDocDBCommands_1.registerDocDBCommands(tree, editorManager);
    registerGraphCommands_1.registerGraphCommands(context, tree);
    registerMongoCommands_1.registerMongoCommands(context, tree, editorManager);
    // Common commands
    const accountContextValues = [GraphAccountTreeItem_1.GraphAccountTreeItem.contextValue, DocDBAccountTreeItem_1.DocDBAccountTreeItem.contextValue, TableAccountTreeItem_1.TableAccountTreeItem.contextValue, MongoAccountTreeItem_1.MongoAccountTreeItem.contextValue];
    vscode_azureextensionui_1.registerCommand('cosmosDB.selectSubscriptions', () => vscode.commands.executeCommand("azure-account.selectSubscriptions"));
    vscode_azureextensionui_1.registerCommand('cosmosDB.createAccount', function (node) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!node) {
                node = (yield tree.showNodePicker(vscode_azureextensionui_1.AzureTreeDataProvider.subscriptionContextValue));
            }
            yield node.createChild(this);
        });
    });
    vscode_azureextensionui_1.registerCommand('cosmosDB.deleteAccount', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = yield tree.showNodePicker(accountContextValues);
        }
        yield node.deleteNode();
    }));
    vscode_azureextensionui_1.registerCommand('cosmosDB.attachDatabaseAccount', () => __awaiter(this, void 0, void 0, function* () {
        const attachedAccountsNode = yield getAttachedNode(tree);
        yield attachedAccountsNode.treeItem.attachNewAccount();
        yield tree.refresh(attachedAccountsNode);
    }));
    vscode_azureextensionui_1.registerCommand('cosmosDB.attachEmulator', () => __awaiter(this, void 0, void 0, function* () {
        const attachedAccountsNode = yield getAttachedNode(tree);
        yield attachedAccountsNode.treeItem.attachEmulator();
        yield tree.refresh(attachedAccountsNode);
    }));
    vscode_azureextensionui_1.registerCommand('cosmosDB.refresh', (node) => __awaiter(this, void 0, void 0, function* () { return yield tree.refresh(node); }));
    vscode_azureextensionui_1.registerCommand('cosmosDB.detachDatabaseAccount', (node) => __awaiter(this, void 0, void 0, function* () {
        const attachedNode = yield getAttachedNode(tree);
        if (!node) {
            node = yield tree.showNodePicker(accountContextValues.map((val) => val += AttachedAccountsTreeItem_1.AttachedAccountSuffix), attachedNode);
        }
        yield attachedNode.treeItem.detach(node.treeItem.id);
        yield tree.refresh(attachedNode);
    }));
    vscode_azureextensionui_1.registerCommand('cosmosDB.openInPortal', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = yield tree.showNodePicker(accountContextValues);
        }
        node.openInPortal();
    }));
    vscode_azureextensionui_1.registerCommand('cosmosDB.copyConnectionString', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = (yield tree.showNodePicker(accountContextValues));
        }
        yield copyConnectionString(node);
    }));
    vscode_azureextensionui_1.registerCommand('cosmosDB.openDocument', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = yield tree.showNodePicker([MongoDocumentTreeItem_1.MongoDocumentTreeItem.contextValue, DocDBDocumentTreeItem_1.DocDBDocumentTreeItem.contextValue]);
        }
        if (node.treeItem instanceof MongoDocumentTreeItem_1.MongoDocumentTreeItem) {
            yield editorManager.showDocument(new MongoDocumentNodeEditor_1.MongoDocumentNodeEditor(node), 'cosmos-document.json');
        }
        else if (node.treeItem instanceof DocDBDocumentTreeItem_1.DocDBDocumentTreeItem) {
            yield editorManager.showDocument(new DocDBDocumentNodeEditor_1.DocDBDocumentNodeEditor(node), 'cosmos-document.json');
        }
    }));
    vscode_azureextensionui_1.registerCommand('cosmosDB.update', (filePath) => editorManager.updateMatchingNode(filePath, tree));
    vscode_azureextensionui_1.registerCommand('cosmosDB.loadMore', (node) => tree.loadMore(node));
    vscode_azureextensionui_1.registerEvent('cosmosDB.CosmosEditorManager.onDidSaveTextDocument', vscode.workspace.onDidSaveTextDocument, function (doc) {
        return __awaiter(this, void 0, void 0, function* () {
            yield editorManager.onDidSaveTextDocument(this, doc, tree);
        });
    });
    vscode_azureextensionui_1.registerEvent('cosmosDB.onDidChangeConfiguration', vscode.workspace.onDidChangeConfiguration, function (event) {
        return __awaiter(this, void 0, void 0, function* () {
            this.properties.isActivationEvent = "true";
            this.suppressErrorDisplay = true;
            if (event.affectsConfiguration(extensionVariables_1.ext.settingsKeys.documentLabelFields)) {
                yield vscode.commands.executeCommand("cosmosDB.refresh");
            }
        });
    });
}
exports.activate = activate;
function getAttachedNode(tree) {
    return __awaiter(this, void 0, void 0, function* () {
        const rootNodes = yield tree.getChildren();
        return rootNodes.find((node) => node.treeItem instanceof AttachedAccountsTreeItem_1.AttachedAccountsTreeItem);
    });
}
function copyConnectionString(node) {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.platform !== 'linux' || (yield cpUtil.commandSucceeds('xclip', '-version'))) {
            copypaste.copy(node.treeItem.connectionString);
        }
        else {
            vscode.window.showErrorMessage('You must have xclip installed to copy the connection string.');
        }
    });
}
// this method is called when your extension is deactivated
function deactivate() {
    // NOOP
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map