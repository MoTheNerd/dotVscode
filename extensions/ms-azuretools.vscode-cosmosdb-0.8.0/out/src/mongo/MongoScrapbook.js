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
const MongoDatabaseTreeItem_1 = require("./tree/MongoDatabaseTreeItem");
const array_1 = require("../utils/array");
const errorListeners_1 = require("./errorListeners");
const extensionVariables_1 = require("../extensionVariables");
const ErrorNode_1 = require("antlr4ts/tree/ErrorNode");
const notInScrapbookMessage = "You must have a MongoDB scrapbook (*.mongo) open to run a MongoDB command.";
function getAllErrorsFromTextDocument(document) {
    let commands = getAllCommandsFromTextDocument(document);
    let errors = [];
    for (let command of commands) {
        for (let error of (command.errors || [])) {
            let diagnostic = new vscode.Diagnostic(error.range, error.message);
            errors.push(diagnostic);
        }
    }
    return errors;
}
exports.getAllErrorsFromTextDocument = getAllErrorsFromTextDocument;
function executeAllCommandsFromActiveEditor(database, extensionPath, editorManager, tree, context) {
    return __awaiter(this, void 0, void 0, function* () {
        extensionVariables_1.ext.outputChannel.appendLine("Running all commands in scrapbook...");
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
        const command = getCommandFromTextAtLocation(commandText, new vscode.Position(0, 0));
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
    return getAllCommandsFromText(document.getText());
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
            extensionVariables_1.ext.outputChannel.appendLine(command.text);
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
                throw new Error(`Error near line ${err.range.start.line}, column ${err.range.start.character}: '${err.message}'. Please check syntax.`);
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
function getCommandFromTextAtLocation(content, position) {
    let commands = getAllCommandsFromText(content);
    return findCommandAtPosition(commands, position);
}
exports.getCommandFromTextAtLocation = getCommandFromTextAtLocation;
function getAllCommandsFromText(content) {
    const lexer = new mongoLexer_1.mongoLexer(new ANTLRInputStream_1.ANTLRInputStream(content));
    let lexerListener = new errorListeners_1.LexerErrorListener();
    lexer.removeErrorListeners(); // Default listener outputs to the console
    lexer.addErrorListener(lexerListener);
    let tokens = new CommonTokenStream_1.CommonTokenStream(lexer);
    const parser = new mongoParser.mongoParser(tokens);
    let parserListener = new errorListeners_1.ParserErrorListener();
    parser.removeErrorListeners(); // Default listener outputs to the console
    parser.addErrorListener(parserListener);
    let commandsContext = parser.mongoCommands();
    const commands = new FindMongoCommandsVisitor().visit(commandsContext);
    // Match errors with commands based on location
    let errors = lexerListener.errors.concat(parserListener.errors);
    errors.sort((a, b) => {
        let linediff = a.range.start.line - b.range.start.line;
        let chardiff = a.range.start.character - b.range.start.character;
        return linediff || chardiff;
    });
    for (let err of errors) {
        let associatedCommand = findCommandAtPosition(commands, err.range.start);
        if (associatedCommand) {
            associatedCommand.errors = associatedCommand.errors || [];
            associatedCommand.errors.push(err);
        }
        else {
            // Create a new command to hook this up to
            let emptyCommand = {
                collection: undefined,
                name: undefined,
                range: err.range,
                text: ""
            };
            emptyCommand.errors = [err];
            commands.push(emptyCommand);
        }
    }
    return commands;
}
exports.getAllCommandsFromText = getAllCommandsFromText;
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
class FindMongoCommandsVisitor extends visitors_1.MongoVisitor {
    constructor() {
        super(...arguments);
        this.commands = [];
    }
    visitCommand(ctx) {
        this.commands.push({
            range: new vscode.Range(ctx.start.line - 1, ctx.start.charPositionInLine, ctx.stop.line - 1, ctx.stop.charPositionInLine),
            text: ctx.text,
            name: '',
            arguments: [],
            argumentObjects: []
        });
        return super.visitCommand(ctx);
    }
    visitCollection(ctx) {
        this.commands[this.commands.length - 1].collection = ctx.text;
        return super.visitCollection(ctx);
    }
    visitFunctionCall(ctx) {
        if (ctx.parent instanceof mongoParser.CommandContext) {
            this.commands[this.commands.length - 1].name = (ctx._FUNCTION_NAME && ctx._FUNCTION_NAME.text) || "";
        }
        return super.visitFunctionCall(ctx);
    }
    visitArgument(ctx) {
        let argumentsContext = ctx.parent;
        if (argumentsContext) {
            let functionCallContext = argumentsContext.parent;
            if (functionCallContext && functionCallContext.parent instanceof mongoParser.CommandContext) {
                const lastCommand = this.commands[this.commands.length - 1];
                const argAsObject = this.contextToObject(ctx);
                lastCommand.argumentObjects.push(argAsObject);
                lastCommand.arguments.push(JSON.stringify(argAsObject));
            }
        }
        return super.visitArgument(ctx);
    }
    defaultResult(_node) {
        return this.commands;
    }
    contextToObject(ctx) {
        let parsedObject = {};
        if (!ctx || ctx.childCount === 0) { //Base case and malformed statements
            return parsedObject;
        }
        // In a well formed expression, Argument and propertyValue tokens should have exactly one child, from their definitions in mongo.g4
        // The only difference in types of children between PropertyValue and argument tokens is the functionCallContext that isn't handled at the moment.
        let child = ctx.children[0];
        if (child instanceof mongoParser.LiteralContext) {
            let text = child.text;
            let tokenType = child.start.type;
            const nonStringLiterals = [mongoParser.mongoParser.NullLiteral, mongoParser.mongoParser.BooleanLiteral, mongoParser.mongoParser.NumericLiteral];
            if (tokenType === mongoParser.mongoParser.StringLiteral) {
                parsedObject = MongoDatabaseTreeItem_1.stripQuotes(text);
            }
            else if (nonStringLiterals.indexOf(tokenType) > -1) {
                parsedObject = JSON.parse(text);
            }
            else {
                throw new Error(`Unrecognized token. Token text: ${text}`);
            }
        }
        else if (child instanceof mongoParser.ObjectLiteralContext) {
            let propertyNameAndValue = array_1.findType(child.children, mongoParser.PropertyNameAndValueListContext);
            if (!propertyNameAndValue) { // Argument is {}
                return {};
            }
            else {
                //tslint:disable:no-non-null-assertion
                let propertyAssignments = array_1.filterType(propertyNameAndValue.children, mongoParser.PropertyAssignmentContext);
                for (let propertyAssignment of propertyAssignments) {
                    const propertyName = propertyAssignment.children[0];
                    const propertyValue = propertyAssignment.children[2];
                    parsedObject[MongoDatabaseTreeItem_1.stripQuotes(propertyName.text)] = this.contextToObject(propertyValue);
                }
            }
        }
        else if (child instanceof mongoParser.ArrayLiteralContext) {
            let elementList = array_1.findType(child.children, mongoParser.ElementListContext);
            if (elementList) {
                let elementItems = array_1.filterType(elementList.children, mongoParser.PropertyValueContext);
                parsedObject = elementItems.map(this.contextToObject.bind(this));
            }
            else {
                parsedObject = [];
            }
        }
        else if (child instanceof mongoParser.FunctionCallContext || child instanceof ErrorNode_1.ErrorNode) {
            return {};
        }
        else {
            return {};
        }
        return parsedObject;
    }
}
//# sourceMappingURL=MongoScrapbook.js.map