import { formatNodes } from '../../src/accessibility/AXTreeFormatter';
import { RefRegistry } from '../../src/refs/RefRegistry';
import { RawAXNode } from '../../src/accessibility/types';

function makeNode(nodeId: string, role: string, name: string, extra: Partial<RawAXNode> = {}): RawAXNode {
  return {
    nodeId,
    backendDOMNodeId: parseInt(nodeId),
    role: { type: 'role', value: role },
    name: { type: 'computedString', value: name },
    ...extra,
  };
}

describe('formatNodes', () => {
  let registry: RefRegistry;

  beforeEach(() => {
    registry = new RefRegistry();
  });

  it('formats a button', () => {
    const nodes = [makeNode('1', 'button', 'Sign In')];
    const result = formatNodes(nodes, registry);
    expect(result).toBe('[1] button "Sign In"');
  });

  it('formats a textbox with value', () => {
    const nodes = [makeNode('1', 'textbox', 'Email', {
      value: { type: 'string', value: 'user@example.com' },
    })];
    const result = formatNodes(nodes, registry);
    expect(result).toBe('[1] textbox "Email" value="user@example.com"');
  });

  it('formats a textbox with empty value', () => {
    const nodes = [makeNode('1', 'textbox', 'Password', {
      value: { type: 'string', value: '' },
    })];
    const result = formatNodes(nodes, registry);
    expect(result).toBe('[1] textbox "Password" value=""');
  });

  it('formats a checkbox with checked state', () => {
    const nodes = [makeNode('1', 'checkbox', 'Remember me', {
      properties: [{ name: 'checked', value: { type: 'boolean', value: false } }],
    })];
    const result = formatNodes(nodes, registry);
    expect(result).toBe('[1] checkbox "Remember me" checked=false');
  });

  it('formats multiple nodes with sequential refs', () => {
    const nodes = [
      makeNode('1', 'heading', 'Sign in to your account'),
      makeNode('2', 'textbox', 'Email address', { value: { type: 'string', value: '' } }),
      makeNode('3', 'button', 'Sign in'),
    ];
    const result = formatNodes(nodes, registry);
    const lines = result.split('\n');
    expect(lines[0]).toBe('[1] heading "Sign in to your account"');
    expect(lines[1]).toBe('[2] textbox "Email address" value=""');
    expect(lines[2]).toBe('[3] button "Sign in"');
  });

  it('resets registry counter on each call', () => {
    const nodes = [makeNode('1', 'button', 'OK')];
    formatNodes(nodes, registry);
    const result2 = formatNodes(nodes, registry);
    expect(result2).toBe('[1] button "OK"');
  });

  it('formats a link', () => {
    const nodes = [makeNode('1', 'link', 'Forgot your password?')];
    const result = formatNodes(nodes, registry);
    expect(result).toBe('[1] link "Forgot your password?"');
  });

  it('formats a disabled button', () => {
    const nodes = [makeNode('1', 'button', 'Submit', {
      properties: [{ name: 'disabled', value: { type: 'boolean', value: true } }],
    })];
    const result = formatNodes(nodes, registry);
    expect(result).toContain('disabled');
  });

  it('registers nodes in registry', () => {
    const nodes = [
      makeNode('1', 'button', 'OK'),
      makeNode('2', 'link', 'Cancel'),
    ];
    formatNodes(nodes, registry);
    expect(registry.size()).toBe(2);
    expect(registry.get(1)?.role).toBe('button');
    expect(registry.get(2)?.role).toBe('link');
  });
});
