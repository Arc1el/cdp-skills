"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChromeLauncher = void 0;
const child_process_1 = require("child_process");
const CdpError_1 = require("../errors/CdpError");
const DEFAULT_CHROME_PATHS = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
];
class ChromeLauncher {
    constructor(options = {}) {
        this.process = null;
        this.options = {
            port: options.port ?? 9222,
            userDataDir: options.userDataDir ?? '/tmp/chrome-cdp-debug',
            executablePath: options.executablePath ?? '',
            headless: options.headless ?? false,
            extraArgs: options.extraArgs ?? [],
        };
    }
    async launch() {
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
        this.process = (0, child_process_1.spawn)(execPath, args, {
            stdio: 'ignore',
            detached: false,
        });
        this.process.on('error', (err) => {
            throw new CdpError_1.CdpConnectionError(`Chrome process error: ${err.message}`);
        });
        await this._waitForDebugPort(this.options.port, 10000);
    }
    async kill() {
        if (this.process) {
            this.process.kill();
            this.process = null;
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }
    get port() {
        return this.options.port;
    }
    _findChrome() {
        for (const p of DEFAULT_CHROME_PATHS) {
            try {
                require('fs').accessSync(p);
                return p;
            }
            catch {
                // not found, try next
            }
        }
        throw new CdpError_1.CdpConnectionError('Chrome not found. Set executablePath or install Google Chrome.');
    }
    async _waitForDebugPort(port, timeoutMs) {
        const http = require('http');
        const deadline = Date.now() + timeoutMs;
        while (Date.now() < deadline) {
            const ready = await new Promise(resolve => {
                const req = http.get(`http://localhost:${port}/json/version`, (res) => {
                    resolve(res.statusCode === 200);
                });
                req.on('error', () => resolve(false));
                req.setTimeout(500, () => { req.destroy(); resolve(false); });
            });
            if (ready)
                return;
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        throw new CdpError_1.CdpConnectionError(`Chrome debug port ${port} did not become available within ${timeoutMs}ms`);
    }
}
exports.ChromeLauncher = ChromeLauncher;
//# sourceMappingURL=ChromeLauncher.js.map