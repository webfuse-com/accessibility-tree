// -------------------------------------
// Copyright (c) Thassilo M. Schiepanski
// -------------------------------------


import { AccessibilityTree } from "./api.ts";


declare global {
    interface Window {
        AccessibilityTree: any;
    }
}


window.AccessibilityTree = AccessibilityTree;