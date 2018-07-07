"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
class MongoVisitor {
    visitMongoCommands(ctx) {
        return this.visitChildren(ctx);
    }
    visitCommands(ctx) {
        return this.visitChildren(ctx);
    }
    visitCommand(ctx) {
        return this.visitChildren(ctx);
    }
    visitCollection(ctx) {
        return this.visitChildren(ctx);
    }
    visitFunctionCall(ctx) {
        return this.visitChildren(ctx);
    }
    visitArgument(ctx) {
        return this.visitChildren(ctx);
    }
    visitArguments(ctx) {
        return this.visitChildren(ctx);
    }
    visit(tree) {
        return tree.accept(this);
    }
    visitChildren(ctx) {
        var result = this.defaultResult(ctx);
        var n = ctx.childCount;
        for (var i = 0; i < n; i++) {
            if (!this.shouldVisitNextChild(ctx, result)) {
                break;
            }
            var childNode = ctx.getChild(i);
            var childResult = childNode.accept(this);
            result = this.aggregateResult(result, childResult);
        }
        return result;
    }
    visitTerminal(node) {
        return this.defaultResult(node);
    }
    visitErrorNode(node) {
        return this.defaultResult(node);
    }
    defaultResult(_node) {
        return null;
    }
    aggregateResult(aggregate, nextResult) {
        return !nextResult ? aggregate : nextResult;
    }
    shouldVisitNextChild(_node, _currentResult) {
        return true;
    }
}
exports.MongoVisitor = MongoVisitor;
//# sourceMappingURL=visitors.js.map