import { CdpConnection } from '../connection/CdpConnection';
import { RawAXNode } from './types';
export declare class AXTreeFetcher {
    private readonly connection;
    constructor(connection: CdpConnection);
    fetchFullTree(): Promise<RawAXNode[]>;
}
//# sourceMappingURL=AXTreeFetcher.d.ts.map