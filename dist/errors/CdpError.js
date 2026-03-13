"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CdpNavigationError = exports.CdpInteractionError = exports.CdpRefNotFoundError = exports.CdpConnectionError = exports.CdpError = void 0;
class CdpError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CdpError';
    }
}
exports.CdpError = CdpError;
class CdpConnectionError extends CdpError {
    constructor(message) {
        super(message);
        this.name = 'CdpConnectionError';
    }
}
exports.CdpConnectionError = CdpConnectionError;
class CdpRefNotFoundError extends CdpError {
    constructor(ref) {
        super(`Ref [${ref}] not found in registry. Call getTree() first.`);
        this.name = 'CdpRefNotFoundError';
        this.ref = ref;
    }
}
exports.CdpRefNotFoundError = CdpRefNotFoundError;
class CdpInteractionError extends CdpError {
    constructor(ref, message) {
        super(`Interaction failed for ref [${ref}]: ${message}`);
        this.name = 'CdpInteractionError';
        this.ref = ref;
    }
}
exports.CdpInteractionError = CdpInteractionError;
class CdpNavigationError extends CdpError {
    constructor(url, message) {
        super(`Navigation to "${url}" failed: ${message}`);
        this.name = 'CdpNavigationError';
        this.url = url;
    }
}
exports.CdpNavigationError = CdpNavigationError;
//# sourceMappingURL=CdpError.js.map