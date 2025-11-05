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

    public toString(): string {
        return this.rootWebArea ? this.rootWebArea.toString() : "{}";
    }

    public build(): this {
        this.rootWebArea = new AccessibilityNode(
            this.buildTree(this.root),
            (this.root as Document)?.title ?? "",
            "RootWebArea",
            {},
            (this.root as Document)?.documentElement ?? this.root as HTMLElement,
            {}
        );

        return this;
    }

    public traverse(
        nodeCb: (node: AccessibilityNode, depth: number, parent?: AccessibilityNode) => void
    ): void {
        if(!this.rootWebArea) return;

        const traverseNode = (node: AccessibilityNode, depth: number, parent?: AccessibilityNode) => {
            nodeCb(node, depth, parent);

            for(let child of node.children) {
                traverseNode(child, depth + 1, node);
            }
        };

        traverseNode(this.rootWebArea, 0);
    }

    public findByRole(role: string): AccessibilityNode[] {
        const matches: AccessibilityNode[] = [];
        this.traverse(node => {
            if(node.role !== role) return;

            matches.push(node);
        });

        return matches;
    }

    public findByName(text: string): AccessibilityNode[] {
        const matches: AccessibilityNode[] = [];
        this.traverse(node => {
            if(!node.name || !node.name.toLowerCase().includes(text.toLowerCase())) return;

            matches.push(node);
        });

        return matches;
    }

    // PRIVATE

    private buildTree(root: Document | Element): AccessibilityNode[] {
        const start = (root as Document).documentElement
            ? (root as Document).body || (root as Document).documentElement
            : (root as Element);

        const result: AccessibilityNode[] = [];
        for(let element of Array.from(start!.children)) {
            const node = this.elementToAccessibilityNode(element, new Set());
            node
                && result.push(node);
        }

        return result;
    }

    private elementToAccessibilityNode(element: Element, owningChain: Set<Element>): AccessibilityNode | null {
        if(this.isHidden(element)) return null;

        const role = (element.getAttribute("role") || "").trim() || this.getImplicitRole(element);
        if([ "none", "presentation" ].includes(role)) {
            const children: AccessibilityNode[] = [];
            for(let childElement of Array.from(element.children)) {
                const childNode = this.elementToAccessibilityNode(childElement, owningChain);
                if(childNode) children.push(childNode);
            }

            if(children.length === 0) return null;
            if(children.length === 1) return children[0];

            return new AccessibilityNode(children, "", "group", {}, element, {});
        }

        const name = this.computeAccessibleName(element, new Set());
        const description = this.computeAccessibleDescription(element, new Set());
        const states = this.computeStates(element, role);
        const properties = this.computeProperties(element, role);

        const children: AccessibilityNode[] = [];
        if(!this.isLeafRole(role)) {
            for(let childElement of Array.from(element.children)) {
                const childNode = this.elementToAccessibilityNode(childElement, owningChain);
                childNode
                    && children.push(childNode);
            }
        }

        const owns = (element.getAttribute("aria-owns") || "").trim();
        for(let id of (owns ?? "").split(/\s+/)) {
            const owned = element.ownerDocument?.getElementById(id);
            if(!owned || owningChain.has(owned)) continue;
            owningChain.add(owned);
            const ownedNode = this.elementToAccessibilityNode(owned, owningChain);
            owningChain.delete(owned);
            if(ownedNode) children.push(ownedNode);
        }

        const value = this.computeValue(element, role);

        return new AccessibilityNode(children, name, role, properties, element, states, description, value);
    }

    private isHidden(element: Element): boolean {
        if((element as HTMLElement).hidden) return true;
        if(element.getAttribute("aria-hidden") === "true") return true;

        try {
            const view = element.ownerDocument?.defaultView!;
            if(view) {
                const style = view.getComputedStyle(element);
                if(
                    style.display === "none"
                    || style.visibility === "hidden"
                    || style.visibility === "collapse"
                ) {
                    return true;
                }
            }
        } catch {}

        return false;
    }

    private getImplicitRole(element: Element): string {
        const tagName = element.tagName.toLowerCase();

        if(tagName === "a" && (element as HTMLAnchorElement).hasAttribute("href")) return "link";
        if(tagName === "button") return "button";
        if(tagName === "img") return "img";
        if(/^h[1-6]$/.test(tagName)) return "heading";
        if(tagName === "ul" || tagName === "ol") return "list";
        if(tagName === "li") return "listitem";
        if(tagName === "nav") return "navigation";
        if(tagName === "main") return "main";
        if(tagName === "header") return "banner";
        if(tagName === "footer") return "contentinfo";
        if(tagName === "section" || tagName === "article") return "region";

        if(tagName !== "input") return "generic"
    
        const type = ((element as HTMLInputElement).type || "").toLowerCase();
        if([ "button", "submit", "reset", "image" ].includes(type)) return "button";
        if(type === "checkbox") return "checkbox";
        if(type === "radio") return "radio";
        if(type === "range") return "slider";
        return "textbox";
    }

    private isLeafRole(role: string): boolean {
        return [
            "button",
            "checkbox",
            "img",
            "option",
            "radio",
            "slider",
            "textbox"
        ].includes(role);
    }

    private computeAccessibleName(element: Element, visited: Set<Element>): string {
        if(visited.has(element)) return "";
        visited.add(element);

        const labelledBy = (element.getAttribute("aria-labelledby") || "").trim();
        if(labelledBy) {
            const parts: string[] = [];
            for(let id of labelledBy.split(/\s+/)) {
                const referenced = element.ownerDocument?.getElementById(id);
                if(!referenced || this.isHidden(referenced)) continue;

                parts.push(this.computeText(referenced, new Set(visited)));
            }

            if(parts.length) return parts.join(" ").trim();
        }

        const ariaLabel = (element.getAttribute("aria-label") || "").trim();
        if(ariaLabel) return ariaLabel;

        const hostLanguageName = this.hostLanguageName(element);
        if(hostLanguageName) return hostLanguageName;

        const title = (element.getAttribute("title") || "").trim();
        if(title) return title;

        return this.computeText(element, new Set(visited));
    }

    private computeAccessibleDescription(element: Element, visited: Set<Element>): string {
        if(visited.has(element)) return "";
        visited.add(element);

        const describedBy = (element.getAttribute("aria-describedby") || "").trim();
        if(!describedBy) {
            return (element.getAttribute("title") || "").trim();
        }

        const parts: string[] = [];
        for(let id of describedBy.split(/\s+/)) {
            const referenced = element.ownerDocument?.getElementById(id);
            if(!referenced || this.isHidden(referenced)) continue;

            parts.push(this.computeText(referenced, new Set(visited)));
        }

        return parts.join(" ").trim();
    }

    private computeText(element: Element, visited: Set<Element>): string {
        if(this.isHidden(element)) return "";
        if(visited.has(element)) return "";

        visited.add(element);

        const text = [];
        for(let node of Array.from(element.childNodes)) {
            if(node.nodeType === 3) {   // Node.TEXT_NODE
                text.push(node.textContent || "");

                continue;
            }
            if(node.nodeType === 1) {   // Node.ELEMENT_NODE
                text.push(` ${this.computeText(node as Element, new Set(visited))}`);

                continue;
            }
        }

        return text.join("").trim();
    }

    private hostLanguageName(element: Element): string {
        const tagName = element.tagName.toLowerCase();

        if(tagName === "img") {
            return (element.getAttribute("alt") || "").trim();
        }
        if(tagName === "button" || /^h\d+$/.test(tagName)) {
            return (element.textContent || "").trim();
        }

        if(tagName !== "input") return "";

        const inputElement = element as HTMLInputElement;
        if([ "button", "submit", "reset" ].includes(inputElement.type) && inputElement.value) {
            return inputElement.value;
        }

        return inputElement.getAttribute("placeholder") ?? "";
    }

    private computeStates(element: Element, role: string): Record<string, any> {
        const aria = (name: string) => (element.getAttribute(name) || "").trim();

        const states: Record<string, any> = {};

        states.disabled = (aria("aria-disabled") === "true") || undefined;
        states.expanded = (aria("aria-expanded") === "true") || undefined;

        if(role === "checkbox") {
            states.checked = (aria("aria-checked") === "true") || (element as any).checked || undefined;
        }

        return states;
    }

    private computeProperties(element: Element, role: string): Record<string, any> {
        const properties: Record<string, any> = {};
        if(role === "heading") {
            const match = element.tagName.toLowerCase().match(/^h([1-6])$/);
            properties.level = match ? parseInt(match[1]) : properties.level;
        }

        return properties;
    }

    private computeValue(element: Element, role: string): string | undefined {
        const value = element.getAttribute("aria-valuenow");
        if(value) return value;

        if(role === "textbox") return (element as HTMLInputElement).value || undefined;

        return undefined;
    }
}