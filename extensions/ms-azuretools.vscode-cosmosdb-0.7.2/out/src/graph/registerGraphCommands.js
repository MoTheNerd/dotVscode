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
const GraphAccountTreeItem_1 = require("./tree/GraphAccountTreeItem");
const GraphDatabaseTreeItem_1 = require("./tree/GraphDatabaseTreeItem");
const GraphCollectionTreeItem_1 = require("./tree/GraphCollectionTreeItem");
const GraphViewsManager_1 = require("./GraphViewsManager");
function registerGraphCommands(context, actionHandler, tree) {
    let graphViewsManager = new GraphViewsManager_1.GraphViewsManager(context);
    actionHandler.registerCommand('cosmosDB.createGraphDatabase', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = (yield tree.showNodePicker(GraphAccountTreeItem_1.GraphAccountTreeItem.contextValue));
        }
        yield node.createChild();
    }));
    actionHandler.registerCommand('cosmosDB.createGraph', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = (yield tree.showNodePicker(GraphDatabaseTreeItem_1.GraphDatabaseTreeItem.contextValue));
        }
        yield node.createChild();
    }));
    actionHandler.registerCommand('cosmosDB.deleteGraphDatabase', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = yield tree.showNodePicker(GraphDatabaseTreeItem_1.GraphDatabaseTreeItem.contextValue);
        }
        yield node.deleteNode();
    }));
    actionHandler.registerCommand('cosmosDB.deleteGraph', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = yield tree.showNodePicker(GraphCollectionTreeItem_1.GraphCollectionTreeItem.contextValue);
        }
        yield node.deleteNode();
    }));
    actionHandler.registerCommand('cosmosDB.openGraphExplorer', (node) => __awaiter(this, void 0, void 0, function* () {
        if (!node) {
            node = (yield tree.showNodePicker(GraphCollectionTreeItem_1.GraphCollectionTreeItem.contextValue));
        }
        yield node.treeItem.showExplorer(graphViewsManager);
    }));
}
exports.registerGraphCommands = registerGraphCommands;
//# sourceMappingURL=registerGraphCommands.js.map