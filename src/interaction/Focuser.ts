import { CdpConnection } from '../connection/CdpConnection';
import { InteractiveNode } from '../accessibility/types';
import { CdpInteractionError } from '../errors/CdpError';

export class Focuser {
  constructor(private readonly connection: CdpConnection) {}

  async focus(node: InteractiveNode): Promise<void> {
    const client = this.connection.getClient();

    try {
      const resolveResult = await client.DOM.resolveNode({ backendNodeId: node.backendDOMNodeId });
      const objectId = resolveResult.object.objectId;
      if (!objectId) throw new Error('No objectId from resolveNode');

      await client.Runtime.callFunctionOn({
        objectId,
        functionDeclaration: 'function() { this.focus(); }',
        silent: true,
      });
    } catch (err) {
      throw new CdpInteractionError(node.ref, (err as Error).message);
    }
  }
}
