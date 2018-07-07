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
const timeout_1 = require("./timeout");
const inputValidationTimeoutMs = 2000;
/**
 * Intended to be used for VS Code validateInput to protect against long-running validations. If a time-out occurs or the action throws,
 * returns undefined (indicating a valid input). Use for optional validations.
 */
function validOnTimeoutOrException(inputValidation, timeoutMs) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            timeoutMs = timeoutMs || inputValidationTimeoutMs;
            return yield timeout_1.valueOnTimeout(timeoutMs, undefined, inputValidation);
        }
        catch (error) {
            return undefined;
        }
    });
}
exports.validOnTimeoutOrException = validOnTimeoutOrException;
//# sourceMappingURL=inputValidation.js.map