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
const inputValidation_1 = require("../../utils/inputValidation");
const extensionVariables_1 = require("../../extensionVariables");
const getCosmosDBManagementClient_1 = require("../../docdb/getCosmosDBManagementClient");
class CosmosDBAccountNameStep extends vscode_azureextensionui_1.AzureNameStep {
    isRelatedNameAvailable(wizardContext, name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield vscode_azureextensionui_1.ResourceGroupListStep.isNameAvailable(wizardContext, name);
        });
    }
    prompt(wizardContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = getCosmosDBManagementClient_1.getCosmosDBManagementClient(wizardContext.credentials, wizardContext.subscriptionId);
            wizardContext.accountName = (yield extensionVariables_1.ext.ui.showInputBox({
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