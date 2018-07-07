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
const DocDBAccountTreeItemBase_1 = require("../../docdb/tree/DocDBAccountTreeItemBase");
const deleteCosmosDBAccount_1 = require("../../commands/deleteCosmosDBAccount");
class TableAccountTreeItem extends DocDBAccountTreeItemBase_1.DocDBAccountTreeItemBase {
    constructor() {
        super(...arguments);
        this.contextValue = TableAccountTreeItem.contextValue;
    }
    hasMoreChildren() {
        return false;
    }
    initChild() {
        throw new Error('Table Accounts are not supported yet.');
    }
    loadMoreChildren(_node, _clearCache) {
        return __awaiter(this, void 0, void 0, function* () {
            return [{
                    id: 'tableNotSupported',
                    contextValue: 'tableNotSupported',
                    label: 'Table Accounts are not supported yet.'
                }];
        });
    }
    deleteTreeItem(node) {
        return __awaiter(this, void 0, void 0, function* () {
            yield deleteCosmosDBAccount_1.deleteCosmosDBAccount(node);
        });
    }
}
TableAccountTreeItem.contextValue = "cosmosDBTableAccount";
exports.TableAccountTreeItem = TableAccountTreeItem;
//# sourceMappingURL=TableAccountTreeItem.js.map