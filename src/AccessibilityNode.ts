export class AccessibilityNode {
    private static getUniqueSelector(element: HTMLElement): string | null {
        if(!element.nodeName) return null;

        const parts = [];

        let currentElement: HTMLElement | null = element;
        while(currentElement) {
            if(currentElement.id) {
                parts.unshift(`#${currentElement.id}`);

                break;
            }

            const selector = [
                currentElement.nodeName.toLowerCase(),
                ... currentElement.classList.length
                    ? [
                        ".",
                        ...currentElement.classList
                    ].join(".")
                    : []
            ];

            if(currentElement.parentNode) {
                const siblings = Array.from(currentElement.parentNode.children)
                    .filter(el => el.nodeName === currentElement!.nodeName);
                (siblings.length > 1)
                    && selector.push(`:nth-of-type(${siblings.indexOf(currentElement) + 1})`);
            }

            parts.unshift(selector.join(""));

            currentElement = currentElement.parentElement;
        }

        return parts.join(" > ");
    }

    private static modify(obj: Partial<AccessibilityNode>, collapseEmptyProperties: boolean): Partial<AccessibilityNode> {
        const newObj: Partial<AccessibilityNode> = {};
        for(let prop in obj) {
            if(prop === "source") {
                newObj[prop] = AccessibilityNode.getUniqueSelector(obj[prop]);

                continue;
            }

            if(prop === "children") {
                if((obj[prop] ?? []).length) {
                    newObj[prop] = obj[prop]
                        .map(child => AccessibilityNode.modify(child, collapseEmptyProperties));
                }

                continue;
            }

            if(collapseEmptyProperties && (
                obj[prop] === null || obj[prop] === undefined
                || (Array.isArray(obj[prop]) && !obj[prop].length)
                || (typeof(obj[prop]) === "string" && !obj[prop].trim().length)
                || (Object.getPrototypeOf(obj[prop]).constructor.name === "Object" && !Object.keys(obj[prop]).length)
            )) continue;

            newObj[prop] = obj[prop];
        }

        return newObj;
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
        const obj: Partial<AccessibilityNode> = {
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
            AccessibilityNode.modify(obj, collapseEmptyProperties),
            null,
            4
        );
    }
};