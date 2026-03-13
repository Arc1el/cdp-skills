"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Typer = void 0;
const CdpError_1 = require("../errors/CdpError");
class Typer {
    constructor(connection) {
        this.connection = connection;
    }
    async type(node, text) {
        const client = this.connection.getClient();
        try {
            const resolveResult = await client.DOM.resolveNode({ backendNodeId: node.backendDOMNodeId });
            const objectId = resolveResult.object.objectId;
            if (!objectId)
                throw new Error('No objectId from resolveNode');
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
        }
        catch (err) {
            throw new CdpError_1.CdpInteractionError(node.ref, err.message);
        }
    }
}
exports.Typer = Typer;
//# sourceMappingURL=Typer.js.map