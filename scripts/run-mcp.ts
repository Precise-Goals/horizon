/**
 * Horizon MCP Server Runner
 * Auto-detects virtualenv and starts FastAPI MCP server using Bun.
 */
import { spawn } from 'bun';
import { existsSync } from 'fs';
import path from 'path';

const rootDir = process.cwd();
const isWindows = process.platform === 'win32';

const venvPythonWin = path.join(rootDir, 'mcpserver', '.venv', 'Scripts', 'python.exe');
const venvPythonPosix = path.join(rootDir, 'mcpserver', '.venv', 'bin', 'python');

let pythonBin = 'python';
if (isWindows && existsSync(venvPythonWin)) {
  pythonBin = venvPythonWin;
} else if (!isWindows && existsSync(venvPythonPosix)) {
  pythonBin = venvPythonPosix;
}

console.log(`[HORIZON MCP] Starting FastAPI MCP Server via ${pythonBin}...`);

const proc = spawn({
  cmd: [pythonBin, '-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '10000', '--reload'],
  cwd: path.join(rootDir, 'mcpserver'),
  stdout: 'inherit',
  stderr: 'inherit',
});

process.on('SIGINT', () => {
  proc.kill();
  process.exit(0);
});
