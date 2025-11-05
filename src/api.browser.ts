// -------------------------------------
// Copyright (c) Thassilo M. Schiepanski
// -------------------------------------


import { AccessibilityTree } from "./api.js";


declare global {
    interface Window {
        AccessibilityTree: any;
    }
}


window.AccessibilityTree = AccessibilityTree;