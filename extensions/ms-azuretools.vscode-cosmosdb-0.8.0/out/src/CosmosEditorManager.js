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
const fse = require("fs-extra");
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const vscodeUtils = require("./utils/vscodeUtils");
const vscode_1 = require("vscode");
const DocDBDocumentTreeItem_1 = require("./docdb/tree/DocDBDocumentTreeItem");
const DocDBDocumentNodeEditor_1 = require("./docdb/editors/DocDBDocumentNodeEditor");
const MongoDocumentTreeItem_1 = require("./mongo/tree/MongoDocumentTreeItem");
const MongoDocumentNodeEditor_1 = require("./mongo/editors/MongoDocumentNodeEditor");
const MongoCollectionTreeItem_1 = require("./mongo/tree/MongoCollectionTreeItem");
const MongoCollectionNodeEditor_1 = require("./mongo/editors/MongoCollectionNodeEditor");
const DocDBStoredProcedureTreeItem_1 = require("./docdb/tree/DocDBStoredProcedureTreeItem");
const DocDBStoredProcedureNodeEditor_1 = require("./docdb/editors/DocDBStoredProcedureNodeEditor");
const extensionVariables_1 = require("./extensionVariables");
class CosmosEditorManager {
    constructor(globalState) {
        this.fileMap = {};
        this.ignoreSave = false;
        this.showSavePromptKey = 'cosmosDB.showSavePrompt';
        this._persistedEditorsKey = "ms-azuretools.vscode-cosmosdb.editors";
        this._globalState = globalState;
    }
    showDocument(editor, fileName, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let column = vscode.ViewColumn.Active;
            let preserveFocus = false;
            if (options && options.showInNextColumn) {
                preserveFocus = true;
                const activeEditor = vscode.window.activeTextEditor;
                if (activeEditor && activeEditor.viewColumn >= vscode.ViewColumn.One) {
                    column = activeEditor.viewColumn < vscode_1.ViewColumn.Three ? activeEditor.viewColumn + 1 : vscode_1.ViewColumn.One;
                }
            }
            const localDocPath = path.join(os.tmpdir(), 'vscode-cosmosdb-editor', fileName);
            yield fse.ensureFile(localDocPath);
            const document = yield vscode.workspace.openTextDocument(localDocPath);
            if (document.isDirty) {
                const overwriteFlag = yield vscode.window.showWarningMessage(`You are about to overwrite "${fileName}", which has unsaved changes. Do you want to continue?`, { modal: true }, vscode_azureextensionui_1.DialogResponses.yes, vscode_azureextensionui_1.DialogResponses.cancel);
                if (overwriteFlag !== vscode_azureextensionui_1.DialogResponses.yes) {
                    throw new vscode_azureextensionui_1.UserCancelledError();
                }
            }
            this.fileMap[localDocPath] = editor;
            const fileMapLabels = this._globalState.get(this._persistedEditorsKey, {});
            Object.keys(this.fileMap).forEach((key) => fileMapLabels[key] = (this.fileMap[key]).id);
            this._globalState.update(this._persistedEditorsKey, fileMapLabels);
            const textEditor = yield vscode.window.showTextDocument(document, column, preserveFocus);
            const data = yield editor.getData();
            yield this.updateEditor(data, textEditor, editor);
        });
    }
    updateMatchingNode(documentUri, tree) {
        return __awaiter(this, void 0, void 0, function* () {
            let filePath = Object.keys(this.fileMap).find((fp) => path.relative(documentUri.fsPath, fp) === '');
            if (!filePath) {
                filePath = yield this.loadPersistedEditor(documentUri, tree);
            }
            const document = yield vscode.workspace.openTextDocument(documentUri.fsPath);
            yield this.updateToCloud(this.fileMap[filePath], document);
        });
    }
    updateToCloud(editor, doc) {
        return __awaiter(this, void 0, void 0, function* () {
            const newContent = editor.convertFromString(doc.getText());
            const updatedContent = yield editor.update(newContent);
            const timestamp = (new Date()).toLocaleTimeString();
            extensionVariables_1.ext.outputChannel.appendLine(`${timestamp}: Updated entity "${editor.label}"`);
            extensionVariables_1.ext.outputChannel.show();
            yield this.updateEditor(updatedContent, vscode.window.activeTextEditor, editor);
        });
    }
    updateEditor(data, textEditor, editor) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedText = editor.convertToString(data);
            yield vscodeUtils.writeToEditor(textEditor, updatedText);
            this.ignoreSave = true;
            try {
                yield textEditor.document.save();
            }
            finally {
                this.ignoreSave = false;
            }
        });
    }
    loadPersistedEditor(documentUri, tree) {
        return __awaiter(this, void 0, void 0, function* () {
            const persistedEditors = this._globalState.get(this._persistedEditorsKey);
            //Based on the documentUri, split just the appropriate key's value on '/'
            if (persistedEditors) {
                const editorFilePath = Object.keys(persistedEditors).find((label) => path.relative(documentUri.fsPath, label) === '');
                if (editorFilePath) {
                    const editorNode = yield tree.findNode(persistedEditors[editorFilePath]);
                    let editor;
                    if (editorNode) {
                        if (editorNode.treeItem instanceof MongoCollectionTreeItem_1.MongoCollectionTreeItem) {
                            editor = new MongoCollectionNodeEditor_1.MongoCollectionNodeEditor(editorNode);
                        }
                        else if (editorNode.treeItem instanceof DocDBDocumentTreeItem_1.DocDBDocumentTreeItem) {
                            editor = new DocDBDocumentNodeEditor_1.DocDBDocumentNodeEditor(editorNode);
                        }
                        else if (editorNode.treeItem instanceof MongoDocumentTreeItem_1.MongoDocumentTreeItem) {
                            editor = new MongoDocumentNodeEditor_1.MongoDocumentNodeEditor(editorNode);
                        }
                        else if (editorNode.treeItem instanceof DocDBStoredProcedureTreeItem_1.DocDBStoredProcedureTreeItem) {
                            editor = new DocDBStoredProcedureNodeEditor_1.DocDBStoredProcedureNodeEditor(editorNode);
                        }
                        else {
                            throw new Error("Unexpected type of Editor treeItem");
                        }
                        this.fileMap[editorFilePath] = editor;
                    }
                    else {
                        throw new Error("Failed to find entity on the tree. Please check the explorer to confirm that the entity exists, and that permissions are intact.");
                    }
                }
                return editorFilePath;
            }
            else {
                return undefined;
            }
        });
    }
    onDidSaveTextDocument(context, doc, tree) {
        return __awaiter(this, void 0, void 0, function* () {
            context.suppressTelemetry = true;
            let filePath = Object.keys(this.fileMap).find((fp) => path.relative(doc.uri.fsPath, fp) === '');
            if (!filePath) {
                filePath = yield this.loadPersistedEditor(doc.uri, tree);
            }
            if (!this.ignoreSave && filePath) {
                context.suppressTelemetry = false;
                const editor = this.fileMap[filePath];
                const showSaveWarning = vscode.workspace.getConfiguration().get(this.showSavePromptKey);
                if (showSaveWarning !== false) {
                    const message = `Saving 'cosmos-editor.json' will update the entity "${editor.label}" to the Cloud.`;
                    const result = yield vscode.window.showWarningMessage(message, vscode_azureextensionui_1.DialogResponses.upload, vscode_azureextensionui_1.DialogResponses.alwaysUpload, vscode_azureextensionui_1.DialogResponses.cancel);
                    if (result === vscode_azureextensionui_1.DialogResponses.alwaysUpload) {
                        yield vscode.workspace.getConfiguration().update(this.showSavePromptKey, false, vscode.ConfigurationTarget.Global);
                    }
                    else if (result !== vscode_azureextensionui_1.DialogResponses.upload) {
                        throw new vscode_azureextensionui_1.UserCancelledError();
                    }
                }
                yield this.updateToCloud(editor, doc);
            }
        });
    }
}
exports.CosmosEditorManager = CosmosEditorManager;
//# sourceMappingURL=CosmosEditorManager.js.map