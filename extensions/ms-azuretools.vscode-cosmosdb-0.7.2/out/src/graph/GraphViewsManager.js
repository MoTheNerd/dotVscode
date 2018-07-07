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
const fs = require("fs");
const GraphConfiguration_1 = require("./GraphConfiguration");
const GraphViewServer_1 = require("./GraphViewServer");
const scheme = "vscode-cosmosdb-graphresults";
const previewBaseUri = scheme + '://results/';
class GraphViewsManager {
    constructor(_context) {
        this._context = _context;
        this._lastServerId = 0;
        // One server (and one HTML view) per graph, as represented by unique configurations
        this._servers = new Map(); // map of id -> map
        let documentProvider = new GraphViewDocumentContentProvider(this);
        let registration = vscode.workspace.registerTextDocumentContentProvider(scheme, documentProvider);
        this._context.subscriptions.push(registration);
    }
    showGraphViewer(tabTitle, config) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var id = yield this.getOrCreateServer(config);
                // Add server ID to the URL so that GraphViewDocumentContentProvider knows which port to use in the HTML
                var serverUri = previewBaseUri + id.toString();
                yield vscode.commands.executeCommand('vscode.previewHtml', vscode.Uri.parse(serverUri), vscode.ViewColumn.One, tabTitle);
            }
            catch (error) {
                vscode.window.showErrorMessage(error.message || error);
            }
        });
    }
    findServerById(id) {
        return this._servers.get(id);
    }
    getOrCreateServer(config) {
        return __awaiter(this, void 0, void 0, function* () {
            var existingServer = null;
            var existingId;
            this._servers.forEach((server, key) => {
                if (GraphConfiguration_1.areConfigsEqual(server.configuration, config)) {
                    existingServer = server;
                    existingId = key;
                }
            });
            if (existingServer) {
                return existingId;
            }
            var server = new GraphViewServer_1.GraphViewServer(config);
            yield server.start();
            this._lastServerId += 1;
            var id = this._lastServerId;
            this._servers.set(id, server);
            return id;
        });
    }
}
exports.GraphViewsManager = GraphViewsManager;
class GraphViewDocumentContentProvider {
    constructor(_serverProvider) {
        this._serverProvider = _serverProvider;
    }
    provideTextDocumentContent(uri, _token) {
        // Figure out which client to attach this to
        var serverId = parseInt(uri.path.slice(1) /* remove '/' from beginning */, 10);
        console.assert(serverId > 0);
        var server = this._serverProvider.findServerById(serverId);
        if (server) {
            var outPath = path.join(path.dirname(module.filename), "../..");
            var clientHtmlPath = path.join(outPath, "../resources/graphClient/graphClient.html");
            console.assert(fs.existsSync(clientHtmlPath), `Couldn't find ${clientHtmlPath}`);
            var html = `
    <!DOCTYPE html>
    <html>
      <style>
        body {
          padding: 0;
          margin: 0;
        }
      </style>
      <body>
        <iframe src="file://${clientHtmlPath}?port=${server.port}" style="width: 100%; height: 100%; position: absolute; padding: 0; margin: 0; border: none"></iframe>
      </body>
    </html>
    `;
            return html;
        }
        return "This resource is no longer available.";
    }
}
//# sourceMappingURL=GraphViewsManager.js.map