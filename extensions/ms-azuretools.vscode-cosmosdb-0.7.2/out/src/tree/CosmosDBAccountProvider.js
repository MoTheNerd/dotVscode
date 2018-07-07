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
const azureUtils_1 = require("../utils/azureUtils");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const TableAccountTreeItem_1 = require("../table/tree/TableAccountTreeItem");
const GraphAccountTreeItem_1 = require("../graph/tree/GraphAccountTreeItem");
const DocDBAccountTreeItem_1 = require("../docdb/tree/DocDBAccountTreeItem");
const MongoAccountTreeItem_1 = require("../mongo/tree/MongoAccountTreeItem");
const azure_arm_cosmosdb_1 = require("azure-arm-cosmosdb");
const gremlinEndpoints_1 = require("../graph/gremlinEndpoints");
const CosmosDBAccountNameStep_1 = require("./CosmosDBAccountWizard/CosmosDBAccountNameStep");
const vscodeUtil = require("../utils/vscodeUtils");
const vscode = require("vscode");
const CosmosDBAccountApiStep_1 = require("./CosmosDBAccountWizard/CosmosDBAccountApiStep");
const experiences_1 = require("../experiences");
const CosmosDBAccountCreateStep_1 = require("./CosmosDBAccountWizard/CosmosDBAccountCreateStep");
class CosmosDBAccountProvider {
    constructor() {
        this.childTypeLabel = 'Account';
    }
    hasMoreChildren() {
        return false;
    }
    loadMoreChildren(node) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = new azure_arm_cosmosdb_1.CosmosDBManagementClient(node.credentials, node.subscriptionId);
            const accounts = yield client.databaseAccounts.list();
            return yield Promise.all(accounts.map((databaseAccount) => __awaiter(this, void 0, void 0, function* () {
                return yield this.initChild(client, databaseAccount);
            })));
        });
    }
    createChild(node, showCreatingNode, actionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = new azure_arm_cosmosdb_1.CosmosDBManagementClient(node.credentials, node.subscriptionId);
            const wizardContext = {
                credentials: node.credentials,
                subscriptionId: node.subscriptionId,
                subscriptionDisplayName: node.subscriptionDisplayName
            };
            const wizard = new vscode_azureextensionui_1.AzureWizard([
                new CosmosDBAccountNameStep_1.CosmosDBAccountNameStep(),
                new CosmosDBAccountApiStep_1.CosmosDBAccountApiStep(),
                new vscode_azureextensionui_1.ResourceGroupListStep(),
                new vscode_azureextensionui_1.LocationListStep()
            ], [
                new CosmosDBAccountCreateStep_1.CosmosDBAccountCreateStep()
            ], wizardContext);
            // https://github.com/Microsoft/vscode-azuretools/issues/120
            actionContext = actionContext || { properties: {}, measurements: {} };
            yield wizard.prompt(actionContext, node.ui);
            actionContext.properties.defaultExperience = wizardContext.defaultExperience.api;
            yield vscode.window.withProgress({ location: vscode.ProgressLocation.Window }, (progress) => __awaiter(this, void 0, void 0, function* () {
                showCreatingNode(wizardContext.accountName);
                progress.report({ message: `Cosmos DB: Creating account '${wizardContext.accountName}'` });
                yield wizard.execute(actionContext, vscodeUtil.getOutputChannel());
            }));
            return yield this.initChild(client, wizardContext.databaseAccount);
        });
    }
    initChild(client, databaseAccount) {
        return __awaiter(this, void 0, void 0, function* () {
            const defaultExperience = (databaseAccount && databaseAccount.tags && databaseAccount.tags.defaultExperience);
            const resourceGroup = azureUtils_1.azureUtils.getResourceGroupFromId(databaseAccount.id);
            const accountKind = experiences_1.getExperience(defaultExperience).shortName;
            const label = databaseAccount.name + (accountKind ? ` (${accountKind})` : ``);
            const isEmulator = false;
            if (defaultExperience === "MongoDB") {
                const result = yield client.databaseAccounts.listConnectionStrings(resourceGroup, databaseAccount.name);
                // Use the default connection string
                return new MongoAccountTreeItem_1.MongoAccountTreeItem(databaseAccount.id, label, result.connectionStrings[0].connectionString, isEmulator);
            }
            else {
                const keyResult = yield client.databaseAccounts.listKeys(resourceGroup, databaseAccount.name);
                switch (defaultExperience) {
                    case "Table":
                        return new TableAccountTreeItem_1.TableAccountTreeItem(databaseAccount.id, label, databaseAccount.documentEndpoint, keyResult.primaryMasterKey, isEmulator);
                    case "Graph": {
                        const gremlinEndpoint = yield gremlinEndpoints_1.TryGetGremlinEndpointFromAzure(client, resourceGroup, databaseAccount.name);
                        return new GraphAccountTreeItem_1.GraphAccountTreeItem(databaseAccount.id, label, databaseAccount.documentEndpoint, gremlinEndpoint, keyResult.primaryMasterKey, isEmulator);
                    }
                    case "DocumentDB":
                    default:
                        // Default to DocumentDB, the base type for all Cosmos DB Accounts
                        return new DocDBAccountTreeItem_1.DocDBAccountTreeItem(databaseAccount.id, label, databaseAccount.documentEndpoint, keyResult.primaryMasterKey, isEmulator);
                }
            }
        });
    }
}
exports.CosmosDBAccountProvider = CosmosDBAccountProvider;
//# sourceMappingURL=CosmosDBAccountProvider.js.map