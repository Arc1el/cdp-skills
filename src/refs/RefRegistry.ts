import { InteractiveNode, RefMap } from '../accessibility/types';

export class RefRegistry {
  private map: RefMap = new Map();
  private counter = 0;

  reset(): void {
    this.map.clear();
    this.counter = 0;
  }

  register(node: Omit<InteractiveNode, 'ref'>): InteractiveNode {
    this.counter++;
    const entry: InteractiveNode = { ref: this.counter, ...node };
    this.map.set(this.counter, entry);
    return entry;
  }

  get(ref: number): InteractiveNode | undefined {
    return this.map.get(ref);
  }

  getAll(): RefMap {
    return new Map(this.map);
  }

  size(): number {
    return this.map.size;
  }
}
