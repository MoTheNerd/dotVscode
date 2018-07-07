"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Namespace for common variables used throughout the extension. They must be initialized in the activate() method of extension.ts
 */
var ext;
(function (ext) {
    let settingsKeys;
    (function (settingsKeys) {
        settingsKeys.mongoShellPath = 'mongo.shell.path';
        settingsKeys.documentLabelFields = 'cosmosDB.documentLabelFields';
        let vsCode;
        (function (vsCode) {
            vsCode.proxyStrictSSL = "http.proxyStrictSSL";
        })(vsCode = settingsKeys.vsCode || (settingsKeys.vsCode = {}));
    })(settingsKeys = ext.settingsKeys || (ext.settingsKeys = {}));
})(ext = exports.ext || (exports.ext = {}));
//# sourceMappingURL=extensionVariables.js.map