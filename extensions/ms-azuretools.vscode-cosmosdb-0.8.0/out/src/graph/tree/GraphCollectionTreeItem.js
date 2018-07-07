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
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const vscode = require("vscode");
const GraphTreeItem_1 = require("./GraphTreeItem");
const DocDBStoredProceduresTreeItem_1 = require("../../docdb/tree/DocDBStoredProceduresTreeItem");
const getDocumentClient_1 = require("../../docdb/getDocumentClient");
class GraphCollectionTreeItem {
    constructor(database, collection, _documentEndpoint, _masterKey, _isEmulator) {
        this._documentEndpoint = _documentEndpoint;
        this._masterKey = _masterKey;
        this._isEmulator = _isEmulator;
        this.contextValue = GraphCollectionTreeItem.contextValue;
        this._database = database;
        this._collection = collection;
        this._graphTreeItem = new GraphTreeItem_1.GraphTreeItem(this._database, this._collection);
        this._storedProceduresTreeItem = new DocDBStoredProceduresTreeItem_1.DocDBStoredProceduresTreeItem(this._documentEndpoint, this._masterKey, this, this._isEmulator);
    }
    get id() {
        return this._collection.id;
    }
    get label() {
        return this._collection.id;
    }
    get link() {
        return this._collection._self;
    }
    get iconPath() {
        return {
            light: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icons', 'theme-agnostic', 'Collection.svg'),
            dark: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icons', 'theme-agnostic', 'Collection.svg'),
        };
    }
    getDocumentClient() {
        return getDocumentClient_1.getDocumentClient(this._documentEndpoint, this._masterKey, this._isEmulator);
    }
    loadMoreChildren(_node, _clearCache) {
        return __awaiter(this, void 0, void 0, function* () {
            return [this._graphTreeItem, this._storedProceduresTreeItem];
        });
    }
    hasMoreChildren() {
        return false;
    }
    deleteTreeItem(_node) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = `Are you sure you want to delete graph '${this.label}' and its contents?`;
            const result = yield vscode.window.showWarningMessage(message, { modal: true }, vscode_azureextensionui_1.DialogResponses.deleteResponse, vscode_azureextensionui_1.DialogResponses.cancel);
            if (result === vscode_azureextensionui_1.DialogResponses.deleteResponse) {
                const client = this._database.getDocumentClient();
                yield new Promise((resolve, reject) => {
                    // tslint:disable-next-line:no-function-expression // Grandfathered in
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
}
GraphCollectionTreeItem.contextValue = "cosmosDBGraph";
exports.GraphCollectionTreeItem = GraphCollectionTreeItem;
//# sourceMappingURL=GraphCollectionTreeItem.js.map