"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentView = void 0;
const vscode = __importStar(require("vscode"));
const shellUtils_1 = require("../utils/shellUtils");
class EnvironmentView {
    constructor(context) {
        this.context = context;
        this.currentShell = '';
        this.environmentVariables = [];
        this.shellUtils = new shellUtils_1.ShellUtils();
        this.view = vscode.window.createWebviewPanel('envManager', 'Environment Variables', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        this.view.webview.onDidReceiveMessage(this.handleMessage.bind(this));
    }
    async show() {
        const shells = await this.shellUtils.getAvailableShells();
        if (shells.length > 0) {
            this.currentShell = shells[0];
            await this.loadEnvironmentVariables();
        }
        this.view.webview.html = this.getWebviewContent();
    }
    async loadEnvironmentVariables() {
        try {
            const vars = await this.shellUtils.getEnvironmentVariables(this.currentShell);
            this.environmentVariables = Object.entries(vars).map(([key, value]) => ({
                key,
                value,
                isSystem: key.startsWith('SYSTEM_'),
                isModified: false
            }));
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to load environment variables: ${error}`);
        }
    }
    handleMessage(message) {
        switch (message.command) {
            case 'updateVariable':
                this.updateVariable(message.key, message.value);
                break;
            case 'refresh':
                this.loadEnvironmentVariables().then(() => {
                    this.updateWebview();
                });
                break;
        }
    }
    async updateVariable(key, value) {
        try {
            await this.shellUtils.updateEnvironmentVariable(this.currentShell, key, value);
            this.environmentVariables = this.environmentVariables.map(v => v.key === key ? { ...v, value, isModified: true } : v);
            this.updateWebview();
            vscode.window.showInformationMessage(`Environment variable ${key} updated successfully`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to update environment variable: ${error}`);
        }
    }
    updateWebview() {
        this.view.webview.postMessage({
            command: 'update',
            variables: this.environmentVariables
        });
    }
    getWebviewContent() {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Environment Variables</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        padding: 8px;
                        text-align: left;
                        border-bottom: 1px solid #ddd;
                    }
                    th {
                        background-color: #f5f5f5;
                    }
                    .modified {
                        color: #4CAF50;
                        font-weight: bold;
                    }
                    .system {
                        color: #888;
                    }
                    input[type="text"] {
                        width: 100%;
                        padding: 5px;
                    }
                    button {
                        padding: 5px 10px;
                        margin: 5px;
                        cursor: pointer;
                    }
                </style>
            </head>
            <body>
                <h1>Environment Variables Manager</h1>
                <div id="shell-selector">
                    <label for="shell">Shell:</label>
                    <select id="shell" disabled>
                        <option value="${this.currentShell}">${this.currentShell}</option>
                    </select>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Variable</th>
                            <th>Value</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="env-vars">
                        ${this.environmentVariables.map(v => `
                            <tr>
                                <td class="${v.isSystem ? 'system' : ''}">${v.key}</td>
                                <td>
                                    <input type="text" 
                                           value="${v.value}" 
                                           id="value-${v.key}" 
                                           ${v.isSystem ? 'disabled' : ''}>
                                </td>
                                <td>
                                    ${v.isSystem ? '' : `
                                        <button onclick="updateVariable('${v.key}')">
                                            ${v.isModified ? 'Update' : 'Save'}
                                        </button>
                                    `}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <script>
                    const vscode = acquireVsCodeApi();
                    
                    function updateVariable(key) {
                        const value = document.getElementById('value-' + key).value;
                        vscode.postMessage({
                            command: 'updateVariable',
                            key: key,
                            value: value
                        });
                    }
                    
                    window.addEventListener('message', event => {
                        const message = event.data;
                        if (message.command === 'update') {
                            const tbody = document.getElementById('env-vars');
                            tbody.innerHTML = message.variables.map(v => \`
                                <tr>
                                    <td class="\${v.isSystem ? 'system' : ''}">\${v.key}</td>
                                    <td>
                                        <input type="text" 
                                               value="\${v.value}" 
                                               id="value-\${v.key}" 
                                               \${v.isSystem ? 'disabled' : ''}>
                                    </td>
                                    <td>
                                        \${v.isSystem ? '' : \`
                                            <button onclick="updateVariable('\${v.key}')">
                                                \${v.isModified ? 'Update' : 'Save'}
                                            </button>
                                        \`}
                                    </td>
                                </tr>
                            \`).join('');
                        }
                    });
                </script>
            </body>
            </html>
        `;
    }
}
exports.EnvironmentView = EnvironmentView;
//# sourceMappingURL=environmentView.js.map