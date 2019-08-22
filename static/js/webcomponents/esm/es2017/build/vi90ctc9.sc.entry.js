/*! Built with http://stenciljs.com */
import { h } from '../webcomponents.core.js';

import { b as SelectActionTypes } from './chunk-ad9f4763.js';
import { c as getStore, b as mapStateToProps } from './chunk-6a8011c5.js';

class SelectOptGroup {
    constructor() {
        this.name = "";
    }
    componentWillLoad() {
        this.store = getStore(this);
        this.unsubscribe = mapStateToProps(this, this.store, [
            "direction",
            "filter",
            "filterFunction"
        ]);
        this.dispatch({ type: SelectActionTypes.toggleOptGroupEl, optgroupEl: this.el });
    }
    componentDidUnload() {
        this.dispatch({ type: SelectActionTypes.toggleOptGroupEl, optgroupEl: this.el });
        this.unsubscribe();
    }
    dispatch(action) {
        if (this.store) {
            this.store.dispatch(action);
        }
    }
    optgroupElMatchesFilter(el, filter) {
        let anyOptionElMatchesFilter = false;
        for (let optionEl of el.querySelectorAll("sdx-select-option")) {
            if (this.filterFunction(optionEl, filter)) {
                anyOptionElMatchesFilter = true;
                break;
            }
        }
        return anyOptionElMatchesFilter;
    }
    hostData() {
        return {
            style: {
                display: this.optgroupElMatchesFilter(this.el, this.filter) ? "" : "none"
            },
            class: {
                [this.direction]: true
            }
        };
    }
    render() {
        return (h("div", { class: "wrapper" },
            this.name && h("div", { class: "title" }, this.name),
            h("slot", null)));
    }
    static get is() { return "sdx-select-optgroup"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "direction": {
            "state": true
        },
        "el": {
            "elementRef": true
        },
        "filter": {
            "state": true
        },
        "filterFunction": {
            "state": true
        },
        "name": {
            "type": String,
            "attr": "name"
        }
    }; }
    static get style() { return ".sc-sdx-select-optgroup-h{-webkit-box-sizing:border-box;box-sizing:border-box}*.sc-sdx-select-optgroup, .sc-sdx-select-optgroup:after, .sc-sdx-select-optgroup:before{-webkit-box-sizing:inherit;box-sizing:inherit}.sc-sdx-select-optgroup-h{display:block}.sc-sdx-select-optgroup-h .sc-sdx-select-optgroup-s > sdx-select-option{border-top:none;border-bottom:none}.sc-sdx-select-optgroup-h   .wrapper.sc-sdx-select-optgroup{border-top:1px solid #d6d6d6;border-bottom:1px solid #d6d6d6}.sc-sdx-select-optgroup-h   .wrapper.sc-sdx-select-optgroup   .title.sc-sdx-select-optgroup{font-weight:600;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;padding:0 16px;height:48px;border-left:1px solid #d6d6d6;border-right:1px solid #d6d6d6}.top.sc-sdx-select-optgroup-h   .wrapper.sc-sdx-select-optgroup{border-top:none}.bottom.sc-sdx-select-optgroup-h   .wrapper.sc-sdx-select-optgroup{border-bottom:none}"; }
}

export { SelectOptGroup as SdxSelectOptgroup };
