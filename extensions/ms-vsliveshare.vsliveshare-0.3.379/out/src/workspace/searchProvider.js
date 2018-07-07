//
//  Copyright (c) Microsoft Corporation. All rights reserved.
//
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vsls = require("./contract/VSLS");
const traceSource_1 = require("../tracing/traceSource");
const telemetry_1 = require("../telemetry/telemetry");
const searchServiceTelemetry_1 = require("../telemetry/searchServiceTelemetry");
class SearchProvider {
    constructor(fileservice) {
        this.fileservice = fileservice;
        this.fileservice.onFilesChanged((e) => this.onFilesChanged(e));
        this.trace = traceSource_1.traceSource.withName(traceSource_1.TraceSources.AgentFile);
    }
    onFilesChanged(e) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let change of e.changes) {
                yield this.updateList(change);
            }
        });
    }
    updateList(change) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.filePaths) {
                switch (change.changeType) {
                    case vsls.FileChangeType.Deleted:
                        let index = this.filePaths.indexOf(change.path);
                        if (index === -1) {
                            break;
                        }
                        // If the change is for the last file in the file path list
                        if (index === this.filePaths.length - 1) {
                            this.filePaths.pop();
                        }
                        else {
                            this.filePaths[index] = this.filePaths.pop();
                        }
                        break;
                    case vsls.FileChangeType.Added:
                        //check if file is excluded
                        let fileOptions = {
                            excludePatterns: this.fileSearchOptions.excludes
                        };
                        if (!(yield this.fileservice.isExcludedAsync(change.path, fileOptions))) {
                            this.filePaths.push(change.path);
                        }
                        break;
                    default:
                        break;
                }
            }
        });
    }
    getFiles(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // No file list options passed. Can be used in future to pass on vscode file search options
                let fileOptions = {
                    excludePatterns: options.excludes
                };
                this.filePaths = yield this.fileservice.getFilesAsync(fileOptions);
                searchServiceTelemetry_1.SearchServiceTelemetry.SendFindFileDiagnostics(this.filePaths.length, options.useIgnoreFiles);
            }
            catch (e) {
                this.trace.error(e);
                telemetry_1.Instance.sendFault(searchServiceTelemetry_1.SearchServiceTelemetryEventNames.FIND_FILE_FAULT, telemetry_1.FaultType.Error, 'Failed to get files from host', e);
            }
        });
    }
    provideFileSearchResults(options, progress, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.filePaths || this.fileSearchOptions !== options) {
                yield this.getFiles(options);
                this.fileSearchOptions = options;
            }
            if (this.filePaths) {
                this.filePaths.forEach(filePath => {
                    progress.report(filePath);
                });
            }
        });
    }
    provideTextSearchResults(query, options, progress, token) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.SearchProvider = SearchProvider;
class TextSearchQuery {
}
exports.TextSearchQuery = TextSearchQuery;
class TextSearchOptions {
}
exports.TextSearchOptions = TextSearchOptions;
class TextSearchResult {
}
exports.TextSearchResult = TextSearchResult;

//# sourceMappingURL=searchProvider.js.map
