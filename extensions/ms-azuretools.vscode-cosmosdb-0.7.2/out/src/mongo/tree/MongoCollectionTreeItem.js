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
const path = require("path");
const _ = require("underscore");
const vscodeUtils = require("../../utils/vscodeUtils");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const constants_1 = require("../../constants");
const MongoDocumentTreeItem_1 = require("./MongoDocumentTreeItem");
// tslint:disable:no-var-requires
const EJSON = require("mongodb-extended-json");
class MongoCollectionTreeItem {
    constructor(collection, query) {
        this.contextValue = MongoCollectionTreeItem.contextValue;
        this.childTypeLabel = "Document";
        this._hasMoreChildren = true;
        this._batchSize = constants_1.DefaultBatchSize;
        this.collection = collection;
        this._query = query && query.length && EJSON.parse(query[0]);
        this._projection = query && query.length > 1 && EJSON.parse(query[1]);
    }
    update(documents) {
        return __awaiter(this, void 0, void 0, function* () {
            const operations = documents.map((document) => {
                return {
                    updateOne: {
                        filter: { _id: document._id },
                        update: _.omit(document, '_id'),
                        upsert: false
                    }
                };
            });
            const result = yield this.collection.bulkWrite(operations);
            const output = vscodeUtils.getOutputChannel();
            output.appendLine(`Successfully updated ${result.modifiedCount} document(s), inserted ${result.insertedCount} document(s)`);
            return documents;
        });
    }
    get id() {
        return this.collection.collectionName;
    }
    get label() {
        return this.collection.collectionName;
    }
    get iconPath() {
        return {
            light: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icons', 'theme-agnostic', 'Collection.svg'),
            dark: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'icons', 'theme-agnostic', 'Collection.svg'),
        };
    }
    hasMoreChildren() {
        return this._hasMoreChildren;
    }
    loadMoreChildren(_node, clearCache) {
        return __awaiter(this, void 0, void 0, function* () {
            if (clearCache || this._cursor === undefined) {
                this._cursor = this.collection.find(this._query).batchSize(constants_1.DefaultBatchSize);
                if (this._projection) {
                    this._cursor = this._cursor.project(this._projection);
                }
                this._batchSize = constants_1.DefaultBatchSize;
            }
            const documents = [];
            let count = 0;
            while (count < this._batchSize) {
                this._hasMoreChildren = yield this._cursor.hasNext();
                if (this._hasMoreChildren) {
                    documents.push(yield this._cursor.next());
                    count += 1;
                }
                else {
                    break;
                }
            }
            this._batchSize *= 2;
            return documents.map((document) => new MongoDocumentTreeItem_1.MongoDocumentTreeItem(document, this.collection));
        });
    }
    createChild(_node, showCreatingNode) {
        return __awaiter(this, void 0, void 0, function* () {
            showCreatingNode("");
            const result = yield this.collection.insertOne({});
            const newDocument = yield this.collection.findOne({ _id: result.insertedId });
            return new MongoDocumentTreeItem_1.MongoDocumentTreeItem(newDocument, this.collection);
        });
    }
    //tslint:disable:cyclomatic-complexity
    executeCommand(name, args) {
        try {
            if (name === 'findOne') {
                return reportProgress(this.findOne(args ? args.map(parseJSContent) : undefined), 'Finding');
            }
            if (name === 'drop') {
                return reportProgress(this.drop(), 'Dropping collection');
            }
            if (name === 'insertMany') {
                return reportProgress(this.insertMany(args ? args.map(parseJSContent) : undefined), 'Inserting documents');
            }
            else {
                let argument;
                if (args && args.length > 1) {
                    return undefined;
                }
                if (args) {
                    argument = args[0];
                }
                if (name === 'insert') {
                    return reportProgress(this.insert(argument ? parseJSContent(argument) : undefined), 'Inserting document');
                }
                if (name === 'insertOne') {
                    return reportProgress(this.insertOne(argument ? parseJSContent(argument) : undefined), 'Inserting document');
                }
                if (name === 'deleteOne') {
                    return reportProgress(this.deleteOne(argument ? parseJSContent(argument) : undefined), 'Deleting document');
                }
                if (name === 'deleteMany') {
                    return reportProgress(this.deleteMany(argument ? parseJSContent(argument) : undefined), 'Deleting documents');
                }
                if (name === 'remove') {
                    return reportProgress(this.remove(argument ? parseJSContent(argument) : undefined), 'Removing');
                }
                if (name === 'count') {
                    return reportProgress(this.count(argument ? parseJSContent(argument) : undefined), 'Counting');
                }
                return null;
            }
        }
        catch (error) {
            return Promise.resolve(error);
        }
    }
    deleteTreeItem(_node) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = `Are you sure you want to delete collection '${this.label}'?`;
            const result = yield vscode.window.showWarningMessage(message, { modal: true }, vscode_azureextensionui_1.DialogResponses.deleteResponse, vscode_azureextensionui_1.DialogResponses.cancel);
            if (result === vscode_azureextensionui_1.DialogResponses.deleteResponse) {
                yield this.drop();
            }
            else {
                throw new vscode_azureextensionui_1.UserCancelledError();
            }
        });
    }
    drop() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.collection.drop();
                return `Dropped collection '${this.collection.collectionName}'.`;
            }
            catch (e) {
                let error = e;
                const NamespaceNotFoundCode = 26;
                if (error.name === 'MongoError' && error.code === NamespaceNotFoundCode) {
                    return `Collection '${this.collection.collectionName}' could not be dropped because it does not exist.`;
                }
                else {
                    throw error;
                }
            }
        });
    }
    //tslint:disable:no-any
    findOne(args) {
        return __awaiter(this, void 0, void 0, function* () {
            let result;
            if (!args || args.length === 0) {
                result = yield this.collection.findOne({});
            }
            else if (args.length === 1) {
                result = yield this.collection.findOne(args[0]);
            }
            else if (args.length === 2) {
                result = yield this.collection.findOne(args[0], { fields: args[1] });
            }
            else {
                return Promise.reject(new Error("Too many arguments passed to findOne."));
            }
            // findOne is the only command in this file whose output requires EJSON support.
            // Hence that's the only function which uses EJSON.stringify rather than this.stringify.
            return EJSON.stringify(result, null, '\t');
        });
    }
    insert(document) {
        return this.collection.insert(document)
            .then(({ insertedCount, insertedId, result }) => {
            return this.stringify({ insertedCount, insertedId, result });
        });
    }
    insertOne(document) {
        return this.collection.insertOne(document)
            .then(({ insertedCount, insertedId, result }) => {
            return this.stringify({ insertedCount, insertedId, result });
        });
    }
    //tslint:disable:no-any
    insertMany(args) {
        // documents = args[0], collectionWriteOptions from args[1]
        let insertManyOptions = {};
        const docsLink = "Please see mongo shell documentation. https://docs.mongodb.com/manual/reference/method/db.collection.insertMany/#db.collection.insertMany.";
        if (!args || args.length === 0) {
            return Promise.reject(new Error("Too few arguments passed to insertMany. " + docsLink));
        }
        if (args.length > 2) {
            return Promise.reject(new Error("Too many arguments passed to insertMany. " + docsLink));
        }
        else if (args.length === 2) {
            if (args[1] && args[1].ordered) {
                insertManyOptions["ordered"] = args[1].ordered;
            }
            if (args[1] && args[1].writeConcern) {
                insertManyOptions["w"] = args[1].writeConcern;
            }
        }
        return this.collection.insertMany(args[0], insertManyOptions)
            .then(({ insertedCount, insertedIds, result }) => {
            return this.stringify({ insertedCount, insertedIds, result });
        });
    }
    remove(args) {
        return this.collection.remove(args)
            .then(({ ops, result }) => {
            return this.stringify({ ops, result });
        });
    }
    deleteOne(args) {
        return this.collection.deleteOne(args)
            .then(({ deletedCount, result }) => {
            return this.stringify({ deletedCount, result });
        });
    }
    deleteMany(args) {
        return this.collection.deleteMany(args)
            .then(({ deletedCount, result }) => {
            return this.stringify({ deletedCount, result });
        });
    }
    count(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield this.collection.count(args);
            return JSON.stringify(count);
        });
    }
    // tslint:disable-next-line:no-any
    stringify(result) {
        return JSON.stringify(result, null, '\t');
    }
}
MongoCollectionTreeItem.contextValue = "MongoCollection";
exports.MongoCollectionTreeItem = MongoCollectionTreeItem;
function reportProgress(promise, title) {
    return vscode.window.withProgress({
        location: vscode.ProgressLocation.Window,
        title
    }, (_progress) => {
        return promise;
    });
}
// tslint:disable-next-line:no-any
function parseJSContent(content) {
    try {
        return EJSON.parse(content);
    }
    catch (error) {
        throw error.message;
    }
}
//# sourceMappingURL=MongoCollectionTreeItem.js.map