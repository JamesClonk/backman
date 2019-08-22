/*! Built with http://stenciljs.com */
import { h } from '../webcomponents.core.js';

class Item {
    constructor() {
        this.open = false;
    }
    activeItemChanged() {
        this.decideCollapseHeaderDisplay();
        this.decideCollapseBodyDisplay();
    }
    componentWillLoad() {
        this.setChildElementsReferences();
        this.decideCollapseHeaderDisplay();
    }
    componentDidLoad() {
        this.decideCollapseBodyDisplay();
    }
    setChildElementsReferences() {
        this.itemHeaderEl = this.el.querySelector("sdx-accordion-item-header");
        this.itemBodyEl = this.el.querySelector("sdx-accordion-item-body");
    }
    decideCollapseHeaderDisplay() {
        if (this.itemHeaderEl) {
            this.itemHeaderEl.setAttribute("expand", this.open.toString());
        }
    }
    decideCollapseBodyDisplay() {
        if (this.itemBodyEl) {
            this.itemBodyEl.toggle(this.open);
        }
    }
    render() {
        return (h("slot", null));
    }
    static get is() { return "sdx-accordion-item"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "el": {
            "elementRef": true
        },
        "open": {
            "type": Boolean,
            "attr": "open",
            "watchCallbacks": ["activeItemChanged"]
        }
    }; }
    static get style() { return ":host{-webkit-box-sizing:border-box;box-sizing:border-box}*,:after,:before{-webkit-box-sizing:inherit;box-sizing:inherit}:host{position:relative;display:block;border:1px solid #d6d6d6;border-bottom:0}:host p{padding:13px 13px 14px 19px}:host([arrow-position=center]){padding:0}:host(.margin-bottom-2){margin-bottom:16px}:host(.margin-0){margin:0}"; }
}

export { Item as SdxAccordionItem };
