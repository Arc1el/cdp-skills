import CDP from 'chrome-remote-interface';
import { CdpConnectionError } from '../errors/CdpError';

export interface CdpConnectionOptions {
  host?: string;
  port?: number;
  target?: string;
  timeout?: number;
  onDisconnect?: () => void;
}

export class CdpConnection {
  private client: CDP.Client | null = null;
  private _connected = false;
  private readonly options: Required<Omit<CdpConnectionOptions, 'onDisconnect'>> & { onDisconnect?: () => void };

  constructor(options: CdpConnectionOptions = {}) {
    this.options = {
      host: options.host ?? 'localhost',
      port: options.port ?? 9222,
      target: options.target ?? '',
      timeout: options.timeout ?? 30000,
      onDisconnect: options.onDisconnect,
    };
  }

  async connect(): Promise<void> {
    try {
      const connectOptions: CDP.Options = {
        host: this.options.host,
        port: this.options.port,
      };
      if (this.options.target) {
        connectOptions.target = this.options.target;
      }
      this.client = await CDP(connectOptions);
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
    } catch (err) {
      throw new CdpConnectionError(
        `Failed to connect to Chrome at ${this.options.host}:${this.options.port}: ${(err as Error).message}`
      );
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      this._connected = false;
      await this.client.close().catch(() => {});
      this.client = null;
    }
  }

  getClient(): CDP.Client {
    if (!this.client || !this._connected) {
      throw new CdpConnectionError('Not connected. Browser may have been closed.');
    }
    return this.client;
  }

  get isConnected(): boolean {
    return this._connected;
  }

  get timeout(): number {
    return this.options.timeout;
  }
}
