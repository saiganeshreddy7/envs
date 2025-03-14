import * as vscode from 'vscode';
import { FileHandler } from './fileHandler';

export class ShellUtils {
    private readonly fileHandler: FileHandler;

    constructor() {
        this.fileHandler = new FileHandler();
    }

    public async getShellConfigPath(shell: string): Promise<string | undefined> {
        return this.fileHandler.getShellConfigPath(shell);
    }

    public async getAvailableShells(): Promise<string[]> {
        const shells = ['zsh', 'bash'];
        const availableShells: string[] = [];

        for (const shell of shells) {
            const configPath = await this.fileHandler.getShellConfigPath(shell);
            if (configPath) {
                availableShells.push(shell);
            }
        }

        return availableShells;
    }

    public async getEnvironmentVariables(shell: string): Promise<{ [key: string]: string }> {
        const configPath = await this.fileHandler.getShellConfigPath(shell);
        if (!configPath) {
            throw new Error(`No configuration file found for ${shell}`);
        }

        const content = await this.fileHandler.readFile(configPath);
        const envVars: { [key: string]: string } = {};

        // Parse environment variables from shell config file
        const lines = content.split('\n');
        lines.forEach(line => {
            const match = line.match(/^\s*export\s+([A-Z_]+)=(.*)/);
            if (match) {
                const key = match[1];
                const value = match[2].replace(/['"]/g, '');
                envVars[key] = value;
            }
        });

        return envVars;
    }

    public async updateEnvironmentVariable(
        shell: string,
        key: string,
        value: string
    ): Promise<void> {
        const configPath = await this.fileHandler.getShellConfigPath(shell);
        if (!configPath) {
            throw new Error(`No configuration file found for ${shell}`);
        }

        const content = await this.fileHandler.readFile(configPath);
        const lines = content.split('\n');
        let updated = false;

        const newLines = lines.map(line => {
            const match = line.match(new RegExp(`^\\s*export\\s+${key}=.*`));
            if (match) {
                updated = true;
                return `export ${key}="${value}"`;
            }
            return line;
        });

        if (!updated) {
            newLines.push(`export ${key}="${value}"`);
        }

        await this.fileHandler.writeFile(configPath, newLines.join('\n'));
    }
}
