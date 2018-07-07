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
const vscode = require("vscode");
const DocDBTreeItemBase_1 = require("./DocDBTreeItemBase");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const DocDBStoredProcedureTreeItem_1 = require("./DocDBStoredProcedureTreeItem");
const constants_1 = require("../../constants");
/**
 * This class represents the DocumentDB "Stored Procedures" node in the tree
 */
class DocDBStoredProceduresTreeItem extends DocDBTreeItemBase_1.DocDBTreeItemBase {
    constructor(endpoint, masterKey, _collection, isEmulator) {
        super(endpoint, masterKey, isEmulator);
        this._collection = _collection;
        this.contextValue = DocDBStoredProceduresTreeItem.contextValue;
        this.childTypeLabel = "Stored Procedure";
    }
    initChild(resource) {
        return new DocDBStoredProcedureTreeItem_1.DocDBStoredProcedureTreeItem(this.documentEndpoint, this.masterKey, this.isEmulator, this._collection.getDocumentClient(), resource);
    }
    get iconPath() {
        return {
            light: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icons', 'theme-agnostic', 'stored procedures.svg'),
            dark: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icons', 'theme-agnostic', 'stored procedures.svg')
        };
    }
    createChild(_node, showCreatingNode) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.getDocumentClient();
            let spID = yield vscode.window.showInputBox({
                prompt: "Enter a unique stored Procedure ID",
                ignoreFocusOut: true
            });
            if (spID || spID === "") {
                spID = spID.trim();
                showCreatingNode(spID);
                const sproc = yield new Promise((resolve, reject) => {
                    client.createStoredProcedure(this.link, { id: spID, body: constants_1.defaultStoredProcedure }, (err, result) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(result);
                        }
                    });
                });
                return this.initChild(sproc);
            }
            throw new vscode_azureextensionui_1.UserCancelledError();
        });
    }
    get id() {
        return "$StoredProcedures";
    }
    get label() {
        return "Stored Procedures";
    }
    get link() {
        return this._collection.link;
    }
    getIterator(client, feedOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client.readStoredProcedures(this.link, feedOptions);
        });
    }
}
DocDBStoredProceduresTreeItem.contextValue = "cosmosDBStoredProceduresGroup";
exports.DocDBStoredProceduresTreeItem = DocDBStoredProceduresTreeItem;
//# sourceMappingURL=DocDBStoredProceduresTreeItem.js.map