// -------------------------------------
// Copyright (c) Thassilo M. Schiepanski
// -------------------------------------


import { JSDOM } from "jsdom";


export { AccessibilityTree } from "./AccessibilityTree.js";


export function parseDOM(html: string) {
    return new JSDOM(html).window.document.documentElement;
}