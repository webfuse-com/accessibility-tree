const SECTIONING_CONTENT: Set<string> = new Set([
    "article",
    "aside",
    "main",
    "nav",
    "section"
]);
const SECTIONING_ROOTS: Set<string> = new Set([
    "blockquote",
    "details",
    "dialog",
    "fieldset",
    "figure",
    "td"
]);
const INPUT_BUTTON_TYPES = new Set([
    "button",
    "image",
    "reset",
    "submit"
]);
const INPUT_TEXTLIKE_TYPES = new Set([
    "email",
    "tel",
    "text",
    "url"
]);
const INPUT_NO_ROLE_TYPES = new Set([
    "color",
    "date",
    "datetime-local",
    "file",
    "hidden",
    "month",
    "time",
    "week"
]);

const TH_SCOPE_ROLES: Record<string, string> = {
    row: "rowheader",
    col: "columnheader",
    rowgroup: "rowheader",
    colgroup: "columnheader"
};
 

export const NO_ROLE: string = "generic";
export const PRESENTATIONAL_ROLES: Set<string> = new Set([
    "none",
    "presentation"
]);
export const NAME_FROM_CONTENTS_ROLES: Set<string> = new Set([
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
export const CHILDREN_PRESENTATIONAL_ROLES: Set<string> = new Set([
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


function hasAncestor(element: Element, tagNames: Set<string>): boolean {
    let current: Element | null = element.parentElement;
    while(current) {
        if(tagNames.has(current.tagName.toLowerCase())) return true;

        current = current.parentElement;
    }

    return false;
}

function hasListAncestor(element: Element): boolean {
    let current: Element | null = element.parentElement;
    while(current) {
        const tag = current.tagName.toLowerCase();
        if(tag === "ul" || tag === "ol" || tag === "menu") return true;
        if(current.getAttribute("role") === "list") return true;
 
        current = current.parentElement;
    }

    return false;
}

function hasAccessibleName(element: Element): boolean {
    return Boolean(
        (element.getAttribute("aria-label") || "").trim()
        || (element.getAttribute("aria-labelledby") || "").trim()
        || (element.getAttribute("title") || "").trim()
    );
}

function isInsideSectioning(element: Element): boolean {
    return hasAncestor(element, SECTIONING_CONTENT) || hasAncestor(element, SECTIONING_ROOTS);
}

function isMultiSelect(select: HTMLSelectElement): boolean {
    return select.multiple || (select.size ?? 0) > 1;
}

function isInGrid(td: Element): boolean {
    const tableRole = td.closest("table")?.getAttribute("role");
 
    return tableRole === "grid" || tableRole === "treegrid";
}

function getImplicitInputRole(input: HTMLInputElement): string {
    const type = (input.type || "text").toLowerCase();
    const hasList = input.hasAttribute("list");
 
    if(INPUT_BUTTON_TYPES.has(type)) return "button";
    if(INPUT_NO_ROLE_TYPES.has(type)) return NO_ROLE;
    if(INPUT_TEXTLIKE_TYPES.has(type)) return hasList ? "combobox" : "textbox";

    switch(type) {
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
 
 
export function getImplicitRole(element: Element): string {
    const tag = element.tagName.toLowerCase();

    switch(tag) {
        case "a":
        case "area":
            return (element as HTMLAnchorElement).hasAttribute("href") ? "link" : NO_ROLE;
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
            return element.getAttribute("alt") === "" && !hasAccessibleName(element)
                ? "presentation"
                : "img";
        case "input":
            return getImplicitInputRole(element as HTMLInputElement);
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
            return isMultiSelect(element as HTMLSelectElement) ? "listbox" : "combobox";
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