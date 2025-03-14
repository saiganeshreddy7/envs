export interface EnvironmentVariable {
    key: string;
    value: string;
    isSystem: boolean;
    isModified: boolean;
}

export interface ShellEnvironment {
    shell: string;
    variables: EnvironmentVariable[];
}

export interface EnvironmentUpdate {
    key: string;
    value: string;
    action: 'add' | 'update' | 'remove';
}
