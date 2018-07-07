"use strict";
//
//  Copyright (c) Microsoft Corporation. All rights reserved.
//
Object.defineProperty(exports, "__esModule", { value: true });
const telemetry_1 = require("../telemetry/telemetry");
const telemetryStrings_1 = require("../telemetry/telemetryStrings");
class SearchServiceTelemetry {
    static SendFindFileDiagnostics(fileCount, useIgnoreFiles) {
        const summaryEvent = new telemetry_1.TelemetryEvent(SearchServiceTelemetryEventNames.FIND_FILE);
        summaryEvent.addMeasure(SearchServiceTelemetryPropertyNames.FILE_COUNT, fileCount);
        summaryEvent.addProperty(SearchServiceTelemetryPropertyNames.USE_IGNORE_FILES, useIgnoreFiles);
        summaryEvent.send();
    }
}
SearchServiceTelemetry.PROPERTY_PREFIX = telemetryStrings_1.TelemetryPropertyNames.FEATURE_NAME + 'Search.';
exports.SearchServiceTelemetry = SearchServiceTelemetry;
class SearchServiceTelemetryEventNames {
}
SearchServiceTelemetryEventNames.FIND_FILE_FAULT = 'find-file-fault';
SearchServiceTelemetryEventNames.FIND_FILE = 'find-file';
exports.SearchServiceTelemetryEventNames = SearchServiceTelemetryEventNames;
class SearchServiceTelemetryPropertyNames {
}
SearchServiceTelemetryPropertyNames.FILE_COUNT = SearchServiceTelemetry.PROPERTY_PREFIX + 'FileCount';
SearchServiceTelemetryPropertyNames.USE_IGNORE_FILES = SearchServiceTelemetry.PROPERTY_PREFIX + 'UseIgnoreFiles';

//# sourceMappingURL=searchServiceTelemetry.js.map
