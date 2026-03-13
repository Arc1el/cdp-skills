"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatNodes = formatNodes;
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
function formatNodes(nodes, registry) {
    registry.reset();
    const lines = [];
    for (const node of nodes) {
        const role = getStringValue(node.role);
        const name = getStringValue(node.name);
        const value = getStringValue(node.value);
        const description = getStringValue(node.description);
        const backendDOMNodeId = node.backendDOMNodeId;
        const nodeData = {
            role,
            name,
            value,
            description,
            backendDOMNodeId,
        };
        const checked = getPropertyValue(node, 'checked');
        if (checked !== undefined)
            nodeData.checked = checked === true || checked === 'true' || checked === 'mixed';
        const selected = getPropertyValue(node, 'selected');
        if (selected !== undefined)
            nodeData.selected = selected === true;
        const expanded = getPropertyValue(node, 'expanded');
        if (expanded !== undefined)
            nodeData.expanded = expanded === true;
        const disabled = getPropertyValue(node, 'disabled');
        if (disabled !== undefined)
            nodeData.disabled = disabled === true;
        const required = getPropertyValue(node, 'required');
        if (required !== undefined)
            nodeData.required = required === true;
        const level = getPropertyValue(node, 'level');
        if (level !== undefined && typeof level === 'number')
            nodeData.level = level;
        const entry = registry.register(nodeData);
        lines.push(formatLine(entry));
    }
    return lines.join('\n');
}
function formatLine(node) {
    const label = node.name || node.description || node.value;
    let line = `[${node.ref}] ${node.role} "${label}"`;
    if (node.role === 'textbox' || node.role === 'searchbox' || node.role === 'combobox') {
        line += ` value="${node.value}"`;
    }
    if (node.checked !== undefined) {
        line += ` checked=${node.checked}`;
    }
    if (node.selected !== undefined) {
        line += ` selected=${node.selected}`;
    }
    if (node.expanded !== undefined) {
        line += ` expanded=${node.expanded}`;
    }
    if (node.disabled) {
        line += ` disabled`;
    }
    if (node.required) {
        line += ` required`;
    }
    if (node.level !== undefined) {
        line += ` level=${node.level}`;
    }
    return line;
}
//# sourceMappingURL=AXTreeFormatter.js.map