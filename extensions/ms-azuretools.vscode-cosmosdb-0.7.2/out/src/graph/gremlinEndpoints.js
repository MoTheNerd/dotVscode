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
function TryGetGremlinEndpointFromAzure(client, resourceGroup, account) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            // Use the callback version of get because the Promise one currently doesn't expose gremlinEndpoint (https://github.com/Azure/azure-documentdb-node/issues/227)
            client.databaseAccounts.get(resourceGroup, account, (error, _result, _httpRequest, response) => {
                if (error) {
                    reject(error);
                }
                else {
                    let body = JSON.parse(response.body);
                    let endpointUri = body.properties.gremlinEndpoint;
                    if (endpointUri) {
                        resolve(parseEndpointUrl(endpointUri));
                    }
                    else {
                        // If it doesn't have gremlinEndpoint in its properties, it must be a pre-GA endpoint
                        resolve(undefined);
                    }
                }
            });
        });
    });
}
exports.TryGetGremlinEndpointFromAzure = TryGetGremlinEndpointFromAzure;
function getPossibleGremlinEndpoints(documentEndpoint) {
    // E.g., given a document endpoint from Azure such as https://<graphname>.documents.azure.com:443/
    const documentSuffix = '.documents.azure.com';
    if (documentEndpoint.indexOf(documentSuffix) >= 0) {
        // Pre-GA style (Dec 2017)
        const preGAEndpoint = documentEndpoint.replace(documentSuffix, '.graphs.azure.com');
        // Post-GA style (Dec 2017)
        const postGAEndpoint = documentEndpoint.replace(documentSuffix, '.gremlin.cosmosdb.azure.com');
        return [parseEndpointUrl(postGAEndpoint), parseEndpointUrl(preGAEndpoint)];
    }
    else {
        console.warn(`Unexpected document URL format: ${documentEndpoint}`);
        return [parseEndpointUrl(documentEndpoint)];
    }
}
exports.getPossibleGremlinEndpoints = getPossibleGremlinEndpoints;
/**
 * Parses a IGremlinPoint from a URL
 * @param url An account URL such as 'https://<graphname>.documents.azure.com:443/'
 */
function parseEndpointUrl(url) {
    let [, protocol, host, , portString] = url.match(/^([^:]+):\/\/([^:]+)(:([0-9]+))?\/?$/);
    console.assert(!!protocol && !!host, "Unexpected endpoint format");
    let port = parseInt(portString || "443", 10);
    console.assert(port > 0, "Unexpected port");
    return { host, port, ssl: protocol.toLowerCase() === "https" };
}
//# sourceMappingURL=gremlinEndpoints.js.map