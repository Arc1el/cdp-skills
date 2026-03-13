"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CdpConnection = void 0;
const chrome_remote_interface_1 = __importDefault(require("chrome-remote-interface"));
const CdpError_1 = require("../errors/CdpError");
class CdpConnection {
    constructor(options = {}) {
        this.client = null;
        this._connected = false;
        this.options = {
            host: options.host ?? 'localhost',
            port: options.port ?? 9222,
            target: options.target ?? '',
            timeout: options.timeout ?? 30000,
            onDisconnect: options.onDisconnect,
        };
    }
    async connect() {
        try {
            const connectOptions = {
                host: this.options.host,
                port: this.options.port,
            };
            if (this.options.target) {
                connectOptions.target = this.options.target;
            }
            this.client = await (0, chrome_remote_interface_1.default)(connectOptions);
            this._connected = true;
            // 브라우저가 강제 종료되면 'disconnect' 이벤트 발생
            this.client.on('disconnect', () => {
                if (this._connected) {
                    this._connected = false;
                    this.client = null;
                    console.warn('[CdpConnection] Browser disconnected unexpectedly.');
                    this.options.onDisconnect?.();
                }
            });
            await this.client.Accessibility.enable();
            await this.client.DOM.enable();
            await this.client.Page.enable();
            await this.client.Runtime.enable();
        }
        catch (err) {
            throw new CdpError_1.CdpConnectionError(`Failed to connect to Chrome at ${this.options.host}:${this.options.port}: ${err.message}`);
        }
    }
    async disconnect() {
        if (this.client) {
            this._connected = false;
            await this.client.close().catch(() => { });
            this.client = null;
        }
    }
    getClient() {
        if (!this.client || !this._connected) {
            throw new CdpError_1.CdpConnectionError('Not connected. Browser may have been closed.');
        }
        return this.client;
    }
    get isConnected() {
        return this._connected;
    }
    get timeout() {
        return this.options.timeout;
    }
}
exports.CdpConnection = CdpConnection;
//# sourceMappingURL=CdpConnection.js.map