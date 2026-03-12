import { CdpConnection } from '../connection/CdpConnection';
import { InteractiveNode } from '../accessibility/types';
import { CdpInteractionError } from '../errors/CdpError';

export class Typer {
  constructor(private readonly connection: CdpConnection) {}

  async type(node: InteractiveNode, text: string): Promise<void> {
    const client = this.connection.getClient();

    try {
      const resolveResult = await client.DOM.resolveNode({ backendNodeId: node.backendDOMNodeId });
      const objectId = resolveResult.object.objectId;
      if (!objectId) throw new Error('No objectId from resolveNode');

      // Focus, clear, set value, then dispatch input/change events (React/Vue compatible)
      await client.Runtime.callFunctionOn({
        objectId,
        functionDeclaration: `function(value) {
          this.focus();
          // Native input value setter to bypass React synthetic event system
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
            || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(this, value);
          } else {
            this.value = value;
          }
          this.dispatchEvent(new Event('input', { bubbles: true }));
          this.dispatchEvent(new Event('change', { bubbles: true }));
        }`,
        arguments: [{ value: text }],
        silent: true,
      });
    } catch (err) {
      throw new CdpInteractionError(node.ref, (err as Error).message);
    }
  }
}
