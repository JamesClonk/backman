/*! Built with http://stenciljs.com */
import { h } from '../webcomponents.core.js';

function getSlot(wc) {
    if (!wc.shadowRoot) {
        return null;
    }
    const nativeSlot = wc.shadowRoot.querySelector("slot");
    if (nativeSlot) {
        return nativeSlot;
    }
    return wc.querySelector(`.sc-${wc.tagName.toLowerCase()}-s`);
}
function installSlotObserver(wc, callback) {
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
function isNativeSlot(node) {
    return !!node.tagName && node.tagName.toLowerCase() === "slot";
}
function getAllSlotChildNodes(wc, slot, collection) {
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
function parseFunction(fn) {
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
function closest(sourceEl, target) {
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
function getPreviousFromList(list, el) {
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
function getNextFromList(list, el) {
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

const breakpoints = {
    xs: 0,
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1280,
    ul: 1440
};
function isDesktopOrLarger() {
    return window.innerWidth >= breakpoints.lg;
}

export { getSlot as a, installSlotObserver as b, isNativeSlot as c, getAllSlotChildNodes as d, parseFunction as e, closest as f, getPreviousFromList as g, getNextFromList as h, isDesktopOrLarger as i };
