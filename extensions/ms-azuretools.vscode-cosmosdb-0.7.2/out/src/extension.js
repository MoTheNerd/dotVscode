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
const vscodeUtil = require("./utils/vscodeUtils");
const cpUtil = require("./utils/cp");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const telemetry_1 = require("./utils/telemetry");
const CosmosEditorManager_1 = require("./CosmosEditorManager");
const CosmosDBAccountProvider_1 = require("./tree/CosmosDBAccountProvider");
const AttachedAccountsTreeItem_1 = require("./tree/AttachedAccountsTreeItem");
const vscodeUtils_1 = require("./utils/vscodeUtils");
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
function activate(context) {
    context.subscriptions.push(new telemetry_1.Reporter(context));
    const ui = new vscode_azureextensionui_1.AzureUserInput(context.globalState);
    const tree = new vscode_azureextensionui_1.AzureTreeDataProvider(new CosmosDBAccountProvider_1.CosmosDBAccountProvider(), 'cosmosDB.loadMore', ui, telemetry_1.reporter, [new AttachedAccountsTreeItem_1.AttachedAccountsTreeItem(context.globalState)]);
    context.subscriptions.push(tree);
    context.subscriptions.push(vscode.window.registerTreeDataProvider('cosmosDBExplorer', tree));
    const editorManager = new CosmosEditorManager_1.CosmosEditorManager(context.globalState);
    context.subscriptions.push(vscodeUtil.getOutputChannel());
    const actionHandler = new vscode_azureextensionui_1.AzureActionHandler(context, vscodeUtils_1.getOutputChannel(), telemetry_1.reporter);
    registerDocDBCommands_1.registerDocDBCommands(actionHandler, tree, editorManager);
    registerGraphCommands_1.registerGraphCommands(context, actionHandler, tree);
    registerMongoCommands_1.registerMongoCommands(context, actionHandler, tree, editorManager);
    // Common commands
    const accountContextValues = [GraphAccountTreeItem_1.GraphAccountTreeItem.contextValue, DocDBAccountTreeItem_1.DocDBAccountTreeItem.contextValue, TableAccountTreeItem_1.TableAccountTreeItem.contextValue, MongoAccountTreeItem_1.MongoAccountTreeItem.contextValue];
    actionHandler.registerCommand('cosmosDB.selectSubscriptions', () => vscode.commands.executeCommand("azure-account.selectSubscriptions"));
    actionHandler.registerCommand('cosmosDB.createAccount', function (node) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!node) {
                node = (yield tree.showNodePicker(vscode_azureextensionui_1.AzureTreeDataProvider.subscriptionContextValue));
            }
            yield node.createChild(this);
        });
    });
    actionHandler.registerCommand('cosmosDB.deleteAccount', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = yield tree.showNodePicker(accountContextValues);
        }
        yield node.deleteNode();
    }));
    actionHandler.registerCommand('cosmosDB.attachDatabaseAccount', () => __awaiter(this, void 0, void 0, function* () {
        const attachedAccountsNode = yield getAttachedNode(tree);
        yield attachedAccountsNode.treeItem.attachNewAccount();
        tree.refresh(attachedAccountsNode);
    }));
    actionHandler.registerCommand('cosmosDB.attachEmulator', () => __awaiter(this, void 0, void 0, function* () {
        const attachedAccountsNode = yield getAttachedNode(tree);
        yield attachedAccountsNode.treeItem.attachEmulator();
        tree.refresh(attachedAccountsNode);
    }));
    actionHandler.registerCommand('cosmosDB.refresh', (node) => __awaiter(this, void 0, void 0, function* () { return yield tree.refresh(node); }));
    actionHandler.registerCommand('cosmosDB.detachDatabaseAccount', (node) => __awaiter(this, void 0, void 0, function* () {
        const attachedNode = yield getAttachedNode(tree);
        if (!node) {
            node = yield tree.showNodePicker(accountContextValues.map((val) => val += AttachedAccountsTreeItem_1.AttachedAccountSuffix), attachedNode);
        }
        yield attachedNode.treeItem.detach(node.treeItem.id);
        yield tree.refresh(attachedNode);
    }));
    actionHandler.registerCommand('cosmosDB.openInPortal', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = yield tree.showNodePicker(accountContextValues);
        }
        node.openInPortal();
    }));
    actionHandler.registerCommand('cosmosDB.copyConnectionString', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = (yield tree.showNodePicker(accountContextValues));
        }
        yield copyConnectionString(node);
    }));
    actionHandler.registerCommand('cosmosDB.openDocument', (node) => __awaiter(this, void 0, void 0, function* () {
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
    actionHandler.registerCommand('cosmosDB.update', (filePath) => editorManager.updateMatchingNode(filePath, tree));
    actionHandler.registerCommand('cosmosDB.loadMore', (node) => tree.loadMore(node));
    actionHandler.registerEvent('cosmosDB.CosmosEditorManager.onDidSaveTextDocument', vscode.workspace.onDidSaveTextDocument, function (doc) {
        return __awaiter(this, void 0, void 0, function* () { yield editorManager.onDidSaveTextDocument(this, doc, tree); });
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