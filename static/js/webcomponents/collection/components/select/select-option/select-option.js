import { SelectActionTypes } from "../select-store";
import { mapStateToProps, getStore } from "../../../core/helpers/store-helpers";
export class SelectOption {
    constructor() {
        this.selected = false;
        this.disabled = false;
        this.placeholder = false;
    }
    onClick() {
        this.select(this, "add", true);
    }
    selectedChanged() {
        this.select(this, this.selected ? "add" : "remove");
    }
    componentWillLoad() {
        this.store = getStore(this);
        this.unsubscribe = mapStateToProps(this, this.store, [
            "selectionSorted",
            "multiple",
            "direction",
            "select",
            "filter",
            "filterFunction"
        ]);
        this.dispatch({ type: SelectActionTypes.toggleOptionEl, optionEl: this.el });
        if (this.selected) {
            this.select(this, "add");
        }
    }
    componentDidUnload() {
        this.dispatch({ type: SelectActionTypes.toggleOptionEl, optionEl: this.el });
        this.select(this, "remove");
        this.unsubscribe();
    }
    isSelected() {
        return this.selectionSorted && this.selectionSorted.indexOf(this.el) > -1;
    }
    dispatch(action) {
        if (this.store) {
            this.store.dispatch(action);
        }
    }
    hostData() {
        return {
            style: {
                display: this.filterFunction(this.el, this.filter) ? "" : "none"
            },
            class: {
                selected: this.isSelected(),
                multiple: this.multiple,
                disabled: this.disabled,
                [this.direction]: true
            }
        };
    }
    render() {
        return (h("div", { class: "component" }, this.multiple
            ? (h("sdx-input-item", { type: "checkbox", class: "option", checked: this.isSelected(), disabled: this.disabled, disableFocus: true },
                h("sdx-text-truncate", null,
                    h("slot", null))))
            : (h("div", { class: "option" },
                h("sdx-text-truncate", null,
                    h("slot", null))))));
    }
    static get is() { return "sdx-select-option"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "direction": {
            "state": true
        },
        "disabled": {
            "type": Boolean,
            "attr": "disabled"
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
        "multiple": {
            "state": true
        },
        "placeholder": {
            "type": Boolean,
            "attr": "placeholder"
        },
        "select": {
            "state": true
        },
        "selected": {
            "type": Boolean,
            "attr": "selected",
            "watchCallbacks": ["selectedChanged"]
        },
        "selectionSorted": {
            "state": true
        },
        "value": {
            "type": "Any",
            "attr": "value"
        }
    }; }
    static get listeners() { return [{
            "name": "click",
            "method": "onClick"
        }]; }
    static get style() { return "/**style-placeholder:sdx-select-option:**/"; }
}
