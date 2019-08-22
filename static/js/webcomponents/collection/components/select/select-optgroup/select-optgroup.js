import { SelectActionTypes } from "../select-store";
import { getStore, mapStateToProps } from "../../../core/helpers/store-helpers";
export class SelectOptGroup {
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
    static get style() { return "/**style-placeholder:sdx-select-optgroup:**/"; }
}
