export declare class CdpError extends Error {
    constructor(message: string);
}
export declare class CdpConnectionError extends CdpError {
    constructor(message: string);
}
export declare class CdpRefNotFoundError extends CdpError {
    readonly ref: number;
    constructor(ref: number);
}
export declare class CdpInteractionError extends CdpError {
    readonly ref: number;
    constructor(ref: number, message: string);
}
export declare class CdpNavigationError extends CdpError {
    readonly url: string;
    constructor(url: string, message: string);
}
//# sourceMappingURL=CdpError.d.ts.map