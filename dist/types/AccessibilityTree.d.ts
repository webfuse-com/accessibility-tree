import { AccessibilityNodeStringOptions, AccessibilityNode } from "./AccessibilityNode.js";
export declare class AccessibilityTree {
    private readonly root;
    private rootWebArea?;
    private ownedElements;
    private hiddenCache;
    constructor(root: Document | Element);
    toObject(): AccessibilityNode | null;
    toString(options?: Partial<AccessibilityNodeStringOptions>): string;
    build(): this;
    traverse(nodeCb: (node: AccessibilityNode, depth: number, parent?: AccessibilityNode) => void): void;
    findByRole(role: string): AccessibilityNode[];
    findByName(text: string): AccessibilityNode[];
    private collectOwnedElements;
    private buildTree;
    private elementToAccessibilityNode;
    private directTextContent;
    private resolveRole;
    private hasRevokingTraits;
    private isHidden;
    private computeHidden;
}
