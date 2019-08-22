/*! Built with http://stenciljs.com */
import { h } from '../webcomponents.core.js';

class Section {
    render() {
        return (h("slot", null));
    }
    static get is() { return "sdx-accordion-item-section"; }
    static get encapsulation() { return "shadow"; }
    static get style() { return ":host{-webkit-box-sizing:border-box;box-sizing:border-box}*,:after,:before{-webkit-box-sizing:inherit;box-sizing:inherit}:host{padding:16px 15px;display:inline-block;position:relative}"; }
}

export { Section as SdxAccordionItemSection };
