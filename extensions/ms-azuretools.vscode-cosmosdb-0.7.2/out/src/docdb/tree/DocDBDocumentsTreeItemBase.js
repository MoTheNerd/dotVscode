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
const DocDBTreeItemBase_1 = require("./DocDBTreeItemBase");
/**
 * This class provides common logic for DocumentDB, Graph, and Table "documents" (or whatever passes for a "document" in this API type)
 * (DocumentDB is the base type for all Cosmos DB accounts)
 */
class DocDBDocumentsTreeItemBase extends DocDBTreeItemBase_1.DocDBTreeItemBase {
    constructor(documentEndpoint, masterKey, collection, isEmulator) {
        super(documentEndpoint, masterKey, isEmulator);
        this._collection = collection;
    }
    get iconPath() {
        return {
            light: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icons', 'theme-agnostic', 'Collection.svg'),
            dark: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icons', 'theme-agnostic', 'Collection.svg')
        };
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
    getIterator(client, feedOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client.readDocuments(this.link, feedOptions);
        });
    }
}
exports.DocDBDocumentsTreeItemBase = DocDBDocumentsTreeItemBase;
//# sourceMappingURL=DocDBDocumentsTreeItemBase.js.map