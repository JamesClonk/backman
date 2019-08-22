/*! Built with http://stenciljs.com */
import { h } from '../webcomponents.core.js';

import { a as getSlot, b as installSlotObserver, c as isNativeSlot, d as getAllSlotChildNodes, e as parseFunction, f as closest, g as getPreviousFromList, h as getNextFromList } from './chunk-c2033b1f.js';

class Accordion {
    constructor() {
        this.openedItems = [];
        this.arrowPosition = "none";
        this.keepOpen = false;
    }
    arrowPropertyChanged() {
        this.initiateComponent();
    }
    componentWillLoad() {
        this.initiateComponent();
    }
    componentDidLoad() {
        installSlotObserver(this.el, () => this.onSlotChange());
    }
    onSlotChange() {
        this.initiateComponent();
    }
    close(index) {
        let itemEl = this.accordionItemEls[index];
        if (!this.keepOpen) {
            this.closeNotIgnoredItems(index);
        }
        const headerEl = itemEl.querySelector("sdx-accordion-item-header");
        if (headerEl) {
            itemEl.setAttribute("open", "false");
            this.trackOpenItems(index, "false");
        }
    }
    closeAll() {
        this.openedItems = [];
        for (let i = 0; i < this.accordionItemEls.length; i++) {
            let itemEl = this.accordionItemEls[i];
            const headerEl = itemEl.querySelector("sdx-accordion-item-header");
            if (headerEl) {
                itemEl.setAttribute("open", "false");
                this.trackOpenItems(i, "false");
            }
        }
    }
    toggle(index) {
        let itemEl = this.accordionItemEls[index];
        if (!this.keepOpen) {
            this.closeNotIgnoredItems(index);
        }
        const headerEl = itemEl.querySelector("sdx-accordion-item-header");
        if (headerEl) {
            const itemFound = itemEl.getAttribute("open") || "false";
            const isOpen = itemFound === "false" ? "true" : "false";
            itemEl.setAttribute("open", isOpen);
            this.trackOpenItems(index, isOpen);
        }
    }
    open(index) {
        let itemEl = this.accordionItemEls[index];
        if (!this.keepOpen) {
            this.closeNotIgnoredItems(index);
        }
        const headerEl = itemEl.querySelector("sdx-accordion-item-header");
        if (headerEl) {
            itemEl.setAttribute("open", "true");
            this.trackOpenItems(index, "true");
        }
    }
    openAll() {
        if (this.keepOpen || this.accordionItemEls.length === 1) {
            this.openedItems = [];
            for (let i = 0; i < this.accordionItemEls.length; i++) {
                let itemEl = this.accordionItemEls[i];
                const headerEl = itemEl.querySelector("sdx-accordion-item-header");
                if (headerEl) {
                    itemEl.setAttribute("open", "true");
                    this.trackOpenItems(i, "true");
                }
            }
        }
    }
    initiateComponent() {
        this.setChildElementsReferences();
        this.initiateAccordionItems();
    }
    setChildElementsReferences() {
        this.accordionItemEls = this.el.querySelectorAll("sdx-accordion-item");
    }
    initiateAccordionItems() {
        this.openedItems = [];
        for (let i = 0; i < this.accordionItemEls.length; ++i) {
            const itemEl = this.accordionItemEls[i];
            const headerEl = itemEl.querySelector("sdx-accordion-item-header");
            if (headerEl) {
                let isOpen = "false";
                if (itemEl.hasAttribute("open") && itemEl.getAttribute("open") !== "false") {
                    isOpen = "true";
                }
                itemEl.setAttribute("open", isOpen);
                itemEl.setAttribute("arrow-position", this.arrowPosition);
                headerEl.setAttribute("arrow-position", this.arrowPosition);
                const bodyEl = itemEl.querySelector("sdx-accordion-item-body");
                if (bodyEl) {
                    bodyEl.setAttribute("arrow-position", this.arrowPosition);
                }
                this.trackOpenItems(i, isOpen);
                headerEl.toggle = this.toggle.bind(this, i);
            }
        }
    }
    closeNotIgnoredItems(ignoreIndex) {
        for (let i = 0; i < this.openedItems.length; i++) {
            if (this.openedItems[i] !== ignoreIndex) {
                const itemEl = this.accordionItemEls[this.openedItems[i]];
                itemEl.setAttribute("open", "false");
            }
        }
        this.openedItems = [];
    }
    trackOpenItems(index, isOpen) {
        if (!this.keepOpen && isOpen === "true") {
            this.openedItems.push(index);
        }
    }
    render() {
        return (h("slot", null));
    }
    static get is() { return "sdx-accordion"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "arrowPosition": {
            "type": String,
            "attr": "arrow-position",
            "watchCallbacks": ["arrowPropertyChanged"]
        },
        "close": {
            "method": true
        },
        "closeAll": {
            "method": true
        },
        "el": {
            "elementRef": true
        },
        "keepOpen": {
            "type": Boolean,
            "attr": "keep-open",
            "watchCallbacks": ["arrowPropertyChanged"]
        },
        "open": {
            "method": true
        },
        "openAll": {
            "method": true
        },
        "toggle": {
            "method": true
        }
    }; }
    static get style() { return ":host{-webkit-box-sizing:border-box;box-sizing:border-box}*,:after,:before{-webkit-box-sizing:inherit;box-sizing:inherit}:host{display:block;border-bottom:1px solid #d6d6d6}"; }
}

export { Accordion as SdxAccordion };
