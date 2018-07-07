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
const vscodeUtils_1 = require("../../utils/vscodeUtils");
// tslint:disable:no-var-requires
const EJSON = require("mongodb-extended-json");
class MongoCollectionNodeEditor {
    constructor(collectionNode) {
        this._collectionNode = collectionNode;
    }
    get label() {
        return vscodeUtils_1.getNodeEditorLabel(this._collectionNode);
    }
    getData() {
        return __awaiter(this, void 0, void 0, function* () {
            const children = yield this._collectionNode.getCachedChildren();
            return children.map((child) => child.treeItem.document);
        });
    }
    update(documents) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedDocs = yield this._collectionNode.treeItem.update(documents);
            yield MongoCollectionNodeEditor.updateCachedDocNodes(updatedDocs, this._collectionNode);
            return updatedDocs;
        });
    }
    static updateCachedDocNodes(updatedDocs, collectionNode) {
        return __awaiter(this, void 0, void 0, function* () {
            const documentNodes = yield collectionNode.getCachedChildren();
            for (const updatedDoc of updatedDocs) {
                const documentNode = documentNodes.find((node) => node.treeItem.document._id.toString() === updatedDoc._id.toString());
                if (documentNode) {
                    documentNode.treeItem.document = updatedDoc;
                    yield documentNode.refresh();
                }
            }
        });
    }
    get id() {
        return this._collectionNode.id;
    }
    convertFromString(data) {
        return EJSON.parse(data);
    }
    convertToString(data) {
        return EJSON.stringify(data, null, 2);
    }
}
exports.MongoCollectionNodeEditor = MongoCollectionNodeEditor;
//# sourceMappingURL=MongoCollectionNodeEditor.js.map