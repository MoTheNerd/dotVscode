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
const MongoCollectionNodeEditor_1 = require("./MongoCollectionNodeEditor");
const MongoCollectionTreeItem_1 = require("../tree/MongoCollectionTreeItem");
// tslint:disable:no-var-requires
const EJSON = require("mongodb-extended-json");
class MongoFindResultEditor {
    constructor(databaseNode, command, tree) {
        this._databaseNode = databaseNode;
        this._command = command;
        this._tree = tree;
    }
    get label() {
        const accountNode = this._databaseNode.parent;
        return `${accountNode.treeItem.label}/${this._databaseNode.treeItem.label}/${this._command.collection}`;
    }
    getData() {
        return __awaiter(this, void 0, void 0, function* () {
            const dbTreeItem = this._databaseNode.treeItem;
            const db = yield dbTreeItem.getDb();
            const collection = db.collection(this._command.collection);
            // NOTE: Intentionally creating a _new_ tree item rather than searching for a cached node in the tree because
            // the executed 'find' command could have a filter or projection that is not handled by a cached tree node
            this._collectionTreeItem = new MongoCollectionTreeItem_1.MongoCollectionTreeItem(collection, this._command.arguments);
            const documents = yield this._collectionTreeItem.loadMoreChildren(undefined, true);
            return documents.map((docTreeItem) => docTreeItem.document);
        });
    }
    update(documents) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedDocs = yield this._collectionTreeItem.update(documents);
            const cachedCollectionNode = yield this._tree.findNode(this.id);
            if (cachedCollectionNode) {
                MongoCollectionNodeEditor_1.MongoCollectionNodeEditor.updateCachedDocNodes(updatedDocs, cachedCollectionNode);
            }
            return updatedDocs;
        });
    }
    get id() {
        return `${this._databaseNode.id}/${this._command.collection}`;
    }
    convertFromString(data) {
        return EJSON.parse(data);
    }
    convertToString(data) {
        return EJSON.stringify(data, null, 2);
    }
}
exports.MongoFindResultEditor = MongoFindResultEditor;
//# sourceMappingURL=MongoFindResultEditor.js.map