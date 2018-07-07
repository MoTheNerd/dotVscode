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
const azure_arm_cosmosdb_1 = require("azure-arm-cosmosdb");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const inputValidation_1 = require("../../utils/inputValidation");
class CosmosDBAccountNameStep extends vscode_azureextensionui_1.AzureNameStep {
    isRelatedNameAvailable(wizardContext, name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield vscode_azureextensionui_1.ResourceGroupListStep.isNameAvailable(wizardContext, name);
        });
    }
    prompt(wizardContext, ui) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = new azure_arm_cosmosdb_1.CosmosDBManagementClient(wizardContext.credentials, wizardContext.subscriptionId);
            wizardContext.accountName = (yield ui.showInputBox({
                placeHolder: "Account name",
                prompt: "Provide a Cosmos DB account name",
                validateInput: (name) => inputValidation_1.validOnTimeoutOrException(() => validateCosmosDBAccountName(name, client))
            })).trim();
            wizardContext.relatedNameTask = this.generateRelatedName(wizardContext, wizardContext.accountName, vscode_azureextensionui_1.resourceGroupNamingRules);
            return wizardContext;
        });
    }
}
exports.CosmosDBAccountNameStep = CosmosDBAccountNameStep;
function validateCosmosDBAccountName(name, client) {
    return __awaiter(this, void 0, void 0, function* () {
        name = name ? name.trim() : '';
        const min = 3;
        const max = 31;
        if (name.length < min || name.length > max) {
            return `The name must be between ${min} and ${max} characters.`;
        }
        else if (name.match(/[^a-z0-9-]/)) {
            return "The name can only contain lowercase letters, numbers, and the '-' character.";
        }
        else if (yield client.databaseAccounts.checkNameExists(name)) {
            return `Account name "${name}" is not available.`;
        }
        else {
            return undefined;
        }
    });
}
//# sourceMappingURL=CosmosDBAccountNameStep.js.map