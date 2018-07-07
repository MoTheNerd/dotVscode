"use strict";
// Generated from ./grammar/mongo.g4 by ANTLR 4.6-SNAPSHOT
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/*tslint:disable */
const ATN_1 = require("antlr4ts/atn/ATN");
const ATNDeserializer_1 = require("antlr4ts/atn/ATNDeserializer");
// import { FailedPredicateException } from 'antlr4ts/FailedPredicateException';
const Decorators_1 = require("antlr4ts/Decorators");
const NoViableAltException_1 = require("antlr4ts/NoViableAltException");
const Decorators_2 = require("antlr4ts/Decorators");
const Parser_1 = require("antlr4ts/Parser");
const ParserRuleContext_1 = require("antlr4ts/ParserRuleContext");
const ParserATNSimulator_1 = require("antlr4ts/atn/ParserATNSimulator");
// import { ParseTreeListener } from 'antlr4ts/tree/ParseTreeListener';
// import { ParseTreeVisitor } from 'antlr4ts/tree/ParseTreeVisitor';
const RecognitionException_1 = require("antlr4ts/RecognitionException");
// import { RuleContext } from 'antlr4ts/RuleContext';
const RuleVersion_1 = require("antlr4ts/RuleVersion");
const Token_1 = require("antlr4ts/Token");
const VocabularyImpl_1 = require("antlr4ts/VocabularyImpl");
const Utils = require("antlr4ts/misc/Utils");
class mongoParser extends Parser_1.Parser {
    constructor(input) {
        super(input);
        this._interp = new ParserATNSimulator_1.ParserATNSimulator(mongoParser._ATN, this);
    }
    get vocabulary() {
        return mongoParser.VOCABULARY;
    }
    get grammarFileName() { return "mongo.g4"; }
    get ruleNames() { return mongoParser.ruleNames; }
    get serializedATN() { return mongoParser._serializedATN; }
    mongoCommands() {
        let _localctx = new MongoCommandsContext(this._ctx, this.state);
        this.enterRule(_localctx, 0, mongoParser.RULE_mongoCommands);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 34;
                this.commands();
                this.state = 35;
                this.match(mongoParser.EOF);
            }
        }
        catch (re) {
            if (re instanceof RecognitionException_1.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    commands() {
        let _localctx = new CommandsContext(this._ctx, this.state);
        this.enterRule(_localctx, 2, mongoParser.RULE_commands);
        let _la;
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 40;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
                do {
                    {
                        this.state = 40;
                        this._errHandler.sync(this);
                        switch (this._input.LA(1)) {
                            case mongoParser.DB:
                                {
                                    this.state = 37;
                                    this.command();
                                }
                                break;
                            case mongoParser.SEMICOLON:
                                {
                                    this.state = 38;
                                    this.emptyCommand();
                                }
                                break;
                            case mongoParser.SingleLineComment:
                            case mongoParser.MultiLineComment:
                                {
                                    this.state = 39;
                                    this.comment();
                                }
                                break;
                            default:
                                throw new NoViableAltException_1.NoViableAltException(this);
                        }
                    }
                    this.state = 42;
                    this._errHandler.sync(this);
                    _la = this._input.LA(1);
                } while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << mongoParser.SingleLineComment) | (1 << mongoParser.MultiLineComment) | (1 << mongoParser.SEMICOLON) | (1 << mongoParser.DB))) !== 0));
            }
        }
        catch (re) {
            if (re instanceof RecognitionException_1.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    command() {
        let _localctx = new CommandContext(this._ctx, this.state);
        this.enterRule(_localctx, 4, mongoParser.RULE_command);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 44;
                this.match(mongoParser.DB);
                this.state = 45;
                this.match(mongoParser.DOT);
                this.state = 51;
                this._errHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this._input, 2, this._ctx)) {
                    case 1:
                        {
                            this.state = 46;
                            this.functionCall();
                        }
                        break;
                    case 2:
                        {
                            {
                                this.state = 47;
                                this.collection();
                                this.state = 48;
                                this.match(mongoParser.DOT);
                                this.state = 49;
                                this.functionCall();
                            }
                        }
                        break;
                }
                this.state = 54;
                this._errHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this._input, 3, this._ctx)) {
                    case 1:
                        {
                            this.state = 53;
                            this.match(mongoParser.SEMICOLON);
                        }
                        break;
                }
            }
        }
        catch (re) {
            if (re instanceof RecognitionException_1.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    emptyCommand() {
        let _localctx = new EmptyCommandContext(this._ctx, this.state);
        this.enterRule(_localctx, 6, mongoParser.RULE_emptyCommand);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 56;
                this.match(mongoParser.SEMICOLON);
            }
        }
        catch (re) {
            if (re instanceof RecognitionException_1.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    collection() {
        let _localctx = new CollectionContext(this._ctx, this.state);
        this.enterRule(_localctx, 8, mongoParser.RULE_collection);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 58;
                this.match(mongoParser.STRING_LITERAL);
            }
        }
        catch (re) {
            if (re instanceof RecognitionException_1.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    functionCall() {
        let _localctx = new FunctionCallContext(this._ctx, this.state);
        this.enterRule(_localctx, 10, mongoParser.RULE_functionCall);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 60;
                _localctx._FUNCTION_NAME = this.match(mongoParser.STRING_LITERAL);
                this.state = 61;
                this.arguments();
            }
        }
        catch (re) {
            if (re instanceof RecognitionException_1.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    arguments() {
        let _localctx = new ArgumentsContext(this._ctx, this.state);
        this.enterRule(_localctx, 12, mongoParser.RULE_arguments);
        let _la;
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 63;
                _localctx._OPEN_PARENTHESIS = this.match(mongoParser.T__0);
                this.state = 72;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << mongoParser.T__3) | (1 << mongoParser.T__5) | (1 << mongoParser.StringLiteral) | (1 << mongoParser.NullLiteral) | (1 << mongoParser.BooleanLiteral) | (1 << mongoParser.NumericLiteral))) !== 0)) {
                    {
                        this.state = 64;
                        this.argument();
                        this.state = 69;
                        this._errHandler.sync(this);
                        _la = this._input.LA(1);
                        while (_la === mongoParser.T__1) {
                            {
                                {
                                    this.state = 65;
                                    this.match(mongoParser.T__1);
                                    this.state = 66;
                                    this.argument();
                                }
                            }
                            this.state = 71;
                            this._errHandler.sync(this);
                            _la = this._input.LA(1);
                        }
                    }
                }
                this.state = 74;
                _localctx._CLOSED_PARENTHESIS = this.match(mongoParser.T__2);
            }
        }
        catch (re) {
            if (re instanceof RecognitionException_1.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    argument() {
        let _localctx = new ArgumentContext(this._ctx, this.state);
        this.enterRule(_localctx, 14, mongoParser.RULE_argument);
        try {
            this.state = 79;
            this._errHandler.sync(this);
            switch (this._input.LA(1)) {
                case mongoParser.StringLiteral:
                case mongoParser.NullLiteral:
                case mongoParser.BooleanLiteral:
                case mongoParser.NumericLiteral:
                    this.enterOuterAlt(_localctx, 1);
                    {
                        this.state = 76;
                        this.literal();
                    }
                    break;
                case mongoParser.T__3:
                    this.enterOuterAlt(_localctx, 2);
                    {
                        this.state = 77;
                        this.objectLiteral();
                    }
                    break;
                case mongoParser.T__5:
                    this.enterOuterAlt(_localctx, 3);
                    {
                        this.state = 78;
                        this.arrayLiteral();
                    }
                    break;
                default:
                    throw new NoViableAltException_1.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof RecognitionException_1.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    objectLiteral() {
        let _localctx = new ObjectLiteralContext(this._ctx, this.state);
        this.enterRule(_localctx, 16, mongoParser.RULE_objectLiteral);
        let _la;
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 81;
                this.match(mongoParser.T__3);
                this.state = 83;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
                if (_la === mongoParser.StringLiteral) {
                    {
                        this.state = 82;
                        this.propertyNameAndValueList();
                    }
                }
                this.state = 86;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
                if (_la === mongoParser.T__1) {
                    {
                        this.state = 85;
                        this.match(mongoParser.T__1);
                    }
                }
                this.state = 88;
                this.match(mongoParser.T__4);
            }
        }
        catch (re) {
            if (re instanceof RecognitionException_1.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    arrayLiteral() {
        let _localctx = new ArrayLiteralContext(this._ctx, this.state);
        this.enterRule(_localctx, 18, mongoParser.RULE_arrayLiteral);
        let _la;
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 90;
                this.match(mongoParser.T__5);
                this.state = 92;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << mongoParser.T__3) | (1 << mongoParser.T__5) | (1 << mongoParser.StringLiteral) | (1 << mongoParser.NullLiteral) | (1 << mongoParser.BooleanLiteral) | (1 << mongoParser.NumericLiteral) | (1 << mongoParser.STRING_LITERAL))) !== 0)) {
                    {
                        this.state = 91;
                        this.elementList();
                    }
                }
                this.state = 94;
                this.match(mongoParser.T__6);
            }
        }
        catch (re) {
            if (re instanceof RecognitionException_1.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    elementList() {
        let _localctx = new ElementListContext(this._ctx, this.state);
        this.enterRule(_localctx, 20, mongoParser.RULE_elementList);
        let _la;
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 96;
                this.propertyValue();
                this.state = 101;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
                while (_la === mongoParser.T__1) {
                    {
                        {
                            this.state = 97;
                            this.match(mongoParser.T__1);
                            this.state = 98;
                            this.propertyValue();
                        }
                    }
                    this.state = 103;
                    this._errHandler.sync(this);
                    _la = this._input.LA(1);
                }
            }
        }
        catch (re) {
            if (re instanceof RecognitionException_1.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    propertyNameAndValueList() {
        let _localctx = new PropertyNameAndValueListContext(this._ctx, this.state);
        this.enterRule(_localctx, 22, mongoParser.RULE_propertyNameAndValueList);
        try {
            let _alt;
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 104;
                this.propertyAssignment();
                this.state = 109;
                this._errHandler.sync(this);
                _alt = this.interpreter.adaptivePredict(this._input, 11, this._ctx);
                while (_alt !== 2 && _alt !== ATN_1.ATN.INVALID_ALT_NUMBER) {
                    if (_alt === 1) {
                        {
                            {
                                this.state = 105;
                                this.match(mongoParser.T__1);
                                this.state = 106;
                                this.propertyAssignment();
                            }
                        }
                    }
                    this.state = 111;
                    this._errHandler.sync(this);
                    _alt = this.interpreter.adaptivePredict(this._input, 11, this._ctx);
                }
            }
        }
        catch (re) {
            if (re instanceof RecognitionException_1.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    propertyAssignment() {
        let _localctx = new PropertyAssignmentContext(this._ctx, this.state);
        this.enterRule(_localctx, 24, mongoParser.RULE_propertyAssignment);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 112;
                this.propertyName();
                this.state = 113;
                this.match(mongoParser.T__7);
                this.state = 114;
                this.propertyValue();
            }
        }
        catch (re) {
            if (re instanceof RecognitionException_1.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    propertyValue() {
        let _localctx = new PropertyValueContext(this._ctx, this.state);
        this.enterRule(_localctx, 26, mongoParser.RULE_propertyValue);
        try {
            this.state = 120;
            this._errHandler.sync(this);
            switch (this._input.LA(1)) {
                case mongoParser.StringLiteral:
                case mongoParser.NullLiteral:
                case mongoParser.BooleanLiteral:
                case mongoParser.NumericLiteral:
                    this.enterOuterAlt(_localctx, 1);
                    {
                        this.state = 116;
                        this.literal();
                    }
                    break;
                case mongoParser.T__3:
                    this.enterOuterAlt(_localctx, 2);
                    {
                        this.state = 117;
                        this.objectLiteral();
                    }
                    break;
                case mongoParser.T__5:
                    this.enterOuterAlt(_localctx, 3);
                    {
                        this.state = 118;
                        this.arrayLiteral();
                    }
                    break;
                case mongoParser.STRING_LITERAL:
                    this.enterOuterAlt(_localctx, 4);
                    {
                        this.state = 119;
                        this.functionCall();
                    }
                    break;
                default:
                    throw new NoViableAltException_1.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof RecognitionException_1.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    literal() {
        let _localctx = new LiteralContext(this._ctx, this.state);
        this.enterRule(_localctx, 28, mongoParser.RULE_literal);
        let _la;
        try {
            this.state = 124;
            this._errHandler.sync(this);
            switch (this._input.LA(1)) {
                case mongoParser.StringLiteral:
                case mongoParser.NullLiteral:
                case mongoParser.BooleanLiteral:
                    this.enterOuterAlt(_localctx, 1);
                    {
                        this.state = 122;
                        _la = this._input.LA(1);
                        if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << mongoParser.StringLiteral) | (1 << mongoParser.NullLiteral) | (1 << mongoParser.BooleanLiteral))) !== 0))) {
                            this._errHandler.recoverInline(this);
                        }
                        else {
                            if (this._input.LA(1) === Token_1.Token.EOF) {
                                this.matchedEOF = true;
                            }
                            this._errHandler.reportMatch(this);
                            this.consume();
                        }
                    }
                    break;
                case mongoParser.NumericLiteral:
                    this.enterOuterAlt(_localctx, 2);
                    {
                        this.state = 123;
                        this.match(mongoParser.NumericLiteral);
                    }
                    break;
                default:
                    throw new NoViableAltException_1.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof RecognitionException_1.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    propertyName() {
        let _localctx = new PropertyNameContext(this._ctx, this.state);
        this.enterRule(_localctx, 30, mongoParser.RULE_propertyName);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 126;
                this.match(mongoParser.StringLiteral);
            }
        }
        catch (re) {
            if (re instanceof RecognitionException_1.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    comment() {
        let _localctx = new CommentContext(this._ctx, this.state);
        this.enterRule(_localctx, 32, mongoParser.RULE_comment);
        let _la;
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 128;
                _la = this._input.LA(1);
                if (!(_la === mongoParser.SingleLineComment || _la === mongoParser.MultiLineComment)) {
                    this._errHandler.recoverInline(this);
                }
                else {
                    if (this._input.LA(1) === Token_1.Token.EOF) {
                        this.matchedEOF = true;
                    }
                    this._errHandler.reportMatch(this);
                    this.consume();
                }
            }
        }
        catch (re) {
            if (re instanceof RecognitionException_1.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    static get _ATN() {
        if (!mongoParser.__ATN) {
            mongoParser.__ATN = new ATNDeserializer_1.ATNDeserializer().deserialize(Utils.toCharArray(mongoParser._serializedATN));
        }
        return mongoParser.__ATN;
    }
}
mongoParser.T__0 = 1;
mongoParser.T__1 = 2;
mongoParser.T__2 = 3;
mongoParser.T__3 = 4;
mongoParser.T__4 = 5;
mongoParser.T__5 = 6;
mongoParser.T__6 = 7;
mongoParser.T__7 = 8;
mongoParser.SingleLineComment = 9;
mongoParser.MultiLineComment = 10;
mongoParser.StringLiteral = 11;
mongoParser.NullLiteral = 12;
mongoParser.BooleanLiteral = 13;
mongoParser.NumericLiteral = 14;
mongoParser.DecimalLiteral = 15;
mongoParser.LineTerminator = 16;
mongoParser.SEMICOLON = 17;
mongoParser.DOT = 18;
mongoParser.DB = 19;
mongoParser.STRING_LITERAL = 20;
mongoParser.DOUBLE_QUOTED_STRING_LITERAL = 21;
mongoParser.SINGLE_QUOTED_STRING_LITERAL = 22;
mongoParser.WHITESPACE = 23;
mongoParser.RULE_mongoCommands = 0;
mongoParser.RULE_commands = 1;
mongoParser.RULE_command = 2;
mongoParser.RULE_emptyCommand = 3;
mongoParser.RULE_collection = 4;
mongoParser.RULE_functionCall = 5;
mongoParser.RULE_arguments = 6;
mongoParser.RULE_argument = 7;
mongoParser.RULE_objectLiteral = 8;
mongoParser.RULE_arrayLiteral = 9;
mongoParser.RULE_elementList = 10;
mongoParser.RULE_propertyNameAndValueList = 11;
mongoParser.RULE_propertyAssignment = 12;
mongoParser.RULE_propertyValue = 13;
mongoParser.RULE_literal = 14;
mongoParser.RULE_propertyName = 15;
mongoParser.RULE_comment = 16;
mongoParser.ruleNames = [
    "mongoCommands", "commands", "command", "emptyCommand", "collection",
    "functionCall", "arguments", "argument", "objectLiteral", "arrayLiteral",
    "elementList", "propertyNameAndValueList", "propertyAssignment", "propertyValue",
    "literal", "propertyName", "comment"
];
mongoParser._LITERAL_NAMES = [
    undefined, "'('", "','", "')'", "'{'", "'}'", "'['", "']'", "':'", undefined,
    undefined, undefined, "'null'", undefined, undefined, undefined, undefined,
    "';'", "'.'", "'db'"
];
mongoParser._SYMBOLIC_NAMES = [
    undefined, undefined, undefined, undefined, undefined, undefined, undefined,
    undefined, undefined, "SingleLineComment", "MultiLineComment", "StringLiteral",
    "NullLiteral", "BooleanLiteral", "NumericLiteral", "DecimalLiteral", "LineTerminator",
    "SEMICOLON", "DOT", "DB", "STRING_LITERAL", "DOUBLE_QUOTED_STRING_LITERAL",
    "SINGLE_QUOTED_STRING_LITERAL", "WHITESPACE"
];
mongoParser.VOCABULARY = new VocabularyImpl_1.VocabularyImpl(mongoParser._LITERAL_NAMES, mongoParser._SYMBOLIC_NAMES, []);
mongoParser._serializedATN = "\x03\uAF6F\u8320\u479D\uB75C\u4880\u1605\u191C\uAB37\x03\x19\x85\x04\x02" +
    "\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
    "\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
    "\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x03" +
    "\x02\x03\x02\x03\x02\x03\x03\x03\x03\x03\x03\x06\x03+\n\x03\r\x03\x0E" +
    "\x03,\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x05\x04" +
    "6\n\x04\x03\x04\x05\x049\n\x04\x03\x05\x03\x05\x03\x06\x03\x06\x03\x07" +
    "\x03\x07\x03\x07\x03\b\x03\b\x03\b\x03\b\x07\bF\n\b\f\b\x0E\bI\v\b\x05" +
    "\bK\n\b\x03\b\x03\b\x03\t\x03\t\x03\t\x05\tR\n\t\x03\n\x03\n\x05\nV\n" +
    "\n\x03\n\x05\nY\n\n\x03\n\x03\n\x03\v\x03\v\x05\v_\n\v\x03\v\x03\v\x03" +
    "\f\x03\f\x03\f\x07\ff\n\f\f\f\x0E\fi\v\f\x03\r\x03\r\x03\r\x07\rn\n\r" +
    "\f\r\x0E\rq\v\r\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0F\x03\x0F\x03\x0F" +
    "\x03\x0F\x05\x0F{\n\x0F\x03\x10\x03\x10\x05\x10\x7F\n\x10\x03\x11\x03" +
    "\x11\x03\x12\x03\x12\x03\x12\x02\x02\x02\x13\x02\x02\x04\x02\x06\x02\b" +
    "\x02\n\x02\f\x02\x0E\x02\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A\x02" +
    "\x1C\x02\x1E\x02 \x02\"\x02\x02\x04\x03\x02\r\x0F\x03\x02\v\f\x85\x02" +
    "$\x03\x02\x02\x02\x04*\x03\x02\x02\x02\x06.\x03\x02\x02\x02\b:\x03\x02" +
    "\x02\x02\n<\x03\x02\x02\x02\f>\x03\x02\x02\x02\x0EA\x03\x02\x02\x02\x10" +
    "Q\x03\x02\x02\x02\x12S\x03\x02\x02\x02\x14\\\x03\x02\x02\x02\x16b\x03" +
    "\x02\x02\x02\x18j\x03\x02\x02\x02\x1Ar\x03\x02\x02\x02\x1Cz\x03\x02\x02" +
    "\x02\x1E~\x03\x02\x02\x02 \x80\x03\x02\x02\x02\"\x82\x03\x02\x02\x02$" +
    "%\x05\x04\x03\x02%&\x07\x02\x02\x03&\x03\x03\x02\x02\x02\'+\x05\x06\x04" +
    "\x02(+\x05\b\x05\x02)+\x05\"\x12\x02*\'\x03\x02\x02\x02*(\x03\x02\x02" +
    "\x02*)\x03\x02\x02\x02+,\x03\x02\x02\x02,*\x03\x02\x02\x02,-\x03\x02\x02" +
    "\x02-\x05\x03\x02\x02\x02./\x07\x15\x02\x02/5\x07\x14\x02\x0206\x05\f" +
    "\x07\x0212\x05\n\x06\x0223\x07\x14\x02\x0234\x05\f\x07\x0246\x03\x02\x02" +
    "\x0250\x03\x02\x02\x0251\x03\x02\x02\x0268\x03\x02\x02\x0279\x07\x13\x02" +
    "\x0287\x03\x02\x02\x0289\x03\x02\x02\x029\x07\x03\x02\x02\x02:;\x07\x13" +
    "\x02\x02;\t\x03\x02\x02\x02<=\x07\x16\x02\x02=\v\x03\x02\x02\x02>?\x07" +
    "\x16\x02\x02?@\x05\x0E\b\x02@\r\x03\x02\x02\x02AJ\x07\x03\x02\x02BG\x05" +
    "\x10\t\x02CD\x07\x04\x02\x02DF\x05\x10\t\x02EC\x03\x02\x02\x02FI\x03\x02" +
    "\x02\x02GE\x03\x02\x02\x02GH\x03\x02\x02\x02HK\x03\x02\x02\x02IG\x03\x02" +
    "\x02\x02JB\x03\x02\x02\x02JK\x03\x02\x02\x02KL\x03\x02\x02\x02LM\x07\x05" +
    "\x02\x02M\x0F\x03\x02\x02\x02NR\x05\x1E\x10\x02OR\x05\x12\n\x02PR\x05" +
    "\x14\v\x02QN\x03\x02\x02\x02QO\x03\x02\x02\x02QP\x03\x02\x02\x02R\x11" +
    "\x03\x02\x02\x02SU\x07\x06\x02\x02TV\x05\x18\r\x02UT\x03\x02\x02\x02U" +
    "V\x03\x02\x02\x02VX\x03\x02\x02\x02WY\x07\x04\x02\x02XW\x03\x02\x02\x02" +
    "XY\x03\x02\x02\x02YZ\x03\x02\x02\x02Z[\x07\x07\x02\x02[\x13\x03\x02\x02" +
    "\x02\\^\x07\b\x02\x02]_\x05\x16\f\x02^]\x03\x02\x02\x02^_\x03\x02\x02" +
    "\x02_`\x03\x02\x02\x02`a\x07\t\x02\x02a\x15\x03\x02\x02\x02bg\x05\x1C" +
    "\x0F\x02cd\x07\x04\x02\x02df\x05\x1C\x0F\x02ec\x03\x02\x02\x02fi\x03\x02" +
    "\x02\x02ge\x03\x02\x02\x02gh\x03\x02\x02\x02h\x17\x03\x02\x02\x02ig\x03" +
    "\x02\x02\x02jo\x05\x1A\x0E\x02kl\x07\x04\x02\x02ln\x05\x1A\x0E\x02mk\x03" +
    "\x02\x02\x02nq\x03\x02\x02\x02om\x03\x02\x02\x02op\x03\x02\x02\x02p\x19" +
    "\x03\x02\x02\x02qo\x03\x02\x02\x02rs\x05 \x11\x02st\x07\n\x02\x02tu\x05" +
    "\x1C\x0F\x02u\x1B\x03\x02\x02\x02v{\x05\x1E\x10\x02w{\x05\x12\n\x02x{" +
    "\x05\x14\v\x02y{\x05\f\x07\x02zv\x03\x02\x02\x02zw\x03\x02\x02\x02zx\x03" +
    "\x02\x02\x02zy\x03\x02\x02\x02{\x1D\x03\x02\x02\x02|\x7F\t\x02\x02\x02" +
    "}\x7F\x07\x10\x02\x02~|\x03\x02\x02\x02~}\x03\x02\x02\x02\x7F\x1F\x03" +
    "\x02\x02\x02\x80\x81\x07\r\x02\x02\x81!\x03\x02\x02\x02\x82\x83\t\x03" +
    "\x02\x02\x83#\x03\x02\x02\x02\x10*,58GJQUX^goz~";
__decorate([
    Decorators_2.Override,
    Decorators_1.NotNull
], mongoParser.prototype, "vocabulary", null);
__decorate([
    Decorators_2.Override
], mongoParser.prototype, "grammarFileName", null);
__decorate([
    Decorators_2.Override
], mongoParser.prototype, "ruleNames", null);
__decorate([
    Decorators_2.Override
], mongoParser.prototype, "serializedATN", null);
__decorate([
    RuleVersion_1.RuleVersion(0)
], mongoParser.prototype, "mongoCommands", null);
__decorate([
    RuleVersion_1.RuleVersion(0)
], mongoParser.prototype, "commands", null);
__decorate([
    RuleVersion_1.RuleVersion(0)
], mongoParser.prototype, "command", null);
__decorate([
    RuleVersion_1.RuleVersion(0)
], mongoParser.prototype, "emptyCommand", null);
__decorate([
    RuleVersion_1.RuleVersion(0)
], mongoParser.prototype, "collection", null);
__decorate([
    RuleVersion_1.RuleVersion(0)
], mongoParser.prototype, "functionCall", null);
__decorate([
    RuleVersion_1.RuleVersion(0)
], mongoParser.prototype, "arguments", null);
__decorate([
    RuleVersion_1.RuleVersion(0)
], mongoParser.prototype, "argument", null);
__decorate([
    RuleVersion_1.RuleVersion(0)
], mongoParser.prototype, "objectLiteral", null);
__decorate([
    RuleVersion_1.RuleVersion(0)
], mongoParser.prototype, "arrayLiteral", null);
__decorate([
    RuleVersion_1.RuleVersion(0)
], mongoParser.prototype, "elementList", null);
__decorate([
    RuleVersion_1.RuleVersion(0)
], mongoParser.prototype, "propertyNameAndValueList", null);
__decorate([
    RuleVersion_1.RuleVersion(0)
], mongoParser.prototype, "propertyAssignment", null);
__decorate([
    RuleVersion_1.RuleVersion(0)
], mongoParser.prototype, "propertyValue", null);
__decorate([
    RuleVersion_1.RuleVersion(0)
], mongoParser.prototype, "literal", null);
__decorate([
    RuleVersion_1.RuleVersion(0)
], mongoParser.prototype, "propertyName", null);
__decorate([
    RuleVersion_1.RuleVersion(0)
], mongoParser.prototype, "comment", null);
exports.mongoParser = mongoParser;
class MongoCommandsContext extends ParserRuleContext_1.ParserRuleContext {
    constructor(parent, invokingState) {
        super(parent, invokingState);
    }
    commands() {
        return this.getRuleContext(0, CommandsContext);
    }
    EOF() { return this.getToken(mongoParser.EOF, 0); }
    get ruleIndex() { return mongoParser.RULE_mongoCommands; }
    enterRule(listener) {
        if (listener.enterMongoCommands)
            listener.enterMongoCommands(this);
    }
    exitRule(listener) {
        if (listener.exitMongoCommands)
            listener.exitMongoCommands(this);
    }
    accept(visitor) {
        if (visitor.visitMongoCommands)
            return visitor.visitMongoCommands(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], MongoCommandsContext.prototype, "ruleIndex", null);
__decorate([
    Decorators_2.Override
], MongoCommandsContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], MongoCommandsContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], MongoCommandsContext.prototype, "accept", null);
exports.MongoCommandsContext = MongoCommandsContext;
class CommandsContext extends ParserRuleContext_1.ParserRuleContext {
    constructor(parent, invokingState) {
        super(parent, invokingState);
    }
    command(i) {
        if (i === undefined) {
            return this.getRuleContexts(CommandContext);
        }
        else {
            return this.getRuleContext(i, CommandContext);
        }
    }
    emptyCommand(i) {
        if (i === undefined) {
            return this.getRuleContexts(EmptyCommandContext);
        }
        else {
            return this.getRuleContext(i, EmptyCommandContext);
        }
    }
    comment(i) {
        if (i === undefined) {
            return this.getRuleContexts(CommentContext);
        }
        else {
            return this.getRuleContext(i, CommentContext);
        }
    }
    get ruleIndex() { return mongoParser.RULE_commands; }
    enterRule(listener) {
        if (listener.enterCommands)
            listener.enterCommands(this);
    }
    exitRule(listener) {
        if (listener.exitCommands)
            listener.exitCommands(this);
    }
    accept(visitor) {
        if (visitor.visitCommands)
            return visitor.visitCommands(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], CommandsContext.prototype, "ruleIndex", null);
__decorate([
    Decorators_2.Override
], CommandsContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], CommandsContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], CommandsContext.prototype, "accept", null);
exports.CommandsContext = CommandsContext;
class CommandContext extends ParserRuleContext_1.ParserRuleContext {
    constructor(parent, invokingState) {
        super(parent, invokingState);
    }
    DB() { return this.getToken(mongoParser.DB, 0); }
    DOT(i) {
        if (i === undefined) {
            return this.getTokens(mongoParser.DOT);
        }
        else {
            return this.getToken(mongoParser.DOT, i);
        }
    }
    functionCall() {
        return this.tryGetRuleContext(0, FunctionCallContext);
    }
    SEMICOLON() { return this.tryGetToken(mongoParser.SEMICOLON, 0); }
    collection() {
        return this.tryGetRuleContext(0, CollectionContext);
    }
    get ruleIndex() { return mongoParser.RULE_command; }
    enterRule(listener) {
        if (listener.enterCommand)
            listener.enterCommand(this);
    }
    exitRule(listener) {
        if (listener.exitCommand)
            listener.exitCommand(this);
    }
    accept(visitor) {
        if (visitor.visitCommand)
            return visitor.visitCommand(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], CommandContext.prototype, "ruleIndex", null);
__decorate([
    Decorators_2.Override
], CommandContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], CommandContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], CommandContext.prototype, "accept", null);
exports.CommandContext = CommandContext;
class EmptyCommandContext extends ParserRuleContext_1.ParserRuleContext {
    constructor(parent, invokingState) {
        super(parent, invokingState);
    }
    SEMICOLON() { return this.getToken(mongoParser.SEMICOLON, 0); }
    get ruleIndex() { return mongoParser.RULE_emptyCommand; }
    enterRule(listener) {
        if (listener.enterEmptyCommand)
            listener.enterEmptyCommand(this);
    }
    exitRule(listener) {
        if (listener.exitEmptyCommand)
            listener.exitEmptyCommand(this);
    }
    accept(visitor) {
        if (visitor.visitEmptyCommand)
            return visitor.visitEmptyCommand(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], EmptyCommandContext.prototype, "ruleIndex", null);
__decorate([
    Decorators_2.Override
], EmptyCommandContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], EmptyCommandContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], EmptyCommandContext.prototype, "accept", null);
exports.EmptyCommandContext = EmptyCommandContext;
class CollectionContext extends ParserRuleContext_1.ParserRuleContext {
    constructor(parent, invokingState) {
        super(parent, invokingState);
    }
    STRING_LITERAL() { return this.getToken(mongoParser.STRING_LITERAL, 0); }
    get ruleIndex() { return mongoParser.RULE_collection; }
    enterRule(listener) {
        if (listener.enterCollection)
            listener.enterCollection(this);
    }
    exitRule(listener) {
        if (listener.exitCollection)
            listener.exitCollection(this);
    }
    accept(visitor) {
        if (visitor.visitCollection)
            return visitor.visitCollection(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], CollectionContext.prototype, "ruleIndex", null);
__decorate([
    Decorators_2.Override
], CollectionContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], CollectionContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], CollectionContext.prototype, "accept", null);
exports.CollectionContext = CollectionContext;
class FunctionCallContext extends ParserRuleContext_1.ParserRuleContext {
    constructor(parent, invokingState) {
        super(parent, invokingState);
    }
    arguments() {
        return this.getRuleContext(0, ArgumentsContext);
    }
    STRING_LITERAL() { return this.getToken(mongoParser.STRING_LITERAL, 0); }
    get ruleIndex() { return mongoParser.RULE_functionCall; }
    enterRule(listener) {
        if (listener.enterFunctionCall)
            listener.enterFunctionCall(this);
    }
    exitRule(listener) {
        if (listener.exitFunctionCall)
            listener.exitFunctionCall(this);
    }
    accept(visitor) {
        if (visitor.visitFunctionCall)
            return visitor.visitFunctionCall(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], FunctionCallContext.prototype, "ruleIndex", null);
__decorate([
    Decorators_2.Override
], FunctionCallContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], FunctionCallContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], FunctionCallContext.prototype, "accept", null);
exports.FunctionCallContext = FunctionCallContext;
class ArgumentsContext extends ParserRuleContext_1.ParserRuleContext {
    constructor(parent, invokingState) {
        super(parent, invokingState);
    }
    argument(i) {
        if (i === undefined) {
            return this.getRuleContexts(ArgumentContext);
        }
        else {
            return this.getRuleContext(i, ArgumentContext);
        }
    }
    get ruleIndex() { return mongoParser.RULE_arguments; }
    enterRule(listener) {
        if (listener.enterArguments)
            listener.enterArguments(this);
    }
    exitRule(listener) {
        if (listener.exitArguments)
            listener.exitArguments(this);
    }
    accept(visitor) {
        if (visitor.visitArguments)
            return visitor.visitArguments(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], ArgumentsContext.prototype, "ruleIndex", null);
__decorate([
    Decorators_2.Override
], ArgumentsContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], ArgumentsContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], ArgumentsContext.prototype, "accept", null);
exports.ArgumentsContext = ArgumentsContext;
class ArgumentContext extends ParserRuleContext_1.ParserRuleContext {
    constructor(parent, invokingState) {
        super(parent, invokingState);
    }
    literal() {
        return this.tryGetRuleContext(0, LiteralContext);
    }
    objectLiteral() {
        return this.tryGetRuleContext(0, ObjectLiteralContext);
    }
    arrayLiteral() {
        return this.tryGetRuleContext(0, ArrayLiteralContext);
    }
    get ruleIndex() { return mongoParser.RULE_argument; }
    enterRule(listener) {
        if (listener.enterArgument)
            listener.enterArgument(this);
    }
    exitRule(listener) {
        if (listener.exitArgument)
            listener.exitArgument(this);
    }
    accept(visitor) {
        if (visitor.visitArgument)
            return visitor.visitArgument(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], ArgumentContext.prototype, "ruleIndex", null);
__decorate([
    Decorators_2.Override
], ArgumentContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], ArgumentContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], ArgumentContext.prototype, "accept", null);
exports.ArgumentContext = ArgumentContext;
class ObjectLiteralContext extends ParserRuleContext_1.ParserRuleContext {
    constructor(parent, invokingState) {
        super(parent, invokingState);
    }
    propertyNameAndValueList() {
        return this.tryGetRuleContext(0, PropertyNameAndValueListContext);
    }
    get ruleIndex() { return mongoParser.RULE_objectLiteral; }
    enterRule(listener) {
        if (listener.enterObjectLiteral)
            listener.enterObjectLiteral(this);
    }
    exitRule(listener) {
        if (listener.exitObjectLiteral)
            listener.exitObjectLiteral(this);
    }
    accept(visitor) {
        if (visitor.visitObjectLiteral)
            return visitor.visitObjectLiteral(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], ObjectLiteralContext.prototype, "ruleIndex", null);
__decorate([
    Decorators_2.Override
], ObjectLiteralContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], ObjectLiteralContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], ObjectLiteralContext.prototype, "accept", null);
exports.ObjectLiteralContext = ObjectLiteralContext;
class ArrayLiteralContext extends ParserRuleContext_1.ParserRuleContext {
    constructor(parent, invokingState) {
        super(parent, invokingState);
    }
    elementList() {
        return this.tryGetRuleContext(0, ElementListContext);
    }
    get ruleIndex() { return mongoParser.RULE_arrayLiteral; }
    enterRule(listener) {
        if (listener.enterArrayLiteral)
            listener.enterArrayLiteral(this);
    }
    exitRule(listener) {
        if (listener.exitArrayLiteral)
            listener.exitArrayLiteral(this);
    }
    accept(visitor) {
        if (visitor.visitArrayLiteral)
            return visitor.visitArrayLiteral(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], ArrayLiteralContext.prototype, "ruleIndex", null);
__decorate([
    Decorators_2.Override
], ArrayLiteralContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], ArrayLiteralContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], ArrayLiteralContext.prototype, "accept", null);
exports.ArrayLiteralContext = ArrayLiteralContext;
class ElementListContext extends ParserRuleContext_1.ParserRuleContext {
    constructor(parent, invokingState) {
        super(parent, invokingState);
    }
    propertyValue(i) {
        if (i === undefined) {
            return this.getRuleContexts(PropertyValueContext);
        }
        else {
            return this.getRuleContext(i, PropertyValueContext);
        }
    }
    get ruleIndex() { return mongoParser.RULE_elementList; }
    enterRule(listener) {
        if (listener.enterElementList)
            listener.enterElementList(this);
    }
    exitRule(listener) {
        if (listener.exitElementList)
            listener.exitElementList(this);
    }
    accept(visitor) {
        if (visitor.visitElementList)
            return visitor.visitElementList(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], ElementListContext.prototype, "ruleIndex", null);
__decorate([
    Decorators_2.Override
], ElementListContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], ElementListContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], ElementListContext.prototype, "accept", null);
exports.ElementListContext = ElementListContext;
class PropertyNameAndValueListContext extends ParserRuleContext_1.ParserRuleContext {
    constructor(parent, invokingState) {
        super(parent, invokingState);
    }
    propertyAssignment(i) {
        if (i === undefined) {
            return this.getRuleContexts(PropertyAssignmentContext);
        }
        else {
            return this.getRuleContext(i, PropertyAssignmentContext);
        }
    }
    get ruleIndex() { return mongoParser.RULE_propertyNameAndValueList; }
    enterRule(listener) {
        if (listener.enterPropertyNameAndValueList)
            listener.enterPropertyNameAndValueList(this);
    }
    exitRule(listener) {
        if (listener.exitPropertyNameAndValueList)
            listener.exitPropertyNameAndValueList(this);
    }
    accept(visitor) {
        if (visitor.visitPropertyNameAndValueList)
            return visitor.visitPropertyNameAndValueList(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], PropertyNameAndValueListContext.prototype, "ruleIndex", null);
__decorate([
    Decorators_2.Override
], PropertyNameAndValueListContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], PropertyNameAndValueListContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], PropertyNameAndValueListContext.prototype, "accept", null);
exports.PropertyNameAndValueListContext = PropertyNameAndValueListContext;
class PropertyAssignmentContext extends ParserRuleContext_1.ParserRuleContext {
    constructor(parent, invokingState) {
        super(parent, invokingState);
    }
    propertyName() {
        return this.getRuleContext(0, PropertyNameContext);
    }
    propertyValue() {
        return this.getRuleContext(0, PropertyValueContext);
    }
    get ruleIndex() { return mongoParser.RULE_propertyAssignment; }
    enterRule(listener) {
        if (listener.enterPropertyAssignment)
            listener.enterPropertyAssignment(this);
    }
    exitRule(listener) {
        if (listener.exitPropertyAssignment)
            listener.exitPropertyAssignment(this);
    }
    accept(visitor) {
        if (visitor.visitPropertyAssignment)
            return visitor.visitPropertyAssignment(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], PropertyAssignmentContext.prototype, "ruleIndex", null);
__decorate([
    Decorators_2.Override
], PropertyAssignmentContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], PropertyAssignmentContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], PropertyAssignmentContext.prototype, "accept", null);
exports.PropertyAssignmentContext = PropertyAssignmentContext;
class PropertyValueContext extends ParserRuleContext_1.ParserRuleContext {
    constructor(parent, invokingState) {
        super(parent, invokingState);
    }
    literal() {
        return this.tryGetRuleContext(0, LiteralContext);
    }
    objectLiteral() {
        return this.tryGetRuleContext(0, ObjectLiteralContext);
    }
    arrayLiteral() {
        return this.tryGetRuleContext(0, ArrayLiteralContext);
    }
    functionCall() {
        return this.tryGetRuleContext(0, FunctionCallContext);
    }
    get ruleIndex() { return mongoParser.RULE_propertyValue; }
    enterRule(listener) {
        if (listener.enterPropertyValue)
            listener.enterPropertyValue(this);
    }
    exitRule(listener) {
        if (listener.exitPropertyValue)
            listener.exitPropertyValue(this);
    }
    accept(visitor) {
        if (visitor.visitPropertyValue)
            return visitor.visitPropertyValue(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], PropertyValueContext.prototype, "ruleIndex", null);
__decorate([
    Decorators_2.Override
], PropertyValueContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], PropertyValueContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], PropertyValueContext.prototype, "accept", null);
exports.PropertyValueContext = PropertyValueContext;
class LiteralContext extends ParserRuleContext_1.ParserRuleContext {
    constructor(parent, invokingState) {
        super(parent, invokingState);
    }
    NullLiteral() { return this.tryGetToken(mongoParser.NullLiteral, 0); }
    BooleanLiteral() { return this.tryGetToken(mongoParser.BooleanLiteral, 0); }
    StringLiteral() { return this.tryGetToken(mongoParser.StringLiteral, 0); }
    NumericLiteral() { return this.tryGetToken(mongoParser.NumericLiteral, 0); }
    get ruleIndex() { return mongoParser.RULE_literal; }
    enterRule(listener) {
        if (listener.enterLiteral)
            listener.enterLiteral(this);
    }
    exitRule(listener) {
        if (listener.exitLiteral)
            listener.exitLiteral(this);
    }
    accept(visitor) {
        if (visitor.visitLiteral)
            return visitor.visitLiteral(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], LiteralContext.prototype, "ruleIndex", null);
__decorate([
    Decorators_2.Override
], LiteralContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], LiteralContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], LiteralContext.prototype, "accept", null);
exports.LiteralContext = LiteralContext;
class PropertyNameContext extends ParserRuleContext_1.ParserRuleContext {
    constructor(parent, invokingState) {
        super(parent, invokingState);
    }
    StringLiteral() { return this.getToken(mongoParser.StringLiteral, 0); }
    get ruleIndex() { return mongoParser.RULE_propertyName; }
    enterRule(listener) {
        if (listener.enterPropertyName)
            listener.enterPropertyName(this);
    }
    exitRule(listener) {
        if (listener.exitPropertyName)
            listener.exitPropertyName(this);
    }
    accept(visitor) {
        if (visitor.visitPropertyName)
            return visitor.visitPropertyName(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], PropertyNameContext.prototype, "ruleIndex", null);
__decorate([
    Decorators_2.Override
], PropertyNameContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], PropertyNameContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], PropertyNameContext.prototype, "accept", null);
exports.PropertyNameContext = PropertyNameContext;
class CommentContext extends ParserRuleContext_1.ParserRuleContext {
    constructor(parent, invokingState) {
        super(parent, invokingState);
    }
    SingleLineComment() { return this.tryGetToken(mongoParser.SingleLineComment, 0); }
    MultiLineComment() { return this.tryGetToken(mongoParser.MultiLineComment, 0); }
    get ruleIndex() { return mongoParser.RULE_comment; }
    enterRule(listener) {
        if (listener.enterComment)
            listener.enterComment(this);
    }
    exitRule(listener) {
        if (listener.exitComment)
            listener.exitComment(this);
    }
    accept(visitor) {
        if (visitor.visitComment)
            return visitor.visitComment(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], CommentContext.prototype, "ruleIndex", null);
__decorate([
    Decorators_2.Override
], CommentContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], CommentContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], CommentContext.prototype, "accept", null);
exports.CommentContext = CommentContext;
//# sourceMappingURL=mongoParser.js.map