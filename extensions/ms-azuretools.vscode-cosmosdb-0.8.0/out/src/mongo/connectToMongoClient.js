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
const mongodb_1 = require("mongodb");
// Can't call appendExtensionUserAgent() here because languageClient.ts can't take a dependency on vscode-azureextensionui and hence vscode, so have
//   to pass the user agent string in
function connectToMongoClient(connectionString, extensionUserAgent) {
    return __awaiter(this, void 0, void 0, function* () {
        // appname appears to be the correct equivalent to user-agent for mongo
        let options = {
            appname: extensionUserAgent,
        };
        return yield mongodb_1.MongoClient.connect(connectionString, options);
    });
}
exports.connectToMongoClient = connectToMongoClient;
//# sourceMappingURL=connectToMongoClient.js.map