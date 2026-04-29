type SourceStringCb = (element: Element) => string;
export interface AccessibilityNodeStringOptions {
    collapseEmptyProperties: boolean;
    sourceStringCb: SourceStringCb;
}
export declare class AccessibilityNode {
    private static cssEscape;
    private static getUniqueSelector;
    private static modifyNodeForString;
    readonly children: AccessibilityNode[];
    readonly name: string;
    readonly properties: Record<string, unknown>;
    readonly role: string;
    readonly source: Element;
    readonly states: Record<string, boolean | undefined>;
    readonly description?: string;
    readonly value?: string;
    constructor(children: AccessibilityNode[], name: string, role: string, properties: Record<string, any>, source: Element, states: Record<string, any>, description?: string, value?: string);
    toString(option?: Partial<AccessibilityNodeStringOptions>): string;
    toJSON(): unknown;
}
export {};
