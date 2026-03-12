export class CdpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CdpError';
  }
}

export class CdpConnectionError extends CdpError {
  constructor(message: string) {
    super(message);
    this.name = 'CdpConnectionError';
  }
}

export class CdpRefNotFoundError extends CdpError {
  readonly ref: number;
  constructor(ref: number) {
    super(`Ref [${ref}] not found in registry. Call getTree() first.`);
    this.name = 'CdpRefNotFoundError';
    this.ref = ref;
  }
}

export class CdpInteractionError extends CdpError {
  readonly ref: number;
  constructor(ref: number, message: string) {
    super(`Interaction failed for ref [${ref}]: ${message}`);
    this.name = 'CdpInteractionError';
    this.ref = ref;
  }
}

export class CdpNavigationError extends CdpError {
  readonly url: string;
  constructor(url: string, message: string) {
    super(`Navigation to "${url}" failed: ${message}`);
    this.name = 'CdpNavigationError';
    this.url = url;
  }
}
