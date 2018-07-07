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
const vscode = require("vscode");
const url = require("url");
const ic = require("./internalConfig");
var Key;
(function (Key) {
    // PUBLIC SETTINGS
    Key[Key["features"] = 0] = "features";
    Key[Key["diagnosticLogging"] = 1] = "diagnosticLogging";
    Key[Key["accountProvider"] = 2] = "accountProvider";
    Key[Key["account"] = 3] = "account";
    Key[Key["connectionMode"] = 4] = "connectionMode";
    Key[Key["joinDebugSessionOption"] = 5] = "joinDebugSessionOption";
    Key[Key["nameTagVisibility"] = 6] = "nameTagVisibility";
    Key[Key["guestApprovalRequired"] = 7] = "guestApprovalRequired";
    Key[Key["excludedDebugTypes"] = 8] = "excludedDebugTypes";
    Key[Key["keepAliveInterval"] = 9] = "keepAliveInterval";
    Key[Key["showInStatusBar"] = 10] = "showInStatusBar";
    Key[Key["allowGuestTaskControl"] = 11] = "allowGuestTaskControl";
    // PRIVATE SETTINGS
    Key[Key["joinWorkspaceLocalPath"] = 12] = "joinWorkspaceLocalPath";
    Key[Key["agentUri"] = 13] = "agentUri";
    Key[Key["serviceUri"] = 14] = "serviceUri";
    Key[Key["joinInNewWindow"] = 15] = "joinInNewWindow";
    Key[Key["registrationUri"] = 16] = "registrationUri";
    Key[Key["showLauncherInstallNotification"] = 17] = "showLauncherInstallNotification";
    Key[Key["showLauncherError"] = 18] = "showLauncherError";
    Key[Key["joinEventCorrelationId"] = 19] = "joinEventCorrelationId";
    Key[Key["workspaceReloadTime"] = 20] = "workspaceReloadTime";
    Key[Key["userSettingsPath"] = 21] = "userSettingsPath";
    Key[Key["name"] = 22] = "name";
    Key[Key["shortName"] = 23] = "shortName";
    Key[Key["abbreviation"] = 24] = "abbreviation";
    Key[Key["licenseUrl"] = 25] = "licenseUrl";
    Key[Key["privacyUrl"] = 26] = "privacyUrl";
    Key[Key["configName"] = 27] = "configName";
    Key[Key["authority"] = 28] = "authority";
    Key[Key["scheme"] = 29] = "scheme";
    Key[Key["agent"] = 30] = "agent";
    Key[Key["commandPrefix"] = 31] = "commandPrefix";
    Key[Key["launcherName"] = 32] = "launcherName";
    Key[Key["userEmail"] = 33] = "userEmail";
    Key[Key["isInternal"] = 34] = "isInternal";
    Key[Key["canCollectPII"] = 35] = "canCollectPII";
    Key[Key["teamStatus"] = 36] = "teamStatus";
    Key[Key["isShareLocalServerHintDisplayed"] = 37] = "isShareLocalServerHintDisplayed";
    Key[Key["debugAdapters"] = 38] = "debugAdapters";
    Key[Key["sessionCount"] = 39] = "sessionCount";
    Key[Key["requestFeedback"] = 40] = "requestFeedback";
    Key[Key["gitHubUri"] = 41] = "gitHubUri";
    Key[Key["experimentalFeatures"] = 42] = "experimentalFeatures";
    Key[Key["sharedTerminalWindow"] = 43] = "sharedTerminalWindow";
    Key[Key["sharedTerminalWidth"] = 44] = "sharedTerminalWidth";
    Key[Key["sharedTerminalHeight"] = 45] = "sharedTerminalHeight";
    Key[Key["shareDebugTerminal"] = 46] = "shareDebugTerminal";
    Key[Key["debugAdapter"] = 47] = "debugAdapter";
    Key[Key["debugHostAdapter"] = 48] = "debugHostAdapter";
    Key[Key["traceFilters"] = 49] = "traceFilters";
})(Key = exports.Key || (exports.Key = {}));
const privateSettings = [
    Key.joinWorkspaceLocalPath,
    Key.agentUri,
    Key.serviceUri,
    Key.joinInNewWindow,
    Key.registrationUri,
    Key.showLauncherInstallNotification,
    Key.showLauncherError,
    Key.joinEventCorrelationId,
    Key.workspaceReloadTime,
    Key.userSettingsPath,
    Key.name,
    Key.shortName,
    Key.abbreviation,
    Key.licenseUrl,
    Key.privacyUrl,
    Key.configName,
    Key.authority,
    Key.scheme,
    Key.agent,
    Key.commandPrefix,
    Key.launcherName,
    Key.userEmail,
    Key.isInternal,
    Key.canCollectPII,
    Key.teamStatus,
    Key.isShareLocalServerHintDisplayed,
    Key.debugAdapters,
    Key.sessionCount,
    Key.requestFeedback,
    Key.gitHubUri,
    Key.debugAdapter,
    Key.debugHostAdapter,
    Key.experimentalFeatures,
    Key.traceFilters
];
var FeatureSet;
(function (FeatureSet) {
    FeatureSet["defaultFeatures"] = "default";
    FeatureSet["stable"] = "stable";
    FeatureSet["experimental"] = "experimental";
})(FeatureSet || (FeatureSet = {}));
exports.featureFlags = {
    lsp: true,
    multiGuestLsp: true,
    api: false,
    sharedTerminals: true,
    localUndo: true,
    localRedo: false,
    workspaceTask: true,
    summonParticipants: true,
    guestApproval: true,
    newFileProvider: true,
    shareDebugTerminal: false,
    verticalScrolling: true,
    findFiles: true,
    multiRootWorkspaceVSCode: false,
    multiRootWorkspaceVSIDE: false,
};
const experimentalFeatures = {
    lsp: true,
    multiGuestLsp: true,
    api: true,
    sharedTerminals: true,
    localUndo: true,
    localRedo: true,
    workspaceTask: true,
    summonParticipants: true,
    guestApproval: true,
    newFileProvider: true,
    shareDebugTerminal: true,
    verticalScrolling: true,
    findFiles: true,
    multiRootWorkspaceVSCode: false,
    multiRootWorkspaceVSIDE: false,
};
function isPrivateKey(key) {
    return privateSettings.indexOf(key) >= 0;
}
function initAsync(context) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ic.InternalConfig.initAsync(context, Key[Key.userSettingsPath]);
        let featureSet = FeatureSet[get(Key.features)];
        if (featureSet === FeatureSet.experimental ||
            (((featureSet === FeatureSet.defaultFeatures) || (typeof featureSet === 'undefined')) && get(Key.isInternal))) {
            Object.assign(exports.featureFlags, experimentalFeatures);
        }
        Object.assign(exports.featureFlags, get(Key.experimentalFeatures));
    });
}
exports.initAsync = initAsync;
function save(key, value, global = true, delaySaveToDisk = false) {
    if (isPrivateKey(key)) {
        return ic.InternalConfig.save(Key[key], value, delaySaveToDisk);
    }
    let extensionConfig = vscode.workspace.getConfiguration(get(Key.configName));
    if (global && value === undefined &&
        extensionConfig.inspect(Key[key]).globalValue === undefined) {
        // Trying to remove a global value that doesn't exist throws an exception.
        return;
    }
    return extensionConfig.update(Key[key], value, global);
}
exports.save = save;
function get(key) {
    if (isPrivateKey(key)) {
        return ic.InternalConfig.get(Key[key]);
    }
    let extensionConfig = vscode.workspace.getConfiguration(get(Key.configName));
    let value = extensionConfig.get(Key[key]);
    return value;
}
exports.get = get;
function getUserSettings() {
    const userSettings = ic.InternalConfig.getUserSettings();
    userSettings.experimentalFeatures = exports.featureFlags;
    return userSettings;
}
exports.getUserSettings = getUserSettings;
function getUri(key) {
    if (isPrivateKey(key)) {
        return ic.InternalConfig.getUri(Key[key]);
    }
    let value = get(key);
    if (!value) {
        return null;
    }
    try {
        return url.parse(value);
    }
    catch (e) {
        return null;
    }
}
exports.getUri = getUri;

//# sourceMappingURL=config.js.map
