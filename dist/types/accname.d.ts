interface Ctx {
    visited: Set<Element>;
    isReferenced: boolean;
    isRoot: boolean;
    roleOf: (el: Element) => string;
    isHidden: (el: Element) => boolean;
}
export declare function computeTextAlternative(element: Element, ctx: Ctx): string;
export declare function computeDescription(element: Element, name: string, ctx: Omit<Ctx, "visited" | "isReferenced" | "isRoot">): string;
export {};
