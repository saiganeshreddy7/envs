import * as vscode from 'vscode';
import { ShellUtils } from './utils/shellUtils';

export function activate(context: vscode.ExtensionContext) {
    const shellUtils = new ShellUtils();

    // Register command to open shell config file
    context.subscriptions.push(
        vscode.commands.registerCommand('envManager.openConfig', async () => {
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
        })
    );

    // Register command to save changes
    context.subscriptions.push(
        vscode.commands.registerCommand('envManager.saveChanges', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor');
                return;
            }

            const document = editor.document;
            await document.save();
            vscode.window.showInformationMessage('Changes saved');
        })
    );

    // Register command to discard changes
    context.subscriptions.push(
        vscode.commands.registerCommand('envManager.discardChanges', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor');
                return;
            }

            await vscode.commands.executeCommand('workbench.action.files.revert');
            vscode.window.showInformationMessage('Changes discarded');
        })
    );

    // Register command to update environment variable
    context.subscriptions.push(
        vscode.commands.registerCommand('envManager.updateVariable', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor');
                return;
            }

            const key = await vscode.window.showInputBox({
                prompt: 'Enter environment variable name',
                placeHolder: 'VARIABLE_NAME'
            });

            if (!key) return;

            const value = await vscode.window.showInputBox({
                prompt: 'Enter environment variable value',
                placeHolder: 'value'
            });

            if (value !== undefined) {
                try {
                    await shellUtils.updateEnvironmentVariable('zsh', key, value);
                    vscode.window.showInformationMessage(`Updated ${key}=${value}`);
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to update variable: ${error}`);
                }
            }
        })
    );
}

export function deactivate() {}
