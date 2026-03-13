export interface ChromeLaunchOptions {
    port?: number;
    userDataDir?: string;
    executablePath?: string;
    headless?: boolean;
    extraArgs?: string[];
}
export declare class ChromeLauncher {
    private process;
    private readonly options;
    constructor(options?: ChromeLaunchOptions);
    launch(): Promise<void>;
    kill(): Promise<void>;
    get port(): number;
    private _findChrome;
    private _waitForDebugPort;
}
//# sourceMappingURL=ChromeLauncher.d.ts.map