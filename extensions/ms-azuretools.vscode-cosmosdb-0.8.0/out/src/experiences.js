"use strict";
/* ------------------------------------------------------------------------------------------
 *   Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var API;
(function (API) {
    API["MongoDB"] = "MongoDB";
    API["Graph"] = "Graph";
    API["Table"] = "Table";
    API["DocumentDB"] = "DocumentDB";
})(API = exports.API || (exports.API = {}));
var DBAccountKind;
(function (DBAccountKind) {
    DBAccountKind["MongoDB"] = "MongoDB";
    DBAccountKind["GlobalDocumentDB"] = "GlobalDocumentDB";
})(DBAccountKind = exports.DBAccountKind || (exports.DBAccountKind = {}));
function getExperience(api) {
    let info = experiencesMap.get(api);
    if (!info) {
        info = { api: api, shortName: api, longName: api, kind: DBAccountKind.GlobalDocumentDB };
    }
    return info;
}
exports.getExperience = getExperience;
function getExperienceQuickPicks() {
    return experiencesArray.map(exp => getExperienceQuickPick(exp.api));
}
exports.getExperienceQuickPicks = getExperienceQuickPicks;
function getExperienceQuickPick(api) {
    const exp = getExperience(api);
    return { label: exp.longName, description: exp.description, data: exp };
}
exports.getExperienceQuickPick = getExperienceQuickPick;
const experiencesArray = [
    { api: API.DocumentDB, longName: "SQL", description: "(DocumentDB)", shortName: "SQL", kind: DBAccountKind.GlobalDocumentDB },
    { api: API.MongoDB, longName: "MongoDB", shortName: "MongoDB", kind: DBAccountKind.MongoDB },
    { api: API.Table, longName: "Azure Table", shortName: "Table", kind: DBAccountKind.GlobalDocumentDB },
    { api: API.Graph, longName: "Gremlin", description: "(Graph)", shortName: "Gremlin", kind: DBAccountKind.GlobalDocumentDB }
];
const experiencesMap = new Map(experiencesArray.map((info) => [info.api, info]));
//# sourceMappingURL=experiences.js.map