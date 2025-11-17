// -------------------------------------
// Copyright (c) Thassilo M. Schiepanski
// -------------------------------------


export { AccessibilityTree } from "./AccessibilityTree.js";


export async function parseDOM(html: string) {
    try {
        const { JSDOM } = await import("jsdom");

        return new JSDOM(html)
            .window
            .document
            .documentElement;
    } catch(err) {
        if((err as Error & { code: string })?.code !== "ERR_MODULE_NOT_FOUND") throw err;

        throw new ReferenceError("Install jsdom@22.1.0 to use accessibility tree with Node.js");
    }
}