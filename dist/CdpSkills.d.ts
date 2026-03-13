import { CdpConnectionOptions } from './connection/CdpConnection';
import { ChromeLaunchOptions } from './launcher/ChromeLauncher';
import { RefMap } from './accessibility/types';
export declare class CdpSkills {
    private readonly connection;
    private readonly registry;
    private launcher;
    private fetcher;
    private clicker;
    private typer;
    private focuser;
    private navigator;
    constructor(options?: CdpConnectionOptions);
    get isConnected(): boolean;
    /** Chrome을 디버그 모드로 실행 후 CDP 연결까지 완료 */
    launch(launchOptions?: ChromeLaunchOptions): Promise<void>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    /** CDP 연결 해제 + 실행한 Chrome 프로세스 종료 */
    close(): Promise<void>;
    getTree(): Promise<string>;
    click(ref: number): Promise<void>;
    type(ref: number, text: string): Promise<void>;
    focus(ref: number): Promise<void>;
    navigate(url: string): Promise<string>;
    getRefMap(): RefMap;
}
//# sourceMappingURL=CdpSkills.d.ts.map