import { InteractiveNode, RefMap } from '../accessibility/types';
export declare class RefRegistry {
    private map;
    private counter;
    reset(): void;
    register(node: Omit<InteractiveNode, 'ref'>): InteractiveNode;
    get(ref: number): InteractiveNode | undefined;
    getAll(): RefMap;
    size(): number;
}
//# sourceMappingURL=RefRegistry.d.ts.map