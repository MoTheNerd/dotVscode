"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
function removeDuplicatesById(entries) {
    var mapById = new Map();
    entries.forEach(n => {
        mapById.set(n.id, n);
    });
    return [...mapById.values()];
}
exports.removeDuplicatesById = removeDuplicatesById;
//# sourceMappingURL=array.js.map