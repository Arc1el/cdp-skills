import { CdpConnection } from '../connection/CdpConnection';
import { RawAXNode } from './types';

export class AXTreeFetcher {
  constructor(private readonly connection: CdpConnection) {}

  async fetchFullTree(): Promise<RawAXNode[]> {
    const client = this.connection.getClient();
    const result = await (client as any).send('Accessibility.getFullAXTree', {});
    return (result.nodes ?? []) as unknown as RawAXNode[];
  }
}
