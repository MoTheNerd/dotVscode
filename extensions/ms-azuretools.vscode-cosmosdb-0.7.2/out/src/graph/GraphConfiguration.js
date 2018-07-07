"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
function areConfigsEqual(config1, config2) {
    // Don't compare gremlin endpoints, documentEndpoint is enough to guarantee uniqueness
    return config1.documentEndpoint === config2.documentEndpoint &&
        config1.databaseName === config2.databaseName &&
        config1.graphName === config2.graphName;
}
exports.areConfigsEqual = areConfigsEqual;
//# sourceMappingURL=GraphConfiguration.js.map