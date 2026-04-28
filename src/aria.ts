type AriaValueType =
    | "boolean"
    | "tristate"
    | "id"
    | "idlist"
    | "integer" |
    "number"
    | "string"
    | "token"
    | "tokenlist";


const STATE_SPECS_TYPE: Record<string, AriaValueType> = {
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

const PROPERTY_SPECS_TYPE: Record<string, AriaValueType> = {
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


function strip(name: string): string {
    return name.replace(/^aria-/, "");
}

function parseValue(raw: string, type: AriaValueType): unknown {
    const trimmed = raw.trim();

    switch(type) {
        case "boolean":
            if(trimmed === "true") return true;
            if(trimmed === "false") return false;

            return undefined;
        case "tristate":
            if(trimmed === "true") return true;
            if(trimmed === "false") return false;
            if(trimmed === "mixed") return "mixed";

            return undefined;
        case "integer": {
            const n = parseInt(trimmed, 10);

            return Number.isFinite(n) ? n : undefined;
        }
        case "number": {
            const n = parseFloat(trimmed);

            return Number.isFinite(n) ? n : undefined;
        }
        case "idlist":
        case "tokenlist":
            return trimmed ? trimmed.split(/\s+/) : undefined;
        case "id":
        case "token":
        case "string":
        default:
            return trimmed || undefined;
    }
}


export interface ComputedAria {
    states: Record<string, any>;
    properties: Record<string, any>;
}


export function computeAria(element: Element, role: string): ComputedAria {
    const states: Record<string, any> = {};
    const properties: Record<string, any> = {};

    for(const attr of Array.from(element.attributes)) {
        const name = attr.name.toLowerCase();

        if(STATE_SPECS_TYPE[name]) {
            const v = parseValue(attr.value, STATE_SPECS_TYPE[name]);
            (v !== undefined)
                && (states[strip(name)] = v);

            continue;
        }
        if(PROPERTY_SPECS_TYPE[name]) {
            const v = parseValue(attr.value, PROPERTY_SPECS_TYPE[name]);
            (v !== undefined)
                && (properties[strip(name)] = v);
        }
    }

    const tagName: string = element.tagName.toLowerCase();

    if(states.disabled === undefined && (element as HTMLInputElement).disabled) {
        states.disabled = true;
    }

    if("required" in element && (element as HTMLInputElement).required && properties.required === undefined) {
        properties.required = true;
    }
    if("readOnly" in element && (element as HTMLInputElement).readOnly && properties.readonly === undefined) {
        properties.readonly = true;
    }

    if(([
        "checkbox",
        "radio",
        "switch"
    ].includes(role)) && states.checked === undefined) {
        if(tagName === "input") {
            const input = element as HTMLInputElement;
            // indeterminate maps to "mixed" for tri-state checkbox
            if(input.indeterminate && role === "checkbox") {
                states.checked = "mixed";
            } else {
                states.checked = input.checked;
            }
        } else {
            states.checked = false;
        }
    }

    if(role === "option" && states.selected === undefined && tagName === "option") {
        states.selected = (element as HTMLOptionElement).selected;
    }

    if(role === "heading" && properties.level === undefined) {
        const match = tagName.match(/^h([1-6])$/);
        match
            && (properties.level = parseInt(match[1], 10));
    }

    if(role === "listitem" && properties.posinset === undefined) {
        const parent = element.parentElement;

        if(parent && (parent.tagName === "OL" || parent.tagName === "UL" || parent.tagName === "MENU")) {
            const items = Array.from(parent.children).filter(c => c.tagName === "LI");
            const idx = items.indexOf(element);

            if(idx >= 0) {
                properties.posinset = idx + 1;
                properties.setsize = items.length;
            }
        }
    }

    if([
        "slider",
        "spinbutton",
        "progressbar",
        "meter"
    ].includes(role)) {
        if(tagName === "input") {
            const input = element as HTMLInputElement;
            if(properties.valuemin === undefined && input.min !== "") {
                properties.valuemin = parseFloat(input.min);
            }
            if(properties.valuemax === undefined && input.max !== "") {
                properties.valuemax = parseFloat(input.max);
            }
            if(properties.valuenow === undefined && input.value !== "") {
                properties.valuenow = parseFloat(input.value);
            }
        } else if([
            "progress",
            "meter"
        ].includes(tagName)) {
            const p = element as HTMLProgressElement | HTMLMeterElement;
            if(properties.valuenow === undefined) {
                properties.valuenow = p.value;
            }
            if(properties.valuemax === undefined) {
                properties.valuemax = p.max;
            }

            if(tagName === "meter") {
                const m = element as HTMLMeterElement;
                if(properties.valuemin === undefined) {
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


export function computeValue(element: Element, role: string): string | undefined {
    const valueText: string = (element.getAttribute("aria-valuetext") || "").trim();
    if(valueText) return valueText;

    const valueNow: string = (element.getAttribute("aria-valuenow") || "").trim();
    if(valueNow) return valueNow;

    const tagName: string = element.tagName.toLowerCase();

    if([
        "textbox",
        "searchbox"
    ].includes(role)) {
        if([
            "input",
            "textarea"
        ].includes(tagName)) return (element as HTMLInputElement).value || undefined;

        // contenteditable
        return element.textContent?.trim() || undefined;
    }

    if(role === "combobox" && tagName === "select") {
        const sel = element as HTMLSelectElement;

        return sel.selectedOptions[0]?.textContent?.trim() || undefined;
    }

    if([
        "slider",
        "spinbutton",
        "progressbar",
        "meter"
    ].includes(role)) {
        if(tagName === "input") return (element as HTMLInputElement).value || undefined;

        if([
            "progress",
            "meter"
        ].includes(tagName)) return String((element as HTMLProgressElement).value);
    }

    return undefined;
}