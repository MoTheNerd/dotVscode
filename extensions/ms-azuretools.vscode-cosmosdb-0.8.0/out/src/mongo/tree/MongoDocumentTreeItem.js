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
const _ = require("underscore");
const vscode = require("vscode");
const path = require("path");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const vscodeUtils_1 = require("../../utils/vscodeUtils");
class MongoDocumentTreeItem {
    constructor(document, collection) {
        this.contextValue = MongoDocumentTreeItem.contextValue;
        this.commandId = 'cosmosDB.openDocument';
        this.document = document;
        this._label = vscodeUtils_1.getDocumentTreeItemLabel(this.document);
        this._collection = collection;
    }
    get id() {
        return this.document._id.toString();
    }
    refreshLabel() {
        return __awaiter(this, void 0, void 0, function* () {
            this._label = vscodeUtils_1.getDocumentTreeItemLabel(this.document);
        });
    }
    get label() {
        return this._label;
    }
    get iconPath() {
        return {
            light: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icons', 'theme-agnostic', 'Document.svg'),
            dark: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icons', 'theme-agnostic', 'Document.svg'),
        };
    }
    deleteTreeItem(_node) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = `Are you sure you want to delete document '${this._label}'?`;
            const dialogResult = yield vscode.window.showWarningMessage(message, { modal: true }, vscode_azureextensionui_1.DialogResponses.deleteResponse, vscode_azureextensionui_1.DialogResponses.cancel);
            if (dialogResult === vscode_azureextensionui_1.DialogResponses.deleteResponse) {
                const deleteResult = yield this._collection.deleteOne({ "_id": this.document._id });
                if (deleteResult.deletedCount !== 1) {
                    throw new Error(`Failed to delete document with _id '${this.document._id}'.`);
                }
            }
            else {
                throw new vscode_azureextensionui_1.UserCancelledError();
            }
        });
    }
    update(newDocument) {
        return __awaiter(this, void 0, void 0, function* () {
            this.document = yield MongoDocumentTreeItem.update(this._collection, newDocument);
            yield this.refreshLabel();
            return this.document;
        });
    }
    static update(collection, newDocument) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!newDocument["_id"]) {
                throw new Error(`The "_id" field is required to update a document.`);
            }
            const filter = { _id: newDocument._id };
            const result = yield collection.updateOne(filter, _.omit(newDocument, '_id'));
            if (result.modifiedCount !== 1) {
                throw new Error(`Failed to update document with _id '${newDocument._id}'.`);
            }
            return newDocument;
        });
    }
}
MongoDocumentTreeItem.contextValue = "MongoDocument";
exports.MongoDocumentTreeItem = MongoDocumentTreeItem;
//# sourceMappingURL=MongoDocumentTreeItem.js.map