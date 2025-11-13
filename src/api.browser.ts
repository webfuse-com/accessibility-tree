// -------------------------------------
// Copyright (c) Thassilo M. Schiepanski
// -------------------------------------


import { AccessibilityTree } from "./AccessibilityTree.js";


declare global {
    interface Window {
        AccessibilityTree: any;
    }
}


window.AccessibilityTree = AccessibilityTree;