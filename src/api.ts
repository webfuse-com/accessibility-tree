// -------------------------------------
// Copyright (c) Thassilo M. Schiepanski
// -------------------------------------


export { AccessibilityTree } from "./AccessibilityTree.js";


export async function parseDOM(html: string) {
    const { JSDOM } = await import("jsdom");

    return new JSDOM(html)
        .window
        .document
        .documentElement;
}