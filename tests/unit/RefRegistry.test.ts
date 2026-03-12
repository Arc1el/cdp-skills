import { RefRegistry } from '../../src/refs/RefRegistry';

describe('RefRegistry', () => {
  let registry: RefRegistry;

  beforeEach(() => {
    registry = new RefRegistry();
  });

  it('starts empty', () => {
    expect(registry.size()).toBe(0);
  });

  it('registers nodes with sequential refs', () => {
    const a = registry.register({ role: 'button', name: 'OK', value: '', description: '', backendDOMNodeId: 1 });
    const b = registry.register({ role: 'link', name: 'Cancel', value: '', description: '', backendDOMNodeId: 2 });
    expect(a.ref).toBe(1);
    expect(b.ref).toBe(2);
  });

  it('retrieves registered nodes', () => {
    registry.register({ role: 'button', name: 'OK', value: '', description: '', backendDOMNodeId: 1 });
    const node = registry.get(1);
    expect(node).toBeDefined();
    expect(node?.role).toBe('button');
    expect(node?.name).toBe('OK');
  });

  it('returns undefined for unknown ref', () => {
    expect(registry.get(999)).toBeUndefined();
  });

  it('resets counter and map', () => {
    registry.register({ role: 'button', name: 'OK', value: '', description: '', backendDOMNodeId: 1 });
    registry.reset();
    expect(registry.size()).toBe(0);
    const node = registry.register({ role: 'link', name: 'Home', value: '', description: '', backendDOMNodeId: 2 });
    expect(node.ref).toBe(1);
  });

  it('getAll returns a copy of the map', () => {
    registry.register({ role: 'button', name: 'OK', value: '', description: '', backendDOMNodeId: 1 });
    const map = registry.getAll();
    expect(map.size).toBe(1);
    // Mutating returned map should not affect registry
    map.clear();
    expect(registry.size()).toBe(1);
  });

  it('stores all node fields', () => {
    const node = registry.register({
      role: 'checkbox',
      name: 'Remember me',
      value: '',
      description: '',
      backendDOMNodeId: 42,
      checked: false,
    });
    const retrieved = registry.get(node.ref);
    expect(retrieved?.backendDOMNodeId).toBe(42);
    expect(retrieved?.checked).toBe(false);
  });
});
