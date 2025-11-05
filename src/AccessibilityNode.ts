export class AccessibilityNode {
    public readonly children: AccessibilityNode[];
    public readonly name: string;
    public readonly properties: Record<string, unknown>;
    public readonly role: string;
    public readonly source: Element;
    public readonly states: Record<string, boolean | undefined>;

    public readonly description?: string;
    public readonly value?: string;

    constructor(
        children: AccessibilityNode[],
        name: string,
        role: string,
        properties: Record<string, any>,
        source: Element,
        states: Record<string, any>,
        description?: string,
        value?: string
    ) {
        this.children = children;
        this.name = name;
        this.role = role;
        this.properties = properties;
        this.source = source;
        this.states = states;

        this.description = description;
        this.value = value;
    }

    public toString(): string {
        return JSON.stringify({
            children: this.children,
            name: this.name,
            role: this.role,
            properties: this.properties,
            source: this.source,
            states: this.states,
            description: this.description,
            value: this.value
        }, null, 4);
    }
};