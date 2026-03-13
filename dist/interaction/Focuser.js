"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Focuser = void 0;
const CdpError_1 = require("../errors/CdpError");
class Focuser {
    constructor(connection) {
        this.connection = connection;
    }
    async focus(node) {
        const client = this.connection.getClient();
        try {
            const resolveResult = await client.DOM.resolveNode({ backendNodeId: node.backendDOMNodeId });
            const objectId = resolveResult.object.objectId;
            if (!objectId)
                throw new Error('No objectId from resolveNode');
            await client.Runtime.callFunctionOn({
                objectId,
                functionDeclaration: 'function() { this.focus(); }',
                silent: true,
            });
        }
        catch (err) {
            throw new CdpError_1.CdpInteractionError(node.ref, err.message);
        }
    }
}
exports.Focuser = Focuser;
//# sourceMappingURL=Focuser.js.map