import { AccessibilityNodeStringOptions, AccessibilityNode } from "./AccessibilityNode.js";
import { getImplicitRole, PRESENTATIONAL_ROLES, CHILDREN_PRESENTATIONAL_ROLES, NO_ROLE } from "./roles.js";
import { computeAria, computeValue } from "./aria.js";
import { computeTextAlternative, computeDescription } from "./accname.js";


export class AccessibilityTree {
    private readonly root: Document | Element;

    private rootWebArea?: AccessibilityNode;
    private ownedElements: Set<Element> = new Set();
    private hiddenCache: WeakMap<Element, boolean> = new WeakMap();

    public constructor(root: Document | Element) {
        this.root = root;
    }

    // PUBLIC

    public toObject(): AccessibilityNode | null {
        return this.rootWebArea ?? null;
    }

    public toString(options: Partial<AccessibilityNodeStringOptions> = {}): string {
        return this.rootWebArea
            ? this.rootWebArea.toString(options)
            : "{}";
    }

    public build(): this {
        this.ownedElements = new Set();
        this.hiddenCache = new WeakMap();

        this.collectOwnedElements(this.root);

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

    public traverse(nodeCb: (node: AccessibilityNode, depth: number, parent?: AccessibilityNode) => void): void {
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

    private collectOwnedElements(scope: Document | Element): void {
        const root = (scope as Document).documentElement ? scope as Document : scope as Element;

        const owners = (root as any).querySelectorAll?.("[aria-owns]") as NodeListOf<Element> | undefined;
        if(!owners) return;

        for(const owner of Array.from(owners)) {
            const ids = (owner.getAttribute("aria-owns") || "").trim();
            if(!ids) continue;

            for(let id of ids.split(/\s+/)) {
                const owned = owner.ownerDocument?.getElementById(id);
                owned
                    && this.ownedElements.add(owned);
            }
        }
    }

    private buildTree(root: Document | Element): AccessibilityNode[] {
        let start: Element;
        if((root as Document).documentElement) {
            start = (root as Document).body || (root as Document).documentElement;
        } else if((root as Element).tagName?.toLowerCase() === "html") {
            const body = (root as Element).querySelector("body");
            start = body ?? (root as Element);
        } else {
            start = root as Element;
        }

        const result: AccessibilityNode[] = [];
        for(let element of Array.from(start.children)) {
            if(this.ownedElements.has(element)) continue;

            const node = this.elementToAccessibilityNode(element, new Set());
            node
                && result.push(node);
        }

        return result;
    }

    private elementToAccessibilityNode(element: Element, owningChain: Set<Element>): AccessibilityNode | null {
        if(this.isHidden(element)) return null;

        const role: string = this.resolveRole(element);

        if(PRESENTATIONAL_ROLES.has(role)) {
            const children: AccessibilityNode[] = [];
            for(let childElement of Array.from(element.children)) {
                if(this.ownedElements.has(childElement) && !owningChain.has(childElement)) continue;

                const childNode = this.elementToAccessibilityNode(childElement, owningChain);
                if(childNode) children.push(childNode);
            }

            if(children.length === 0) return null;
            if(children.length === 1) return children[0];

            return new AccessibilityNode(children, "", "generic", {}, element, {});
        }

        const name = computeTextAlternative(element, {
            visited: new Set(),
            isRoot: true,
            isReferenced: false,
            roleOf: el => this.resolveRole(el),
            isHidden: el => this.isHidden(el)
        });
        const description = computeDescription(element, name, {
            roleOf: el => this.resolveRole(el),
            isHidden: el => this.isHidden(el)
        });
        const {
            states,
            properties
        } = computeAria(element, role);
        const value = computeValue(element, role);

        if(name) {
            const ariaLabel = (element.getAttribute("aria-label") || "").trim();
            if(ariaLabel && ariaLabel === name) delete properties.label;
            if((element.getAttribute("aria-labelledby") || "").trim()) delete properties.labelledby;
        }
        if(description) {
            const ariaDesc = (element.getAttribute("aria-description") || "").trim();
            if(ariaDesc && ariaDesc === description) delete properties.description;
            if((element.getAttribute("aria-describedby") || "").trim()) delete properties.describedby;
        }

        const children: AccessibilityNode[] = [];
        if(!CHILDREN_PRESENTATIONAL_ROLES.has(role)) {
            for(let childElement of Array.from(element.children)) {
                if(this.ownedElements.has(childElement) && !owningChain.has(childElement)) continue;

                const childNode = this.elementToAccessibilityNode(childElement, owningChain);
                childNode
                    && children.push(childNode);
            }
        }

        const owns: string = (element.getAttribute("aria-owns") || "").trim();
        if(owns) {
            for(let id of owns.split(/\s+/)) {
                const owned = element.ownerDocument?.getElementById(id);
                if(!owned || owningChain.has(owned)) continue;

                owningChain.add(owned);
                const ownedNode = this.elementToAccessibilityNode(owned, owningChain);
                owningChain.delete(owned);

                ownedNode
                    && children.push(ownedNode);
            }
        }

        let effectiveName = name;
        if(role === NO_ROLE && !effectiveName) {
            const textOnly = this.directTextContent(element);
            if(textOnly) effectiveName = textOnly;
        }

        if(
            role === NO_ROLE
            && !effectiveName
            && !description
            && !value
            && children.length === 0
            && Object.keys(states).length === 0
            && Object.keys(properties).length === 0
        ) {
            return null;
        }

        return new AccessibilityNode(children, effectiveName, role, properties, element, states, description || undefined, value);
    }

    private directTextContent(element: Element): string {
        const parts: string[] = [];
        for(let node of Array.from(element.childNodes)) {
            if(node.nodeType === 3) {
                const t = (node.textContent || "").replace(/\s+/g, " ").trim();
                if(t) parts.push(t);
            }
        }

        return parts.join(" ");
    }

    private resolveRole(element: Element): string {
        const explicit = (element.getAttribute("role") || "").trim().split(/\s+/)[0] || "";

        if(explicit && PRESENTATIONAL_ROLES.has(explicit)) {
            if(this.hasRevokingTraits(element)) return getImplicitRole(element);

            return explicit;
        }

        if(explicit) return explicit;

        return getImplicitRole(element);
    }

    private hasRevokingTraits(element: Element): boolean {
        const ti: string | null = element.getAttribute("tabindex");
        if(ti !== null && parseInt(ti, 10) >= 0) return true;

        const tag = element.tagName.toLowerCase();
        if(tag === "a" && element.hasAttribute("href")) return true;
        if(tag === "button" || tag === "input" || tag === "select" || tag === "textarea") return true;

        for(let attr of Array.from(element.attributes)) {
            if(/^aria-/i.test(attr.name) && attr.name !== "aria-hidden") return true;
        }

        return false;
    }

    private isHidden(element: Element): boolean {
        const cached: boolean | undefined = this.hiddenCache.get(element);
        if(cached !== undefined) return cached;

        const result: boolean = this.computeHidden(element);
        this.hiddenCache.set(element, result);

        return result;
    }

    private computeHidden(element: Element): boolean {
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

        let parent: HTMLElement | null = element.parentElement;
        while(parent) {
            if((parent as HTMLElement).hidden) return true;
            if(parent.getAttribute("aria-hidden") === "true") return true;

            try {
                const view = parent.ownerDocument?.defaultView!;
                if(view && view.getComputedStyle(parent).display === "none") return true;
            } catch {}

            parent = parent.parentElement;
        }

        return false;
    }
}