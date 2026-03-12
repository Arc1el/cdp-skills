import { CdpConnection, CdpConnectionOptions } from './connection/CdpConnection';
import { AXTreeFetcher } from './accessibility/AXTreeFetcher';
import { filterInteractiveNodes } from './accessibility/AXTreeFilter';
import { formatNodes } from './accessibility/AXTreeFormatter';
import { RefRegistry } from './refs/RefRegistry';
import { Clicker } from './interaction/Clicker';
import { Typer } from './interaction/Typer';
import { Focuser } from './interaction/Focuser';
import { Navigator } from './interaction/Navigator';
import { ChromeLauncher, ChromeLaunchOptions } from './launcher/ChromeLauncher';
import { RefMap } from './accessibility/types';
import { CdpRefNotFoundError } from './errors/CdpError';

export class CdpSkills {
  private readonly connection: CdpConnection;
  private readonly registry: RefRegistry;
  private launcher: ChromeLauncher | null = null;
  private fetcher!: AXTreeFetcher;
  private clicker!: Clicker;
  private typer!: Typer;
  private focuser!: Focuser;
  private navigator!: Navigator;

  constructor(options?: CdpConnectionOptions) {
    this.connection = new CdpConnection(options);
    this.registry = new RefRegistry();
  }

  get isConnected(): boolean {
    return this.connection.isConnected;
  }

  /** Chrome을 디버그 모드로 실행 후 CDP 연결까지 완료 */
  async launch(launchOptions?: ChromeLaunchOptions): Promise<void> {
    this.launcher = new ChromeLauncher(launchOptions);
    await this.launcher.launch();
    await this.connect();
  }

  async connect(): Promise<void> {
    await this.connection.connect();
    this.fetcher = new AXTreeFetcher(this.connection);
    this.clicker = new Clicker(this.connection);
    this.typer = new Typer(this.connection);
    this.focuser = new Focuser(this.connection);
    this.navigator = new Navigator(this.connection);
  }

  async disconnect(): Promise<void> {
    await this.connection.disconnect();
  }

  /** CDP 연결 해제 + 실행한 Chrome 프로세스 종료 */
  async close(): Promise<void> {
    await this.disconnect();
    if (this.launcher) {
      await this.launcher.kill();
      this.launcher = null;
    }
  }

  async getTree(): Promise<string> {
    const raw = await this.fetcher.fetchFullTree();
    const filtered = filterInteractiveNodes(raw);
    return formatNodes(filtered, this.registry);
  }

  async click(ref: number): Promise<void> {
    const node = this.registry.get(ref);
    if (!node) throw new CdpRefNotFoundError(ref);
    await this.clicker.click(node);
  }

  async type(ref: number, text: string): Promise<void> {
    const node = this.registry.get(ref);
    if (!node) throw new CdpRefNotFoundError(ref);
    await this.typer.type(node, text);
  }

  async focus(ref: number): Promise<void> {
    const node = this.registry.get(ref);
    if (!node) throw new CdpRefNotFoundError(ref);
    await this.focuser.focus(node);
  }

  async navigate(url: string): Promise<string> {
    await this.navigator.navigate(url);
    return this.getTree();
  }

  getRefMap(): RefMap {
    return this.registry.getAll();
  }
}
