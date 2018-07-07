"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const azure_arm_cosmosdb_1 = require("azure-arm-cosmosdb");
function getCosmosDBManagementClient(credentials, subscriptionId) {
    const client = new azure_arm_cosmosdb_1.CosmosDBManagementClient(credentials, subscriptionId);
    vscode_azureextensionui_1.addExtensionUserAgent(client);
    return client;
}
exports.getCosmosDBManagementClient = getCosmosDBManagementClient;
//# sourceMappingURL=getCosmosDBManagementClient.js.map