"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clicker = void 0;
const CdpError_1 = require("../errors/CdpError");
class Clicker {
    constructor(connection) {
        this.connection = connection;
    }
    async click(node) {
        const client = this.connection.getClient();
        try {
            // Primary strategy: DOM.getBoxModel → center coordinates → mouse events
            const boxResult = await client.DOM.getBoxModel({ backendNodeId: node.backendDOMNodeId });
            const model = boxResult.model;
            // content quad: [x1,y1, x2,y2, x3,y3, x4,y4]
            const quad = model.content;
            const x = (quad[0] + quad[2] + quad[4] + quad[6]) / 4;
            const y = (quad[1] + quad[3] + quad[5] + quad[7]) / 4;
            await client.Input.dispatchMouseEvent({ type: 'mouseMoved', x, y, button: 'none', clickCount: 0 });
            await client.Input.dispatchMouseEvent({ type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
            await client.Input.dispatchMouseEvent({ type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
        }
        catch {
            // Fallback: Runtime.callFunctionOn element.click()
            try {
                const resolveResult = await client.DOM.resolveNode({ backendNodeId: node.backendDOMNodeId });
                const objectId = resolveResult.object.objectId;
                if (!objectId)
                    throw new Error('No objectId from resolveNode');
                await client.Runtime.callFunctionOn({
                    objectId,
                    functionDeclaration: 'function() { this.click(); }',
                    silent: true,
                });
            }
            catch (fallbackErr) {
                throw new CdpError_1.CdpInteractionError(node.ref, fallbackErr.message);
            }
        }
    }
}
exports.Clicker = Clicker;
//# sourceMappingURL=Clicker.js.map