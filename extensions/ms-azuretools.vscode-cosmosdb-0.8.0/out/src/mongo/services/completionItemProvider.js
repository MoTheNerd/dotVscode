"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const ParserRuleContext_1 = require("antlr4ts/ParserRuleContext");
const TerminalNode_1 = require("antlr4ts/tree/TerminalNode");
const ErrorNode_1 = require("antlr4ts/tree/ErrorNode");
const mongoParser = require("./../grammar/mongoParser");
const mongoLexer_1 = require("./../grammar/mongoLexer");
const visitors_1 = require("./../grammar/visitors");
const vscode_languageserver_1 = require("vscode-languageserver");
class CompletionItemsVisitor extends visitors_1.MongoVisitor {
    constructor(textDocument, db, offset, schemaService, jsonLanguageService) {
        super();
        this.textDocument = textDocument;
        this.db = db;
        this.offset = offset;
        this.schemaService = schemaService;
        this.jsonLanguageService = jsonLanguageService;
        this.at = this.textDocument.positionAt(this.offset);
    }
    visitCommands(ctx) {
        return this.thenable(this.createDbKeywordCompletion(this.createRange(ctx)));
    }
    visitEmptyCommand(ctx) {
        return this.thenable(this.createDbKeywordCompletion(this.createRangeAfter(ctx)));
    }
    visitCommand(ctx) {
        if (ctx.childCount === 0) {
            return this.thenable(this.createDbKeywordCompletion(this.createRange(ctx)));
        }
        const lastTerminalNode = this.getLastTerminalNode(ctx);
        if (lastTerminalNode) {
            return this.getCompletionItemsFromTerminalNode(lastTerminalNode);
        }
        return this.thenable();
    }
    visitCollection(ctx) {
        return Promise.all([this.createCollectionCompletions(this.createRange(ctx)), this.createDbFunctionCompletions(this.createRange(ctx))])
            .then(([collectionCompletions, dbFunctionCompletions]) => [...collectionCompletions, ...dbFunctionCompletions]);
    }
    visitFunctionCall(ctx) {
        const previousNode = this.getPreviousNode(ctx);
        if (previousNode instanceof TerminalNode_1.TerminalNode) {
            return this.getCompletionItemsFromTerminalNode(previousNode);
        }
        return this.thenable();
    }
    visitArguments(ctx) {
        const terminalNode = this.getLastTerminalNode(ctx);
        if (terminalNode && terminalNode.symbol === ctx._CLOSED_PARENTHESIS) {
            return this.thenable(this.createDbKeywordCompletion(this.createRangeAfter(terminalNode)));
        }
        return this.thenable();
    }
    visitArgument(ctx) {
        return ctx.parent.accept(this);
    }
    visitObjectLiteral(ctx) {
        let functionName = this.getFunctionName(ctx);
        let collectionName = this.getCollectionName(ctx);
        if (collectionName && functionName) {
            if (['find', 'findOne', 'findOneAndDelete', 'findOneAndUpdate', 'findOneAndReplace', 'deleteOne', 'deleteMany', 'remove'].indexOf(functionName) !== -1) {
                return this.getArgumentCompletionItems(this.schemaService.queryDocumentUri(collectionName), collectionName, ctx);
            }
        }
        return ctx.parent.accept(this);
    }
    visitArrayLiteral(ctx) {
        let functionName = this.getFunctionName(ctx);
        let collectionName = this.getCollectionName(ctx);
        if (collectionName && functionName) {
            if (['aggregate'].indexOf(functionName) !== -1) {
                return this.getArgumentCompletionItems(this.schemaService.aggregateDocumentUri(collectionName), collectionName, ctx);
            }
        }
        return ctx.parent.accept(this);
    }
    getArgumentCompletionItems(documentUri, _collectionName, ctx) {
        const text = this.textDocument.getText();
        const document = vscode_languageserver_1.TextDocument.create(documentUri, 'json', 1, text.substring(ctx.start.startIndex, ctx.stop.stopIndex + 1));
        const positionOffset = this.textDocument.offsetAt(this.at);
        const contextOffset = ctx.start.startIndex;
        const position = document.positionAt(positionOffset - contextOffset);
        return this.jsonLanguageService.doComplete(document, position, this.jsonLanguageService.parseJSONDocument(document))
            .then(list => {
            return list.items.map(item => {
                const startPositionOffset = document.offsetAt(item.textEdit.range.start);
                const endPositionOffset = document.offsetAt(item.textEdit.range.end);
                item.textEdit.range = vscode_languageserver_1.Range.create(this.textDocument.positionAt(startPositionOffset + contextOffset), this.textDocument.positionAt(contextOffset + endPositionOffset));
                return item;
            });
        });
    }
    getFunctionName(ctx) {
        let parent = ctx.parent;
        if (!(parent && parent instanceof mongoParser.ArgumentContext)) {
            return null;
        }
        parent = parent.parent;
        if (!(parent && parent instanceof mongoParser.ArgumentsContext)) {
            return null;
        }
        parent = parent.parent;
        if (!(parent && parent instanceof mongoParser.FunctionCallContext)) {
            return null;
        }
        return parent._FUNCTION_NAME.text;
    }
    getCollectionName(ctx) {
        let parent = ctx.parent;
        if (!(parent && parent instanceof mongoParser.ArgumentContext)) {
            return null;
        }
        parent = parent.parent;
        if (!(parent && parent instanceof mongoParser.ArgumentsContext)) {
            return null;
        }
        parent = parent.parent;
        if (!(parent && parent instanceof mongoParser.FunctionCallContext)) {
            return null;
        }
        let previousNode = this.getPreviousNode(parent);
        if (previousNode && previousNode instanceof TerminalNode_1.TerminalNode && previousNode.symbol.type === mongoLexer_1.mongoLexer.DOT) {
            previousNode = this.getPreviousNode(previousNode);
            if (previousNode && previousNode instanceof mongoParser.CollectionContext) {
                return previousNode.text;
            }
        }
        return null;
    }
    visitElementList(ctx) {
        return ctx.parent.accept(this);
    }
    visitPropertyNameAndValueList(ctx) {
        return ctx.parent.accept(this);
    }
    visitPropertyAssignment(ctx) {
        return ctx.parent.accept(this);
    }
    visitPropertyValue(ctx) {
        return ctx.parent.accept(this);
    }
    visitPropertyName(ctx) {
        return ctx.parent.accept(this);
    }
    visitLiteral(ctx) {
        return ctx.parent.accept(this);
    }
    visitTerminal(ctx) {
        return ctx.parent.accept(this);
    }
    visitErrorNode(ctx) {
        return ctx.parent.accept(this);
    }
    getCompletionItemsFromTerminalNode(node) {
        if (node._symbol.type === mongoParser.mongoParser.DB) {
            return this.thenable(this.createDbKeywordCompletion(this.createRange(node)));
        }
        if (node._symbol.type === mongoParser.mongoParser.SEMICOLON) {
            return this.thenable(this.createDbKeywordCompletion(this.createRangeAfter(node)));
        }
        if (node._symbol.type === mongoParser.mongoParser.DOT) {
            const previousNode = this.getPreviousNode(node);
            if (previousNode && previousNode instanceof TerminalNode_1.TerminalNode) {
                if (previousNode._symbol.type === mongoParser.mongoParser.DB) {
                    return Promise.all([this.createCollectionCompletions(this.createRangeAfter(node)), this.createDbFunctionCompletions(this.createRangeAfter(node))])
                        .then(([collectionCompletions, dbFunctionCompletions]) => [...collectionCompletions, ...dbFunctionCompletions]);
                }
            }
            if (previousNode instanceof mongoParser.CollectionContext) {
                return this.createCollectionFunctionsCompletions(this.createRangeAfter(node));
            }
        }
        if (node instanceof ErrorNode_1.ErrorNode) {
            const previousNode = this.getPreviousNode(node);
            if (previousNode) {
                if (previousNode instanceof TerminalNode_1.TerminalNode) {
                    return this.getCompletionItemsFromTerminalNode(previousNode);
                }
                return previousNode.accept(this);
            }
        }
        return this.thenable();
    }
    getLastTerminalNode(ctx) {
        return ctx.children ? ctx.children.slice().reverse().filter(node => node instanceof TerminalNode_1.TerminalNode && node.symbol.stopIndex > -1 && node.symbol.stopIndex < this.offset)[0] : null;
    }
    getPreviousNode(node) {
        let previousNode = null;
        const parentNode = node.parent;
        for (let i = 0; i < parentNode.childCount; i++) {
            const currentNode = parentNode.getChild(i);
            if (currentNode === node) {
                break;
            }
            previousNode = currentNode;
        }
        return previousNode;
    }
    createDbKeywordCompletion(range) {
        return {
            textEdit: {
                newText: 'db',
                range
            },
            kind: vscode_languageserver_1.CompletionItemKind.Keyword,
            label: 'db'
        };
    }
    createDbFunctionCompletions(range) {
        return this.thenable(this.createFunctionCompletion('adminCommand', range), this.createFunctionCompletion('auth', range), this.createFunctionCompletion('cloneDatabase', range), this.createFunctionCompletion('commandHelp', range), this.createFunctionCompletion('copyDatabase', range), this.createFunctionCompletion('createCollection', range), this.createFunctionCompletion('createView', range), this.createFunctionCompletion('createUser', range), this.createFunctionCompletion('currentOp', range), this.createFunctionCompletion('dropDatabase', range), this.createFunctionCompletion('eval', range), this.createFunctionCompletion('fsyncLock', range), this.createFunctionCompletion('fsyncUnLock', range), this.createFunctionCompletion('getCollection', range), this.createFunctionCompletion('getCollectionInfos', range), this.createFunctionCompletion('getCollectionNames', range), this.createFunctionCompletion('getLastError', range), this.createFunctionCompletion('getLastErrorObj', range), this.createFunctionCompletion('getLogComponents', range), this.createFunctionCompletion('getMongo', range), this.createFunctionCompletion('getName', range), this.createFunctionCompletion('getPrevError', range), this.createFunctionCompletion('getProfilingLevel', range), this.createFunctionCompletion('getProfilingStatus', range), this.createFunctionCompletion('getReplicationInfo', range), this.createFunctionCompletion('getSiblingDB', range), this.createFunctionCompletion('getWriteConcern', range), this.createFunctionCompletion('hostInfo', range), this.createFunctionCompletion('isMaster', range), this.createFunctionCompletion('killOp', range), this.createFunctionCompletion('listCommands', range), this.createFunctionCompletion('loadServerScripts', range), this.createFunctionCompletion('logout', range), this.createFunctionCompletion('printCollectionStats', range), this.createFunctionCompletion('printReplicationInfo', range), this.createFunctionCompletion('printShardingStatus', range), this.createFunctionCompletion('printSlaveReplicationInfo', range), this.createFunctionCompletion('dropUser', range), this.createFunctionCompletion('repairDatabase', range), this.createFunctionCompletion('runCommand', range), this.createFunctionCompletion('serverStatus', range), this.createFunctionCompletion('setLogLevel', range), this.createFunctionCompletion('setProfilingLevel', range), this.createFunctionCompletion('setWriteConcern', range), this.createFunctionCompletion('unsetWriteConcern', range), this.createFunctionCompletion('setVerboseShell', range), this.createFunctionCompletion('shotdownServer', range), this.createFunctionCompletion('stats', range), this.createFunctionCompletion('version', range));
    }
    createCollectionCompletions(range) {
        if (this.db) {
            return this.db.collections().then(collections => {
                return collections.map(collection => ({
                    textEdit: {
                        newText: collection.collectionName,
                        range
                    },
                    label: collection.collectionName,
                    kind: vscode_languageserver_1.CompletionItemKind.Property,
                    filterText: collection.collectionName,
                    sortText: `1:${collection.collectionName}`
                }));
            });
        }
        return Promise.resolve([]);
    }
    createCollectionFunctionsCompletions(range) {
        return this.thenable(this.createFunctionCompletion('bulkWrite', range), this.createFunctionCompletion('count', range), this.createFunctionCompletion('copyTo', range), this.createFunctionCompletion('convertToCapped', range), this.createFunctionCompletion('createIndex', range), this.createFunctionCompletion('createIndexes', range), this.createFunctionCompletion('dataSize', range), this.createFunctionCompletion('deleteOne', range), this.createFunctionCompletion('deleteMany', range), this.createFunctionCompletion('distinct', range), this.createFunctionCompletion('drop', range), this.createFunctionCompletion('dropIndex', range), this.createFunctionCompletion('dropIndexes', range), this.createFunctionCompletion('ensureIndex', range), this.createFunctionCompletion('explain', range), this.createFunctionCompletion('reIndex', range), this.createFunctionCompletion('find', range), this.createFunctionCompletion('findOne', range), this.createFunctionCompletion('findOneAndDelete', range), this.createFunctionCompletion('findOneAndReplace', range), this.createFunctionCompletion('findOneAndUpdate', range), this.createFunctionCompletion('getDB', range), this.createFunctionCompletion('getPlanCache', range), this.createFunctionCompletion('getIndexes', range), this.createFunctionCompletion('group', range), this.createFunctionCompletion('insert', range), this.createFunctionCompletion('insertOne', range), this.createFunctionCompletion('insertMany', range), this.createFunctionCompletion('mapReduce', range), this.createFunctionCompletion('aggregate', range), this.createFunctionCompletion('remove', range), this.createFunctionCompletion('replaceOne', range), this.createFunctionCompletion('renameCollection', range), this.createFunctionCompletion('runCommand', range), this.createFunctionCompletion('save', range), this.createFunctionCompletion('stats', range), this.createFunctionCompletion('storageSize', range), this.createFunctionCompletion('totalIndexSize', range), this.createFunctionCompletion('update', range), this.createFunctionCompletion('updateOne', range), this.createFunctionCompletion('updateMany', range), this.createFunctionCompletion('validate', range), this.createFunctionCompletion('getShardVersion', range), this.createFunctionCompletion('getShardDistribution', range), this.createFunctionCompletion('getSplitKeysForChunks', range), this.createFunctionCompletion('getWriteConcern', range), this.createFunctionCompletion('setWriteConcern', range), this.createFunctionCompletion('unsetWriteConcern', range), this.createFunctionCompletion('latencyStats', range));
    }
    createFunctionCompletion(label, range) {
        return {
            textEdit: {
                newText: label,
                range
            },
            kind: vscode_languageserver_1.CompletionItemKind.Function,
            label,
            sortText: `2:${label}`
        };
    }
    createRange(parserRuleContext) {
        if (parserRuleContext instanceof ParserRuleContext_1.ParserRuleContext) {
            let startToken = parserRuleContext.start;
            let stopToken = parserRuleContext.stop;
            if (!stopToken || startToken.type === mongoParser.mongoParser.EOF) {
                stopToken = startToken;
            }
            let stop = stopToken.stopIndex;
            return this._createRange(startToken.startIndex, stop);
        }
        if (parserRuleContext instanceof TerminalNode_1.TerminalNode) {
            return this._createRange(parserRuleContext.symbol.startIndex, parserRuleContext.symbol.stopIndex);
        }
        return null;
    }
    createRangeAfter(parserRuleContext) {
        if (parserRuleContext instanceof ParserRuleContext_1.ParserRuleContext) {
            let stopToken = parserRuleContext.stop;
            if (!stopToken) {
                stopToken = parserRuleContext.start;
            }
            let stop = stopToken.stopIndex;
            return this._createRange(stop + 1, stop + 1);
        }
        if (parserRuleContext instanceof TerminalNode_1.TerminalNode) {
            return this._createRange(parserRuleContext.symbol.stopIndex + 1, parserRuleContext.symbol.stopIndex + 1);
        }
        //currently returning an null for the sake of linting. Would prefer to throw an error, but don't want
        // to introduce a regression bug.
        return null;
    }
    _createRange(start, end) {
        const endPosition = this.textDocument.positionAt(end);
        if (endPosition.line < this.at.line) {
            return vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(this.at.line, 0), this.at);
        }
        const startPosition = this.textDocument.positionAt(start);
        return vscode_languageserver_1.Range.create(startPosition, endPosition);
    }
    thenable(...completionItems) {
        return Promise.resolve(completionItems || []);
    }
}
exports.CompletionItemsVisitor = CompletionItemsVisitor;
//# sourceMappingURL=completionItemProvider.js.map