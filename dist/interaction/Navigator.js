"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Navigator = void 0;
const CdpError_1 = require("../errors/CdpError");
class Navigator {
    constructor(connection) {
        this.connection = connection;
    }
    async navigate(url) {
        const client = this.connection.getClient();
        const timeout = this.connection.timeout;
        try {
            await Promise.race([
                this._doNavigate(client, url),
                new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout)),
            ]);
        }
        catch (err) {
            throw new CdpError_1.CdpNavigationError(url, err.message);
        }
    }
    async _doNavigate(client, url) {
        await Promise.all([
            new Promise(resolve => client.Page.loadEventFired(() => resolve())),
            client.Page.navigate({ url }),
        ]);
    }
}
exports.Navigator = Navigator;
//# sourceMappingURL=Navigator.js.map