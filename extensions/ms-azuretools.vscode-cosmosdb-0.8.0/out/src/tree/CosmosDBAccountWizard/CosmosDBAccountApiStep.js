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
class CosmosDBAccountApiStep extends vscode_azureextensionui_1.AzureWizardPromptStep {
    prompt(wizardContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const picks = experiences_1.getExperienceQuickPicks();
            const result = yield extensionVariables_1.ext.ui.showQuickPick(picks, {
                placeHolder: "Select an API for your Cosmos DB account...",
            });
            wizardContext.defaultExperience = result.data;
            return wizardContext;
        });
    }
}
exports.CosmosDBAccountApiStep = CosmosDBAccountApiStep;
//# sourceMappingURL=CosmosDBAccountApiStep.js.map