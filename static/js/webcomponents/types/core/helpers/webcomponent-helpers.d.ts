/**
 * A collection of useful Stencil components methods, e.g. for making sure that
 * modern browsers with native web component support and old browsers
 * using polyfills produce the same results.
 */
/**
 * Returns the <slot /> element.
 * Works on both modern browsers and polyfilled old browsers,
 * where a <div class="slot" /> is used as fallback.
 * @param wc Web Component to read <slot /> from.
 */
export declare function getSlot(wc: HTMLElement): HTMLElement | null;
/**
 * Sets up an observer that is triggered when child nodes in <slot /> change.
 * Works on both modern browsers and polyfilled old browsers.
 * @param wc Web Component to install observer.
 * @param callback Function executed on change.
 */
export declare function installSlotObserver(wc: HTMLElement, callback: () => void): void;
/**
 * Checks if a given node is a native slot by validating its tag name.
 * Required to know if a native web component functions can be called (e.g. slot.assignedNodes()).
 * @param node Node to check
 */
export declare function isNativeSlot(node: Node): boolean;
/**
 * Returns all child nodes of the <slot /> tag (recursively - if child node is a <slot /> again).
 * Works on both modern browsers and polyfilled old browsers.
 * @param wc Web Component to read slots child nodes from.
 */
export declare function getAllSlotChildNodes(wc: HTMLElement, slot?: Node | null, collection?: Node[]): Node[];
/**
 * Returns all child nodes of the <slot /> tag (recursively) that match a given tag name.
 * @param wc Web Component to read slots child nodes from.
 * @param tagName Tag to look for, e.g. "sdx-select-option".
 * @param collection Internal for recursion.
 * @param children Internal for recursion.
 */
export declare function getAllSlotChildNodesByTagName(wc: HTMLElement, tagName: string, collection?: Node[], children?: Node[]): Node[];
/**
 * Evaluates a function string and returns the result.
 * Do nothing if the passed parameter already is a function.
 * @param fn Function - either as a string or as a function itself
 */
export declare function parseFunction(fn: string | Function | undefined): Function;
/**
 * Traverses up from a given DOM node searching for a given selector or node.
 * Returns the first match.
 * @param sourceEl Starting DOM node.
 * @param selector Selector or DOM node.
 */
export declare function closest(sourceEl: HTMLElement, target: HTMLElement | string): HTMLElement | null;
/**
 * Returns the previous element of a list. Start from the end
 * if the given element is the first on the list.
 * @param list Array to pick element from.
 * @param el Item that will be used to get the index.
 */
export declare function getPreviousFromList<T>(list: T[], el: T): T;
/**
 * Returns the next element of a list. Start from the beginning
 * if the given element is the last on the list.
 * @param list Array to pick element from.
 * @param el Item that will be used to get the index.
 */
export declare function getNextFromList<T>(list: T[], el: T): T;
