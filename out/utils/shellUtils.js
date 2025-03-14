"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShellUtils = void 0;
const fileHandler_1 = require("./fileHandler");
class ShellUtils {
    constructor() {
        this.fileHandler = new fileHandler_1.FileHandler();
    }
    async getShellConfigPath(shell) {
        return this.fileHandler.getShellConfigPath(shell);
    }
    async getAvailableShells() {
        const shells = ['zsh', 'bash'];
        const availableShells = [];
        for (const shell of shells) {
            const configPath = await this.fileHandler.getShellConfigPath(shell);
            if (configPath) {
                availableShells.push(shell);
            }
        }
        return availableShells;
    }
    async getEnvironmentVariables(shell) {
        const configPath = await this.fileHandler.getShellConfigPath(shell);
        if (!configPath) {
            throw new Error(`No configuration file found for ${shell}`);
        }
        const content = await this.fileHandler.readFile(configPath);
        const envVars = {};
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
    async updateEnvironmentVariable(shell, key, value) {
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
exports.ShellUtils = ShellUtils;
//# sourceMappingURL=shellUtils.js.map