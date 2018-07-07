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
const VSLS_1 = require("./contract/VSLS");
const vsls = require("./contract/VSLS");
const session_1 = require("../session");
const util_1 = require("./../util");
const collaborators_1 = require("./collaborators");
const lspClient = require("../languageService/lspClient");
const config_1 = require("../config");
class RemoteWorkspaceManager {
    constructor(workspaceService, fileService) {
        this.workspaceService = workspaceService;
        this.fileService = fileService;
        this.registeredServices = new Set();
        session_1.SessionContext.on(collaborators_1.CollaboratorManager.collaboratorsChangedEvent, () => __awaiter(this, void 0, void 0, function* () {
            if (!this.clientLspLanguageServicesActivated &&
                [session_1.SessionState.JoiningInProgress, session_1.SessionState.Joined].indexOf(session_1.SessionContext.State) >= 0) {
                if (config_1.featureFlags.multiGuestLsp ||
                    (session_1.SessionContext.collaboratorManager && session_1.SessionContext.collaboratorManager.getCollaboratorCount() === 1)) {
                    yield this.activateLSPClientAsync();
                    this.clientLspLanguageServicesActivated = true;
                }
            }
        }));
        workspaceService.onServicesChanged((e) => {
            if (e.changeType === vsls.WorkspaceServicesChangeType.Add) {
                e.serviceNames.forEach(s => {
                    this.registeredServices.add(s);
                });
            }
            else if (e.changeType === vsls.WorkspaceServicesChangeType.Remove) {
                e.serviceNames.forEach(s => {
                    this.registeredServices.delete(s);
                });
            }
        });
    }
    get client() {
        return this.workspaceService.client;
    }
    getOwnerRootPathAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.ownerRootPath) {
                const fileListOptions = {
                    includeDetails: false,
                    recurseMode: VSLS_1.FileRecurseMode.None,
                    excludePatterns: undefined
                };
                const fileRootInfos = yield this.fileService.listRootsAsync(fileListOptions);
                const fileRootInfo = fileRootInfos.shift();
                if (fileRootInfo) {
                    this.ownerRootPath = fileRootInfo.localPath;
                }
            }
            return this.ownerRootPath;
        });
    }
    isRemoteSession() {
        return session_1.SessionContext.State === session_1.SessionState.Joined;
    }
    activateLSPClientAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            yield lspClient.activateAsync(util_1.ExtensionUtil.Context, this.client, [...this.registeredServices]);
        });
    }
}
exports.RemoteWorkspaceManager = RemoteWorkspaceManager;

//# sourceMappingURL=remoteWorkspaceManager.js.map
