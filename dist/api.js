// src/AccessibilityNode.ts
var AccessibilityNode = class _AccessibilityNode {
  static cssEscape(value) {
    return globalThis.CSS && typeof globalThis.CSS.escape === "function" ? globalThis.CSS.escape(value) : value.replace(/[^a-zA-Z0-9_-]/g, (ch) => `\\${ch}`);
  }
  static getUniqueSelector(element) {
    if (!element.nodeName) return null;
    const parts = [];
    let currentElement = element;
    while (currentElement) {
      if (currentElement.id) {
        parts.unshift(`#${_AccessibilityNode.cssEscape(currentElement.id)}`);
        break;
      }
      const segments = [
        currentElement.nodeName.toLowerCase(),
        ...Array.from(currentElement.classList).map((c) => `.${_AccessibilityNode.cssEscape(c)}`)
      ];
      if (currentElement.parentNode) {
        const siblings = Array.from(currentElement.parentNode.children).filter((el) => el.nodeName === currentElement.nodeName);
        siblings.length > 1 && segments.push(`:nth-of-type(${siblings.indexOf(currentElement) + 1})`);
      }
      parts.unshift(segments.join(""));
      currentElement = currentElement.parentElement;
    }
    return parts.join(" > ");
  }
  static modifyNodeForString(obj, options = {}) {
    const strObj = {};
    for (const prop in obj) {
      if (prop === "source") {
        strObj[prop] = (options.sourceStringCb ?? _AccessibilityNode.getUniqueSelector).call(null, obj[prop]);
        continue;
      }
      if (prop === "children") {
        if (!(obj[prop] ?? []).length) continue;
        strObj[prop] = obj[prop].map((child) => {
          return _AccessibilityNode.modifyNodeForString(child, options);
        });
        continue;
      }
      if ((options.collapseEmptyProperties ?? false) && (obj[prop] === null || obj[prop] === void 0 || Array.isArray(obj[prop]) && !obj[prop].length || typeof obj[prop] === "string" && !obj[prop].trim().length || Object.getPrototypeOf(obj[prop]).constructor.name === "Object" && !Object.keys(obj[prop]).length)) continue;
      strObj[prop] = obj[prop];
    }
    return strObj;
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
  toString(option = {}) {
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
      _AccessibilityNode.modifyNodeForString(obj, option),
      null,
      2
    );
  }
  toJSON() {
    return _AccessibilityNode.modifyNodeForString({
      children: this.children,
      name: this.name,
      role: this.role,
      properties: this.properties,
      source: this.source,
      states: this.states,
      description: this.description,
      value: this.value
    });
  }
};

// src/roles.ts
var SECTIONING_CONTENT = /* @__PURE__ */ new Set([
  "article",
  "aside",
  "main",
  "nav",
  "section"
]);
var SECTIONING_ROOTS = /* @__PURE__ */ new Set([
  "blockquote",
  "details",
  "dialog",
  "fieldset",
  "figure",
  "td"
]);
var INPUT_BUTTON_TYPES = /* @__PURE__ */ new Set([
  "button",
  "image",
  "reset",
  "submit"
]);
var INPUT_TEXTLIKE_TYPES = /* @__PURE__ */ new Set([
  "email",
  "tel",
  "text",
  "url"
]);
var INPUT_NO_ROLE_TYPES = /* @__PURE__ */ new Set([
  "color",
  "date",
  "datetime-local",
  "file",
  "hidden",
  "month",
  "time",
  "week"
]);
var TH_SCOPE_ROLES = {
  row: "rowheader",
  col: "columnheader",
  rowgroup: "rowheader",
  colgroup: "columnheader"
};
var NO_ROLE = "generic";
var PRESENTATIONAL_ROLES = /* @__PURE__ */ new Set([
  "none",
  "presentation"
]);
var NAME_FROM_CONTENTS_ROLES = /* @__PURE__ */ new Set([
  "button",
  "cell",
  "checkbox",
  "columnheader",
  "gridcell",
  "heading",
  "link",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "option",
  "paragraph",
  "radio",
  "row",
  "rowgroup",
  "rowheader",
  "switch",
  "tab",
  "tooltip",
  "treeitem"
]);
var CHILDREN_PRESENTATIONAL_ROLES = /* @__PURE__ */ new Set([
  "button",
  "checkbox",
  "img",
  "menuitemcheckbox",
  "menuitemradio",
  "meter",
  "option",
  "progressbar",
  "radio",
  "scrollbar",
  "separator",
  "slider",
  "switch",
  "tab"
]);
function hasAncestor(element, tagNames) {
  let current = element.parentElement;
  while (current) {
    if (tagNames.has(current.tagName.toLowerCase())) return true;
    current = current.parentElement;
  }
  return false;
}
function hasListAncestor(element) {
  let current = element.parentElement;
  while (current) {
    const tag = current.tagName.toLowerCase();
    if (tag === "ul" || tag === "ol" || tag === "menu") return true;
    if (current.getAttribute("role") === "list") return true;
    current = current.parentElement;
  }
  return false;
}
function hasAccessibleName(element) {
  return Boolean(
    (element.getAttribute("aria-label") || "").trim() || (element.getAttribute("aria-labelledby") || "").trim() || (element.getAttribute("title") || "").trim()
  );
}
function isInsideSectioning(element) {
  return hasAncestor(element, SECTIONING_CONTENT) || hasAncestor(element, SECTIONING_ROOTS);
}
function isMultiSelect(select) {
  return select.multiple || (select.size ?? 0) > 1;
}
function isInGrid(td) {
  const tableRole = td.closest("table")?.getAttribute("role");
  return tableRole === "grid" || tableRole === "treegrid";
}
function getImplicitInputRole(input) {
  const type = (input.type || "text").toLowerCase();
  const hasList = input.hasAttribute("list");
  if (INPUT_BUTTON_TYPES.has(type)) return "button";
  if (INPUT_NO_ROLE_TYPES.has(type)) return NO_ROLE;
  if (INPUT_TEXTLIKE_TYPES.has(type)) return hasList ? "combobox" : "textbox";
  switch (type) {
    case "checkbox":
      return "checkbox";
    case "radio":
      return "radio";
    case "range":
      return "slider";
    case "number":
      return "spinbutton";
    case "search":
      return hasList ? "combobox" : "searchbox";
    case "password":
      return "textbox";
  }
  return hasList ? "combobox" : "textbox";
}
function getImplicitRole(element) {
  const tag = element.tagName.toLowerCase();
  switch (tag) {
    case "a":
    case "area":
      return element.hasAttribute("href") ? "link" : NO_ROLE;
    case "article":
      return "article";
    case "aside":
      return "complementary";
    case "blockquote":
      return "blockquote";
    case "button":
      return "button";
    case "caption":
      return "caption";
    case "code":
      return "code";
    case "datalist":
      return "listbox";
    case "del":
    case "s":
      return "deletion";
    case "details":
      return "group";
    case "dfn":
      return "definition";
    case "dialog":
      return "dialog";
    case "em":
      return "emphasis";
    case "fieldset":
      return "group";
    case "figure":
      return "figure";
    case "footer":
      return isInsideSectioning(element) ? NO_ROLE : "contentinfo";
    case "form":
      return hasAccessibleName(element) ? "form" : NO_ROLE;
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return "heading";
    case "header":
      return isInsideSectioning(element) ? NO_ROLE : "banner";
    case "hr":
      return "separator";
    case "html":
      return "document";
    case "img":
      return element.getAttribute("alt") === "" && !hasAccessibleName(element) ? "presentation" : "img";
    case "input":
      return getImplicitInputRole(element);
    case "ins":
      return "insertion";
    case "li":
      return hasListAncestor(element) ? "listitem" : NO_ROLE;
    case "main":
      return "main";
    case "mark":
      return "mark";
    case "math":
      return "math";
    case "menu":
      return "list";
    case "meter":
      return "meter";
    case "nav":
      return "navigation";
    case "ol":
    case "ul":
      return "list";
    case "optgroup":
      return "group";
    case "option":
      return "option";
    case "output":
      return "status";
    case "p":
      return "paragraph";
    case "progress":
      return "progressbar";
    case "search":
      return "search";
    case "section":
      return hasAccessibleName(element) ? "region" : NO_ROLE;
    case "select":
      return isMultiSelect(element) ? "listbox" : "combobox";
    case "strong":
      return "strong";
    case "sub":
      return "subscript";
    case "summary":
      return "button";
    case "sup":
      return "superscript";
    case "table":
      return "table";
    case "tbody":
    case "tfoot":
    case "thead":
      return "rowgroup";
    case "td":
      return isInGrid(element) ? "gridcell" : "cell";
    case "textarea":
      return "textbox";
    case "th":
      return TH_SCOPE_ROLES[element.getAttribute("scope") || ""] ?? "columnheader";
    case "time":
      return "time";
    case "tr":
      return "row";
  }
  return NO_ROLE;
}

// src/aria.ts
var STATE_SPECS_TYPE = {
  "aria-busy": "boolean",
  "aria-checked": "tristate",
  "aria-current": "token",
  "aria-disabled": "boolean",
  "aria-expanded": "boolean",
  "aria-grabbed": "boolean",
  "aria-hidden": "boolean",
  "aria-invalid": "token",
  "aria-pressed": "tristate",
  "aria-selected": "boolean"
};
var PROPERTY_SPECS_TYPE = {
  "aria-activedescendant": "id",
  "aria-atomic": "boolean",
  "aria-autocomplete": "token",
  "aria-braillelabel": "string",
  "aria-brailleroledescription": "string",
  "aria-colcount": "integer",
  "aria-colindex": "integer",
  "aria-colindextext": "string",
  "aria-colspan": "integer",
  "aria-controls": "idlist",
  "aria-describedby": "idlist",
  "aria-description": "string",
  "aria-details": "idlist",
  "aria-dropeffect": "tokenlist",
  "aria-errormessage": "id",
  "aria-flowto": "idlist",
  "aria-haspopup": "token",
  "aria-keyshortcuts": "string",
  "aria-label": "string",
  "aria-labelledby": "idlist",
  "aria-level": "integer",
  "aria-live": "token",
  "aria-modal": "boolean",
  "aria-multiline": "boolean",
  "aria-multiselectable": "boolean",
  "aria-orientation": "token",
  "aria-owns": "idlist",
  "aria-placeholder": "string",
  "aria-posinset": "integer",
  "aria-readonly": "boolean",
  "aria-relevant": "tokenlist",
  "aria-required": "boolean",
  "aria-roledescription": "string",
  "aria-rowcount": "integer",
  "aria-rowindex": "integer",
  "aria-rowindextext": "string",
  "aria-rowspan": "integer",
  "aria-setsize": "integer",
  "aria-sort": "token",
  "aria-valuemax": "number",
  "aria-valuemin": "number",
  "aria-valuenow": "number",
  "aria-valuetext": "string"
};
function strip(name) {
  return name.replace(/^aria-/, "");
}
function parseValue(raw, type) {
  const trimmed = raw.trim();
  switch (type) {
    case "boolean":
      if (trimmed === "true") return true;
      if (trimmed === "false") return false;
      return void 0;
    case "tristate":
      if (trimmed === "true") return true;
      if (trimmed === "false") return false;
      if (trimmed === "mixed") return "mixed";
      return void 0;
    case "integer": {
      const n = parseInt(trimmed, 10);
      return Number.isFinite(n) ? n : void 0;
    }
    case "number": {
      const n = parseFloat(trimmed);
      return Number.isFinite(n) ? n : void 0;
    }
    case "idlist":
    case "tokenlist":
      return trimmed ? trimmed.split(/\s+/) : void 0;
    case "id":
    case "token":
    case "string":
    default:
      return trimmed || void 0;
  }
}
function computeAria(element, role) {
  const states = {};
  const properties = {};
  for (const attr of Array.from(element.attributes)) {
    const name = attr.name.toLowerCase();
    if (STATE_SPECS_TYPE[name]) {
      const v = parseValue(attr.value, STATE_SPECS_TYPE[name]);
      v !== void 0 && (states[strip(name)] = v);
      continue;
    }
    if (PROPERTY_SPECS_TYPE[name]) {
      const v = parseValue(attr.value, PROPERTY_SPECS_TYPE[name]);
      v !== void 0 && (properties[strip(name)] = v);
    }
  }
  const tagName = element.tagName.toLowerCase();
  if (states.disabled === void 0 && element.disabled) {
    states.disabled = true;
  }
  if ("required" in element && element.required && properties.required === void 0) {
    properties.required = true;
  }
  if ("readOnly" in element && element.readOnly && properties.readonly === void 0) {
    properties.readonly = true;
  }
  if ([
    "checkbox",
    "radio",
    "switch"
  ].includes(role) && states.checked === void 0) {
    if (tagName === "input") {
      const input = element;
      if (input.indeterminate && role === "checkbox") {
        states.checked = "mixed";
      } else {
        states.checked = input.checked;
      }
    } else {
      states.checked = false;
    }
  }
  if (role === "option" && states.selected === void 0 && tagName === "option") {
    states.selected = element.selected;
  }
  if (role === "heading" && properties.level === void 0) {
    const match = tagName.match(/^h([1-6])$/);
    match && (properties.level = parseInt(match[1], 10));
  }
  if (role === "listitem" && properties.posinset === void 0) {
    const parent = element.parentElement;
    if (parent && (parent.tagName === "OL" || parent.tagName === "UL" || parent.tagName === "MENU")) {
      const items = Array.from(parent.children).filter((c) => c.tagName === "LI");
      const idx = items.indexOf(element);
      if (idx >= 0) {
        properties.posinset = idx + 1;
        properties.setsize = items.length;
      }
    }
  }
  if ([
    "slider",
    "spinbutton",
    "progressbar",
    "meter"
  ].includes(role)) {
    if (tagName === "input") {
      const input = element;
      if (properties.valuemin === void 0 && input.min !== "") {
        properties.valuemin = parseFloat(input.min);
      }
      if (properties.valuemax === void 0 && input.max !== "") {
        properties.valuemax = parseFloat(input.max);
      }
      if (properties.valuenow === void 0 && input.value !== "") {
        properties.valuenow = parseFloat(input.value);
      }
    } else if ([
      "progress",
      "meter"
    ].includes(tagName)) {
      const p = element;
      if (properties.valuenow === void 0) {
        properties.valuenow = p.value;
      }
      if (properties.valuemax === void 0) {
        properties.valuemax = p.max;
      }
      if (tagName === "meter") {
        const m = element;
        if (properties.valuemin === void 0) {
          properties.valuemin = m.min;
        }
      }
    }
  }
  return {
    states,
    properties
  };
}
function computeValue(element, role) {
  const valueText = (element.getAttribute("aria-valuetext") || "").trim();
  if (valueText) return valueText;
  const valueNow = (element.getAttribute("aria-valuenow") || "").trim();
  if (valueNow) return valueNow;
  const tagName = element.tagName.toLowerCase();
  if ([
    "textbox",
    "searchbox"
  ].includes(role)) {
    if ([
      "input",
      "textarea"
    ].includes(tagName)) return element.value || void 0;
    return element.textContent?.trim() || void 0;
  }
  if (role === "combobox" && tagName === "select") {
    const sel = element;
    return sel.selectedOptions[0]?.textContent?.trim() || void 0;
  }
  if ([
    "slider",
    "spinbutton",
    "progressbar",
    "meter"
  ].includes(role)) {
    if (tagName === "input") return element.value || void 0;
    if ([
      "progress",
      "meter"
    ].includes(tagName)) return String(element.value);
  }
  return void 0;
}

// src/accname.ts
var FORM_CONTROL_TAGS = /* @__PURE__ */ new Set(["input", "textarea", "select"]);
function cssEscape(view, value) {
  const fn = view?.CSS?.escape ?? globalThis.CSS?.escape;
  if (typeof fn === "function") return fn.call(view?.CSS ?? globalThis.CSS, value);
  return value.replace(/[^a-zA-Z0-9_-]/g, (ch) => `\\${ch}`);
}
function isFormControl(element) {
  return FORM_CONTROL_TAGS.has(element.tagName.toLowerCase());
}
function isEmbeddedControl(element) {
  if (isFormControl(element)) return true;
  const role = element.getAttribute("role");
  return !!role && [
    "textbox",
    "combobox",
    "listbox",
    "spinbutton",
    "slider",
    "progressbar"
  ].includes(role);
}
function append(into, piece) {
  if (!piece) return into;
  if (!into) return piece;
  return `${into} ${piece}`;
}
var pseudoSupport = /* @__PURE__ */ new WeakMap();
function supportsPseudoStyle(document) {
  if (!document) return false;
  const cached = pseudoSupport.get(document);
  if (cached !== void 0) return cached;
  const view = document.defaultView;
  let isSupported = !!view && typeof view.getComputedStyle === "function";
  if (isSupported && /\bjsdom\b/i.test(view.navigator?.userAgent ?? "")) {
    isSupported = false;
  }
  pseudoSupport.set(document, isSupported);
  return isSupported;
}
function pseudoContent(element, pseudo) {
  const doc = element.ownerDocument;
  if (!supportsPseudoStyle(doc)) return "";
  try {
    const view = doc.defaultView;
    const style = view.getComputedStyle(element, pseudo);
    const content = style.getPropertyValue("content");
    if (!content || content === "none" || content === "normal") return "";
    const m = content.match(/^["'](.*)["']$/);
    return m ? m[1] : "";
  } catch {
    return "";
  }
}
function hostLanguageLabel(element, ctx) {
  const tagName = element.tagName.toLowerCase();
  const document = element.ownerDocument;
  if (isFormControl(element) || [
    "meter",
    "progress",
    "output"
  ].includes(tagName)) {
    const id = element.id;
    let text = "";
    if (id && document) {
      const labels = document.querySelectorAll(`label[for="${cssEscape(document.defaultView, id)}"]`);
      for (const label of Array.from(labels)) {
        if (ctx.isHidden(label)) continue;
        text = append(text, computeTextAlternative(label, {
          ...ctx,
          visited: new Set(ctx.visited),
          isRoot: false,
          isReferenced: true
        }));
      }
    }
    const parentLabel = element.closest("label");
    if (parentLabel && !ctx.visited.has(parentLabel)) {
      text = append(text, computeTextAlternative(parentLabel, {
        ...ctx,
        visited: new Set(ctx.visited),
        isRoot: false,
        isReferenced: true
      }));
    }
    if (text) return text;
  }
  if (tagName === "input") {
    const input = element;
    const type = (input?.getAttribute("type") || "").toLowerCase();
    if (type === "button" || type === "submit" || type === "reset") {
      if (input.value) return input.value;
      if (type === "submit") return "Submit";
      if (type === "reset") return "Reset";
      return "";
    }
    if (type === "image") {
      if (input.alt) return input.alt;
      if (input.value) return input.value;
      const title = (element.getAttribute("title") || "").trim();
      if (title) return title;
      return "Submit Query";
    }
  }
  if (tagName === "img" || tagName === "area") {
    const alt = element.getAttribute("alt");
    if (alt !== null) return alt;
  }
  if (tagName === "fieldset") {
    const legend = element.querySelector("legend");
    if (legend && !ctx.isHidden(legend)) {
      return computeTextAlternative(legend, {
        ...ctx,
        visited: new Set(ctx.visited),
        isRoot: false,
        isReferenced: true
      });
    }
  }
  if (tagName === "figure") {
    const cap = element.querySelector("figcaption");
    if (cap && !ctx.isHidden(cap)) {
      return computeTextAlternative(cap, {
        ...ctx,
        visited: new Set(ctx.visited),
        isRoot: false,
        isReferenced: true
      });
    }
  }
  if (tagName === "table") {
    for (const child of Array.from(element.children)) {
      if (child.tagName.toLowerCase() === "caption" && !ctx.isHidden(child)) {
        return computeTextAlternative(child, {
          ...ctx,
          visited: new Set(ctx.visited),
          isRoot: false,
          isReferenced: true
        });
      }
    }
  }
  if (tagName === "svg") {
    for (const child of Array.from(element.children)) {
      if (child.tagName.toLowerCase() === "title") return (child.textContent || "").trim();
    }
  }
  return "";
}
function computeTextAlternative(element, ctx) {
  if (ctx.visited.has(element)) return "";
  ctx.visited.add(element);
  if (ctx.isHidden(element) && !ctx.isReferenced) return "";
  if (ctx.isRoot) {
    const ids = (element.getAttribute("aria-labelledby") || "").trim();
    if (ids) {
      const doc = element.ownerDocument;
      let text = "";
      for (let id of ids.split(/\s+/)) {
        const ref = doc?.getElementById(id);
        if (!ref) continue;
        text = append(text, computeTextAlternative(ref, {
          ...ctx,
          visited: new Set(ctx.visited),
          isRoot: false,
          isReferenced: true
        }));
      }
      if (text) return text;
    }
  }
  const ariaLabel = (element.getAttribute("aria-label") || "").trim();
  if (ariaLabel) return ariaLabel;
  const role = ctx.roleOf(element);
  if (role !== "presentation" && role !== "none") {
    const host = hostLanguageLabel(element, ctx);
    if (host) return host;
  }
  if (ctx.isReferenced && isEmbeddedControl(element)) {
    const tagName = element.tagName.toLowerCase();
    if (role === "textbox" || [
      "input",
      "textarea"
    ].includes(tagName)) {
      const v = element.value;
      if (v) return v;
    } else if (role === "combobox" && tagName === "select") {
      const sel = element;
      const opt = sel.selectedOptions[0];
      if (opt) return (opt.textContent || "").trim();
    } else if ([
      "slider",
      "spinbutton",
      "progressbar"
    ].includes(tagName)) {
      const vt = (element.getAttribute("aria-valuetext") || "").trim();
      if (vt) return vt;
      const vn = element.trim();
      if (vn) return vn;
      if (tagName === "input") {
        const v = element.value;
        if (v) return v;
      }
    }
  }
  const allowFromContents = NAME_FROM_CONTENTS_ROLES.has(role) || ctx.isReferenced;
  if (allowFromContents) {
    let text = append("", pseudoContent(element, "::before"));
    for (const node of Array.from(element.childNodes)) {
      if (node.nodeType === 3) {
        const t = (node.textContent || "").replace(/\s+/g, " ");
        text = append(text, t.trim());
        continue;
      }
      if (node.nodeType === 1) {
        text = append(text, computeTextAlternative(node, {
          ...ctx,
          isRoot: false
        }));
        continue;
      }
    }
    text = append(text, pseudoContent(element, "::after"));
    if (text.trim()) return text.trim();
  }
  const title = (element.getAttribute("title") || "").trim();
  if (title) return title;
  return "";
}
function computeDescription(element, name, ctx) {
  const describedBy = (element.getAttribute("aria-describedby") || "").trim();
  if (describedBy) {
    const document = element.ownerDocument;
    let text = "";
    for (let id of describedBy.split(/\s+/)) {
      const ref = document?.getElementById(id);
      if (!ref) continue;
      text = append(text, computeTextAlternative(ref, {
        ...ctx,
        visited: /* @__PURE__ */ new Set(),
        isRoot: false,
        isReferenced: true
      }));
    }
    if (text) return text;
  }
  const ariaDesc = (element.getAttribute("aria-description") || "").trim();
  if (ariaDesc) return ariaDesc;
  const title = (element.getAttribute("title") || "").trim();
  if (title && title !== name) return title;
  return "";
}

// src/AccessibilityTree.ts
var AccessibilityTree = class {
  root;
  rootWebArea;
  ownedElements = /* @__PURE__ */ new Set();
  hiddenCache = /* @__PURE__ */ new WeakMap();
  constructor(root) {
    this.root = root;
  }
  // PUBLIC
  toObject() {
    return this.rootWebArea ?? null;
  }
  toString(options = {}) {
    return this.rootWebArea ? this.rootWebArea.toString(options) : "{}";
  }
  build() {
    this.ownedElements = /* @__PURE__ */ new Set();
    this.hiddenCache = /* @__PURE__ */ new WeakMap();
    this.collectOwnedElements(this.root);
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
  collectOwnedElements(scope) {
    const root = scope.documentElement ? scope : scope;
    const owners = root.querySelectorAll?.("[aria-owns]");
    if (!owners) return;
    for (const owner of Array.from(owners)) {
      const ids = (owner.getAttribute("aria-owns") || "").trim();
      if (!ids) continue;
      for (let id of ids.split(/\s+/)) {
        const owned = owner.ownerDocument?.getElementById(id);
        owned && this.ownedElements.add(owned);
      }
    }
  }
  buildTree(root) {
    let start;
    if (root.documentElement) {
      start = root.body || root.documentElement;
    } else if (root.tagName?.toLowerCase() === "html") {
      const body = root.querySelector("body");
      start = body ?? root;
    } else {
      start = root;
    }
    const result = [];
    for (let element of Array.from(start.children)) {
      if (this.ownedElements.has(element)) continue;
      const node = this.elementToAccessibilityNode(element, /* @__PURE__ */ new Set());
      node && result.push(node);
    }
    return result;
  }
  elementToAccessibilityNode(element, owningChain) {
    if (this.isHidden(element)) return null;
    const role = this.resolveRole(element);
    if (PRESENTATIONAL_ROLES.has(role)) {
      const children2 = [];
      for (let childElement of Array.from(element.children)) {
        if (this.ownedElements.has(childElement) && !owningChain.has(childElement)) continue;
        const childNode = this.elementToAccessibilityNode(childElement, owningChain);
        if (childNode) children2.push(childNode);
      }
      if (children2.length === 0) return null;
      if (children2.length === 1) return children2[0];
      return new AccessibilityNode(children2, "", "generic", {}, element, {});
    }
    const name = computeTextAlternative(element, {
      visited: /* @__PURE__ */ new Set(),
      isRoot: true,
      isReferenced: false,
      roleOf: (el) => this.resolveRole(el),
      isHidden: (el) => this.isHidden(el)
    });
    const description = computeDescription(element, name, {
      roleOf: (el) => this.resolveRole(el),
      isHidden: (el) => this.isHidden(el)
    });
    const {
      states,
      properties
    } = computeAria(element, role);
    const value = computeValue(element, role);
    if (name) {
      const ariaLabel = (element.getAttribute("aria-label") || "").trim();
      if (ariaLabel && ariaLabel === name) delete properties.label;
      if ((element.getAttribute("aria-labelledby") || "").trim()) delete properties.labelledby;
    }
    if (description) {
      const ariaDesc = (element.getAttribute("aria-description") || "").trim();
      if (ariaDesc && ariaDesc === description) delete properties.description;
      if ((element.getAttribute("aria-describedby") || "").trim()) delete properties.describedby;
    }
    const children = [];
    if (!CHILDREN_PRESENTATIONAL_ROLES.has(role)) {
      for (let childElement of Array.from(element.children)) {
        if (this.ownedElements.has(childElement) && !owningChain.has(childElement)) continue;
        const childNode = this.elementToAccessibilityNode(childElement, owningChain);
        childNode && children.push(childNode);
      }
    }
    const owns = (element.getAttribute("aria-owns") || "").trim();
    if (owns) {
      for (let id of owns.split(/\s+/)) {
        const owned = element.ownerDocument?.getElementById(id);
        if (!owned || owningChain.has(owned)) continue;
        owningChain.add(owned);
        const ownedNode = this.elementToAccessibilityNode(owned, owningChain);
        owningChain.delete(owned);
        ownedNode && children.push(ownedNode);
      }
    }
    let effectiveName = name;
    if (role === NO_ROLE && !effectiveName) {
      const textOnly = this.directTextContent(element);
      if (textOnly) effectiveName = textOnly;
    }
    if (role === NO_ROLE && !effectiveName && !description && !value && children.length === 0 && Object.keys(states).length === 0 && Object.keys(properties).length === 0) {
      return null;
    }
    return new AccessibilityNode(children, effectiveName, role, properties, element, states, description || void 0, value);
  }
  directTextContent(element) {
    const parts = [];
    for (let node of Array.from(element.childNodes)) {
      if (node.nodeType === 3) {
        const t = (node.textContent || "").replace(/\s+/g, " ").trim();
        if (t) parts.push(t);
      }
    }
    return parts.join(" ");
  }
  resolveRole(element) {
    const explicit = (element.getAttribute("role") || "").trim().split(/\s+/)[0] || "";
    if (explicit && PRESENTATIONAL_ROLES.has(explicit)) {
      if (this.hasRevokingTraits(element)) return getImplicitRole(element);
      return explicit;
    }
    if (explicit) return explicit;
    return getImplicitRole(element);
  }
  hasRevokingTraits(element) {
    const ti = element.getAttribute("tabindex");
    if (ti !== null && parseInt(ti, 10) >= 0) return true;
    const tag = element.tagName.toLowerCase();
    if (tag === "a" && element.hasAttribute("href")) return true;
    if (tag === "button" || tag === "input" || tag === "select" || tag === "textarea") return true;
    for (let attr of Array.from(element.attributes)) {
      if (/^aria-/i.test(attr.name) && attr.name !== "aria-hidden") return true;
    }
    return false;
  }
  isHidden(element) {
    const cached = this.hiddenCache.get(element);
    if (cached !== void 0) return cached;
    const result = this.computeHidden(element);
    this.hiddenCache.set(element, result);
    return result;
  }
  computeHidden(element) {
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
    let parent = element.parentElement;
    while (parent) {
      if (parent.hidden) return true;
      if (parent.getAttribute("aria-hidden") === "true") return true;
      try {
        const view = parent.ownerDocument?.defaultView;
        if (view && view.getComputedStyle(parent).display === "none") return true;
      } catch {
      }
      parent = parent.parentElement;
    }
    return false;
  }
};

// src/api.ts
async function parseDOM(html) {
  try {
    const { JSDOM } = await import("jsdom");
    return new JSDOM(html).window.document.documentElement;
  } catch (err) {
    if (err?.code !== "ERR_MODULE_NOT_FOUND") throw err;
    throw new ReferenceError("Install jsdom@22.1.0 to use accessibility tree with Node.js");
  }
}
export {
  AccessibilityTree,
  parseDOM
};
