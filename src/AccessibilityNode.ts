export class AccessibilityNode {
    private static filter(obj: Partial<AccessibilityNode>): Partial<AccessibilityNode> {
        const filterProps: string[] = [];
        for(let prop in obj) {
            if(prop === "children") {
                obj[prop] = obj[prop]
                    .map(child => AccessibilityNode.filter(child));

                continue;
            }

            (prop === "source" || (value => {
                if(value === null || value === undefined) return true;
                if(Array.isArray(value) && value.length === 0) return true;
                if(typeof(value) === "string" && !value.trim().length) return true;
                if(Object.getPrototypeOf(value).constructor.name === "Object" && !Object.keys(value).length) return true;

                return false;
            })(obj[prop]))
                && filterProps.push(prop);
        }

        return Object.fromEntries(
            Object.entries(obj)
                .filter(entry => !filterProps.includes(entry[0]))
        );
    }

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

    public toString(collapseEmptyProperties: boolean = false): string {
        const obj: Partial<AccessibilityNode> = JSON.parse(JSON.stringify({
            children: this.children,
            name: this.name,
            role: this.role,
            properties: this.properties,
            source: this.source,
            states: this.states,
            description: this.description,
            value: this.value
        }));

        return JSON.stringify(
            collapseEmptyProperties
                ? AccessibilityNode.filter(obj)
                : obj,
            null,
            4
        );
    }
};