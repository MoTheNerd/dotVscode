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
const fse = require("fs-extra");
const vscode = require("vscode");
const MongoAccountTreeItem_1 = require("../mongo/tree/MongoAccountTreeItem");
const DocDBAccountTreeItemBase_1 = require("../docdb/tree/DocDBAccountTreeItemBase");
const outputChannel = vscode.window.createOutputChannel("Azure CosmosDB");
function getOutputChannel() {
    return outputChannel;
}
exports.getOutputChannel = getOutputChannel;
function dispose(disposables) {
    disposables.forEach(d => d.dispose());
    return [];
}
exports.dispose = dispose;
function toDisposable(dispose) {
    return { dispose };
}
exports.toDisposable = toDisposable;
function showNewFile(data, extensionPath, fileName, fileExtension, column) {
    return __awaiter(this, void 0, void 0, function* () {
        let uri;
        const folderPath = vscode.workspace.rootPath || extensionPath;
        const fullFileName = yield getUniqueFileName(folderPath, fileName, fileExtension);
        uri = vscode.Uri.file(path.join(folderPath, fullFileName)).with({ scheme: 'untitled' });
        const textDocument = yield vscode.workspace.openTextDocument(uri);
        const editor = yield vscode.window.showTextDocument(textDocument, column ? column > vscode.ViewColumn.Three ? vscode.ViewColumn.One : column : undefined, true);
        yield writeToEditor(editor, data);
    });
}
exports.showNewFile = showNewFile;
function writeToEditor(editor, data) {
    return __awaiter(this, void 0, void 0, function* () {
        yield editor.edit((editBuilder) => {
            if (editor.document.lineCount > 0) {
                const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
                editBuilder.delete(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(lastLine.range.start.line, lastLine.range.end.character)));
            }
            editBuilder.insert(new vscode.Position(0, 0), data);
        });
    });
}
exports.writeToEditor = writeToEditor;
function getUniqueFileName(folderPath, fileName, fileExtension) {
    return __awaiter(this, void 0, void 0, function* () {
        let count = 1;
        const maxCount = 1024;
        while (count < maxCount) {
            const fileSuffix = count === 0 ? '' : '-' + count.toString();
            const fullFileName = fileName + fileSuffix + fileExtension;
            const fullPath = path.join(folderPath, fullFileName);
            const pathExists = yield fse.pathExists(fullPath);
            const editorExists = vscode.workspace.textDocuments.find(doc => doc.uri.fsPath === fullPath) !== undefined;
            if (!pathExists && !editorExists) {
                return fullFileName;
            }
            count += 1;
        }
        throw new Error('Could not find unique name for new file.');
    });
}
function tryfetchNodeModule(moduleName) {
    try {
        // tslint:disable-next-line:non-literal-require
        return require(`${vscode.env.appRoot}/node_modules.asar/${moduleName}`);
    }
    catch (err) {
        //Empty catch block intended
    }
    try {
        // tslint:disable-next-line:non-literal-require
        return require(`${vscode.env.appRoot}/node_modules/${moduleName}`);
    }
    catch (err) {
        //Empty catch block intended
    }
    return null;
}
exports.tryfetchNodeModule = tryfetchNodeModule;
function getNodeEditorLabel(node) {
    let labels = [node.treeItem.label];
    while (node.parent) {
        node = node.parent;
        labels.unshift(node.treeItem.label);
        if (isAccountTreeItem(node.treeItem)) {
            break;
        }
    }
    return labels.join('/');
}
exports.getNodeEditorLabel = getNodeEditorLabel;
function isAccountTreeItem(treeItem) {
    return (treeItem instanceof MongoAccountTreeItem_1.MongoAccountTreeItem) || (treeItem instanceof DocDBAccountTreeItemBase_1.DocDBAccountTreeItemBase);
}
//# sourceMappingURL=vscodeUtils.js.map