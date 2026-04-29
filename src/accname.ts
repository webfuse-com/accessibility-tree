import { NAME_FROM_CONTENTS_ROLES } from "./roles.js";


interface Ctx {
    visited: Set<Element>;
    isReferenced: boolean;
    isRoot: boolean;
    roleOf: (el: Element) => string;
    isHidden: (el: Element) => boolean;
}


const FORM_CONTROL_TAGS = new Set([ "input", "textarea", "select" ]);


function cssEscape(view: Window | undefined | null, value: string): string {
    const fn = (view as any)?.CSS?.escape
        ?? (globalThis as any).CSS?.escape;
    if(typeof fn === "function") return fn.call((view as any)?.CSS
        ?? (globalThis as any).CSS, value);

    return value.replace(/[^a-zA-Z0-9_-]/g, ch => `\\${ ch }`);
}

function isFormControl(element: Element): boolean {
    return FORM_CONTROL_TAGS.has(element.tagName.toLowerCase());
}

function isEmbeddedControl(element: Element): boolean {
    if(isFormControl(element)) return true;

    const role: string | null = element.getAttribute("role");

    return !!role && [
        "textbox",
        "combobox",
        "listbox",
        "spinbutton",
        "slider",
        "progressbar"
    ].includes(role);
}

function append(into: string, piece: string): string {
    if(!piece) return into;
    if(!into) return piece;

    return `${ into } ${ piece }`;
}


const pseudoSupport: WeakMap<Document, boolean> = new WeakMap();

function supportsPseudoStyle(document: Document | null | undefined): boolean {
    if(!document) return false;

    const cached = pseudoSupport.get(document);
    if(cached !== undefined) return cached;

    const view = document.defaultView;
    let isSupported: boolean = !!view && typeof view.getComputedStyle === "function";

    if(isSupported && /\bjsdom\b/i.test(view!.navigator?.userAgent ?? "")) {
        isSupported = false;
    }

    pseudoSupport.set(document, isSupported);

    return isSupported;
}

function pseudoContent(element: Element, pseudo: "::before" | "::after"): string {
    const doc = element.ownerDocument;
    if(!supportsPseudoStyle(doc)) return "";

    try {
        const view = doc!.defaultView!;
        const style = view.getComputedStyle(element, pseudo);
        const content = style.getPropertyValue("content");
        if(!content || content === "none" || content === "normal") return "";

        const m = content.match(/^["'](.*)["']$/);

        return m ? m[1] : "";
    } catch {
        return "";
    }
}


function hostLanguageLabel(element: Element, ctx: Ctx): string {
    const tagName: string = element.tagName.toLowerCase();
    const document: Document = element.ownerDocument;

    if(isFormControl(element) || [
        "meter",
        "progress",
        "output"
    ].includes(tagName)) {
        const id = element.id;
        let text: string = "";

        if(id && document) {
            const labels = document.querySelectorAll(`label[for="${cssEscape(document.defaultView, id)}"]`);
            for(const label of Array.from(labels)) {
                if(ctx.isHidden(label)) continue;

                text = append(text, computeTextAlternative(label, {
                    ...ctx,
                    visited: new Set(ctx.visited),
                    isRoot: false,
                    isReferenced: true
                }));
            }
        }

        const parentLabel = element.closest("label");
        if(parentLabel && !ctx.visited.has(parentLabel)) {
            text = append(text, computeTextAlternative(parentLabel, {
                ...ctx,

                visited: new Set(ctx.visited),
                isRoot: false,
                isReferenced: true
            }));
        }

        if(text) return text;
    }

    if(tagName === "input") {
        const input: HTMLInputElement | null = element as HTMLInputElement;
        const type: string = (input?.getAttribute("type") || "").toLowerCase();

        if(type === "button" || type === "submit" || type === "reset") {
            if(input.value) return input.value;
            if(type === "submit") return "Submit";
            if(type === "reset") return "Reset";

            return "";
        }
        if(type === "image") {
            if(input.alt) return input.alt;
            if(input.value) return input.value;

            const title = (element.getAttribute("title") || "").trim();
            if(title) return title;

            return "Submit Query";
        }
    }

    if(tagName === "img" || tagName === "area") {
        const alt: string | null = element.getAttribute("alt");
        if(alt !== null) return alt;
    }

    if(tagName === "fieldset") {
        const legend: HTMLElement | null = element.querySelector("legend");

        if(legend && !ctx.isHidden(legend)) {
            return computeTextAlternative(legend, {
                ...ctx,

                visited: new Set(ctx.visited),
                isRoot: false,
                isReferenced: true
            });
        }
    }

    if(tagName === "figure") {
        const cap: HTMLElement | null = element.querySelector("figcaption");

        if(cap && !ctx.isHidden(cap)) {
            return computeTextAlternative(cap, {
                ...ctx,

                visited: new Set(ctx.visited),
                isRoot: false,
                isReferenced: true
            });
        }
    }

    if(tagName === "table") {
        for(const child of Array.from(element.children)) {
            if(child.tagName.toLowerCase() === "caption" && !ctx.isHidden(child)) {
                return computeTextAlternative(child, {
                    ...ctx,

                    visited: new Set(ctx.visited),
                    isRoot: false,
                    isReferenced: true
                });
            }
        }
    }

    if(tagName === "svg") {
        for(const child of Array.from(element.children)) {
            if(child.tagName.toLowerCase() === "title") return (child.textContent || "").trim();
        }
    }

    return "";
}


export function computeTextAlternative(element: Element, ctx: Ctx): string {
    if(ctx.visited.has(element)) return "";

    ctx.visited.add(element);

    if(ctx.isHidden(element) && !ctx.isReferenced) return "";

    if(ctx.isRoot) {
        const ids: string = (element.getAttribute("aria-labelledby") || "").trim();

        if(ids) {
            const doc = element.ownerDocument;
            let text: string = "";

            for(let id of ids.split(/\s+/)) {
                const ref = doc?.getElementById(id);
                if(!ref) continue;

                text = append(text, computeTextAlternative(ref, {
                    ...ctx,

                    visited: new Set(ctx.visited),
                    isRoot: false,
                    isReferenced: true
                }));
            }

            if(text) return text;
        }
    }

    const ariaLabel: string = (element.getAttribute("aria-label") || "").trim();
    if(ariaLabel) return ariaLabel;

    const role: string = ctx.roleOf(element);

    if(role !== "presentation" && role !== "none") {
        const host: string = hostLanguageLabel(element, ctx);
        if(host) return host;
    }

    if(ctx.isReferenced && isEmbeddedControl(element)) {
        const tagName: string = element.tagName.toLowerCase();

        if(role === "textbox" || [
            "input",
            "textarea"
        ].includes(tagName)) {
            const v = (element as HTMLInputElement).value;
            if(v) return v;
        } else if(role === "combobox" && tagName === "select") {
            const sel = element as HTMLSelectElement;
            const opt = sel.selectedOptions[0];
            if(opt) return (opt.textContent || "").trim();
        } else if([
            "slider",
            "spinbutton",
            "progressbar"
        ].includes(tagName)) {
            const vt = (element.getAttribute("aria-valuetext") || "").trim();
            if(vt) return vt;

            const vn = element.textContent.trim();
            if(vn) return vn;

            if(tagName === "input") {
                const v = (element as HTMLInputElement).value;
                if(v) return v;
            }
        }
    }

    const allowFromContents: boolean = NAME_FROM_CONTENTS_ROLES.has(role) || ctx.isReferenced;

    if(allowFromContents) {
        let text: string = append("", pseudoContent(element, "::before"));

        for(const node of Array.from(element.childNodes)) {
            if(node.nodeType === 3) {
                const t = (node.textContent || "").replace(/\s+/g, " ");
                text = append(text, t.trim());

                continue;
            }
            if(node.nodeType === 1) {
                text = append(text, computeTextAlternative(node as Element, {
                    ...ctx,

                    isRoot: false
                }));

                continue;
            }
        }

        text = append(text, pseudoContent(element, "::after"));

        if(text.trim()) return text.trim();
    }

    const title: string = (element.getAttribute("title") || "").trim();
    if(title) return title;

    return "";
}


export function computeDescription(element: Element, name: string, ctx: Omit<Ctx, "visited" | "isReferenced" | "isRoot">): string {
    const describedBy: string = (element.getAttribute("aria-describedby") || "").trim();

    if(describedBy) {
        const document: Document = element.ownerDocument;
        let text: string = "";

        for(let id of describedBy.split(/\s+/)) {
            const ref = document?.getElementById(id);
            if(!ref) continue;

            text = append(text, computeTextAlternative(ref, {
                ...ctx,

                visited: new Set(),
                isRoot: false,
                isReferenced: true
            }));
        }

        if(text) return text;
    }

    const ariaDesc: string = (element.getAttribute("aria-description") || "").trim();
    if(ariaDesc) return ariaDesc;

    const title: string = (element.getAttribute("title") || "").trim();
    if(title && title !== name) return title;

    return "";
}