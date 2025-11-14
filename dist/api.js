// src/api.ts
import { JSDOM } from "jsdom";

// src/AccessibilityNode.ts
var AccessibilityNode = class _AccessibilityNode {
  static getUniqueSelector(element) {
    if (!element.nodeName) return null;
    const parts = [];
    let currentElement = element;
    while (currentElement) {
      if (currentElement.id) {
        parts.unshift(`#${currentElement.id}`);
        break;
      }
      const selector = [
        currentElement.nodeName.toLowerCase(),
        ...currentElement.classList.length ? [
          ".",
          ...currentElement.classList
        ].join(".") : []
      ];
      if (currentElement.parentNode) {
        const siblings = Array.from(currentElement.parentNode.children).filter((el) => el.nodeName === currentElement.nodeName);
        siblings.length > 1 && selector.push(`:nth-of-type(${siblings.indexOf(currentElement) + 1})`);
      }
      parts.unshift(selector.join(""));
      currentElement = currentElement.parentElement;
    }
    return parts.join(" > ");
  }
  static modify(obj, collapseEmptyProperties) {
    const newObj = {};
    for (let prop in obj) {
      if (prop === "source") {
        newObj[prop] = _AccessibilityNode.getUniqueSelector(obj[prop]);
        continue;
      }
      if (prop === "children") {
        if ((obj[prop] ?? []).length) {
          newObj[prop] = obj[prop].map((child) => _AccessibilityNode.modify(child, collapseEmptyProperties));
        }
        continue;
      }
      if (collapseEmptyProperties && (obj[prop] === null || obj[prop] === void 0 || Array.isArray(obj[prop]) && !obj[prop].length || typeof obj[prop] === "string" && !obj[prop].trim().length || Object.getPrototypeOf(obj[prop]).constructor.name === "Object" && !Object.keys(obj[prop]).length)) continue;
      newObj[prop] = obj[prop];
    }
    return newObj;
  }
  children;
  name;
  properties;
  role;
  source;
  states;
  description;
  value;
  constructor(children, name, role, properties, source, states, description, value) {
    this.children = children;
    this.name = name;
    this.role = role;
    this.properties = properties;
    this.source = source;
    this.states = states;
    this.description = description;
    this.value = value;
  }
  toString(collapseEmptyProperties = false) {
    const obj = {
      children: this.children,
      name: this.name,
      role: this.role,
      properties: this.properties,
      source: this.source,
      states: this.states,
      description: this.description,
      value: this.value
    };
    return JSON.stringify(
      _AccessibilityNode.modify(obj, collapseEmptyProperties),
      null,
      4
    );
  }
};

// src/AccessibilityTree.ts
var AccessibilityTree = class {
  root;
  rootWebArea = null;
  constructor(root) {
    this.root = root;
  }
  // PUBLIC
  toObject() {
    return this.rootWebArea;
  }
  toString(collapseEmptyProperties = false) {
    return this.rootWebArea ? this.rootWebArea.toString(collapseEmptyProperties) : "{}";
  }
  build() {
    this.rootWebArea = new AccessibilityNode(
      this.buildTree(this.root),
      this.root?.title ?? "",
      "RootWebArea",
      {},
      this.root?.documentElement ?? this.root,
      {}
    );
    return this;
  }
  traverse(nodeCb) {
    if (!this.rootWebArea) return;
    const traverseNode = (node, depth, parent) => {
      nodeCb(node, depth, parent);
      for (let child of node.children) {
        traverseNode(child, depth + 1, node);
      }
    };
    traverseNode(this.rootWebArea, 0);
  }
  findByRole(role) {
    const matches = [];
    this.traverse((node) => {
      if (node.role !== role) return;
      matches.push(node);
    });
    return matches;
  }
  findByName(text) {
    const matches = [];
    this.traverse((node) => {
      if (!node.name || !node.name.toLowerCase().includes(text.toLowerCase())) return;
      matches.push(node);
    });
    return matches;
  }
  // PRIVATE
  buildTree(root) {
    const start = root.documentElement ? root.body || root.documentElement : root;
    const result = [];
    for (let element of Array.from(start.children)) {
      const node = this.elementToAccessibilityNode(element, /* @__PURE__ */ new Set());
      node && result.push(node);
    }
    return result;
  }
  elementToAccessibilityNode(element, owningChain) {
    if (this.isHidden(element)) return null;
    const role = (element.getAttribute("role") || "").trim() || this.getImplicitRole(element);
    if (["none", "presentation"].includes(role)) {
      const children2 = [];
      for (let childElement of Array.from(element.children)) {
        const childNode = this.elementToAccessibilityNode(childElement, owningChain);
        if (childNode) children2.push(childNode);
      }
      if (children2.length === 0) return null;
      if (children2.length === 1) return children2[0];
      return new AccessibilityNode(children2, "", "group", {}, element, {});
    }
    const name = this.computeAccessibleName(element, /* @__PURE__ */ new Set());
    const description = this.computeAccessibleDescription(element, /* @__PURE__ */ new Set());
    const states = this.computeStates(element, role);
    const properties = this.computeProperties(element, role);
    const children = [];
    if (!this.isLeafRole(role)) {
      for (let childElement of Array.from(element.children)) {
        const childNode = this.elementToAccessibilityNode(childElement, owningChain);
        childNode && children.push(childNode);
      }
    }
    const owns = (element.getAttribute("aria-owns") || "").trim();
    for (let id of (owns ?? "").split(/\s+/)) {
      const owned = element.ownerDocument?.getElementById(id);
      if (!owned || owningChain.has(owned)) continue;
      owningChain.add(owned);
      const ownedNode = this.elementToAccessibilityNode(owned, owningChain);
      owningChain.delete(owned);
      if (ownedNode) children.push(ownedNode);
    }
    const value = this.computeValue(element, role);
    return new AccessibilityNode(children, name, role, properties, element, states, description, value);
  }
  isHidden(element) {
    if (element.hidden) return true;
    if (element.getAttribute("aria-hidden") === "true") return true;
    try {
      const view = element.ownerDocument?.defaultView;
      if (view) {
        const style = view.getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") {
          return true;
        }
      }
    } catch {
    }
    return false;
  }
  getImplicitRole(element) {
    const tagName = element.tagName.toLowerCase();
    if (tagName === "a" && element.hasAttribute("href")) return "link";
    if (tagName === "button") return "button";
    if (tagName === "img") return "img";
    if (/^h[1-6]$/.test(tagName)) return "heading";
    if (tagName === "ul" || tagName === "ol") return "list";
    if (tagName === "li") return "listitem";
    if (tagName === "nav") return "navigation";
    if (tagName === "main") return "main";
    if (tagName === "header") return "banner";
    if (tagName === "footer") return "contentinfo";
    if (tagName === "section" || tagName === "article") return "region";
    if (tagName !== "input") return "generic";
    const type = (element.type || "").toLowerCase();
    if (["button", "submit", "reset", "image"].includes(type)) return "button";
    if (type === "checkbox") return "checkbox";
    if (type === "radio") return "radio";
    if (type === "range") return "slider";
    return "textbox";
  }
  isLeafRole(role) {
    return [
      "button",
      "checkbox",
      "img",
      "option",
      "radio",
      "slider",
      "textbox"
    ].includes(role);
  }
  computeAccessibleName(element, visited) {
    if (visited.has(element)) return "";
    visited.add(element);
    const labelledBy = (element.getAttribute("aria-labelledby") || "").trim();
    if (labelledBy) {
      const parts = [];
      for (let id of labelledBy.split(/\s+/)) {
        const referenced = element.ownerDocument?.getElementById(id);
        if (!referenced || this.isHidden(referenced)) continue;
        parts.push(this.computeText(referenced, new Set(visited)));
      }
      if (parts.length) return parts.join(" ").trim();
    }
    const ariaLabel = (element.getAttribute("aria-label") || "").trim();
    if (ariaLabel) return ariaLabel;
    const hostLanguageName = this.hostLanguageName(element);
    if (hostLanguageName) return hostLanguageName;
    const title = (element.getAttribute("title") || "").trim();
    if (title) return title;
    return this.computeText(element, new Set(visited));
  }
  computeAccessibleDescription(element, visited) {
    if (visited.has(element)) return "";
    visited.add(element);
    const describedBy = (element.getAttribute("aria-describedby") || "").trim();
    if (!describedBy) {
      return (element.getAttribute("title") || "").trim();
    }
    const parts = [];
    for (let id of describedBy.split(/\s+/)) {
      const referenced = element.ownerDocument?.getElementById(id);
      if (!referenced || this.isHidden(referenced)) continue;
      parts.push(this.computeText(referenced, new Set(visited)));
    }
    return parts.join(" ").trim();
  }
  computeText(element, visited) {
    if (this.isHidden(element)) return "";
    if (visited.has(element)) return "";
    visited.add(element);
    const text = [];
    for (let node of Array.from(element.childNodes)) {
      if (node.nodeType === 3) {
        text.push(node.textContent || "");
        continue;
      }
      if (node.nodeType === 1) {
        text.push(` ${this.computeText(node, new Set(visited))}`);
        continue;
      }
    }
    return text.join("").trim();
  }
  hostLanguageName(element) {
    const tagName = element.tagName.toLowerCase();
    if (tagName === "img") {
      return (element.getAttribute("alt") || "").trim();
    }
    if (tagName === "button" || /^h\d+$/.test(tagName)) {
      return (element.textContent || "").trim();
    }
    if (tagName !== "input") return "";
    const inputElement = element;
    if (["button", "submit", "reset"].includes(inputElement.type) && inputElement.value) {
      return inputElement.value;
    }
    return inputElement.getAttribute("placeholder") ?? "";
  }
  computeStates(element, role) {
    const aria = (name) => (element.getAttribute(name) || "").trim();
    const states = {};
    const disabled = aria("aria-disabled") === "true";
    if (disabled) {
      states.disabled = disabled;
    }
    const expanded = aria("aria-expanded") === "true";
    if (expanded) {
      states.expanded = expanded;
    }
    if (role === "checkbox") {
      states.checked = aria("aria-checked") === "true" || element.checked || false;
    }
    return states;
  }
  computeProperties(element, role) {
    const properties = {};
    if (role === "heading") {
      const match = element.tagName.toLowerCase().match(/^h([1-6])$/);
      properties.level = match ? parseInt(match[1]) : properties.level;
    }
    Array.from(element.attributes).filter((attr) => /^aria\-.+$/i.test(attr.name)).forEach((attr) => {
      properties[attr.name] = attr.value;
    });
    return properties;
  }
  computeValue(element, role) {
    const value = element.getAttribute("aria-valuenow");
    if (value) return value;
    if (role === "textbox") return element.value || void 0;
    return void 0;
  }
};

// src/api.ts
function parseDOM(html) {
  return new JSDOM(html).window.document.documentElement;
}
export {
  AccessibilityTree,
  parseDOM
};
