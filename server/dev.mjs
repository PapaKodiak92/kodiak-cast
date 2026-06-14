import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const children = [];

function getCleanEnv() {
  const cleanEnv = {};

  for (const [key, value] of Object.entries(process.env)) {
    if (!key || key.startsWith('=') || key.includes('\0') || typeof value === 'undefined') {
      continue;
    }

    cleanEnv[key] = String(value).replace(/\0/g, '');
  }

  return cleanEnv;
}

function startProcess(label, command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: false,
    windowsHide: false,
    env: getCleanEnv(),
    ...options
  });

  children.push(child);

  child.on('error', (error) => {
    console.error(`[${label}] failed to start: ${error.message}`);
    shutdown(1);
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      return;
    }

    if (code && code !== 0) {
      console.error(`[${label}] exited with code ${code}`);
      shutdown(code);
    }
  });

  return child;
}

function shutdown(exitCode = 0) {
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }

  process.exit(exitCode);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

startProcess('Kodiak AI', process.execPath, ['server/ai-gateway.mjs']);
startProcess('Vite', npmCommand, ['run', 'dev:vite']);
