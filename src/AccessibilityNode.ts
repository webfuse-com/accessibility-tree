type SourceStringCb = (element: Element) => string;


export interface AccessibilityNodeStringOptions {
    collapseEmptyProperties: boolean;
    sourceStringCb: SourceStringCb;
}


export class AccessibilityNode {
    private static cssEscape(value: string): string {
        return (globalThis.CSS && typeof globalThis.CSS.escape === "function")
            ? globalThis.CSS.escape(value)
            : value.replace(/[^a-zA-Z0-9_-]/g, ch => `\\${ ch }`);
    }

    private static getUniqueSelector(element: HTMLElement): string | null {
        if(!element.nodeName) return null;

        const parts: string[] = [];

        let currentElement: HTMLElement | null = element;

        while(currentElement) {
            if(currentElement.id) {
                parts.unshift(`#${ AccessibilityNode.cssEscape(currentElement.id) }`);

                break;
            }

            const segments = [
                currentElement.nodeName.toLowerCase(),

                ... Array.from(currentElement.classList).map(c => `.${ AccessibilityNode.cssEscape(c) }`)
            ];

            if(currentElement.parentNode) {
                const siblings = Array.from(currentElement.parentNode.children)
                    .filter(el => el.nodeName === currentElement!.nodeName);

                (siblings.length > 1)
                    && segments.push(`:nth-of-type(${siblings.indexOf(currentElement) + 1})`);
            }

            parts.unshift(segments.join(""));

            currentElement = currentElement.parentElement;
        }

        return parts.join(" > ");
    }

    private static modifyNodeForString(
        obj: Partial<AccessibilityNode>,
        options: Partial<AccessibilityNodeStringOptions> = {}
    ): Partial<AccessibilityNode> {
        const strObj: Record<string, unknown> = {};

        for(const prop in obj) {
            const property = obj[prop as keyof AccessibilityNode] as unknown;

            if(prop === "source") {
                strObj[prop] = (
                    options.sourceStringCb ?? AccessibilityNode.getUniqueSelector
                ).call(null, property as HTMLElement);

                continue;
            }

            if(prop === "children") {
                if(!(property as Node[] ?? []).length) continue;

                strObj[prop] = obj[prop]!
                    .map(child => {
                        return AccessibilityNode.modifyNodeForString(child, options);
                    });

                continue;
            }

            if(
                (options.collapseEmptyProperties ?? false) && (
                    (property === null)
                    || (property === undefined)
                    || (Array.isArray(property) && !property.length)
                    || (typeof(property) === "string" && !property.trim().length)
                    || ((Object.getPrototypeOf(property).constructor.name === "Object") && !Object.keys(property).length)
                )
            ) continue;

            strObj[prop] = property;
        }

        return strObj;
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

    public toString(option: Partial<AccessibilityNodeStringOptions> = {}): string {
        const obj = {
            children: this.children,
            name: this.name,
            role: this.role,
            properties: this.properties,
            source: this.source,
            states: this.states,
            description: this.description,
            value: this.value
        };

        return JSON.stringify(
            AccessibilityNode.modifyNodeForString(obj, option),
            null,
            2
        );
    }

    public toJSON(): unknown {
        return AccessibilityNode.modifyNodeForString({
            children: this.children,
            name: this.name,
            role: this.role,
            properties: this.properties,
            source: this.source,
            states: this.states,
            description: this.description,
            value: this.value
        });
    }
};