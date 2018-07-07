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
const DocDBDatabaseTreeItem_1 = require("./tree/DocDBDatabaseTreeItem");
const DocDBAccountTreeItem_1 = require("./tree/DocDBAccountTreeItem");
const DocDBCollectionTreeItem_1 = require("./tree/DocDBCollectionTreeItem");
const DocDBDocumentTreeItem_1 = require("./tree/DocDBDocumentTreeItem");
const DocDBDocumentsTreeItem_1 = require("./tree/DocDBDocumentsTreeItem");
const DocDBStoredProcedureTreeItem_1 = require("./tree/DocDBStoredProcedureTreeItem");
const vscode_1 = require("vscode");
const DocDBStoredProcedureNodeEditor_1 = require("./editors/DocDBStoredProcedureNodeEditor");
function registerDocDBCommands(tree, editorManager) {
    vscode_azureextensionui_1.registerCommand('cosmosDB.createDocDBDatabase', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = (yield tree.showNodePicker(DocDBAccountTreeItem_1.DocDBAccountTreeItem.contextValue));
        }
        const databaseNode = yield node.createChild();
        yield databaseNode.createChild();
    }));
    vscode_azureextensionui_1.registerCommand('cosmosDB.createDocDBCollection', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = (yield tree.showNodePicker(DocDBDatabaseTreeItem_1.DocDBDatabaseTreeItem.contextValue));
        }
        yield node.createChild();
    }));
    vscode_azureextensionui_1.registerCommand('cosmosDB.createDocDBDocument', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = (yield tree.showNodePicker(DocDBDocumentsTreeItem_1.DocDBDocumentsTreeItem.contextValue));
        }
        let childNode = yield node.createChild();
        yield vscode_1.commands.executeCommand("cosmosDB.openDocument", childNode);
    }));
    vscode_azureextensionui_1.registerCommand('cosmosDB.createDocDBStoredProcedure', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = (yield tree.showNodePicker(DocDBDocumentsTreeItem_1.DocDBDocumentsTreeItem.contextValue));
        }
        let childNode = yield node.createChild();
        yield vscode_1.commands.executeCommand("cosmosDB.openStoredProcedure", childNode);
    }));
    vscode_azureextensionui_1.registerCommand('cosmosDB.deleteDocDBDatabase', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = yield tree.showNodePicker(DocDBDatabaseTreeItem_1.DocDBDatabaseTreeItem.contextValue);
        }
        yield node.deleteNode();
    }));
    vscode_azureextensionui_1.registerCommand('cosmosDB.deleteDocDBCollection', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = yield tree.showNodePicker(DocDBCollectionTreeItem_1.DocDBCollectionTreeItem.contextValue);
        }
        yield node.deleteNode();
    }));
    vscode_azureextensionui_1.registerCommand('cosmosDB.openStoredProcedure', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = yield tree.showNodePicker([DocDBStoredProcedureTreeItem_1.DocDBStoredProcedureTreeItem.contextValue]);
        }
        yield editorManager.showDocument(new DocDBStoredProcedureNodeEditor_1.DocDBStoredProcedureNodeEditor(node), 'cosmos-stored-procedure.js');
    }));
    vscode_azureextensionui_1.registerCommand('cosmosDB.deleteDocDBDocument', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = yield tree.showNodePicker(DocDBDocumentTreeItem_1.DocDBDocumentTreeItem.contextValue);
        }
        yield node.deleteNode();
    }));
    vscode_azureextensionui_1.registerCommand('cosmosDB.deleteDocDBStoredProcedure', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = yield tree.showNodePicker(DocDBStoredProcedureTreeItem_1.DocDBStoredProcedureTreeItem.contextValue);
        }
        yield node.deleteNode();
    }));
}
exports.registerDocDBCommands = registerDocDBCommands;
//# sourceMappingURL=registerDocDBCommands.js.map