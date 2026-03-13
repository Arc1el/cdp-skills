"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterInteractiveNodes = filterInteractiveNodes;
const INTERACTIVE_ROLES = new Set([
    'button', 'link', 'textbox', 'searchbox', 'combobox', 'listbox',
    'option', 'checkbox', 'radio', 'switch', 'menuitem', 'tab',
    'spinbutton', 'slider', 'heading', 'img',
]);
const EXCLUDED_ROLES = new Set(['none', 'presentation', 'InlineTextBox']);
function getStringValue(val) {
    if (!val)
        return '';
    if (typeof val.value === 'string')
        return val.value;
    if (typeof val.value === 'boolean' || typeof val.value === 'number')
        return String(val.value);
    return '';
}
function getPropertyValue(node, name) {
    const prop = node.properties?.find(p => p.name === name);
    return prop?.value?.value;
}
function filterInteractiveNodes(nodes) {
    return nodes.filter(node => {
        if (node.ignored === true)
            return false;
        if (!node.backendDOMNodeId)
            return false;
        const role = getStringValue(node.role);
        if (!role || EXCLUDED_ROLES.has(role))
            return false;
        if (!INTERACTIVE_ROLES.has(role))
            return false;
        if (getPropertyValue(node, 'hidden') === true)
            return false;
        // For img, require alt text (non-empty name)
        if (role === 'img') {
            const name = getStringValue(node.name);
            return name.trim().length > 0;
        }
        // Exclude nodes with no meaningful label
        const name = getStringValue(node.name);
        const value = getStringValue(node.value);
        const description = getStringValue(node.description);
        if (!name.trim() && !value.trim() && !description.trim())
            return false;
        return true;
    });
}
//# sourceMappingURL=AXTreeFilter.js.map