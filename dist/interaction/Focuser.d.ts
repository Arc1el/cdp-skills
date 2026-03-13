import { CdpConnection } from '../connection/CdpConnection';
import { InteractiveNode } from '../accessibility/types';
export declare class Focuser {
    private readonly connection;
    constructor(connection: CdpConnection);
    focus(node: InteractiveNode): Promise<void>;
}
//# sourceMappingURL=Focuser.d.ts.map