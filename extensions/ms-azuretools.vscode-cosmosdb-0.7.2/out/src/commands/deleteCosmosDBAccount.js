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
const azure_arm_cosmosdb_1 = require("azure-arm-cosmosdb");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const azureUtils_1 = require("../utils/azureUtils");
const util = require("../utils/vscodeUtils");
const vscode_azureextensionui_2 = require("vscode-azureextensionui");
function deleteCosmosDBAccount(node) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = `Are you sure you want to delete account '${node.treeItem.label}' and its contents?`;
        const result = yield vscode.window.showWarningMessage(message, { modal: true }, vscode_azureextensionui_1.DialogResponses.deleteResponse, vscode_azureextensionui_1.DialogResponses.cancel);
        if (result === vscode_azureextensionui_1.DialogResponses.deleteResponse) {
            const docDBClient = new azure_arm_cosmosdb_1.CosmosDBManagementClient(node.credentials, node.subscriptionId);
            const resourceGroup = azureUtils_1.azureUtils.getResourceGroupFromId(node.treeItem.id);
            const accountName = azureUtils_1.azureUtils.getAccountNameFromId(node.treeItem.id);
            const output = util.getOutputChannel();
            output.appendLine(`Deleting account "${accountName}"...`);
            output.show();
            yield docDBClient.databaseAccounts.deleteMethod(resourceGroup, accountName);
            output.appendLine(`Successfully deleted account "${accountName}"`);
            output.show();
        }
        else {
            throw new vscode_azureextensionui_2.UserCancelledError();
        }
    });
}
exports.deleteCosmosDBAccount = deleteCosmosDBAccount;
//# sourceMappingURL=deleteCosmosDBAccount.js.map