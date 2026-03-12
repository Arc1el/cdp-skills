import { filterInteractiveNodes } from '../../src/accessibility/AXTreeFilter';
import { RawAXNode } from '../../src/accessibility/types';

function makeNode(overrides: Partial<RawAXNode> = {}): RawAXNode {
  return {
    nodeId: 'node-1',
    backendDOMNodeId: 100,
    role: { type: 'role', value: 'button' },
    name: { type: 'computedString', value: 'Submit' },
    ...overrides,
  };
}

describe('filterInteractiveNodes', () => {
  it('includes a basic button', () => {
    const nodes = [makeNode()];
    expect(filterInteractiveNodes(nodes)).toHaveLength(1);
  });

  it('excludes ignored nodes', () => {
    const nodes = [makeNode({ ignored: true })];
    expect(filterInteractiveNodes(nodes)).toHaveLength(0);
  });

  it('excludes nodes without backendDOMNodeId', () => {
    const nodes = [makeNode({ backendDOMNodeId: undefined })];
    expect(filterInteractiveNodes(nodes)).toHaveLength(0);
  });

  it('excludes role=none', () => {
    const nodes = [makeNode({ role: { type: 'role', value: 'none' } })];
    expect(filterInteractiveNodes(nodes)).toHaveLength(0);
  });

  it('excludes role=presentation', () => {
    const nodes = [makeNode({ role: { type: 'role', value: 'presentation' } })];
    expect(filterInteractiveNodes(nodes)).toHaveLength(0);
  });

  it('excludes role=InlineTextBox', () => {
    const nodes = [makeNode({ role: { type: 'role', value: 'InlineTextBox' } })];
    expect(filterInteractiveNodes(nodes)).toHaveLength(0);
  });

  it('excludes non-interactive roles like paragraph', () => {
    const nodes = [makeNode({ role: { type: 'role', value: 'paragraph' } })];
    expect(filterInteractiveNodes(nodes)).toHaveLength(0);
  });

  it('excludes hidden nodes', () => {
    const nodes = [makeNode({
      properties: [{ name: 'hidden', value: { type: 'boolean', value: true } }],
    })];
    expect(filterInteractiveNodes(nodes)).toHaveLength(0);
  });

  it('excludes nodes with empty name/value/description', () => {
    const nodes = [makeNode({
      name: { type: 'computedString', value: '' },
      value: { type: 'string', value: '' },
      description: { type: 'computedString', value: '' },
    })];
    expect(filterInteractiveNodes(nodes)).toHaveLength(0);
  });

  it('includes img with alt text', () => {
    const nodes = [makeNode({ role: { type: 'role', value: 'img' }, name: { type: 'computedString', value: 'logo' } })];
    expect(filterInteractiveNodes(nodes)).toHaveLength(1);
  });

  it('excludes img without alt text', () => {
    const nodes = [makeNode({
      role: { type: 'role', value: 'img' },
      name: { type: 'computedString', value: '' },
    })];
    expect(filterInteractiveNodes(nodes)).toHaveLength(0);
  });

  it('includes all interactive roles', () => {
    const roles = ['link', 'textbox', 'searchbox', 'combobox', 'listbox', 'option', 'checkbox', 'radio', 'switch', 'menuitem', 'tab', 'spinbutton', 'slider', 'heading'];
    const nodes = roles.map((r, i) => makeNode({
      nodeId: `node-${i}`,
      backendDOMNodeId: i + 1,
      role: { type: 'role', value: r },
    }));
    expect(filterInteractiveNodes(nodes)).toHaveLength(roles.length);
  });

  it('filters mixed list correctly', () => {
    const nodes: RawAXNode[] = [
      makeNode({ nodeId: 'a', backendDOMNodeId: 1, role: { type: 'role', value: 'button' } }),
      makeNode({ nodeId: 'b', backendDOMNodeId: 2, ignored: true }),
      makeNode({ nodeId: 'c', backendDOMNodeId: 3, role: { type: 'role', value: 'link' } }),
      makeNode({ nodeId: 'd', backendDOMNodeId: undefined }),
    ];
    expect(filterInteractiveNodes(nodes)).toHaveLength(2);
  });
});
