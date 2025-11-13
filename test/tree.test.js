import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

import { parseDOM, AccessibilityTree } from "../dist/api.js";


const dom = parseDOM(readFileSync(join(import.meta.dirname, "dom.html")).toString());

const expectedTreeObject = readFileSync(join(import.meta.dirname, "tree.expected.object.json")).toString();
const expectedTreeString = readFileSync(join(import.meta.dirname, "tree.expected.string.json")).toString();
const expectedTreeCollapsed = readFileSync(join(import.meta.dirname, "tree.expected.collapsed.json")).toString();


const accessibilityTree = new AccessibilityTree(dom);

assertEqual(accessibilityTree.toObject(), null, "Invalid empty accessibility tree object");


accessibilityTree.build();

const actualTreeObject = accessibilityTree.toObject();
const actualTreeString = accessibilityTree.toString();
const actualTreeCollapsed = accessibilityTree.toString(true);

writeFileSync(join(import.meta.dirname, "tree.actual.object.json"), JSON.stringify(actualTreeObject, null, 4));
writeFileSync(join(import.meta.dirname, "tree.actual.string.json"), actualTreeString);
writeFileSync(join(import.meta.dirname, "tree.actual.collapsed.json"), actualTreeCollapsed);

assertEqual(actualTreeObject.source, dom, "Invalid accessibility tree RootWebArea source");

assertEqual(
    JSON.parse(JSON.stringify(actualTreeObject)),
    JSON.parse(expectedTreeObject),
    "Invalid accessibility tree object (object; flattened)"
);

assertEqual(
    actualTreeString,
    expectedTreeString,
    "Invalid accessibility tree object (string)"
);

assertEqual(
    expectedTreeCollapsed,
    expectedTreeCollapsed,
    "Invalid accessibility tree object (string, collapsed)"
);


const accessibilityNodesByRole = accessibilityTree.findByRole("banner");

assertEqual(
    accessibilityNodesByRole.length,
    1,
    "Invalid findByRole accessibility nodes count"
);

assertEqual(
    accessibilityNodesByRole[0].children.length,
    2,
    "Invalid findByRole first accessibility node name children count"
);

assertEqual(
    accessibilityNodesByRole[0].name,
    "",
    "Invalid findByRole first accessibility node name"
);

assertEqual(
    accessibilityNodesByRole[0].property,
    undefined,
    "Invalid findByRole first accessibility node property"
);

assertEqual(
    accessibilityNodesByRole[0].role,
    "banner",
    "Invalid findByRole first accessibility node role"
);

assertEqual(
    accessibilityNodesByRole[0].source.toString(),
    "[object HTMLElement]",
    "Invalid findByRole first accessibility node source"
);

assertEqual(
    accessibilityNodesByRole[0].states,
    {
        disabled: undefined,
        expanded: undefined
    },
    "Invalid findByRole first accessibility node states"
);

assertEqual(
    accessibilityNodesByRole[0].description,
    "",
    "Invalid findByRole first accessibility node description"
);

assertEqual(
    accessibilityNodesByRole[0].value,
    undefined,
    "Invalid findByRole first accessibility node value"
);


const accessibilityNodesByName = accessibilityTree.findByName("All about Pasta");

assertEqual(
    accessibilityNodesByName.length,
    2,
    "Invalid findByName accessibility nodes count"
);

assertEqual(
    accessibilityNodesByName[0].children.length,
    4,
    "Invalid findByName first accessibility node name children count"
);

assertEqual(
    accessibilityNodesByName[0].name,
    "All about Pasta",
    "Invalid findByName first accessibility node name"
);

assertEqual(
    accessibilityNodesByName[0].property,
    undefined,
    "Invalid findByName first accessibility node property"
);

assertEqual(
    accessibilityNodesByName[0].role,
    "region",
    "Invalid findByName first accessibility node role"
);

assertEqual(
    accessibilityNodesByName[0].source.toString(),
    "[object HTMLElement]",
    "Invalid findByName first accessibility node source"
);

assertEqual(
    accessibilityNodesByName[0].states,
    {
        disabled: undefined,
        expanded: undefined
    },
    "Invalid findByName first accessibility node states"
);

assertEqual(
    accessibilityNodesByName[0].description,
    "",
    "Invalid findByName first accessibility node description"
);

assertEqual(
    accessibilityNodesByName[0].value,
    undefined,
    "Invalid findByName first accessibility node value"
);