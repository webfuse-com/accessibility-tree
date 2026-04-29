export interface ComputedAria {
    states: Record<string, any>;
    properties: Record<string, any>;
}
export declare function computeAria(element: Element, role: string): ComputedAria;
export declare function computeValue(element: Element, role: string): string | undefined;
