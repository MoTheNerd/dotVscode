"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const DocDBDatabaseTreeItem_1 = require("./DocDBDatabaseTreeItem");
const DocDBAccountTreeItemBase_1 = require("./DocDBAccountTreeItemBase");
const DocDBCollectionTreeItem_1 = require("./DocDBCollectionTreeItem");
const DocDBDocumentTreeItem_1 = require("./DocDBDocumentTreeItem");
const DocDBStoredProcedureTreeItem_1 = require("./DocDBStoredProcedureTreeItem");
const DocDBDocumentsTreeItem_1 = require("./DocDBDocumentsTreeItem");
class DocDBAccountTreeItem extends DocDBAccountTreeItemBase_1.DocDBAccountTreeItemBase {
    constructor() {
        super(...arguments);
        this.contextValue = DocDBAccountTreeItem.contextValue;
    }
    initChild(database) {
        return new DocDBDatabaseTreeItem_1.DocDBDatabaseTreeItem(this.documentEndpoint, this.masterKey, database, this.isEmulator);
    }
    isAncestorOf(contextValue) {
        switch (contextValue) {
            case DocDBDatabaseTreeItem_1.DocDBDatabaseTreeItem.contextValue:
            case DocDBCollectionTreeItem_1.DocDBCollectionTreeItem.contextValue:
            case DocDBDocumentTreeItem_1.DocDBDocumentTreeItem.contextValue:
            case DocDBStoredProcedureTreeItem_1.DocDBStoredProcedureTreeItem.contextValue:
            case DocDBDocumentsTreeItem_1.DocDBDocumentsTreeItem.contextValue:
                return true;
            default:
                return false;
        }
    }
}
DocDBAccountTreeItem.contextValue = "cosmosDBDocumentServer";
exports.DocDBAccountTreeItem = DocDBAccountTreeItem;
//# sourceMappingURL=DocDBAccountTreeItem.js.map