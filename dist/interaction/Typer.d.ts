import { CdpConnection } from '../connection/CdpConnection';
import { InteractiveNode } from '../accessibility/types';
export declare class Typer {
    private readonly connection;
    constructor(connection: CdpConnection);
    type(node: InteractiveNode, text: string): Promise<void>;
}
//# sourceMappingURL=Typer.d.ts.map