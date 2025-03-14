import * as vscode from 'vscode';
import { ShellUtils } from '../utils/shellUtils';
import { EnvironmentVariable, ShellEnvironment } from '../types/environment';

export class EnvironmentView {
    private readonly view: vscode.WebviewPanel;
    private readonly shellUtils: ShellUtils;
    private currentShell: string = '';
    private environmentVariables: EnvironmentVariable[] = [];

    constructor(private readonly context: vscode.ExtensionContext) {
        this.shellUtils = new ShellUtils();
        this.view = vscode.window.createWebviewPanel(
            'envManager',
            'Environment Variables',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.view.webview.onDidReceiveMessage(
            this.handleMessage.bind(this)
        );
    }

    public async show(): Promise<void> {
        const shells = await this.shellUtils.getAvailableShells();
        if (shells.length > 0) {
            this.currentShell = shells[0];
            await this.loadEnvironmentVariables();
        }
        this.view.webview.html = this.getWebviewContent();
    }

    private async loadEnvironmentVariables(): Promise<void> {
        try {
            const vars = await this.shellUtils.getEnvironmentVariables(this.currentShell);
            this.environmentVariables = Object.entries(vars).map(([key, value]) => ({
                key,
                value,
                isSystem: key.startsWith('SYSTEM_'),
                isModified: false
            }));
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to load environment variables: ${error}`);
        }
    }

    private handleMessage(message: any): void {
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

    private async updateVariable(key: string, value: string): Promise<void> {
        try {
            await this.shellUtils.updateEnvironmentVariable(this.currentShell, key, value);
            this.environmentVariables = this.environmentVariables.map(v => 
                v.key === key ? { ...v, value, isModified: true } : v
            );
            this.updateWebview();
            vscode.window.showInformationMessage(`Environment variable ${key} updated successfully`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to update environment variable: ${error}`);
        }
    }

    private updateWebview(): void {
        this.view.webview.postMessage({
            command: 'update',
            variables: this.environmentVariables
        });
    }

    private getWebviewContent(): string {
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
