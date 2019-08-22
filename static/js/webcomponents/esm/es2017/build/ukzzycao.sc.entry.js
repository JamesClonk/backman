/*! Built with http://stenciljs.com */
import { h } from '../webcomponents.core.js';

class Section {
    render() {
        return (h("slot", null));
    }
    static get is() { return "sdx-accordion-item-section"; }
    static get encapsulation() { return "shadow"; }
    static get style() { return ".sc-sdx-accordion-item-section-h{-webkit-box-sizing:border-box;box-sizing:border-box}*.sc-sdx-accordion-item-section, .sc-sdx-accordion-item-section:after, .sc-sdx-accordion-item-section:before{-webkit-box-sizing:inherit;box-sizing:inherit}.sc-sdx-accordion-item-section-h{padding:16px 15px;display:inline-block;position:relative}"; }
}

export { Section as SdxAccordionItemSection };
