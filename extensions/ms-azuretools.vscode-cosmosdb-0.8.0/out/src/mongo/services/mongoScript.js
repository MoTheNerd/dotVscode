"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const ANTLRInputStream_1 = require("antlr4ts/ANTLRInputStream");
const CommonTokenStream_1 = require("antlr4ts/CommonTokenStream");
const ParserRuleContext_1 = require("antlr4ts/ParserRuleContext");
const TerminalNode_1 = require("antlr4ts/tree/TerminalNode");
const Interval_1 = require("antlr4ts/misc/Interval");
const mongoParser = require("./../grammar/mongoParser");
const mongoLexer_1 = require("./../grammar/mongoLexer");
const visitors_1 = require("./../grammar/visitors");
const completionItemProvider_1 = require("./completionItemProvider");
class MongoScriptDocumentManager {
    constructor(schemaService, jsonLanguageService) {
        this.schemaService = schemaService;
        this.jsonLanguageService = jsonLanguageService;
    }
    getDocument(textDocument, db) {
        return new MongoScriptDocument(textDocument, db, this.schemaService, this.jsonLanguageService);
    }
}
exports.MongoScriptDocumentManager = MongoScriptDocumentManager;
class MongoScriptDocument {
    constructor(textDocument, db, schemaService, jsonLanguageService) {
        this.textDocument = textDocument;
        this.db = db;
        this.schemaService = schemaService;
        this.jsonLanguageService = jsonLanguageService;
        this._lexer = new mongoLexer_1.mongoLexer(new ANTLRInputStream_1.ANTLRInputStream(textDocument.getText()));
        this._lexer.removeErrorListeners();
    }
    provideCompletionItemsAt(position) {
        const parser = new mongoParser.mongoParser(new CommonTokenStream_1.CommonTokenStream(this._lexer));
        parser.removeErrorListeners();
        const offset = this.textDocument.offsetAt(position);
        const lastNode = new NodeFinder(offset).visit(parser.commands());
        if (lastNode) {
            return new completionItemProvider_1.CompletionItemsVisitor(this.textDocument, this.db, offset, this.schemaService, this.jsonLanguageService).visit(lastNode);
        }
        return Promise.resolve([]);
    }
}
exports.MongoScriptDocument = MongoScriptDocument;
class NodeFinder extends visitors_1.MongoVisitor {
    constructor(offset) {
        super();
        this.offset = offset;
    }
    defaultResult(ctx) {
        if (ctx instanceof ParserRuleContext_1.ParserRuleContext) {
            const stop = ctx.stop ? ctx.stop.stopIndex : ctx.start.stopIndex;
            if (stop < this.offset) {
                return ctx;
            }
            return null;
        }
        if (ctx instanceof TerminalNode_1.TerminalNode) {
            if (ctx.symbol.stopIndex < this.offset) {
                return ctx;
            }
            return null;
        }
        return null;
    }
    aggregateResult(aggregate, nextResult) {
        if (aggregate && nextResult) {
            const aggregateStart = aggregate instanceof ParserRuleContext_1.ParserRuleContext ? aggregate.start.startIndex : aggregate.symbol.startIndex;
            const aggregateStop = aggregate instanceof ParserRuleContext_1.ParserRuleContext ? aggregate.start.stopIndex : aggregate.symbol.stopIndex;
            const nextResultStart = nextResult instanceof ParserRuleContext_1.ParserRuleContext ? nextResult.start.startIndex : nextResult.symbol.startIndex;
            const nextResultStop = nextResult instanceof ParserRuleContext_1.ParserRuleContext ? nextResult.start.stopIndex : nextResult.symbol.stopIndex;
            if (Interval_1.Interval.of(aggregateStart, aggregateStop).properlyContains(Interval_1.Interval.of(nextResultStart, nextResultStop))) {
                return aggregate;
            }
            return nextResult;
        }
        return nextResult ? nextResult : aggregate;
    }
}
//# sourceMappingURL=mongoScript.js.map