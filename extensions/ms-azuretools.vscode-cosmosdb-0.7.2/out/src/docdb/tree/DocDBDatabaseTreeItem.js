"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const DocDBCollectionTreeItem_1 = require("./DocDBCollectionTreeItem");
const DocDBDatabaseTreeItemBase_1 = require("./DocDBDatabaseTreeItemBase");
class DocDBDatabaseTreeItem extends DocDBDatabaseTreeItemBase_1.DocDBDatabaseTreeItemBase {
    constructor() {
        super(...arguments);
        this.contextValue = DocDBDatabaseTreeItem.contextValue;
        this.childTypeLabel = 'Collection';
    }
    initChild(collection) {
        return new DocDBCollectionTreeItem_1.DocDBCollectionTreeItem(this.documentEndpoint, this.masterKey, collection, this.isEmulator);
    }
}
DocDBDatabaseTreeItem.contextValue = "cosmosDBDocumentDatabase";
exports.DocDBDatabaseTreeItem = DocDBDatabaseTreeItem;
//# sourceMappingURL=DocDBDatabaseTreeItem.js.map