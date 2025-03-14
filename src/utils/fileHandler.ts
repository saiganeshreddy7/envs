import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export class FileHandler {
    private readonly shellConfigFiles: { [key: string]: string } = {
        zsh: path.join(process.env.HOME || '', '.zshrc'),
        bash: path.join(process.env.HOME || '', '.bashrc')
    };

    public async getShellConfigPath(shell: string): Promise<string | undefined> {
        const configPath = this.shellConfigFiles[shell];
        if (await this.fileExists(configPath)) {
            return configPath;
        }
        return undefined;
    }

    public async readFile(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    public async writeFile(filePath: string, content: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, content, 'utf8', (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    private async fileExists(filePath: string): Promise<boolean> {
        return new Promise((resolve) => {
            fs.access(filePath, fs.constants.F_OK, (err) => {
                resolve(!err);
            });
        });
    }
}
