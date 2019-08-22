export function getSlot(wc) {
    if (!wc.shadowRoot) {
        return null;
    }
    const nativeSlot = wc.shadowRoot.querySelector("slot");
    if (nativeSlot) {
        return nativeSlot;
    }
    return wc.querySelector(`.sc-${wc.tagName.toLowerCase()}-s`);
}
export function installSlotObserver(wc, callback) {
    const observer = new MutationObserver(() => callback());
    const observeOptions = {
        childList: true,
        characterData: true,
        subtree: true
    };
    const slot = getSlot(wc);
    if (!slot) {
        return;
    }
    if (isNativeSlot(slot)) {
        observer.observe(wc, observeOptions);
    }
    else {
        observer.observe(slot, observeOptions);
    }
}
export function isNativeSlot(node) {
    return !!node.tagName && node.tagName.toLowerCase() === "slot";
}
export function getAllSlotChildNodes(wc, slot, collection) {
    slot = slot || getSlot(wc);
    collection = collection || [];
    if (!slot) {
        return [];
    }
    if (isNativeSlot(slot)) {
        const assignedNodes = slot.assignedNodes();
        for (let i = 0; i < assignedNodes.length; ++i) {
            const assignedNode = assignedNodes[i];
            if (isNativeSlot(assignedNode)) {
                getAllSlotChildNodes(wc, assignedNode, collection);
            }
            else {
                collection.push(assignedNode);
            }
        }
    }
    else {
        const polyfillSlotChildNodes = slot.childNodes;
        for (let i = 0; i < polyfillSlotChildNodes.length; ++i) {
            const polyfillSlotChildNode = polyfillSlotChildNodes[i];
            collection.push(polyfillSlotChildNode);
        }
    }
    return collection;
}
export function getAllSlotChildNodesByTagName(wc, tagName, collection, children) {
    collection = collection || [];
    children = children || getAllSlotChildNodes(wc);
    for (let i = 0; i < children.length; ++i) {
        const child = children[i];
        if (child.tagName && child.tagName.toLowerCase() === tagName.toLowerCase()) {
            collection.push(child);
        }
        if (child.childNodes.length) {
            getAllSlotChildNodesByTagName(wc, tagName, collection, Array.prototype.slice.call(child.childNodes));
        }
    }
    return collection;
}
export function parseFunction(fn) {
    if (typeof fn === "string") {
        return new Function(fn);
    }
    else if (typeof fn === "function") {
        return fn;
    }
    else {
        return new Function();
    }
}
export function closest(sourceEl, target) {
    let currentEl = sourceEl;
    const matches = (sourceEl, target) => {
        if (typeof target === "object") {
            return sourceEl === target;
        }
        return sourceEl.matches(target);
    };
    while (!matches(currentEl, target)) {
        if (currentEl.parentElement) {
            currentEl = currentEl.parentElement;
        }
        else {
            return null;
        }
    }
    return currentEl;
}
export function getPreviousFromList(list, el) {
    let index;
    let newIndex = 0;
    if (el) {
        index = list.indexOf(el);
    }
    if (index !== undefined) {
        if ((index - 1) >= 0) {
            newIndex = index - 1;
        }
        else {
            newIndex = list.length - 1;
        }
    }
    return list[newIndex];
}
export function getNextFromList(list, el) {
    let index;
    let newIndex = 0;
    if (el) {
        index = list.indexOf(el);
    }
    if (index !== undefined) {
        if ((index + 1) < list.length) {
            newIndex = index + 1;
        }
        else {
            newIndex = 0;
        }
    }
    return list[newIndex];
}
