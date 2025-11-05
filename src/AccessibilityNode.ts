export type AccessibilityNode = {
    children: AccessibilityNode[];
    name: string;
    properties: Record<string, unknown>;
    role: string;
    source: Element;
    states: Record<string, boolean | undefined>;

    description?: string;
    value?: string;
};