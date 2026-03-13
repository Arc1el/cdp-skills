"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefRegistry = void 0;
class RefRegistry {
    constructor() {
        this.map = new Map();
        this.counter = 0;
    }
    reset() {
        this.map.clear();
        this.counter = 0;
    }
    register(node) {
        this.counter++;
        const entry = { ref: this.counter, ...node };
        this.map.set(this.counter, entry);
        return entry;
    }
    get(ref) {
        return this.map.get(ref);
    }
    getAll() {
        return new Map(this.map);
    }
    size() {
        return this.map.size;
    }
}
exports.RefRegistry = RefRegistry;
//# sourceMappingURL=RefRegistry.js.map