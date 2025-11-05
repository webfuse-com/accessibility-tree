import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

import { JSDOM } from "jsdom";

import { AccessibilityTree } from "../dist/api.js";


const dom = new JSDOM(
    readFileSync(join(import.meta.dirname, "dom.html")).toString()
).window.document.documentElement;

const expectedDOMTree = readFileSync(join(import.meta.dirname, "dom.tree.expected.json")).toString();


const accessibilityTree = new AccessibilityTree(dom);

assertEqual(accessibilityTree.toObject(), null, "Invalid empty accessibility tree object");


accessibilityTree.build();

const accessibilityTreeObject = accessibilityTree.toObject();
const accessibilityTreeString = accessibilityTree.toString();

writeFileSync(join(import.meta.dirname, "dom.tree.actual.json"), accessibilityTree.toString());

assertEqual(accessibilityTreeObject.source, dom, "Invalid accessibility tree RootWebArea source");

assertEqual(
    JSON.parse(JSON.stringify(accessibilityTreeObject)),
    JSON.parse(expectedDOMTree),
    "Invalid accessibility tree object (object; flattened)"
);

assertEqual(
    accessibilityTreeString,
    expectedDOMTree,
    "Invalid accessibility tree object (string)"
);