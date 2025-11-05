import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

import { JSDOM } from "jsdom";

import { AccessibilityTree } from "../dist/api.js";


const dom = new JSDOM(
    readFileSync(join(import.meta.dirname, "dom.html")).toString()
).window.document.documentElement;

const accessibilityTree = new AccessibilityTree(dom);


assertEqual(accessibilityTree.toObject(), null, "Invalid empty accessibility tree object");


accessibilityTree.build();

writeFileSync(join(import.meta.dirname, "dom.tree.json"), JSON.stringify(accessibilityTree.toObject(), null, 4));
assertEqual(
    JSON.parse(JSON.stringify(accessibilityTree.toObject())),
    {
        "children": [
            {
                "role": "generic",
                "name": "",
                "description": "",
                "states": {},
                "properties": {},
                "children": [
                    {
                        "role": "banner",
                        "name": "",
                        "description": "",
                        "states": {},
                        "properties": {},
                        "children": [
                            {
                                "role": "heading",
                                "name": "Pasta Lovers",
                                "description": "",
                                "states": {},
                                "properties": {
                                    "level": 1
                                },
                                "children": [],
                                "source": {}
                            },
                            {
                                "role": "navigation",
                                "name": "Main navigation",
                                "description": "",
                                "states": {},
                                "properties": {},
                                "children": [
                                    {
                                        "role": "link",
                                        "name": "",
                                        "description": "",
                                        "states": {},
                                        "properties": {},
                                        "children": [],
                                        "source": {}
                                    },
                                    {
                                        "role": "link",
                                        "name": "",
                                        "description": "",
                                        "states": {},
                                        "properties": {},
                                        "children": [],
                                        "source": {}
                                    }
                                ],
                                "source": {}
                            }
                        ],
                        "source": {}
                    },
                    {
                        "role": "main",
                        "name": "",
                        "description": "",
                        "states": {},
                        "properties": {},
                        "children": [
                            {
                                "role": "region",
                                "name": "All about Pasta",
                                "description": "",
                                "states": {},
                                "properties": {},
                                "children": [
                                    {
                                        "role": "img",
                                        "name": "A bowl of pasta",
                                        "description": "",
                                        "states": {},
                                        "properties": {},
                                        "children": [],
                                        "source": {}
                                    },
                                    {
                                        "role": "heading",
                                        "name": "All about Pasta",
                                        "description": "",
                                        "states": {},
                                        "properties": {
                                            "level": 1
                                        },
                                        "children": [],
                                        "source": {}
                                    },
                                    {
                                        "role": "generic",
                                        "name": "",
                                        "description": "",
                                        "states": {},
                                        "properties": {},
                                        "children": [],
                                        "source": {}
                                    },
                                    {
                                        "role": "list",
                                        "name": "",
                                        "description": "",
                                        "states": {},
                                        "properties": {},
                                        "children": [
                                            {
                                                "role": "listitem",
                                                "name": "",
                                                "description": "",
                                                "states": {},
                                                "properties": {},
                                                "children": [],
                                                "source": {}
                                            },
                                            {
                                                "role": "listitem",
                                                "name": "",
                                                "description": "",
                                                "states": {},
                                                "properties": {},
                                                "children": [],
                                                "source": {}
                                            },
                                            {
                                                "role": "listitem",
                                                "name": "",
                                                "description": "",
                                                "states": {},
                                                "properties": {},
                                                "children": [],
                                                "source": {}
                                            }
                                        ],
                                        "source": {}
                                    }
                                ],
                                "source": {}
                            },
                            {
                                "role": "region",
                                "name": "Find a Recipe",
                                "description": "",
                                "states": {},
                                "properties": {},
                                "children": [
                                    {
                                        "role": "heading",
                                        "name": "Find a Recipe",
                                        "description": "",
                                        "states": {},
                                        "properties": {
                                            "level": 2
                                        },
                                        "children": [],
                                        "source": {}
                                    },
                                    {
                                        "role": "generic",
                                        "name": "",
                                        "description": "Choose a pasta type to find matching recipes.",
                                        "states": {},
                                        "properties": {},
                                        "children": [
                                            {
                                                "role": "generic",
                                                "name": "",
                                                "description": "",
                                                "states": {},
                                                "properties": {},
                                                "children": [],
                                                "source": {}
                                            },
                                            {
                                                "role": "generic",
                                                "name": "",
                                                "description": "",
                                                "states": {},
                                                "properties": {},
                                                "children": [],
                                                "source": {}
                                            },
                                            {
                                                "role": "generic",
                                                "name": "",
                                                "description": "",
                                                "states": {},
                                                "properties": {},
                                                "children": [
                                                    {
                                                        "role": "generic",
                                                        "name": "",
                                                        "description": "",
                                                        "states": {},
                                                        "properties": {},
                                                        "children": [],
                                                        "source": {}
                                                    },
                                                    {
                                                        "role": "generic",
                                                        "name": "",
                                                        "description": "",
                                                        "states": {},
                                                        "properties": {},
                                                        "children": [],
                                                        "source": {}
                                                    },
                                                    {
                                                        "role": "generic",
                                                        "name": "",
                                                        "description": "",
                                                        "states": {},
                                                        "properties": {},
                                                        "children": [],
                                                        "source": {}
                                                    }
                                                ],
                                                "source": {
                                                    "0": {},
                                                    "1": {},
                                                    "2": {}
                                                }
                                            },
                                            {
                                                "role": "button",
                                                "name": "Show pasta recipes",
                                                "description": "",
                                                "states": {},
                                                "properties": {},
                                                "children": [],
                                                "source": {}
                                            }
                                        ],
                                        "source": {}
                                    },
                                    {
                                        "role": "status",
                                        "name": "",
                                        "description": "",
                                        "states": {},
                                        "properties": {},
                                        "children": [],
                                        "source": {}
                                    }
                                ],
                                "source": {}
                            }
                        ],
                        "source": {}
                    },
                    {
                        "role": "contentinfo",
                        "name": "",
                        "description": "",
                        "states": {},
                        "properties": {},
                        "children": [
                            {
                                "role": "generic",
                                "name": "",
                                "description": "",
                                "states": {},
                                "properties": {},
                                "children": [],
                                "source": {}
                            }
                        ],
                        "source": {}
                    }
                ],
                "source": {}
            }
        ],
        "name": "",
        "properties": {},
        "role": "RootWebArea",
        "source": {},
        "states": {}
    },
    "Invalid accessibility tree object"
);