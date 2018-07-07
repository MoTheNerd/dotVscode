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
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const experiences_1 = require("../../experiences");
const extensionVariables_1 = require("../../extensionVariables");
const getCosmosDBManagementClient_1 = require("../../docdb/getCosmosDBManagementClient");
class CosmosDBAccountCreateStep extends vscode_azureextensionui_1.AzureWizardExecuteStep {
    execute(wizardContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = getCosmosDBManagementClient_1.getCosmosDBManagementClient(wizardContext.credentials, wizardContext.subscriptionId);
            extensionVariables_1.ext.outputChannel.appendLine(`Creating Cosmos DB account "${wizardContext.accountName}" with API "${wizardContext.defaultExperience.shortName}"...`);
            let options = {
                location: wizardContext.location.name,
                locations: [{ locationName: wizardContext.location.name }],
                kind: wizardContext.defaultExperience.kind,
                tags: { defaultExperience: wizardContext.defaultExperience.api },
                capabilities: []
            };
            if (wizardContext.defaultExperience.api === experiences_1.API.Graph) {
                options.capabilities.push({ name: "EnableGremlin" });
            }
            wizardContext.databaseAccount = yield client.databaseAccounts.createOrUpdate(wizardContext.resourceGroup.name, wizardContext.accountName, options);
            // createOrUpdate always returns an empty object - so we have to get the DatabaseAccount separately
            wizardContext.databaseAccount = yield client.databaseAccounts.get(wizardContext.resourceGroup.name, wizardContext.accountName);
            extensionVariables_1.ext.outputChannel.appendLine(`Successfully created Cosmos DB account "${wizardContext.accountName}".`);
            return wizardContext;
        });
    }
}
exports.CosmosDBAccountCreateStep = CosmosDBAccountCreateStep;
//# sourceMappingURL=CosmosDBAccountCreateStep.js.map