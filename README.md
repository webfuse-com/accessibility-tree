# Accessibility Tree

Create an accessibility tree from a document object model (DOM).

> The implementation closely adopts the [W3C Working Draft: Accessible Name and Description Computation 1.2](https://w3c.github.io/accname/).

## Install

``` html
<script src="https://cdn.jsdelivr.net/gh/webfuse-com/accessibility-tree@main/dist/api.browser.js"></script>
```

## Use

``` js
// Create tree instance
const accessibilityTree = new AccessibilityTree(document.documentElement);

// Build accessibility tree
accessibilityTree.build();

// Work with accessibility tree
const treeStr = accessibilityTree.toString();
const rootNode = accessibilityTree.toObject();
/* {
    role: "RootWebArea",
    name: "",
    children: [
        // ...
    ]
    properties: {},
    source: document.documentElement,
    states: {}
} */

// Update accessibility tree to reflect latest DOM state
accessibilityTree.build();

// ...
```

``` ts
type AccessibilityNode = {
    children: AccessibilityNode[];
    name: string;
    properties: Record<string, unknown>;
    role: string;
    source: Element;
    states: Record<string, boolean | undefined>;

    description?: string;
    value?: string;
};
```

## Example

``` html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>All about Pasta</title>
        <script src="/pasta.js"></script>
        <style>
            #banner { display: none; }
        </style>
    </head>
    <body>
        <header role="banner">
            <h1>Pasta Lovers</h1>
            <nav aria-label="Main navigation">
                <a href="#about">About</a>
                <a href="#recipes">Recipes</a>
            </nav>
        </header>
        <main role="main">
            <div id="banner" role="region" aria-live="polite" aria-label="Promotional banner">
                <a href="/history">Learn more</a> about pasta.
            </div>
            <section class="hero" id="about" aria-labelledby="about-title">
                <img src="pasta.jpg" alt="A bowl of pasta">
                <h1 id="about-title">All about Pasta</h1>
                <p>Pasta is delicious and comes in many shapes:</p>
                <ul>
                    <li>Spaghetti – Great with tomato sauce.</li>
                    <li>Penne – Perfect for baked dishes.</li>
                    <li>Farfalle – Fun bow-tie pasta.</li>
                </ul>
            </section>
            <section id="recipes-section" aria-labelledby="recipes-title">
                <h2 id="recipes-title">Find a Recipe</h2>
                <form aria-describedby="recipe-hint">
                    <p id="recipe-hint">Choose a pasta type to find matching recipes.</p>
                    <label for="order">Choose pasta recipes:</label>
                    <select id="order" aria-required="true">
                        <option>Spaghetti</option>
                        <option>Penne</option>
                        <option>Farfalle</option>
                    </select>
                    <button
                        type="button"
                        onclick="PASTA.showRecipes()"
                        aria-controls="recipe-results"
                        aria-label="Show pasta recipes">
                        Show Recipes
                    </button>
                </form>
                <div id="recipe-results" role="status" aria-live="polite"></div>
            </section>
        </main>
        <footer role="contentinfo">
            <span>&copy; All about Pasta</span>
        </footer>
    </body>
</html>
```

``` json
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
}
```