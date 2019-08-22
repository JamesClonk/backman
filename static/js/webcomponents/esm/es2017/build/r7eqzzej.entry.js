/*! Built with http://stenciljs.com */
import { h } from '../webcomponents.core.js';

import { a as getSlot, b as installSlotObserver, c as isNativeSlot, d as getAllSlotChildNodes, e as parseFunction, f as closest, g as getPreviousFromList, h as getNextFromList } from './chunk-c2033b1f.js';

class TextTruncate {
    doesSlotContainHTML() {
        return getAllSlotChildNodes(this.el).some((node) => node.nodeType === 1);
    }
    getComponentClassNames() {
        return {
            component: true,
            ellipsis: !this.doesSlotContainHTML()
        };
    }
    render() {
        return (h("div", { class: this.getComponentClassNames() },
            h("div", { class: "slot" },
                h("slot", null))));
    }
    static get is() { return "sdx-text-truncate"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "el": {
            "elementRef": true
        }
    }; }
    static get style() { return ":host{-webkit-box-sizing:border-box;box-sizing:border-box}*,:after,:before{-webkit-box-sizing:inherit;box-sizing:inherit}:host{display:block;width:100%}.component.ellipsis .slot{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"; }
}

export { TextTruncate as SdxTextTruncate };
