"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
function removeDuplicatesById(entries) {
    let mapById = new Map();
    entries.forEach(n => {
        mapById.set(n.id, n);
    });
    return [...mapById.values()];
}
exports.removeDuplicatesById = removeDuplicatesById;
// tslint:disable-next-line:no-any
function filterType(arr, genericConstructor) {
    return arr.filter(element => element instanceof genericConstructor);
}
exports.filterType = filterType;
// tslint:disable-next-line:no-any
function findType(arr, genericConstructor) {
    return arr.find(element => element instanceof genericConstructor);
}
exports.findType = findType;
//# sourceMappingURL=array.js.map