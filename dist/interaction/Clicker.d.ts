import { CdpConnection } from '../connection/CdpConnection';
import { InteractiveNode } from '../accessibility/types';
export declare class Clicker {
    private readonly connection;
    constructor(connection: CdpConnection);
    click(node: InteractiveNode): Promise<void>;
}
//# sourceMappingURL=Clicker.d.ts.map