import CDP from 'chrome-remote-interface';
export interface CdpConnectionOptions {
    host?: string;
    port?: number;
    target?: string;
    timeout?: number;
    onDisconnect?: () => void;
}
export declare class CdpConnection {
    private client;
    private _connected;
    private readonly options;
    constructor(options?: CdpConnectionOptions);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getClient(): CDP.Client;
    get isConnected(): boolean;
    get timeout(): number;
}
//# sourceMappingURL=CdpConnection.d.ts.map