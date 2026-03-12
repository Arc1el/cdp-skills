import CDP from 'chrome-remote-interface';
import { CdpConnection } from '../connection/CdpConnection';
import { CdpNavigationError } from '../errors/CdpError';

export class Navigator {
  constructor(private readonly connection: CdpConnection) {}

  async navigate(url: string): Promise<void> {
    const client = this.connection.getClient();
    const timeout = this.connection.timeout;

    try {
      await Promise.race([
        this._doNavigate(client, url),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout)
        ),
      ]);
    } catch (err) {
      throw new CdpNavigationError(url, (err as Error).message);
    }
  }

  private async _doNavigate(client: CDP.Client, url: string): Promise<void> {
    await Promise.all([
      new Promise<void>(resolve => client.Page.loadEventFired(() => resolve())),
      client.Page.navigate({ url }),
    ]);
  }
}
