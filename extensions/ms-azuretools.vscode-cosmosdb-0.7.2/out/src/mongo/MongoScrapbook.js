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
const vscode = require("vscode");
const ANTLRInputStream_1 = require("antlr4ts/ANTLRInputStream");
const CommonTokenStream_1 = require("antlr4ts/CommonTokenStream");
const mongoParser = require("./grammar/mongoParser");
const visitors_1 = require("./grammar/visitors");
const mongoLexer_1 = require("./grammar/mongoLexer");
const vscodeUtil = require("./../utils/vscodeUtils");
const MongoFindResultEditor_1 = require("./editors/MongoFindResultEditor");
const MongoFindOneResultEditor_1 = require("./editors/MongoFindOneResultEditor");
const output = vscodeUtil.getOutputChannel();
const notInScrapbookMessage = "You must have a MongoDB scrapbook (*.mongo) open to run a MongoDB command.";
function executeAllCommandsFromActiveEditor(database, extensionPath, editorManager, tree, context) {
    return __awaiter(this, void 0, void 0, function* () {
        output.appendLine("Running all commands in scrapbook...");
        let commands = getAllCommandsFromActiveEditor();
        yield executeCommands(vscode.window.activeTextEditor, database, extensionPath, editorManager, tree, context, commands);
    });
}
exports.executeAllCommandsFromActiveEditor = executeAllCommandsFromActiveEditor;
function executeCommandFromActiveEditor(database, extensionPath, editorManager, tree, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const commands = getAllCommandsFromActiveEditor();
        const activeEditor = vscode.window.activeTextEditor;
        const selection = activeEditor.selection;
        const command = findCommandAtPosition(commands, selection.start);
        return yield executeCommand(activeEditor, database, extensionPath, editorManager, tree, context, command);
    });
}
exports.executeCommandFromActiveEditor = executeCommandFromActiveEditor;
function executeCommandFromText(database, extensionPath, editorManager, tree, context, commandText) {
    return __awaiter(this, void 0, void 0, function* () {
        const activeEditor = vscode.window.activeTextEditor;
        const command = getCommandFromText(commandText, new vscode.Position(0, 0));
        return yield executeCommand(activeEditor, database, extensionPath, editorManager, tree, context, command);
    });
}
exports.executeCommandFromText = executeCommandFromText;
function getAllCommandsFromActiveEditor() {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        const commands = getAllCommandsFromTextDocument(activeEditor.document);
        return commands;
    }
    else {
        // Shouldn't be able to reach this
        throw new Error(notInScrapbookMessage);
    }
}
function getAllCommandsFromTextDocument(document) {
    return getAllCommands(document.getText());
}
exports.getAllCommandsFromTextDocument = getAllCommandsFromTextDocument;
function executeCommands(activeEditor, database, extensionPath, editorManager, tree, context, commands) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let command of commands) {
            yield executeCommand(activeEditor, database, extensionPath, editorManager, tree, context, command);
        }
    });
}
function executeCommand(activeEditor, database, extensionPath, editorManager, tree, context, command) {
    return __awaiter(this, void 0, void 0, function* () {
        if (command) {
            output.appendLine(command.text);
            try {
                context.properties["command"] = command.name;
                context.properties["argsCount"] = String(command.arguments ? command.arguments.length : 0);
            }
            catch (error) {
                // Ignore
            }
            if (!database) {
                throw new Error('Please select a MongoDB database to run against by selecting it in the explorer and selecting the "Connect" context menu item');
            }
            if (command.errors && command.errors.length > 0) {
                //Currently, we take the first error pushed. Tests correlate that the parser visits errors in left-to-right, top-to-bottom.
                const err = command.errors[0];
                throw new Error(`Error near line ${err.position.line}, column ${err.position.character}, text '${err.text}'. Please check syntax.`);
            }
            if (command.name === 'find') {
                yield editorManager.showDocument(new MongoFindResultEditor_1.MongoFindResultEditor(database, command, tree), 'cosmos-result.json', { showInNextColumn: true });
            }
            else {
                const result = yield database.treeItem.executeCommand(command, context);
                if (command.name === 'findOne') {
                    if (result === "null") {
                        throw new Error(`Could not find any documents`);
                    }
                    yield editorManager.showDocument(new MongoFindOneResultEditor_1.MongoFindOneResultEditor(database, command.collection, result, tree), 'cosmos-result.json', { showInNextColumn: true });
                }
                else {
                    yield vscodeUtil.showNewFile(result, extensionPath, 'result', '.json', activeEditor.viewColumn + 1);
                }
            }
        }
        else {
            throw new Error('No MongoDB command found at the current cursor location.');
        }
    });
}
function getCommandFromText(content, position) {
    let commands = getAllCommands(content);
    return findCommandAtPosition(commands, position);
}
exports.getCommandFromText = getCommandFromText;
function getAllCommands(content) {
    const lexer = new mongoLexer_1.mongoLexer(new ANTLRInputStream_1.ANTLRInputStream(content));
    lexer.removeErrorListeners();
    const parser = new mongoParser.mongoParser(new CommonTokenStream_1.CommonTokenStream(lexer));
    parser.removeErrorListeners();
    const commands = new MongoScriptDocumentVisitor().visit(parser.commands());
    return commands;
}
function findCommandAtPosition(commands, position) {
    let lastCommandOnSameLine = null;
    let lastCommandBeforePosition = null;
    if (position) {
        for (const command of commands) {
            if (command.range.contains(position)) {
                return command;
            }
            if (command.range.end.line === position.line) {
                lastCommandOnSameLine = command;
            }
            if (command.range.end.isBefore(position)) {
                lastCommandBeforePosition = command;
            }
        }
    }
    return lastCommandOnSameLine || lastCommandBeforePosition || commands[commands.length - 1];
}
class MongoScriptDocumentVisitor extends visitors_1.MongoVisitor {
    constructor() {
        super(...arguments);
        this.commands = [];
    }
    visitCommand(ctx) {
        this.commands.push({
            range: new vscode.Range(ctx.start.line - 1, ctx.start.charPositionInLine, ctx.stop.line - 1, ctx.stop.charPositionInLine),
            text: ctx.text,
            name: ''
        });
        return super.visitCommand(ctx);
    }
    visitCollection(ctx) {
        this.commands[this.commands.length - 1].collection = ctx.text;
        return super.visitCollection(ctx);
    }
    visitFunctionCall(ctx) {
        if (ctx.parent instanceof mongoParser.CommandContext) {
            this.commands[this.commands.length - 1].name = ctx._FUNCTION_NAME.text;
        }
        return super.visitFunctionCall(ctx);
    }
    visitArgument(ctx) {
        let argumentsContext = ctx.parent;
        if (argumentsContext) {
            let functionCallContext = argumentsContext.parent;
            if (functionCallContext && functionCallContext.parent instanceof mongoParser.CommandContext) {
                const lastCommand = this.commands[this.commands.length - 1];
                if (!lastCommand.arguments) {
                    lastCommand.arguments = [];
                }
                lastCommand.arguments.push(ctx.text);
            }
        }
        return super.visitArgument(ctx);
    }
    visitErrorNode(node) {
        const position = new vscode.Position(node._symbol.line - 1, node._symbol.charPositionInLine); // Symbol lines are 1 indexed. Position lines are 0 indexed
        const text = node.text;
        const badCommand = this.commands.find((command) => command.range && command.range.contains(position));
        if (badCommand) {
            // Need a place to hang errors that occur when no command is actually recognized
            badCommand.errors = badCommand.errors || [];
            badCommand.errors.push({ position: position, text: text });
        }
        return this.defaultResult(node);
    }
    defaultResult(_node) {
        return this.commands;
    }
}
//# sourceMappingURL=MongoScrapbook.js.map