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
//
// Implementation of Live Share for VS Code extension public API.
// See LiveShare.ts for public type definitons.
//
const path = require("path");
const semver = require("semver");
const vscode_1 = require("vscode");
const vsls = require("../workspace/contract/VSLS");
const LiveShare_1 = require("./LiveShare");
const telemetry_1 = require("../telemetry/telemetry");
const telemetryStrings_1 = require("../telemetry/telemetryStrings");
const session_1 = require("../session");
const SharedServiceApi_1 = require("./SharedServiceApi");
const checkArg_1 = require("./checkArg");
const config = require("../config");
const PackageInfo_1 = require("./PackageInfo");
const traceSource_1 = require("../tracing/traceSource");
/**
 * RPC variables are intentionally NOT private members of public API objects,
 * to prevent extensions from trivially using the private members to make
 * arbitrary RPC calls.
 */
const rpc = {
    client: null,
    workspaceService: null,
    workspaceUserService: null,
};
/**
 * Implementation of the root API that is used to acquire access to the
 * main Live Share API.
 *
 * An instance of this class is returned by the Live Share extension's
 * activation function.
 */
class LiveShareExtensionApi {
    constructor(rpcClient, workspaceService, workspaceUserService) {
        /**
         * Callers that request an API version outside this range will get `null`,
         * which should be treated the same as if Live Share is not installed.
         */
        this.supportedApiVersionRange = '>=0.2.0';
        rpc.client = rpcClient;
        rpc.workspaceService = workspaceService;
        rpc.workspaceUserService = workspaceUserService;
        if (!LiveShareExtensionApi.trace) {
            LiveShareExtensionApi.trace = traceSource_1.traceSource.withName(vsls.TraceSources.API);
        }
    }
    getApiAsync(requestedApiVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            checkArg_1.default(requestedApiVersion, 'requestedApiVersion', 'string');
            const callingPackage = PackageInfo_1.getCallingPackage('LiveShareExtensionApi.getApiAsync');
            if (!callingPackage) {
                LiveShareExtensionApi.trace.warning('Live Share API request failed ' +
                    'because calling package could not be detected.');
                return null;
            }
            if (!semver.satisfies(requestedApiVersion.split('-')[0], // Ignore any prelease tag
            this.supportedApiVersionRange)) {
                LiveShareExtensionApi.trace.warning(`Package ${callingPackage.name}@${callingPackage.version} requested` +
                    ` Live Share API version {requestedApiVersion} that is not supported.`);
                return null;
            }
            return new LiveShareApi(callingPackage, requestedApiVersion, LiveShareExtensionApi.trace);
        });
    }
}
exports.LiveShareExtensionApi = LiveShareExtensionApi;
/**
 * Main API that enables other VS Code extensions to access Live Share capabilities.
 *
 * An instance of this class is created by the extension API above.
 */
class LiveShareApi {
    constructor(callingPackage, apiVersion, trace) {
        this.callingPackage = callingPackage;
        this.apiVersion = apiVersion;
        this.trace = trace;
        this.sessionChangeEvent = new vscode_1.EventEmitter();
        this.currentPeers = [];
        this.peersChangeEvent = new vscode_1.EventEmitter();
        /** When in Host role, tracks the services that are shared via this API. */
        this.sharedServices = {};
        /** When in Guest role, tracks the named services that are provided by the host. */
        this.availableServices = {};
        /** When in Guest role, tracks the service proxies that are obtained via this API. */
        this.serviceProxies = {};
        checkArg_1.default(callingPackage, 'callingPackage', 'object');
        checkArg_1.default(apiVersion, 'apiVersion', 'string');
        // Ensure the callingPackage property cannot be modified.
        // Note the PackageInfo object is also immutable.
        Object.defineProperty(this, 'callingPackage', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: this.callingPackage,
        });
        trace.info(`Initializing Live Share API ${apiVersion} for ` +
            `${callingPackage.name}@${callingPackage.version}`);
        this.sendActivatedTelemetryEvent();
        // Initialize session state.
        this.session = {
            peerNumber: 0,
            user: null,
            role: LiveShare_1.Role.None,
            access: LiveShare_1.Access.None,
            id: null,
        };
        // Register internal event handlers.
        session_1.SessionContext.addListener(session_1.SessionEvents.StateChanged, (state) => this.onSessionStateChanged(state));
        rpc.workspaceService.onServicesChanged((e) => this.onServicesChanged(e));
        rpc.workspaceUserService.onWorkspaceSessionChanged((e) => this.onUserSessionChanged(e));
    }
    get onDidChangeSession() {
        return this.sessionChangeEvent.event;
    }
    get peers() {
        return this.currentPeers.slice(0);
    }
    get onDidChangePeers() {
        return this.peersChangeEvent.event;
    }
    share(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.session.role === LiveShare_1.Role.Guest) {
                throw new Error('Cannot share while joined to another session.');
            }
            else if (this.session.role === LiveShare_1.Role.Host) {
                if (options && options.access) {
                    throw new Error('Cannot change default access ' +
                        'for an already shared session.');
                }
            }
            const command = 'liveshare.start';
            this.sendInvokeCommandTelemetryEvent(command, options);
            return yield vscode_1.commands.executeCommand(command, options);
        });
    }
    join(link, options) {
        return __awaiter(this, void 0, void 0, function* () {
            checkArg_1.default(link, 'link', 'uri');
            if (this.session.role !== LiveShare_1.Role.None) {
                throw new Error('A session is already active.');
            }
            const command = 'liveshare.join';
            this.sendInvokeCommandTelemetryEvent(command, options);
            yield vscode_1.commands.executeCommand(command, link, options);
        });
    }
    end() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.session.role === LiveShare_1.Role.Guest) {
                const command = 'liveshare.leave';
                this.sendInvokeCommandTelemetryEvent(command);
                yield vscode_1.commands.executeCommand(command);
            }
            else if (this.session.role === LiveShare_1.Role.Host) {
                const command = 'liveshare.end';
                this.sendInvokeCommandTelemetryEvent(command);
                yield vscode_1.commands.executeCommand(command);
            }
        });
    }
    shareService(name) {
        return __awaiter(this, void 0, void 0, function* () {
            checkArg_1.default(name, 'name', 'string');
            // TODO: Check with cloud service for per-extension permissions.
            const isPermitted = !!(config.featureFlags && config.featureFlags.api);
            this.sendShareServiceTelemetryEvent(name, isPermitted);
            if (!isPermitted) {
                this.trace.warning(`shareService(${name}) not permitted.`);
                return null;
            }
            name = this.callingPackage.name + '.' + name;
            this.trace.verbose(`shareService(${name})`);
            let sharedService = this.sharedServices[name];
            if (!sharedService) {
                sharedService = new SharedServiceApi_1.SharedServiceApi(name, rpc.client, this.trace);
                this.sharedServices[name] = sharedService;
                if (this.session.role === LiveShare_1.Role.Host) {
                    try {
                        yield rpc.workspaceService.registerServicesAsync([name], vsls.WorkspaceServicesChangeType.Add);
                    }
                    catch (e) {
                        this.trace.error(e);
                        throw e;
                    }
                    sharedService._isServiceAvailable = true;
                    sharedService._fireIsAvailableChange();
                }
            }
            return sharedService;
        });
    }
    unshareService(name) {
        return __awaiter(this, void 0, void 0, function* () {
            checkArg_1.default(name, 'name', 'string');
            name = this.callingPackage.name + '.' + name;
            this.trace.verbose(`unshareService(${name})`);
            let sharedService = this.sharedServices[name];
            if (sharedService && sharedService.isServiceAvailable) {
                try {
                    yield rpc.workspaceService.registerServicesAsync([name], vsls.WorkspaceServicesChangeType.Remove);
                }
                catch (e) {
                    this.trace.error(e);
                    throw e;
                }
                sharedService._isServiceAvailable = false;
                sharedService._fireIsAvailableChange();
            }
            delete this.sharedServices[name];
        });
    }
    getSharedService(name) {
        return __awaiter(this, void 0, void 0, function* () {
            checkArg_1.default(name, 'name', 'string');
            if (name.indexOf('.') < 0) {
                name = this.callingPackage.name + '.' + name;
            }
            this.trace.verbose(`getSharedService(${name})`);
            let serviceProxy = this.serviceProxies[name];
            if (!serviceProxy) {
                serviceProxy = new SharedServiceApi_1.SharedServiceApi(name, rpc.client, this.trace);
                this.serviceProxies[name] = serviceProxy;
                if (this.session.role === LiveShare_1.Role.Guest && this.availableServices[name]) {
                    serviceProxy._isServiceAvailable = true;
                }
            }
            return serviceProxy;
        });
    }
    convertLocalUriToShared(localUri) {
        checkArg_1.default(localUri, 'localUri', 'uri');
        if (this.session.role !== LiveShare_1.Role.Host) {
            throw new Error('Only the host role can convert shared URIs.');
        }
        // TODO: Support VSLS multi-root workspaces
        const scheme = config.get(config.Key.scheme);
        let workspaceFolder = vscode_1.workspace.getWorkspaceFolder(localUri);
        if (!workspaceFolder) {
            throw new Error(`Not a workspace file URI: ${localUri}`);
        }
        let relativePath = vscode_1.workspace.asRelativePath(localUri).replace('\\', '/');
        return vscode_1.Uri.parse(`${scheme}:/${relativePath}`);
    }
    convertSharedUriToLocal(sharedUri) {
        checkArg_1.default(sharedUri, 'sharedUri', 'uri');
        if (this.session.role !== LiveShare_1.Role.Host) {
            throw new Error('Only the host role can convert shared URIs.');
        }
        const scheme = config.get(config.Key.scheme);
        if (sharedUri.scheme !== scheme) {
            throw new Error(`Not a ${config.get(config.Key.shortName)} shared URI: ${sharedUri}`);
        }
        // TODO: Support VSLS multi-root workspaces
        let rootPath = vscode_1.workspace.rootPath;
        let relativePath = sharedUri.path.replace(/[\\\/]/g, path.sep);
        return vscode_1.Uri.file(path.join(rootPath, relativePath));
    }
    /**
     * Callback from session context whenever state changes.
     * We only care about transitions to/from fully shared or joined states.
     */
    onSessionStateChanged(state) {
        return __awaiter(this, void 0, void 0, function* () {
            const newRole = (state === session_1.SessionState.Shared ? LiveShare_1.Role.Host :
                state === session_1.SessionState.Joined ? LiveShare_1.Role.Guest : LiveShare_1.Role.None);
            if (!this.session.user && (newRole !== LiveShare_1.Role.None || state === session_1.SessionState.SignedIn)) {
                this.onSignedIn();
            }
            else if (this.session.user && state === session_1.SessionState.SignedOut) {
                this.onSignedOut();
            }
            if (newRole === this.session.role) {
                return;
            }
            const sessionChange = this.session;
            sessionChange.role = newRole;
            let peersChangeEvent = null;
            const changedServices = [];
            if (newRole === LiveShare_1.Role.Host) {
                peersChangeEvent = yield this.onShared(changedServices);
            }
            else if (newRole === LiveShare_1.Role.Guest) {
                peersChangeEvent = yield this.onJoined(changedServices);
            }
            else {
                peersChangeEvent = yield this.onEnded(changedServices);
            }
            // Raise all events at the end, after all state was updated.
            this.trace.verbose(`^onDidChangeSession(${LiveShare_1.Role[newRole]})`);
            this.sessionChangeEvent.fire({ session: this.session });
            if (peersChangeEvent) {
                this.trace.verbose(`^onDidChangePeers(${JSON.stringify(peersChangeEvent)})`);
                this.peersChangeEvent.fire(peersChangeEvent);
            }
            for (const s of changedServices) {
                s._fireIsAvailableChange();
            }
        });
    }
    /**
     * The user signed in. Update the current user info.
     */
    onSignedIn() {
        // There is currently no public event raised for signing in.
        this.session.user = session_1.SessionContext.userInfo && {
            displayName: session_1.SessionContext.userInfo.displayName,
            emailAddress: session_1.SessionContext.userInfo.emailAddress,
        };
    }
    /**
     * The user signed out. Update the current user info.
     */
    onSignedOut() {
        // There is currently no public event raised for signing out. 
        this.session.user = null;
    }
    /**
     * A hosted sharing session started. Register any shared services
     * and update current session info.
     */
    onShared(changedServices) {
        return __awaiter(this, void 0, void 0, function* () {
            let sharedServiceNames = Object.keys(this.sharedServices);
            if (sharedServiceNames.length > 0) {
                try {
                    yield rpc.workspaceService.registerServicesAsync(sharedServiceNames, vsls.WorkspaceServicesChangeType.Add);
                }
                catch (e) {
                    this.trace.error(e);
                    // Don't throw. This is an async event-handler,
                    // so the caller would not await or catch the error.
                }
                for (let s of sharedServiceNames) {
                    this.sharedServices[s]._isServiceAvailable = true;
                    changedServices.push(this.sharedServices[s]);
                }
            }
            // Update current session info.
            const sessionInfo = session_1.SessionContext.workspaceSessionInfo;
            const sessionChange = this.session;
            sessionChange.peerNumber = sessionInfo.sessionNumber;
            sessionChange.access = LiveShare_1.Access.Owner;
            sessionChange.id = sessionInfo.id || null;
            return null;
        });
    }
    /**
     * Joined a sharing session as a guest. Make service proxies available,
     * update current session info, and initialize peers.
     */
    onJoined(changedServices) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let s of Object.keys(this.availableServices)) {
                const serviceProxy = this.serviceProxies[s];
                if (serviceProxy && this.availableServices[s]) {
                    serviceProxy._isServiceAvailable = true;
                    changedServices.push(serviceProxy);
                }
            }
            // Update current session info.
            const sessionInfo = session_1.SessionContext.workspaceSessionInfo;
            const sessionChange = this.session;
            sessionChange.peerNumber = sessionInfo.sessionNumber;
            sessionChange.access = LiveShare_1.Access.ReadWrite;
            sessionChange.id = sessionInfo.id || null;
            // Initalize peers array, includuing the host and any other already-joined guests.
            if (sessionInfo.sessions && Object.keys(sessionInfo.sessions).length > 0) {
                const addedPeers = [];
                for (let sessionNumber of Object.keys(sessionInfo.sessions)) {
                    const sessionNumberInt = parseInt(sessionNumber, 10);
                    if (sessionNumberInt !== sessionInfo.sessionNumber) {
                        const profile = sessionInfo.sessions[sessionNumber];
                        addedPeers.push({
                            peerNumber: sessionNumberInt,
                            user: { displayName: profile.name, emailAddress: profile.email },
                            role: (sessionNumberInt === 0 ? LiveShare_1.Role.Host : LiveShare_1.Role.Guest),
                            access: (profile.isOwner ? LiveShare_1.Access.Owner : LiveShare_1.Access.ReadWrite),
                        });
                    }
                }
                if (addedPeers.length > 0) {
                    this.currentPeers.push(...addedPeers);
                    return { added: addedPeers, removed: [] };
                }
            }
            return null;
        });
    }
    /**
     * The sharing session ended (or this user left). Notify shared services and service proxies,
     * and update current session and peers.
     */
    onEnded(changedServices) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let s of Object.keys(this.serviceProxies)) {
                const service = this.serviceProxies[s];
                if (service.isServiceAvailable) {
                    service._isServiceAvailable = false;
                    changedServices.push(service);
                }
            }
            for (let s of Object.keys(this.sharedServices)) {
                const service = this.sharedServices[s];
                if (service.isServiceAvailable) {
                    service._isServiceAvailable = false;
                    changedServices.push(service);
                }
            }
            // Clear current session info.
            const sessionChange = this.session;
            sessionChange.peerNumber = 0;
            sessionChange.access = LiveShare_1.Access.None;
            sessionChange.id = null;
            // Clear peers array.
            if (this.currentPeers.length > 0) {
                return {
                    added: [],
                    removed: this.currentPeers.splice(0, this.currentPeers.length),
                };
            }
            return null;
        });
    }
    /**
     * Callback from workspace service whenever available RPC services changed.
     * We only care about prefixed services (registered via public API).
     */
    onServicesChanged(e) {
        // Filter out internal service names - the ones with no package name prefix.
        const changedServiceNames = e.serviceNames
            .filter(s => s.indexOf('.') >= 0);
        if (e.changeType === vsls.WorkspaceServicesChangeType.Add) {
            for (let s of changedServiceNames) {
                // Save the availablilty of the service in case a proxy is requested.
                this.availableServices[s] = true;
                // If a proxy for the service exists, it's now available (if in Guest role).
                const serviceProxy = this.serviceProxies[s];
                if (serviceProxy && !serviceProxy.isServiceAvailable &&
                    this.session.role === LiveShare_1.Role.Guest) {
                    serviceProxy._isServiceAvailable = true;
                    serviceProxy._fireIsAvailableChange();
                }
            }
        }
        else if (e.changeType === vsls.WorkspaceServicesChangeType.Remove) {
            for (let s of changedServiceNames) {
                // Save the availablilty of the service in case a proxy is requested.
                this.availableServices[s] = false;
                // If a proxy for the service exists, it's now unavailable.
                const serviceProxy = this.serviceProxies[s];
                if (serviceProxy && serviceProxy.isServiceAvailable) {
                    serviceProxy._isServiceAvailable = false;
                    serviceProxy._fireIsAvailableChange();
                }
            }
        }
    }
    /**
     * Callback from workspace user service whenever participants change.
     */
    onUserSessionChanged(e) {
        if (e.sessionNumber === this.session.peerNumber) {
            // Skip notifications about myself; that's handled as part of
            // the session state change.
            return;
        }
        if (e.changeType === vsls.WorkspaceSessionChangeType.Joined) {
            const peer = {
                peerNumber: e.sessionNumber,
                user: { displayName: e.userProfile.name, emailAddress: e.userProfile.email },
                role: LiveShare_1.Role.Guest,
                access: LiveShare_1.Access.ReadWrite,
            };
            this.currentPeers.push(peer);
            this.trace.verbose(`^onDidChangePeers(added: ${JSON.stringify(peer)})`);
            this.peersChangeEvent.fire({ added: [peer], removed: [] });
        }
        else if (e.changeType === vsls.WorkspaceSessionChangeType.Unjoined) {
            const i = this.currentPeers.findIndex(p => p.peerNumber === e.sessionNumber);
            if (i >= 0) {
                const peer = this.currentPeers.splice(i, 1)[0];
                this.trace.verbose(`^onDidChangePeers(removed: ${JSON.stringify(peer)})`);
                this.peersChangeEvent.fire({ added: [], removed: [peer] });
            }
        }
    }
    sendActivatedTelemetryEvent() {
        telemetry_1.Instance.sendTelemetryEvent(telemetryStrings_1.TelemetryEventNames.ACTIVATE_EXTENSION_API, {
            [telemetryStrings_1.TelemetryPropertyNames.EXTENSION_NAME]: this.callingPackage.name,
            [telemetryStrings_1.TelemetryPropertyNames.EXTENSION_VERSION]: this.callingPackage.version,
            [telemetryStrings_1.TelemetryPropertyNames.EXTENSION_REQUESTED_API_VERSION]: this.apiVersion,
        });
    }
    sendInvokeCommandTelemetryEvent(commandName, options) {
        telemetry_1.Instance.sendTelemetryEvent(telemetryStrings_1.TelemetryEventNames.SHARE_EXTENSION_SERVICE, {
            [telemetryStrings_1.TelemetryPropertyNames.EXTENSION_NAME]: this.callingPackage.name,
            [telemetryStrings_1.TelemetryPropertyNames.EXTENSION_VERSION]: this.callingPackage.version,
            [telemetryStrings_1.TelemetryPropertyNames.EXTENSION_INVOKED_COMMAND]: commandName,
            [telemetryStrings_1.TelemetryPropertyNames.EXTENSION_INVOKED_COMMAND_OPTIONS]: (options ? JSON.stringify(options) : ''),
        });
    }
    sendShareServiceTelemetryEvent(serviceName, isPermitted) {
        telemetry_1.Instance.sendTelemetryEvent(telemetryStrings_1.TelemetryEventNames.SHARE_EXTENSION_SERVICE, {
            [telemetryStrings_1.TelemetryPropertyNames.EXTENSION_NAME]: this.callingPackage.name,
            [telemetryStrings_1.TelemetryPropertyNames.EXTENSION_VERSION]: this.callingPackage.version,
            [telemetryStrings_1.TelemetryPropertyNames.EXTENSION_SERVICE_NAME]: serviceName,
            [telemetryStrings_1.TelemetryPropertyNames.EXTENSION_SERVICE_PERMITTED]: isPermitted.toString(),
        });
    }
}

//# sourceMappingURL=LiveShareApi.js.map
