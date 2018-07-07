"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const cp = require("child_process");
const os = require("os");
const vscodeUtils_1 = require("../utils/vscodeUtils");
const vscode_1 = require("vscode");
const extensionVariables_1 = require("../extensionVariables");
class Shell {
    constructor(execPath, mongoShell) {
        this.execPath = execPath;
        this.mongoShell = mongoShell;
        this.executionId = 0;
        this.disposables = [];
        this.onResult = new vscode_1.EventEmitter();
        this.initialize();
    }
    static create(execPath, connectionString, isEmulator) {
        return new Promise((c, e) => {
            try {
                let args = ['--quiet', connectionString];
                if (isEmulator) {
                    // Without this the connection will fail due to the self-signed DocDB certificate
                    args.push("--ssl");
                    args.push("--sslAllowInvalidCertificates");
                }
                const shellProcess = cp.spawn(execPath, args);
                return c(new Shell(execPath, shellProcess));
            }
            catch (error) {
                e(`Error while creating mongo shell with path '${execPath}': ${error}`);
            }
        });
    }
    initialize() {
        const once = (ee, name, fn) => {
            ee.once(name, fn);
            this.disposables.push(vscodeUtils_1.toDisposable(() => ee.removeListener(name, fn)));
        };
        const on = (ee, name, fn) => {
            ee.on(name, fn);
            this.disposables.push(vscodeUtils_1.toDisposable(() => ee.removeListener(name, fn)));
        };
        once(this.mongoShell, 'error', result => this.onResult.fire(result));
        once(this.mongoShell, 'exit', result => this.onResult.fire(result));
        let buffers = [];
        on(this.mongoShell.stdout, 'data', b => {
            let data = b.toString();
            const delimitter = `${this.executionId}${os.EOL}`;
            if (data.endsWith(delimitter)) {
                const result = buffers.join('') + data.substring(0, data.length - delimitter.length);
                buffers = [];
                this.onResult.fire({
                    exitCode: void 0,
                    result,
                    stderr: void 0
                });
            }
            else {
                buffers.push(b);
            }
        });
        on(this.mongoShell.stderr, 'data', result => this.onResult.fire(result));
        once(this.mongoShell.stderr, 'close', result => this.onResult.fire(result));
    }
    useDatabase(database) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.exec(`use ${database}`);
        });
    }
    exec(script) {
        return __awaiter(this, void 0, void 0, function* () {
            script = this.convertToSingleLine(script);
            const executionId = this._generateExecutionSequenceId();
            try {
                this.mongoShell.stdin.write(script, 'utf8');
                this.mongoShell.stdin.write(os.EOL);
                this.mongoShell.stdin.write(executionId, 'utf8');
                this.mongoShell.stdin.write(os.EOL);
            }
            catch (error) {
                vscode_1.window.showErrorMessage(error.toString());
            }
            return yield new Promise((c, e) => {
                let executed = false;
                const handler = setTimeout(() => {
                    if (!executed) {
                        e(`Timed out executing MongoDB command "${script}"`);
                    }
                }, 5000);
                const disposable = this.onResult.event(result => {
                    disposable.dispose();
                    if (result && result.code) {
                        if (result.code === 'ENOENT') {
                            result.message = `Could not find Mongo shell. Make sure it is on your path or you have set the '${extensionVariables_1.ext.settingsKeys.mongoShellPath}' VS Code setting to point to the Mongo shell executable file. Attempted command: "${this.execPath}"`;
                        }
                        e(result);
                    }
                    else {
                        let lines = result.result.split(os.EOL).filter(line => !!line && line !== 'Type "it" for more');
                        lines = lines[lines.length - 1] === 'Type "it" for more' ? lines.splice(lines.length - 1, 1) : lines;
                        executed = true;
                        c(lines.join(os.EOL));
                    }
                    if (handler) {
                        clearTimeout(handler);
                    }
                });
            });
        });
    }
    convertToSingleLine(script) {
        return script.split(os.EOL)
            .map(line => line.trim())
            .join('')
            .trim();
    }
    _generateExecutionSequenceId() {
        return `${++this.executionId}`;
    }
}
exports.Shell = Shell;
//# sourceMappingURL=shell.js.map