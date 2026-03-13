"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CdpSkills = void 0;
const CdpConnection_1 = require("./connection/CdpConnection");
const AXTreeFetcher_1 = require("./accessibility/AXTreeFetcher");
const AXTreeFilter_1 = require("./accessibility/AXTreeFilter");
const AXTreeFormatter_1 = require("./accessibility/AXTreeFormatter");
const RefRegistry_1 = require("./refs/RefRegistry");
const Clicker_1 = require("./interaction/Clicker");
const Typer_1 = require("./interaction/Typer");
const Focuser_1 = require("./interaction/Focuser");
const Navigator_1 = require("./interaction/Navigator");
const ChromeLauncher_1 = require("./launcher/ChromeLauncher");
const CdpError_1 = require("./errors/CdpError");
class CdpSkills {
    constructor(options) {
        this.launcher = null;
        this.connection = new CdpConnection_1.CdpConnection(options);
        this.registry = new RefRegistry_1.RefRegistry();
    }
    get isConnected() {
        return this.connection.isConnected;
    }
    /** Chrome을 디버그 모드로 실행 후 CDP 연결까지 완료 */
    async launch(launchOptions) {
        this.launcher = new ChromeLauncher_1.ChromeLauncher(launchOptions);
        await this.launcher.launch();
        await this.connect();
    }
    async connect() {
        await this.connection.connect();
        this.fetcher = new AXTreeFetcher_1.AXTreeFetcher(this.connection);
        this.clicker = new Clicker_1.Clicker(this.connection);
        this.typer = new Typer_1.Typer(this.connection);
        this.focuser = new Focuser_1.Focuser(this.connection);
        this.navigator = new Navigator_1.Navigator(this.connection);
    }
    async disconnect() {
        await this.connection.disconnect();
    }
    /** CDP 연결 해제 + 실행한 Chrome 프로세스 종료 */
    async close() {
        await this.disconnect();
        if (this.launcher) {
            await this.launcher.kill();
            this.launcher = null;
        }
    }
    async getTree() {
        const raw = await this.fetcher.fetchFullTree();
        const filtered = (0, AXTreeFilter_1.filterInteractiveNodes)(raw);
        return (0, AXTreeFormatter_1.formatNodes)(filtered, this.registry);
    }
    async click(ref) {
        const node = this.registry.get(ref);
        if (!node)
            throw new CdpError_1.CdpRefNotFoundError(ref);
        await this.clicker.click(node);
    }
    async type(ref, text) {
        const node = this.registry.get(ref);
        if (!node)
            throw new CdpError_1.CdpRefNotFoundError(ref);
        await this.typer.type(node, text);
    }
    async focus(ref) {
        const node = this.registry.get(ref);
        if (!node)
            throw new CdpError_1.CdpRefNotFoundError(ref);
        await this.focuser.focus(node);
    }
    async navigate(url) {
        await this.navigator.navigate(url);
        return this.getTree();
    }
    getRefMap() {
        return this.registry.getAll();
    }
}
exports.CdpSkills = CdpSkills;
//# sourceMappingURL=CdpSkills.js.map