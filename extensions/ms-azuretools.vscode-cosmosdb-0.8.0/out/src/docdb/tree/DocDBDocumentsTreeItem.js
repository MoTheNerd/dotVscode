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
const DocDBDocumentTreeItem_1 = require("./DocDBDocumentTreeItem");
/**
 * This class provides logic for DocumentDB collections
 */
class DocDBDocumentsTreeItem extends DocDBTreeItemBase_1.DocDBTreeItemBase {
    constructor(documentEndpoint, masterKey, _collection, isEmulator) {
        super(documentEndpoint, masterKey, isEmulator);
        this._collection = _collection;
        this.contextValue = DocDBDocumentsTreeItem.contextValue;
        this.childTypeLabel = "Documents";
    }
    get iconPath() {
        return {
            light: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icons', 'theme-agnostic', 'Collection.svg'),
            dark: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icons', 'theme-agnostic', 'Collection.svg')
        };
    }
    get id() {
        return "$Documents";
    }
    get label() {
        return "Documents";
    }
    get link() {
        return this._collection.link;
    }
    getIterator(client, feedOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client.readDocuments(this.link, feedOptions);
        });
    }
    initChild(document) {
        return new DocDBDocumentTreeItem_1.DocDBDocumentTreeItem(this._collection, document);
    }
    createChild(_node, showCreatingNode) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.getDocumentClient();
            let docID = yield vscode.window.showInputBox({
                prompt: "Enter a unique document ID or leave blank for a generated ID",
                ignoreFocusOut: true
            });
            if (docID || docID === "") {
                docID = docID.trim();
                let body = { 'id': docID };
                const partitionKey = this._collection.partitionKey && this._collection.partitionKey.paths[0];
                if (partitionKey) {
                    const partitionKeyValue = yield vscode.window.showInputBox({
                        prompt: `Enter a value for the partition key ("${partitionKey}")`,
                        ignoreFocusOut: true
                    });
                    if (partitionKeyValue) {
                        // Unlike delete/replace, createDocument does not accept a partition key value via an options parameter.
                        // We need to present the partitionKey value as part of the document contents
                        Object.assign(body, this.createPartitionPathObject(partitionKey, partitionKeyValue));
                    }
                }
                showCreatingNode(docID);
                const document = yield new Promise((resolve, reject) => {
                    client.createDocument(this.link, body, (err, result) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(result);
                        }
                    });
                });
                return this.initChild(document);
            }
            throw new vscode_azureextensionui_1.UserCancelledError();
        });
    }
    // Create a nested Object given the partition key path and value
    createPartitionPathObject(partitionKey, partitionKeyValue) {
        //remove leading slash
        if (partitionKey[0] === '/') {
            partitionKey = partitionKey.slice(1);
        }
        let keyPath = partitionKey.split('/');
        let PartitionPath = {};
        let interim = PartitionPath;
        let i;
        for (i = 0; i < keyPath.length - 1; i++) {
            interim[keyPath[i]] = {};
            interim = interim[keyPath[i]];
        }
        interim[keyPath[i]] = partitionKeyValue;
        return PartitionPath;
    }
}
DocDBDocumentsTreeItem.contextValue = "cosmosDBDocumentsGroup";
exports.DocDBDocumentsTreeItem = DocDBDocumentsTreeItem;
//# sourceMappingURL=DocDBDocumentsTreeItem.js.map