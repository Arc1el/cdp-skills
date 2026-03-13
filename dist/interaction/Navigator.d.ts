import { CdpConnection } from '../connection/CdpConnection';
export declare class Navigator {
    private readonly connection;
    constructor(connection: CdpConnection);
    navigate(url: string): Promise<void>;
    private _doNavigate;
}
//# sourceMappingURL=Navigator.d.ts.map