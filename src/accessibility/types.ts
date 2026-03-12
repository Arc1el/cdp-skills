export interface RawAXNode {
  nodeId: string;
  ignored?: boolean;
  role?: AXValue;
  name?: AXValue;
  description?: AXValue;
  value?: AXValue;
  properties?: AXProperty[];
  backendDOMNodeId?: number;
  childIds?: string[];
  parentId?: string;
}

export interface AXValue {
  type: string;
  value?: string | boolean | number;
}

export interface AXProperty {
  name: string;
  value: AXValue;
}

export interface InteractiveNode {
  ref: number;
  role: string;
  name: string;
  value: string;
  description: string;
  backendDOMNodeId: number;
  checked?: boolean;
  selected?: boolean;
  expanded?: boolean;
  disabled?: boolean;
  required?: boolean;
  level?: number;
}

export type RefMap = Map<number, InteractiveNode>;
