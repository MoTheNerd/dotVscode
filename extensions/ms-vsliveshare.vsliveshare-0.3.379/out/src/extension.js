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
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const fs = require("fs-extra");
const url = require("url");
const semver = require("semver");
const path = require("path");
require("source-map-support/register");
const traceSource_1 = require("./tracing/traceSource");
const commands_1 = require("./commands");
const statusbar_1 = require("./statusbar");
const service_1 = require("./workspace/service");
const vsls = require("./workspace/contract/VSLS");
const workspaceProvider_1 = require("./workspace/workspaceProvider");
const remoteWorkspaceManager_1 = require("./workspace/remoteWorkspaceManager");
const util_1 = require("./util");
const createHash_js_1 = require("./utils/createHash.js");
const hostAdapterService_1 = require("./debugger/hostAdapterService");
const debugManager_1 = require("./debugger/debugManager");
const shareDebugManager_1 = require("./debugger/shareDebugManager");
const config = require("./config");
const config_1 = require("./config");
const launcher_1 = require("./launcher");
const session_1 = require("./session");
const telemetry_1 = require("./telemetry/telemetry");
const telemetryStrings_1 = require("./telemetry/telemetryStrings");
const agent_1 = require("./agent");
const downloader_1 = require("./downloader");
const LiveShareApi_1 = require("./api/LiveShareApi");
const RemoteTaskProvider = require("./tasks/remoteTaskProvider");
const workspaceProvider2_1 = require("./workspace/workspaceProvider2");
const rpcUtils_1 = require("./utils/rpcUtils");
const rpcTelemetry_1 = require("./telemetry/rpcTelemetry");
const AGENT_INIT_TIMEOUT = 20000;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let activationEvent = telemetry_1.Instance.startTimedEvent(telemetryStrings_1.TelemetryEventNames.ACTIVATE_EXTENSION);
        telemetry_1.Instance.setCorrelationEvent(activationEvent);
        telemetry_1.Instance.addContextProperty(telemetryStrings_1.TelemetryPropertyNames.ENVIRONMENT_VECTOR, process.env.VSLS_ENVIRONMENT_VECTOR);
        telemetry_1.Instance.addContextProperty(telemetryStrings_1.TelemetryPropertyNames.IS_DEBUGGING, util_1.checkDebugging().toString());
        context.subscriptions.push(telemetry_1.Instance.reporter);
        let result = null;
        try {
            result = yield activateInternal(context, activationEvent);
            if (!result) {
                // at this point we should have already called activationEvent.end()
                // in activateInternal().
                return;
            }
        }
        catch (e) {
            const fault = e && e.message || '';
            const telemetryMessage = 'Extension activation failed. ' + fault;
            activationEvent.end(telemetry_1.TelemetryResult.Failure, telemetryMessage);
            telemetry_1.Instance.sendActivateExtensionFault(telemetry_1.FaultType.Error, telemetryMessage, e, activationEvent);
            if (fault.indexOf('Proposed API is only available') > -1) {
                throw new Error(`Visual Studio Live Share relies on access "Proposed APIs" that are currently not
                enabled in this version of Visual Studio Code. See https://aka.ms/vsls-proposed-api for
                more details.`);
            }
            throw e;
        }
        activationEvent.end(telemetry_1.TelemetryResult.Success, 'Extension activation success.', false);
        tryJoinSession(activationEvent);
        return result;
    });
}
exports.activate = activate;
function activateInternal(context, activationEvent) {
    return __awaiter(this, void 0, void 0, function* () {
        yield util_1.ExtensionUtil.InitLogging();
        yield config.initAsync(context);
        if (config.get(config.Key.isInternal)) {
            traceSource_1.traceSource.info('Feature flags: ' + JSON.stringify(config.featureFlags));
        }
        // Update filters now that user settings have been loaded
        util_1.ExtensionUtil.setLoggingFilters();
        const serviceUri = url.format(config.getUri(config.Key.serviceUri));
        telemetry_1.Instance.setServiceEndpoint(serviceUri);
        // Correlate this activation to the join that triggered it (if it was triggered by a join)
        let joinCorrelationId = config.get(config.Key.joinEventCorrelationId);
        if (joinCorrelationId) {
            activationEvent.correlateWithId(joinCorrelationId);
        }
        telemetry_1.Instance.setSettingsContextProperties();
        activationEvent.addProperty(telemetryStrings_1.TelemetryPropertyNames.JOIN_DEBUG_SESSION_OPTION, config.get(config.Key.joinDebugSessionOption));
        activationEvent.addProperty(telemetryStrings_1.TelemetryPropertyNames.NAME_TAG_VISIBILITY, config.get(config.Key.nameTagVisibility));
        activationEvent.markTime(telemetryStrings_1.TelemetryPropertyNames.EXTENSION_ACTIVATION_INITIAL_INIT_COMPLETE);
        try {
            yield util_1.ExtensionUtil.checkCompatibility();
        }
        catch (e) {
            activationEvent.end(telemetry_1.TelemetryResult.UserFailure, 'Extension activation failed - version compatability. ' + e.message);
            // Do not activate the extension if OS version is incompatible
            vscode.window.showErrorMessage(e && e.message);
            return;
        }
        activationEvent.markTime(telemetryStrings_1.TelemetryPropertyNames.EXTENSION_ACTIVATION_COMPAT_CHECK_COMPLETE);
        yield util_1.ExtensionUtil.InitAsync(context);
        const liveShareExtension = vscode.extensions.getExtension('ms-vsliveshare.vsliveshare');
        const isInstalled = yield downloader_1.installFileExistsAsync();
        if (!(yield downloader_1.ExternalDownloader.ensureRuntimeDependenciesAsync(liveShareExtension))) {
            activationEvent.end(telemetry_1.TelemetryResult.UserFailure, 'Extension activation failed - download runtime dependencies.');
            vscode.window.showErrorMessage(`${config.get(config.Key.name)} was unable to download needed dependencies to finish installation. Ensure you have network connectivity and restart VS Code to retry.`);
            return;
        }
        yield checkForCorruptedInstall();
        yield util_1.ExtensionUtil.updateExecutablePermissionsAsync();
        yield launcher_1.Launcher.setup(false, !isInstalled);
        activationEvent.markTime(telemetryStrings_1.TelemetryPropertyNames.EXTENSION_ACTIVATION_LAUNCHER_SETUP_COMPLETE);
        const rpcClient = new service_1.RPCClient();
        setupRpcFilters(rpcClient);
        activationEvent.markTime(telemetryStrings_1.TelemetryPropertyNames.EXTENSION_ACTIVATION_AGENT_PROCESS_SETUP_COMPLETE);
        const authService = service_1.RpcProxy.create(vsls.AuthenticationService, rpcClient, vsls.TraceSources.ClientRpcAuth);
        const fileService = service_1.RpcProxy.create(vsls.FileService, rpcClient, vsls.TraceSources.ClientRpcFile);
        const workspaceService = service_1.RpcProxy.create(vsls.WorkspaceService, rpcClient, vsls.TraceSources.ClientRpcWorkspace);
        const sourceEventService = service_1.RpcProxy.create(vsls.SourceEventService, rpcClient, vsls.TraceSources.ClientRpcSourceEvent);
        const workspaceUserService = service_1.RpcProxy.create(vsls.WorkspaceUserService, rpcClient, vsls.TraceSources.ClientRpcWorkspaceUser);
        const telemetryService = service_1.RpcProxy.create(vsls.TelemetryService, rpcClient, vsls.TraceSources.ClientRpc);
        const firewallService = service_1.RpcProxy.create(vsls.FirewallService, rpcClient, vsls.TraceSources.ClientRpc);
        const serverSharingService = service_1.RpcProxy.create(vsls.ServerSharingService, rpcClient, vsls.TraceSources.ClientRpcServerSharing);
        const portForwardingService = service_1.RpcProxy.create(vsls.PortForwardingService, rpcClient, vsls.TraceSources.ClientRpcPortForwarding);
        const terminalService = service_1.RpcProxy.create(vsls.TerminalService, rpcClient, vsls.TraceSources.ClientRpcPortForwarding);
        const hostAdapterService = new hostAdapterService_1.HostAdapterService(rpcClient);
        const debugManager = new debugManager_1.DebugManager();
        const shareDebugManager = new shareDebugManager_1.ShareDebugManager(rpcClient, hostAdapterService, debugManager);
        context.subscriptions.push(rpcClient);
        const statusBarController = new statusbar_1.StatusBarController((commandId) => exports.extensionCommands.isCommandEnabled(commandId));
        context.subscriptions.push(statusBarController);
        context.subscriptions.push(RemoteTaskProvider.register());
        exports.extensionCommands = new commands_1.Commands(rpcClient, authService, telemetryService, workspaceService, fileService, statusBarController, hostAdapterService, serverSharingService, portForwardingService, sourceEventService, workspaceUserService, firewallService, debugManager, shareDebugManager, terminalService);
        backgroundAgentStartup(rpcClient, statusBarController);
        const deprecatedWorkspaceProvider = new workspaceProvider_1.DeprecatedWorkspaceProvider(workspaceService, fileService, exports.extensionCommands, undefined);
        if (semver.gte(semver.coerce(vscode.version), '1.23.0')) {
            const deprecatedApiAvailable = !!vscode.workspace.registerDeprecatedFileSystemProvider;
            if (config.featureFlags.newFileProvider || !deprecatedApiAvailable) {
                // version >= 1.23.0, using new API if feature flag enabled
                const workspaceProvider = new workspaceProvider2_1.WorkspaceProvider(workspaceService, fileService, exports.extensionCommands, undefined);
                context.subscriptions.push(vscode.workspace.registerFileSystemProvider(config.get(config.Key.authority), workspaceProvider, { isCaseSensitive: true }));
            }
            else {
                // version >= 1.23.0, using deprecated API
                context.subscriptions.push(vscode.workspace.registerDeprecatedFileSystemProvider(config.get(config.Key.authority), deprecatedWorkspaceProvider));
            }
        }
        else {
            // version < 1.23.0, using proposed API
            context.subscriptions.push(vscode.workspace.registerFileSystemProvider(config.get(config.Key.authority), deprecatedWorkspaceProvider, undefined));
        }
        const remoteWorkspaceManager = new remoteWorkspaceManager_1.RemoteWorkspaceManager(workspaceService, fileService);
        session_1.SessionContext.SupportSharedTerminals = config_1.featureFlags.sharedTerminals;
        session_1.SessionContext.SupportSummonParticipants = config_1.featureFlags.summonParticipants;
        session_1.SessionContext.EnableVerticalScrolling = config_1.featureFlags.verticalScrolling;
        return new LiveShareApi_1.LiveShareExtensionApi(rpcClient, workspaceService, workspaceUserService);
    });
}
exports.activateInternal = activateInternal;
function setupRpcFilters(rpcClient) {
    const timingFilter = new rpcUtils_1.TimingFilter();
    rpcClient.addReadFilter((msg) => {
        return timingFilter.filter(false, msg);
    });
    rpcClient.addWriteFilter((msg) => {
        return timingFilter.filter(true, msg);
    });
    const telemetryFilter = new rpcTelemetry_1.TelemetryRpcFilter(new rpcTelemetry_1.LanguageServiceRpcMethodNameProvider());
    rpcClient.addReadFilter((msg) => {
        return telemetryFilter.readFilter(msg);
    });
    rpcClient.addWriteFilter((msg) => {
        return telemetryFilter.writeFilter(msg);
    });
}
// this method is called when your extension is deactivated
function deactivate() {
    return __awaiter(this, void 0, void 0, function* () {
        let deactivateEvent = telemetry_1.Instance.startTimedEvent(telemetryStrings_1.TelemetryEventNames.DEACTIVATE_EXTENSION);
        try {
            traceSource_1.traceSource.info('Client deactivation requested.');
            session_1.SessionContext.dispose();
            if (session_1.SessionContext.coeditingClient) {
                session_1.SessionContext.coeditingClient.dispose(); // Also sends accumulated telemetry
            }
            yield agent_1.Agent.disposeAsync();
            // get `workspaceId` from settings
            const settings = vscode.workspace.getConfiguration();
            const workspaceFolder = settings.get(commands_1.Commands.joinWorkspaceIdFolderSettingName);
            // if inside vsls workspace, delete it
            if (workspaceFolder) {
                try {
                    yield fs.remove(workspaceFolder);
                }
                catch (e) {
                    traceSource_1.traceSource.info(`Failed to remove workspace folder. ${e.message}`);
                }
            }
            launcher_1.Launcher.safelyDeleteCascadeUrlFile();
            deactivateEvent.end(telemetry_1.TelemetryResult.Success, 'Extension deactivation success.');
        }
        catch (e) {
            const telemetryMessage = 'Extension deactivation failed. ' + e.message;
            deactivateEvent.end(telemetry_1.TelemetryResult.Failure, telemetryMessage);
            telemetry_1.Instance.sendDeactivateExtensionFault(telemetry_1.FaultType.Error, telemetryMessage, e, deactivateEvent);
            throw e;
        }
        finally {
            // Its possible that this will through but not much we can do
            return telemetry_1.Instance.reporter.dispose();
        }
    });
}
exports.deactivate = deactivate;
const backgroundAgentStartup = (rpcClient, statusBarController) => __awaiter(this, void 0, void 0, function* () {
    let activationAgentEvent = telemetry_1.Instance.startTimedEvent(telemetryStrings_1.TelemetryEventNames.ACTIVATE_AGENTASYNC, true);
    try {
        const configurationService = service_1.RpcProxy.create(vsls.ConfigurationService, rpcClient, vsls.TraceSources.ClientRpcAuth);
        const clientVersion = util_1.ExtensionUtil.getVersionInfo();
        const agentVersion = yield configurationService.exchangeVersionsAsync(null, clientVersion);
        yield configurationService.exchangeSettingsAsync(config.getUserSettings());
        util_1.ExtensionUtil.checkAgentVersion(agentVersion);
        activationAgentEvent.end(telemetry_1.TelemetryResult.Success, 'Agent activation success.');
    }
    catch (e) {
        const telemetryMessage = 'Agent activation failed. ' + e.message;
        activationAgentEvent.end(telemetry_1.TelemetryResult.Failure, telemetryMessage);
        telemetry_1.Instance.sendActivateAgentAsyncFault(telemetry_1.FaultType.Error, telemetryMessage, e, activationAgentEvent);
        statusBarController.dispose();
        vscode.window.showErrorMessage(e && e.message);
        traceSource_1.traceSource.info(`Deactivating extension from background agent startup.`);
        deactivate();
    }
});
const tryToJoinSessionWithInternalSettings = (workspaceId, activationEvent) => __awaiter(this, void 0, void 0, function* () {
    let timeout;
    try {
        activationEvent.addProperty(telemetryStrings_1.TelemetryPropertyNames.EXTENSION_ACTIVATION_POST_JOIN, 'True');
        const correlationId = config.get(config.Key.joinEventCorrelationId);
        if (correlationId) {
            activationEvent.addProperty(telemetryStrings_1.TelemetryPropertyNames.JOIN_FROM_BROWSER, 'False');
            activationEvent.correlateWithId(correlationId);
        }
        else {
            activationEvent.addProperty(telemetryStrings_1.TelemetryPropertyNames.JOIN_FROM_BROWSER, 'True');
        }
        launcher_1.Launcher.safelyDeleteCascadeUrlFile();
        const cancellationTokenSource = new vscode.CancellationTokenSource();
        const cancellationToken = cancellationTokenSource.token;
        const result = yield Promise.race([
            util_1.ExtensionUtil.runWithProgress(exports.extensionCommands.onExtensionLoadWithLiveShareWorkspace.bind(exports.extensionCommands, workspaceId, cancellationToken), {
                title: 'Joining...',
                cancellationToken
            }),
            // silent sign in, fail silently if can't sign in for a long time
            new Promise((resolve, reject) => {
                timeout = setTimeout(() => {
                    // check if agent started at this point,
                    // if it did - that's just a long join - no need to stop the flow
                    if (!agent_1.Agent.isStarted) {
                        cancellationTokenSource.cancel();
                        session_1.SessionContext.transition(session_1.SessionAction.SignOut);
                        reject(new Error('LiveShare extension failed to initialize.'));
                    }
                }, AGENT_INIT_TIMEOUT);
            })
        ]);
    }
    catch (e) {
        const reload = { title: 'Try again' };
        const result = yield util_1.ExtensionUtil.showErrorAsync(e, undefined, [reload]);
        const joinFormBrowserFaultTelemetryEvent = new telemetry_1.Fault(telemetryStrings_1.TelemetryEventNames.JOIN_FROM_BROWSER_FAULT, telemetry_1.FaultType.Error, '', e);
        if (result && (result.title === reload.title)) {
            joinFormBrowserFaultTelemetryEvent.addProperty(telemetryStrings_1.TelemetryPropertyNames.RELOAD_POST_TIMEOUT, true);
            joinFormBrowserFaultTelemetryEvent.send();
            vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
        else {
            joinFormBrowserFaultTelemetryEvent.addProperty(telemetryStrings_1.TelemetryPropertyNames.RELOAD_POST_TIMEOUT, false);
            joinFormBrowserFaultTelemetryEvent.send();
            vscode.commands.executeCommand('workbench.action.closeWindow');
        }
    }
    finally {
        clearTimeout(timeout);
    }
});
const tryToJoinWithCascadeFile = (joinUrl, activationEvent) => __awaiter(this, void 0, void 0, function* () {
    activationEvent.addProperty(telemetryStrings_1.TelemetryPropertyNames.EXTENSION_ACTIVATION_POST_JOIN, 'False');
    activationEvent.addProperty(telemetryStrings_1.TelemetryPropertyNames.JOIN_FROM_BROWSER, 'True');
    activationEvent.send();
    // Called when launched by the protocol handler
    traceSource_1.traceSource.info(`${config.get(config.Key.abbreviation)} started with URL: ${joinUrl}`);
    vscode.commands.executeCommand(`${config.get(config.Key.commandPrefix)}.join`, joinUrl);
});
const tryJoinSession = (activationEvent) => __awaiter(this, void 0, void 0, function* () {
    const settings = vscode.workspace.getConfiguration();
    const workspaceId = settings.get(commands_1.Commands.joinWorkspaceIdSettingName);
    // check if extension has written workspaceId to internal settings file,
    // if so check file modification time, if new, try to join to the session
    if (workspaceId) {
        traceSource_1.traceSource.info(`Found workspaceId: ${workspaceId}`);
        yield tryToJoinSessionWithInternalSettings(workspaceId, activationEvent);
    }
    else {
        traceSource_1.traceSource.info(`No workspaceId found in workspace settings.`);
        // check if protocol handler has written collaboration session url to a file,
        // if so try to join to collaboration session
        const joinUrl = yield launcher_1.Launcher.readCascadeURL();
        if (joinUrl) {
            traceSource_1.traceSource.info(`Found fresh workspace url cascade.json file: ${joinUrl}`);
            yield tryToJoinWithCascadeFile(joinUrl, activationEvent);
        }
        else {
            traceSource_1.traceSource.info(`No workspace url found in cascade.json file.`);
            vscode.commands.executeCommand(`${config.get(config.Key.commandPrefix)}.signin`, true);
        }
        activationEvent.send();
    }
});
const checkForCorruptedInstall = () => __awaiter(this, void 0, void 0, function* () {
    const extensionDir = path.resolve(__dirname, '../../');
    const manifestFile = path.join(extensionDir, 'manifest.json');
    if (!(yield fs.exists(manifestFile))) {
        // already checked for corrupted install
        traceSource_1.traceSource.info(`Manifest file not found or removed. Skipping install corruption check.`);
        return;
    }
    const manifest = JSON.parse(yield fs.readFile(manifestFile, { encoding: 'utf-8' }));
    const fileList = Object.keys(manifest);
    const hashTable = {};
    yield Promise.all(fileList.map((fileName) => __awaiter(this, void 0, void 0, function* () {
        if (!fileName.length) {
            return;
        }
        const hash = yield createHash_js_1.createHash(path.join(extensionDir, fileName));
        hashTable[fileName] = hash;
    })));
    const ignoreFiles = ['package.json', 'manifest.json'];
    const hashesMatch = Object.keys(hashTable).every(fileName => {
        if (ignoreFiles.indexOf(fileName) !== -1) {
            // skip ignored files
            return true;
        }
        const result = hashTable[fileName] === manifest[fileName];
        if (!result) {
            traceSource_1.traceSource.info(`checksum mismatch: ${fileName} (${hashTable[fileName]} does not match ${manifest[fileName]} in manifest)`);
        }
        return result;
    });
    if (!hashesMatch || !(yield fs.exists(agent_1.Agent.getAgentPath()))) {
        throw new Error(`An update or installation of VS Live Share failed due to a corrupted download. ' +
            'Please uninstall and reinstall the extension to resolve. ' +
            'See https://aka.ms/vsls-corrupted-install for more details.`);
    }
    // Remove manifest file - no longer needed (successful install)
    yield fs.unlink(manifestFile);
});

//# sourceMappingURL=extension.js.map
