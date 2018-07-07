"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var azureUtils;
(function (azureUtils) {
    function getResourceGroupFromId(id) {
        const matches = id.match(/\/subscriptions\/(.*)\/resourceGroups\/(.*)\/providers\/(.*)\/(.*)/);
        if (!matches || matches.length < 3) {
            throw new Error('Invalid Azure Resource Id');
        }
        return matches[2];
    }
    azureUtils.getResourceGroupFromId = getResourceGroupFromId;
    function getAccountNameFromId(id) {
        const matches = id.match(/\/subscriptions\/(.*)\/resourceGroups\/(.*)\/providers\/(.*)\/databaseAccounts\/(.*)/);
        if (!matches || matches.length < 5) {
            throw new Error('Invalid Azure Resource Id');
        }
        return matches[4];
    }
    azureUtils.getAccountNameFromId = getAccountNameFromId;
})(azureUtils = exports.azureUtils || (exports.azureUtils = {}));
//# sourceMappingURL=azureUtils.js.map