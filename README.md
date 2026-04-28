# Accessibility Tree

Create an accessibility tree from the Document Object Model (DOM).

> Closely modelled after:
> 
> - [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/)
> - [ARIA in HTML](https://www.w3.org/TR/html-aria/)
> - [Accessible Name and Description Computation 1.2](https://www.w3.org/TR/accname-1.2/)

``` js
// Create tree instance
const dom = document;
const accessibilityTree = new AccessibilityTree(dom);

// Build accessibility tree
accessibilityTree.build();

// Serialize accessibility tree
const treeStr = accessibilityTree.toString({
  collapseEmptyProperties: true
});
const treeRoot = accessibilityTree.toObject();

// Find accessibility nodes in the tree
const bannerNodes = accessibilityTree.findByRole("banner");
const allAboutPastaNodes = accessibilityTree.findByName("All about Pasta");

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

``` js
// Use a custom 'source' property
let i = 0;
accessibilityTree.toString({
  sourceStringCb: element => `${element.tagName.toUpperCase()}-${i++}`
});
```

> The role of accessibility tree root nodes is `RootWebArea`, which resembles [Google Chrome](https://developer.chrome.com/blog/full-accessibility-tree)'s implementation. 

### Integrate

#### Browser

``` html
<script src="https://cdn.jsdelivr.net/gh/webfuse-com/accessibility-tree@main/dist/api.browser.js"></script>
```

``` js
// From string:
const dom = new DOMParser().parseFromString("<!DOCTYPE html><html>...</html>", "text/html");
```

#### Module

``` console
npm install webfuse-com/accessibility-tree
```

> Install [jsdom](https://github.com/jsdom/jsdom) to use the library with Node.js:
> ``` console
> npm install jsdom
> ```

``` js
import { AccessibilityTree, parseDOM } from "@webfuse-com/accessibility-tree";
```

``` js
// From string:
const dom = await parseDOM("<!DOCTYPE html><html>...</html>");
```

### Example

``` html
<html lang="en">
  <head><title>Pasta Heaven</title></head>
  <body>
      <header>
          <h1>Order a Pasta Dish</h1>
          <nav aria-label="Main"><a href="#x">About Our Restaurant</a></nav>
      </header>
      <main>
          <section aria-labelledby="t">
              <h2 id="t">Place Your Order</h2>
              <img src="p.jpg" alt="Bowl of pasta">
              <span aria-hidden="true">No. 192128</span>
              <form aria-describedby="hint">
                  <p id="hint">Pick your pasta dish:</p>
                  <label for="kind">Type</label>
                  <input id="kind" type="text" value="Penne" required>
                  <input type="range" min="0" max="10" value="7" aria-label="Servings">
                  <label>
                    <input type="checkbox" checked>
                    Spicy
                  </label>
                  <button aria-pressed="true" aria-controls="out">Save</button>
              </form>
          </section>
      </main>
      <footer aria-label="Site footer">© 2025 | Pasta Heaven</footer>
  </body>
</html>
```

``` json
{
  "children": [
    {
      "children": [
        {
          "name": "Order a Pasta Dish",
          "properties": {
            "level": 1
          },
          "role": "heading",
          "source": "html > body > header > h1"
        },
        {
          "children": [
            {
              "name": "About Our Restaurant",
              "role": "link",
              "source": "html > body > header > nav > a"
            }
          ],
          "name": "Main",
          "role": "navigation",
          "source": "html > body > header > nav"
        }
      ],
      "role": "banner",
      "source": "html > body > header"
    },
    {
      "children": [
        {
          "children": [
            {
              "name": "Place Your Order",
              "properties": {
                "level": 2
              },
              "role": "heading",
              "source": "#t"
            },
            {
              "name": "Bowl of pasta",
              "role": "img",
              "source": "html > body > main > section > img"
            },
            {
              "children": [
                {
                  "name": "Pick your pasta dish:",
                  "role": "paragraph",
                  "source": "#hint"
                },
                {
                  "name": "Type",
                  "role": "generic",
                  "source": "html > body > main > section > form > label:nth-of-type(1)"
                },
                {
                  "name": "Type",
                  "properties": {
                    "required": true
                  },
                  "role": "textbox",
                  "source": "#kind",
                  "value": "Penne"
                },
                {
                  "name": "Servings",
                  "properties": {
                    "valuemin": 0,
                    "valuemax": 10,
                    "valuenow": 7
                  },
                  "role": "slider",
                  "source": "html > body > main > section > form > input:nth-of-type(2)",
                  "value": "7"
                },
                {
                  "children": [
                    {
                      "name": "Spicy",
                      "role": "checkbox",
                      "source": "html > body > main > section > form > label:nth-of-type(2) > input",
                      "states": {
                        "checked": true
                      }
                    }
                  ],
                  "name": "Spicy",
                  "role": "generic",
                  "source": "html > body > main > section > form > label:nth-of-type(2)"
                },
                {
                  "name": "Save",
                  "properties": {
                    "controls": [
                      "out"
                    ]
                  },
                  "role": "button",
                  "source": "html > body > main > section > form > button",
                  "states": {
                    "pressed": true
                  }
                }
              ],
              "role": "generic",
              "source": "html > body > main > section > form",
              "description": "Pick your pasta dish:"
            }
          ],
          "name": "Place Your Order",
          "role": "region",
          "source": "html > body > main > section"
        }
      ],
      "role": "main",
      "source": "html > body > main"
    },
    {
      "name": "Site footer",
      "role": "contentinfo",
      "source": "html > body > footer"
    }
  ],
  "name": "Pasta Heaven",
  "role": "RootWebArea",
  "source": "html"
}
```