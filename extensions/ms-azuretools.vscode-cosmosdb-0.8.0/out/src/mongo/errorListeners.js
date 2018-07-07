"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class ParserErrorListener {
    constructor() {
        this._errors = [];
    }
    get errors() {
        return this._errors;
    }
    syntaxError(
    // tslint:disable-next-line:no-any
    _recognizer, _offendingSymbol, line, charPositionInLine, msg, e) {
        const position = new vscode.Position(line - 1, charPositionInLine); // Symbol lines are 1-indexed. Position lines are 0-indexed
        let range = new vscode.Range(position, position);
        let error = {
            message: msg,
            range: range,
            exception: e
        };
        this._errors.push(error);
    }
}
exports.ParserErrorListener = ParserErrorListener;
class LexerErrorListener {
    constructor() {
        this._errors = [];
    }
    get errors() {
        return this._errors;
    }
    syntaxError(
    // tslint:disable-next-line:no-any
    _recognizer, _offendingSymbol, line, charPositionInLine, msg, e) {
        const position = new vscode.Position(line - 1, charPositionInLine); // Symbol lines are 1-indexed. Position lines are 0-indexed
        let range = new vscode.Range(position, position);
        let error = {
            message: msg,
            range: range,
            exception: e
        };
        this._errors.push(error);
    }
}
exports.LexerErrorListener = LexerErrorListener;
//# sourceMappingURL=errorListeners.js.map