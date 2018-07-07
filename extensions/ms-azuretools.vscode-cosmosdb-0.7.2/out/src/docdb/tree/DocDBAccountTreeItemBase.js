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
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const DocDBTreeItemBase_1 = require("./DocDBTreeItemBase");
const vscode = require("vscode");
const deleteCosmosDBAccount_1 = require("../../commands/deleteCosmosDBAccount");
/**
 * This class provides common logic for DocumentDB, Graph, and Table accounts
 * (DocumentDB is the base type for all Cosmos DB accounts)
 */
class DocDBAccountTreeItemBase extends DocDBTreeItemBase_1.DocDBTreeItemBase {
    constructor(id, label, documentEndpoint, masterKey, isEmulator) {
        super(documentEndpoint, masterKey, isEmulator);
        this.childTypeLabel = "Database";
        this.id = id;
        this.label = label;
    }
    get connectionString() {
        return `AccountEndpoint=${this.documentEndpoint};AccountKey=${this.masterKey}`;
    }
    get iconPath() {
        return {
            light: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icons', 'light', 'CosmosDBAccount.svg'),
            dark: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icons', 'dark', 'CosmosDBAccount.svg')
        };
    }
    getIterator(client, feedOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client.readDatabases(feedOptions);
        });
    }
    createChild(_node, showCreatingNode) {
        return __awaiter(this, void 0, void 0, function* () {
            const databaseName = yield vscode.window.showInputBox({
                placeHolder: 'Database Name',
                validateInput: DocDBAccountTreeItemBase.validateDatabaseName,
                ignoreFocusOut: true
            });
            if (databaseName) {
                showCreatingNode(databaseName);
                const client = this.getDocumentClient();
                const database = yield new Promise((resolve, reject) => {
                    client.createDatabase({ id: databaseName }, (err, database) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(database);
                        }
                    });
                });
                return this.initChild(database);
            }
            throw new vscode_azureextensionui_1.UserCancelledError();
        });
    }
    static validateDatabaseName(name) {
        if (!name || name.length < 1 || name.length > 255) {
            return "Name has to be between 1 and 255 chars long";
        }
        if (name.endsWith(" ")) {
            return "Database name cannot end with space";
        }
        if (/[/\\?#]/.test(name)) {
            return `Database name cannot contain the characters '\\', '/', '#', '?'`;
        }
        return undefined;
    }
    deleteTreeItem(node) {
        return __awaiter(this, void 0, void 0, function* () {
            yield deleteCosmosDBAccount_1.deleteCosmosDBAccount(node);
        });
    }
}
exports.DocDBAccountTreeItemBase = DocDBAccountTreeItemBase;
//# sourceMappingURL=DocDBAccountTreeItemBase.js.map