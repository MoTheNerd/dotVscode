"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const DocDBAccountTreeItemBase_1 = require("../../docdb/tree/DocDBAccountTreeItemBase");
const GraphDatabaseTreeItem_1 = require("./GraphDatabaseTreeItem");
const GraphCollectionTreeItem_1 = require("./GraphCollectionTreeItem");
class GraphAccountTreeItem extends DocDBAccountTreeItemBase_1.DocDBAccountTreeItemBase {
    constructor(id, label, documentEndpoint, _gremlinEndpoint, masterKey, isEmulator) {
        super(id, label, documentEndpoint, masterKey, isEmulator);
        this._gremlinEndpoint = _gremlinEndpoint;
        this.contextValue = GraphAccountTreeItem.contextValue;
    }
    initChild(database) {
        return new GraphDatabaseTreeItem_1.GraphDatabaseTreeItem(this.documentEndpoint, this._gremlinEndpoint, this.masterKey, database, this.isEmulator);
    }
    isAncestorOf(contextValue) {
        switch (contextValue) {
            case GraphDatabaseTreeItem_1.GraphDatabaseTreeItem.contextValue:
            case GraphCollectionTreeItem_1.GraphCollectionTreeItem.contextValue:
                return true;
            default:
                return false;
        }
    }
}
GraphAccountTreeItem.contextValue = "cosmosDBGraphAccount";
exports.GraphAccountTreeItem = GraphAccountTreeItem;
//# sourceMappingURL=GraphAccountTreeItem.js.map