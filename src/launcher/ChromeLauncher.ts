import { spawn, ChildProcess } from 'child_process';
import { CdpConnectionError } from '../errors/CdpError';

export interface ChromeLaunchOptions {
  port?: number;
  userDataDir?: string;
  executablePath?: string;
  headless?: boolean;
  extraArgs?: string[];
}

const DEFAULT_CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
];

export class ChromeLauncher {
  private process: ChildProcess | null = null;
  private readonly options: Required<ChromeLaunchOptions>;

  constructor(options: ChromeLaunchOptions = {}) {
    this.options = {
      port: options.port ?? 9222,
      userDataDir: options.userDataDir ?? '/tmp/chrome-cdp-debug',
      executablePath: options.executablePath ?? '',
      headless: options.headless ?? false,
      extraArgs: options.extraArgs ?? [],
    };
  }

  async launch(): Promise<void> {
    const execPath = this.options.executablePath || this._findChrome();

    const args = [
      `--remote-debugging-port=${this.options.port}`,
      `--user-data-dir=${this.options.userDataDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-default-apps',
    ];

    if (this.options.headless) {
      args.push('--headless=new', '--disable-gpu');
    }

    args.push(...this.options.extraArgs);

    this.process = spawn(execPath, args, {
      stdio: 'ignore',
      detached: false,
    });

    this.process.on('error', (err) => {
      throw new CdpConnectionError(`Chrome process error: ${err.message}`);
    });

    await this._waitForDebugPort(this.options.port, 10000);
  }

  async kill(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  get port(): number {
    return this.options.port;
  }

  private _findChrome(): string {
    for (const p of DEFAULT_CHROME_PATHS) {
      try {
        require('fs').accessSync(p);
        return p;
      } catch {
        // not found, try next
      }
    }
    throw new CdpConnectionError(
      'Chrome not found. Set executablePath or install Google Chrome.'
    );
  }

  private async _waitForDebugPort(port: number, timeoutMs: number): Promise<void> {
    const http = require('http');
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      const ready = await new Promise<boolean>(resolve => {
        const req = http.get(`http://localhost:${port}/json/version`, (res: { statusCode: number }) => {
          resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(500, () => { req.destroy(); resolve(false); });
      });

      if (ready) return;
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    throw new CdpConnectionError(
      `Chrome debug port ${port} did not become available within ${timeoutMs}ms`
    );
  }
}
