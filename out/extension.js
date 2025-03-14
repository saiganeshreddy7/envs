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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const shellUtils_1 = require("./utils/shellUtils");
function activate(context) {
    const shellUtils = new shellUtils_1.ShellUtils();
    // Register command to open shell config file
    context.subscriptions.push(vscode.commands.registerCommand('envManager.openConfig', async () => {
        const shells = await shellUtils.getAvailableShells();
        if (shells.length === 0) {
            vscode.window.showErrorMessage('No supported shell configuration files found');
            return;
        }
        const selectedShell = await vscode.window.showQuickPick(shells, {
            placeHolder: 'Select shell to configure'
        });
        if (selectedShell) {
            const configPath = await shellUtils.getShellConfigPath(selectedShell);
            if (configPath) {
                const doc = await vscode.workspace.openTextDocument(configPath);
                await vscode.window.showTextDocument(doc);
            }
        }
    }));
    // Register command to save changes
    context.subscriptions.push(vscode.commands.registerCommand('envManager.saveChanges', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }
        const document = editor.document;
        await document.save();
        vscode.window.showInformationMessage('Changes saved');
    }));
    // Register command to discard changes
    context.subscriptions.push(vscode.commands.registerCommand('envManager.discardChanges', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }
        await vscode.commands.executeCommand('workbench.action.files.revert');
        vscode.window.showInformationMessage('Changes discarded');
    }));
    // Register command to update environment variable
    context.subscriptions.push(vscode.commands.registerCommand('envManager.updateVariable', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }
        const key = await vscode.window.showInputBox({
            prompt: 'Enter environment variable name',
            placeHolder: 'VARIABLE_NAME'
        });
        if (!key)
            return;
        const value = await vscode.window.showInputBox({
            prompt: 'Enter environment variable value',
            placeHolder: 'value'
        });
        if (value !== undefined) {
            try {
                await shellUtils.updateEnvironmentVariable('zsh', key, value);
                vscode.window.showInformationMessage(`Updated ${key}=${value}`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to update variable: ${error}`);
            }
        }
    }));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map