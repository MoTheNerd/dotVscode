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
const getDocumentClient_1 = require("../getDocumentClient");
const path = require("path");
const DocDBStoredProceduresTreeItem_1 = require("./DocDBStoredProceduresTreeItem");
const DocDBStoredProcedureTreeItem_1 = require("./DocDBStoredProcedureTreeItem");
const DocDBDocumentsTreeItem_1 = require("./DocDBDocumentsTreeItem");
const DocDBDocumentTreeItem_1 = require("./DocDBDocumentTreeItem");
/**
 * Represents a DocumentDB collection
 */
class DocDBCollectionTreeItem {
    constructor(_documentEndpoint, _masterKey, _collection, _isEmulator) {
        this._documentEndpoint = _documentEndpoint;
        this._masterKey = _masterKey;
        this._collection = _collection;
        this._isEmulator = _isEmulator;
        this.contextValue = DocDBCollectionTreeItem.contextValue;
        this._documentsTreeItem = new DocDBDocumentsTreeItem_1.DocDBDocumentsTreeItem(this._documentEndpoint, this._masterKey, this, this._isEmulator);
        this._storedProceduresTreeItem = new DocDBStoredProceduresTreeItem_1.DocDBStoredProceduresTreeItem(this._documentEndpoint, this._masterKey, this, this._isEmulator);
    }
    get id() {
        return this._collection.id;
    }
    get label() {
        return this._collection.id;
    }
    get iconPath() {
        return {
            light: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icons', 'theme-agnostic', 'Collection.svg'),
            dark: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icons', 'theme-agnostic', 'Collection.svg')
        };
    }
    get link() {
        return this._collection._self;
    }
    get partitionKey() {
        return this._collection.partitionKey;
    }
    getDocumentClient() {
        return getDocumentClient_1.getDocumentClient(this._documentEndpoint, this._masterKey, this._isEmulator);
    }
    deleteTreeItem(_node) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = `Are you sure you want to delete collection '${this.label}' and its contents?`;
            const result = yield vscode.window.showWarningMessage(message, { modal: true }, vscode_azureextensionui_1.DialogResponses.deleteResponse, vscode_azureextensionui_1.DialogResponses.cancel);
            if (result === vscode_azureextensionui_1.DialogResponses.deleteResponse) {
                const client = this.getDocumentClient();
                yield new Promise((resolve, reject) => {
                    client.deleteCollection(this.link, function (err) {
                        err ? reject(err) : resolve();
                    });
                });
            }
            else {
                throw new vscode_azureextensionui_1.UserCancelledError();
            }
        });
    }
    loadMoreChildren(_node, _clearCache) {
        return __awaiter(this, void 0, void 0, function* () {
            return [this._documentsTreeItem, this._storedProceduresTreeItem];
        });
    }
    hasMoreChildren() {
        return false;
    }
    pickTreeItem(expectedContextValue) {
        switch (expectedContextValue) {
            case DocDBDocumentsTreeItem_1.DocDBDocumentsTreeItem.contextValue:
            case DocDBDocumentTreeItem_1.DocDBDocumentTreeItem.contextValue:
                return this._documentsTreeItem;
            case DocDBStoredProceduresTreeItem_1.DocDBStoredProceduresTreeItem.contextValue:
            case DocDBStoredProcedureTreeItem_1.DocDBStoredProcedureTreeItem.contextValue:
                return this._storedProceduresTreeItem;
            default:
                return undefined;
        }
    }
}
DocDBCollectionTreeItem.contextValue = "cosmosDBDocumentCollection";
exports.DocDBCollectionTreeItem = DocDBCollectionTreeItem;
//# sourceMappingURL=DocDBCollectionTreeItem.js.map