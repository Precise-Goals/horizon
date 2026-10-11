/**
 * Horizon Unified Development Orchestrator
 * Spawns all Horizon monorepo services concurrently using native Bun runtime:
 * 1. Horizon Web UI (Vite / React 19) -> http://localhost:5173
 * 2. Horizon MCP Server (FastAPI / SSE) -> http://127.0.0.1:10000
 * 3. Horizon Docker Agent Bridge -> http://127.0.0.1:5176
 *
 * Run with a single command:
 *   bun run dev:all   or   bun start
 */
import { spawn } from 'bun';
import { existsSync } from 'fs';
import path from 'path';

// ANSI escape sequences for colorized output
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';

interface ServiceSpec {
  name: string;
  tag: string;
  color: string;
  cmd: string[];
  cwd?: string;
  url: string;
  desc: string;
}

const rootDir = process.cwd();
const isWindows = process.platform === 'win32';

// Detect Python executable inside mcpserver/.venv or fallback to system python
const venvPythonWin = path.join(rootDir, 'mcpserver', '.venv', 'Scripts', 'python.exe');
const venvPythonPosix = path.join(rootDir, 'mcpserver', '.venv', 'bin', 'python');

let pythonBin = 'python';
if (isWindows && existsSync(venvPythonWin)) {
  pythonBin = venvPythonWin;
} else if (!isWindows && existsSync(venvPythonPosix)) {
  pythonBin = venvPythonPosix;
}

const services: ServiceSpec[] = [
  {
    name: 'Horizon Web UI',
    tag: '[WEB:5173]',
    color: CYAN,
    cmd: [process.execPath, '--filter', 'horizon-web', 'dev'],
    cwd: rootDir,
    url: 'http://localhost:5173',
    desc: 'React 19, Vite, Tailwind, SRE Observability & Architect UI',
  },
  {
    name: 'FastAPI MCP Server',
    tag: '[MCP:10000]',
    color: MAGENTA,
    cmd: [pythonBin, '-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '10000'],
    cwd: path.join(rootDir, 'mcpserver'),
    url: 'http://127.0.0.1:10000',
    desc: 'JSON-RPC 2.0 / SSE Model Context Protocol & Recovery Engine',
  },
  {
    name: 'Docker Infra Agent',
    tag: '[AGENT:5176]',
    color: GREEN,
    cmd: [process.execPath, 'run', 'scripts/docker-agent.ts'],
    cwd: rootDir,
    url: 'http://127.0.0.1:5176',
    desc: 'Synthetic Docker cluster bridge & container health probes',
  },
];

console.log(`${BOLD}${BLUE}======================================================================${RESET}`);
console.log(`${BOLD}${BLUE}   HORIZON — Autonomous Enterprise Infrastructure Recovery Platform   ${RESET}`);
console.log(`${BOLD}${BLUE}   Unified Fast Bun Runner (All Services Concurrently)                ${RESET}`);
console.log(`${BOLD}${BLUE}======================================================================${RESET}\n`);

services.forEach((s) => {
  console.log(`  ${s.color}${BOLD}${s.tag.padEnd(14)}${RESET} ${BOLD}${s.name}${RESET}`);
  console.log(`  ${' '.repeat(14)}➜ URL:  ${s.color}${s.url}${RESET}`);
  console.log(`  ${' '.repeat(14)}➜ Desc: ${s.desc}\n`);
});

console.log(`${YELLOW}${BOLD}Starting services with Bun... Press Ctrl+C to terminate all.${RESET}\n`);

const spawnedProcesses: ReturnType<typeof spawn>[] = [];

async function pipeStream(readable: ReadableStream<Uint8Array> | null, tag: string, color: string) {
  if (!readable) return;
  const reader = readable.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim().length > 0) {
          console.log(`${color}${BOLD}${tag}${RESET} ${line}`);
        }
      }
    }
    if (buffer.trim().length > 0) {
      console.log(`${color}${BOLD}${tag}${RESET} ${buffer}`);
    }
  } catch {
    // Stream closed
  }
}

for (const s of services) {
  try {
    const proc = spawn({
      cmd: s.cmd,
      cwd: s.cwd || rootDir,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        ...process.env,
        DOCKER_AGENT_PORT: '5176',
      },
    });

    spawnedProcesses.push(proc);
    pipeStream(proc.stdout, s.tag, s.color);
    pipeStream(proc.stderr, s.tag, RED);
  } catch (err) {
    console.error(`${RED}${BOLD}[ERROR] Failed to spawn ${s.name}:${RESET}`, err);
  }
}

// Graceful termination handler
function cleanup() {
  console.log(`\n${YELLOW}${BOLD}[HORIZON] Shutting down all services gracefully...${RESET}`);
  for (const proc of spawnedProcesses) {
    try {
      proc.kill(15); // SIGTERM
    } catch {
      // Ignore
    }
  }
  setTimeout(() => {
    for (const proc of spawnedProcesses) {
      try {
        proc.kill(9); // SIGKILL
      } catch {
        // Ignore
      }
    }
    process.exit(0);
  }, 1200);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', () => {
  for (const proc of spawnedProcesses) {
    try {
      proc.kill(9);
    } catch {
      // Ignore
    }
  }
});
