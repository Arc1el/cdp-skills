"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AXTreeFetcher = void 0;
class AXTreeFetcher {
    constructor(connection) {
        this.connection = connection;
    }
    async fetchFullTree() {
        const client = this.connection.getClient();
        const result = await client.send('Accessibility.getFullAXTree', {});
        return (result.nodes ?? []);
    }
}
exports.AXTreeFetcher = AXTreeFetcher;
//# sourceMappingURL=AXTreeFetcher.js.map