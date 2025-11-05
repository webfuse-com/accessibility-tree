import { AccessibilityNode } from "./AccessibilityNode.js";


export class AccessibilityTree {
    private readonly root: Document | Element;

    private rootWebArea: AccessibilityNode | null = null;

    public constructor(root: Document | Element) {
        this.root = root;
    }

    // PUBLIC

    public toObject(): AccessibilityNode | null {
        return this.rootWebArea;
    }
}