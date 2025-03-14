# Environment Variables Manager (envs)

A lightweight VSCode extension that simplifies managing shell environment variables directly in your editor.

## Features

- **Quick Access**: Open shell configuration files with a single command
- **Direct Editing**: View and modify environment variables in real-time
- **Streamlined Workflow**: Save or discard changes without leaving VSCode
- **Shell Support**: Compatible with both Bash and Zsh

## Installation

1. Open VSCode Extensions view (Ctrl+Shift+X or Cmd+Shift+X)
2. Search for "Environment Variables Manager"
3. Click Install

## Usage

1. Open Command Palette (Ctrl+Shift+P or Cmd+Shift+P)
2. Type and select `envs`
3. Edit your environment variables in the editor
4. Save changes with standard VSCode commands (Ctrl+S or Cmd+S)

## Supported Files

- `.bashrc`
- `.zshrc`
- `.bash_profile`
- `.zprofile`

## Configuration

Customize the extension behavior in your VSCode settings:

```json
{
  "envs.defaultShell": "zsh",
  "envs.autoReload": true
}
```

## Troubleshooting

If your shell configuration file isn't detected automatically:

1. Open VSCode settings
2. Search for "envs"
3. Set the custom path to your configuration file

## License

MIT