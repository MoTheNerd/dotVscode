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
const vscode = require("vscode");
const path = require("path");
const mongodb_1 = require("mongodb");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const MongoAccountTreeItem_1 = require("../mongo/tree/MongoAccountTreeItem");
const GraphAccountTreeItem_1 = require("../graph/tree/GraphAccountTreeItem");
const TableAccountTreeItem_1 = require("../table/tree/TableAccountTreeItem");
const DocDBAccountTreeItem_1 = require("../docdb/tree/DocDBAccountTreeItem");
const vscodeUtils_1 = require("../utils/vscodeUtils");
const mongoConnectionStrings_1 = require("../mongo/mongoConnectionStrings");
const experiences_1 = require("../experiences");
exports.AttachedAccountSuffix = 'Attached';
exports.MONGO_CONNECTION_EXPECTED = 'Connection string must start with "mongodb://" or "mongodb+srv://"';
class AttachedAccountsTreeItem {
    constructor(_globalState) {
        this._globalState = _globalState;
        this.contextValue = AttachedAccountsTreeItem.contextValue;
        this.id = AttachedAccountsTreeItem.contextValue;
        this.label = 'Attached Database Accounts';
        this.childTypeLabel = 'Account';
        this._serviceName = "ms-azuretools.vscode-cosmosdb.connectionStrings";
        this._keytar = vscodeUtils_1.tryfetchNodeModule('keytar');
        this._loadPersistedAccountsTask = this.loadPersistedAccounts();
    }
    getAttachedAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._attachedAccounts) {
                try {
                    this._attachedAccounts = yield this._loadPersistedAccountsTask;
                }
                catch (_a) {
                    this._attachedAccounts = [];
                    throw new Error('Failed to load persisted Database Accounts. Reattach the accounts manually.');
                }
            }
            return this._attachedAccounts;
        });
    }
    get iconPath() {
        return {
            light: path.join(__filename, '..', '..', '..', '..', 'resources', 'icons', 'light', 'ConnectPlugged.svg'),
            dark: path.join(__filename, '..', '..', '..', '..', 'resources', 'icons', 'dark', 'ConnectPlugged.svg')
        };
    }
    hasMoreChildren() {
        return false;
    }
    loadMoreChildren(_node, _clearCache) {
        return __awaiter(this, void 0, void 0, function* () {
            const attachedAccounts = yield this.getAttachedAccounts();
            return attachedAccounts.length > 0 ? attachedAccounts : [{
                    contextValue: 'cosmosDBAttachDatabaseAccount',
                    label: 'Attach Database Account...',
                    id: 'cosmosDBAttachDatabaseAccount',
                    commandId: 'cosmosDB.attachDatabaseAccount',
                    isAncestorOf: () => { return false; }
                }];
        });
    }
    isAncestorOf(contextValue) {
        switch (contextValue) {
            // We have to make sure the Attached Accounts node is not shown for commands like
            // 'Open in Portal', which only work for the non-attached version
            case GraphAccountTreeItem_1.GraphAccountTreeItem.contextValue:
            case MongoAccountTreeItem_1.MongoAccountTreeItem.contextValue:
            case DocDBAccountTreeItem_1.DocDBAccountTreeItem.contextValue:
            case TableAccountTreeItem_1.TableAccountTreeItem.contextValue:
            case vscode_azureextensionui_1.AzureTreeDataProvider.subscriptionContextValue:
                return false;
            default:
                return true;
        }
    }
    attachNewAccount() {
        return __awaiter(this, void 0, void 0, function* () {
            const defaultExperiencePick = yield vscode.window.showQuickPick(experiences_1.getExperienceQuickPicks(), { placeHolder: "Select a Database Account API...", ignoreFocusOut: true });
            if (defaultExperiencePick) {
                const defaultExperience = defaultExperiencePick.data;
                let placeholder;
                let defaultValue;
                let validateInput;
                if (defaultExperience.api === experiences_1.API.MongoDB) {
                    defaultValue = placeholder = 'mongodb://127.0.0.1:27017';
                    validateInput = AttachedAccountsTreeItem.validateMongoConnectionString;
                }
                else {
                    placeholder = 'AccountEndpoint=...;AccountKey=...';
                    validateInput = AttachedAccountsTreeItem.validateDocDBConnectionString;
                }
                const connectionString = yield vscode.window.showInputBox({
                    placeHolder: placeholder,
                    prompt: 'Enter the connection string for your database account',
                    validateInput: validateInput,
                    ignoreFocusOut: true,
                    value: defaultValue
                });
                if (connectionString) {
                    let treeItem = yield this.createTreeItem(connectionString, defaultExperience.api);
                    yield this.attachAccount(treeItem, connectionString);
                }
            }
            else {
                throw new vscode_azureextensionui_1.UserCancelledError();
            }
        });
    }
    attachEmulator() {
        return __awaiter(this, void 0, void 0, function* () {
            let connectionString;
            const defaultExperiencePick = yield vscode.window.showQuickPick([
                experiences_1.getExperienceQuickPick(experiences_1.API.MongoDB),
                experiences_1.getExperienceQuickPick(experiences_1.API.DocumentDB)
            ], {
                placeHolder: "Select a Database Account API...",
                ignoreFocusOut: true
            });
            if (defaultExperiencePick) {
                const defaultExperience = defaultExperiencePick.data;
                let port;
                if (defaultExperience.api === experiences_1.API.MongoDB) {
                    port = vscode.workspace.getConfiguration().get("cosmosDB.emulator.mongoPort");
                }
                else {
                    port = vscode.workspace.getConfiguration().get("cosmosDB.emulator.port");
                }
                if (port) {
                    if (defaultExperience.api === experiences_1.API.MongoDB) {
                        connectionString = `mongodb://localhost:C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==@localhost:${port}?ssl=true`;
                    }
                    else {
                        connectionString = `AccountEndpoint=https://localhost:${port}/;AccountKey=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==;`;
                    }
                    const label = `${defaultExperience.shortName} Emulator`;
                    let treeItem = yield this.createTreeItem(connectionString, defaultExperience.api, label);
                    if (treeItem instanceof DocDBAccountTreeItem_1.DocDBAccountTreeItem || treeItem instanceof GraphAccountTreeItem_1.GraphAccountTreeItem || treeItem instanceof TableAccountTreeItem_1.TableAccountTreeItem || treeItem instanceof MongoAccountTreeItem_1.MongoAccountTreeItem) {
                        treeItem.isEmulator = true;
                    }
                    yield this.attachAccount(treeItem, connectionString);
                }
            }
        });
    }
    attachAccount(treeItem, connectionString) {
        return __awaiter(this, void 0, void 0, function* () {
            const attachedAccounts = yield this.getAttachedAccounts();
            if (attachedAccounts.find(s => s.id === treeItem.id)) {
                vscode.window.showWarningMessage(`Database Account '${treeItem.id}' is already attached.`);
            }
            else {
                attachedAccounts.push(treeItem);
                if (this._keytar) {
                    yield this._keytar.setPassword(this._serviceName, treeItem.id, connectionString);
                    yield this.persistIds(attachedAccounts);
                }
            }
        });
    }
    detach(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const attachedAccounts = yield this.getAttachedAccounts();
            const index = attachedAccounts.findIndex((account) => account.id === id);
            if (index !== -1) {
                attachedAccounts.splice(index, 1);
                if (this._keytar) {
                    yield this._keytar.deletePassword(this._serviceName, id);
                    yield this.persistIds(attachedAccounts);
                }
            }
        });
    }
    getServerIdFromConnectionString(connectionString) {
        return __awaiter(this, void 0, void 0, function* () {
            let host;
            let port;
            const db = yield mongodb_1.MongoClient.connect(connectionString);
            const serverConfig = db.serverConfig;
            // Azure CosmosDB comes back as a ReplSet
            if (serverConfig instanceof mongodb_1.ReplSet) {
                // get the first connection string from the seedlist for the ReplSet
                // this may not be best solution, but the connection (below) gives
                // the replicaset host name, which is different than what is in the connection string
                // "s" is not part of ReplSet static definition but can't find any official documentation on it. Yet it is definitely there at runtime. Grandfathering in.
                // tslint:disable-next-line:no-any
                let rs = serverConfig;
                host = rs.s.replset.s.seedlist[0].host;
                port = rs.s.replset.s.seedlist[0].port;
            }
            else {
                host = serverConfig['host'];
                port = serverConfig['port'];
            }
            return `${host}:${port}`;
        });
    }
    loadPersistedAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            const persistedAccounts = [];
            const value = this._globalState.get(this._serviceName);
            if (value && this._keytar) {
                const accounts = JSON.parse(value);
                yield Promise.all(accounts.map((account) => __awaiter(this, void 0, void 0, function* () {
                    let id;
                    let label;
                    let api;
                    let isEmulator;
                    if (typeof (account) === 'string') {
                        // Default to Mongo if the value is a string for the sake of backwards compatiblity
                        // (Mongo was originally the only account type that could be attached)
                        id = account;
                        api = experiences_1.API.MongoDB;
                        label = `${account} (${experiences_1.getExperience(api).shortName})`;
                        isEmulator = false;
                    }
                    else {
                        id = account.id;
                        api = account.defaultExperience;
                        isEmulator = account.isEmulator;
                        label = isEmulator ? `${experiences_1.getExperience(api).shortName} Emulator` : `${id} (${experiences_1.getExperience(api).shortName})`;
                    }
                    const connectionString = yield this._keytar.getPassword(this._serviceName, id);
                    persistedAccounts.push(yield this.createTreeItem(connectionString, api, label, id, isEmulator));
                })));
            }
            return persistedAccounts;
        });
    }
    createTreeItem(connectionString, api, label, id, isEmulator) {
        return __awaiter(this, void 0, void 0, function* () {
            let treeItem;
            // tslint:disable-next-line:possible-timing-attack // not security related
            if (api === experiences_1.API.MongoDB) {
                if (id === undefined) {
                    id = yield this.getServerIdFromConnectionString(connectionString);
                    // Add database to node id if specified in connection string
                    let database = !isEmulator && mongoConnectionStrings_1.getDatabaseNameFromConnectionString(connectionString);
                    if (database) {
                        id = `${id}/${database}`;
                    }
                }
                label = label || `${id} (${experiences_1.getExperience(api).shortName})`;
                treeItem = new MongoAccountTreeItem_1.MongoAccountTreeItem(id, label, connectionString, isEmulator);
            }
            else {
                const [endpoint, masterKey, id] = AttachedAccountsTreeItem.parseDocDBConnectionString(connectionString);
                label = label || `${id} (${experiences_1.getExperience(api).shortName})`;
                switch (api) {
                    case experiences_1.API.Table:
                        treeItem = new TableAccountTreeItem_1.TableAccountTreeItem(id, label, endpoint, masterKey, isEmulator);
                        break;
                    case experiences_1.API.Graph:
                        treeItem = new GraphAccountTreeItem_1.GraphAccountTreeItem(id, label, endpoint, undefined, masterKey, isEmulator);
                        break;
                    case experiences_1.API.DocumentDB:
                        treeItem = new DocDBAccountTreeItem_1.DocDBAccountTreeItem(id, label, endpoint, masterKey, isEmulator);
                        break;
                    default:
                        throw new Error(`Unexpected defaultExperience "${api}".`);
                }
            }
            treeItem.contextValue += exports.AttachedAccountSuffix;
            return treeItem;
        });
    }
    persistIds(attachedAccounts) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = attachedAccounts.map((node) => {
                let experience;
                let isEmulator;
                if (node instanceof MongoAccountTreeItem_1.MongoAccountTreeItem || node instanceof DocDBAccountTreeItem_1.DocDBAccountTreeItem || node instanceof GraphAccountTreeItem_1.GraphAccountTreeItem || node instanceof TableAccountTreeItem_1.TableAccountTreeItem) {
                    isEmulator = node.isEmulator;
                }
                if (node instanceof MongoAccountTreeItem_1.MongoAccountTreeItem) {
                    experience = experiences_1.API.MongoDB;
                }
                else if (node instanceof GraphAccountTreeItem_1.GraphAccountTreeItem) {
                    experience = experiences_1.API.Graph;
                }
                else if (node instanceof TableAccountTreeItem_1.TableAccountTreeItem) {
                    experience = experiences_1.API.Table;
                }
                else if (node instanceof DocDBAccountTreeItem_1.DocDBAccountTreeItem) {
                    experience = experiences_1.API.DocumentDB;
                }
                else {
                    throw new Error(`Unexpected account node "${node.constructor.name}".`);
                }
                return { id: node.id, defaultExperience: experience, isEmulator: isEmulator };
            });
            yield this._globalState.update(this._serviceName, JSON.stringify(value));
        });
    }
    static validateMongoConnectionString(value) {
        if (value && value.match(/^mongodb(\+srv)?:\/\//)) {
            return undefined;
        }
        return exports.MONGO_CONNECTION_EXPECTED;
    }
    static validateDocDBConnectionString(value) {
        try {
            const [endpoint, masterKey, id] = AttachedAccountsTreeItem.parseDocDBConnectionString(value);
            if (endpoint && masterKey) {
                if (id) {
                    return undefined;
                }
                else {
                    return 'AccountEndpoint is invalid url.';
                }
            }
        }
        catch (error) {
            // Swallow specific errors, show error message below
        }
        return 'Connection string must be of the form "AccountEndpoint=...;AccountKey=..."';
    }
    static parseDocDBConnectionString(value) {
        const matches = value.match(/AccountEndpoint=(.*);AccountKey=(.*)/);
        const endpoint = matches[1];
        const masterKey = matches[2];
        const id = vscode.Uri.parse(endpoint).authority;
        return [endpoint, masterKey, id];
    }
}
AttachedAccountsTreeItem.contextValue = 'cosmosDBAttachedAccounts';
exports.AttachedAccountsTreeItem = AttachedAccountsTreeItem;
//# sourceMappingURL=AttachedAccountsTreeItem.js.map