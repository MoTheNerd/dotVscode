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
const MongoDocumentTreeItem_1 = require("../tree/MongoDocumentTreeItem");
// tslint:disable:no-var-requires
const EJSON = require("mongodb-extended-json");
class MongoFindOneResultEditor {
    constructor(databaseNode, collectionName, data, tree) {
        this._databaseNode = databaseNode;
        this._collectionName = collectionName;
        this._originalDocument = EJSON.parse(data);
        this._tree = tree;
    }
    get label() {
        const accountNode = this._databaseNode.parent;
        return `${accountNode.treeItem.label}/${this._databaseNode.treeItem.label}/${this._collectionName}/${this._originalDocument._id}`;
    }
    getData() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._originalDocument;
        });
    }
    update(newDocument) {
        return __awaiter(this, void 0, void 0, function* () {
            const node = yield this._tree.findNode(this.id);
            if (node) {
                return node.treeItem.update(newDocument);
            }
            // If the node isn't cached already, just update it to Mongo directly (without worrying about updating the tree)
            const db = yield this._databaseNode.treeItem.getDb();
            return yield MongoDocumentTreeItem_1.MongoDocumentTreeItem.update(db.collection(this._collectionName), newDocument);
        });
    }
    get id() {
        return `${this._databaseNode.id}/${this._collectionName}/${this._originalDocument._id.toString()}`;
    }
    convertFromString(data) {
        return EJSON.parse(data);
    }
    convertToString(data) {
        return EJSON.stringify(data, null, 2);
    }
}
exports.MongoFindOneResultEditor = MongoFindOneResultEditor;
//# sourceMappingURL=MongoFindOneResultEditor.js.map