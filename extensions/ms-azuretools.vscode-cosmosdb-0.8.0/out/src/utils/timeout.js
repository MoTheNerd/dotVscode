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
const timedOutMessage = "Execution timed out";
/**
 * Returns the result of awaiting a specified action. Rejects if the action throws. Returns timeoutValue if a time-out occurs.
 */
function valueOnTimeout(timeoutMs, timeoutValue, action) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield rejectOnTimeout(timeoutMs, action);
        }
        catch (err) {
            let error = err;
            if (error && error.message === timedOutMessage) {
                return timeoutValue;
            }
            throw err;
        }
    });
}
exports.valueOnTimeout = valueOnTimeout;
/**
 * Returns the result of awaiting a specified action. Rejects if the action throws or if the time-out occurs.
 */
function rejectOnTimeout(timeoutMs, action) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let timer = setTimeout(() => {
                timer = undefined;
                reject(new Error(timedOutMessage));
            }, timeoutMs);
            let value;
            let error;
            try {
                value = yield action();
                clearTimeout(timer);
                resolve(value);
            }
            catch (err) {
                error = err;
                clearTimeout(timer);
                reject(error);
            }
        }));
    });
}
exports.rejectOnTimeout = rejectOnTimeout;
//# sourceMappingURL=timeout.js.map