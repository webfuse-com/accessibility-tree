# Accessibility Tree

Create an accessibility tree from a document object model (DOM).

> Closely adopts the [W3C Working Draft: Accessible Name and Description Computation 1.2](https://w3c.github.io/accname/).

## Install

``` html
<script src="https://cdn.jsdelivr.net/gh/webfuse-com/accessibility-tree@main/dist/api.browser.js"></script>
```

## Use

``` js
// const dom = parseDOM("<!DOCTYPE html><html>...</html>");
   const dom = document.documentElement;

// Create tree instance
const accessibilityTree = new AccessibilityTree(dom);

// Build accessibility tree
accessibilityTree.build();

// Work with accessibility tree
const treeStr = accessibilityTree.toString();
                              // .toString(true) // collapse empty properties
/* {
    role: "RootWebArea",
    name: "",
    children: [
        // ...
    ]
    properties: {},
    source: "html",                   // Unique CSS selector
    states: {}
} */
const rootNode = accessibilityTree.toObject();
/* & {
    source: document.documentElement  // Element reference
} */

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

> The role of accessibility tree root nodes is `RootWebArea` as implemented with [Google Chrome](https://developer.chrome.com/blog/full-accessibility-tree). 

## Example

``` html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Pasta</title>
  </head>
  <body>
    <header role="banner">
      <h1>Pasta Lovers</h1>
      <nav aria-label="Main nav">
        <a href="#about">About</a>
        <a href="#recipes">Recipes</a>
      </nav>
    </header>
    <main role="main">
      <section id="about" role="region" aria-labelledby="about-in">
        <h2 id="about-in">About Pasta</h2>
        <img src="pasta.jpg" alt="Bowl of pasta">
        <ul aria-label="Pasta types">
          <li aria-label="Spaghetti">Spaghetti</li>
          <li aria-label="Penne">Penne</li>
          <li aria-label="Farfalle">Farfalle</li>
        </ul>
      </section>
      <section id="recipes" role="region" aria-labelledby="recipes-in">
        <h2 id="recipes-in">Recipes</h2>
        <form aria-describedby="hint">
          <label for="type">Type</label>
          <select id="type" aria-required="true">
            <option>Spaghetti</option>
            <option>Penne</option>
            <option>Farfalle</option>
          </select>
          <div role="group" aria-label="Preferences">
            <label>
              <input type="checkbox" aria-label="Updates">
              Updates
            </label>
          </div>
          <button type="button" aria-controls="out" aria-label="Show recipes">Show</button>
        </form>
      </section>
    </main>
    <footer role="contentinfo" aria-label="Footer">
      <a role="link" tabindex="0">Social</a>
    </footer>
  </body>
</html>
```

``` json
{
  "role": "RootWebArea",
  "source": "html",
  "children": [
    {
      "children": [
        {
          "children": [
            {
              "name": "Pasta Lovers",
              "properties": {
                "level": 1
              },
              "role": "heading",
              "source": "html > body > header > h1"
            },
            {
              "children": [
                {
                  "role": "link",
                  "source": "html > body > header > nav > a:nth-of-type(1)"
                },
                {
                  "role": "link",
                  "source": "html > body > header > nav > a:nth-of-type(2)"
                }
              ],
              "name": "Main nav",
              "properties": {
                "aria-label": "Main nav"
              },
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
                  "name": "About Pasta",
                  "properties": {
                    "level": 2
                  },
                  "role": "heading",
                  "source": "#about-in"
                },
                {
                  "name": "Bowl of pasta",
                  "role": "img",
                  "source": "#about > img"
                },
                {
                  "children": [
                    {
                      "name": "Spaghetti",
                      "properties": {
                        "aria-label": "Spaghetti"
                      },
                      "role": "listitem",
                      "source": "#about > ul > li:nth-of-type(1)"
                    },
                    {
                      "name": "Penne",
                      "properties": {
                        "aria-label": "Penne"
                      },
                      "role": "listitem",
                      "source": "#about > ul > li:nth-of-type(2)"
                    },
                    {
                      "name": "Farfalle",
                      "properties": {
                        "aria-label": "Farfalle"
                      },
                      "role": "listitem",
                      "source": "#about > ul > li:nth-of-type(3)"
                    }
                  ],
                  "name": "Pasta types",
                  "properties": {
                    "aria-label": "Pasta types"
                  },
                  "role": "list",
                  "source": "#about > ul"
                }
              ],
              "name": "About Pasta",
              "properties": {
                "aria-labelledby": "about-in"
              },
              "role": "region",
              "source": "#about"
            },
            {
              "children": [
                {
                  "name": "Recipes",
                  "properties": {
                    "level": 2
                  },
                  "role": "heading",
                  "source": "#recipes-in"
                },
                {
                  "children": [
                    {
                      "role": "generic",
                      "source": "#recipes > form > label"
                    },
                    {
                      "children": [
                        {
                          "role": "generic",
                          "source": "#type > option:nth-of-type(1)"
                        },
                        {
                          "role": "generic",
                          "source": "#type > option:nth-of-type(2)"
                        },
                        {
                          "role": "generic",
                          "source": "#type > option:nth-of-type(3)"
                        }
                      ],
                      "properties": {
                        "aria-required": "true"
                      },
                      "role": "generic",
                      "source": "#type"
                    },
                    {
                      "children": [
                        {
                          "children": [
                            {
                              "name": "Updates",
                              "properties": {
                                "aria-label": "Updates"
                              },
                              "role": "checkbox",
                              "source": "#recipes > form > div > label > input",
                              "states": {
                                "checked": false
                              }
                            }
                          ],
                          "role": "generic",
                          "source": "#recipes > form > div > label"
                        }
                      ],
                      "name": "Preferences",
                      "properties": {
                        "aria-label": "Preferences"
                      },
                      "role": "group",
                      "source": "#recipes > form > div"
                    },
                    {
                      "name": "Show recipes",
                      "properties": {
                        "aria-controls": "out",
                        "aria-label": "Show recipes"
                      },
                      "role": "button",
                      "source": "#recipes > form > button"
                    }
                  ],
                  "properties": {
                    "aria-describedby": "hint"
                  },
                  "role": "generic",
                  "source": "#recipes > form"
                }
              ],
              "name": "Recipes",
              "properties": {
                "aria-labelledby": "recipes-in"
              },
              "role": "region",
              "source": "#recipes"
            }
          ],
          "role": "main",
          "source": "html > body > main"
        },
        {
          "children": [
            {
              "role": "link",
              "source": "html > body > footer > a"
            }
          ],
          "name": "Footer",
          "properties": {
            "aria-label": "Footer"
          },
          "role": "contentinfo",
          "source": "html > body > footer"
        }
      ],
      "role": "generic",
      "source": "html > body"
    }
  ]
}
```