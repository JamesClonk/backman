import { getStore, mapStateToProps } from "../../core/helpers/store-helpers";
import * as wcHelpers from "../../core/helpers/webcomponent-helpers";
import { InputGroupActionTypes } from "./input-group-store";
export class InputItem {
    constructor() {
        this.invokeChangeCallback = () => null;
        this.type = "radio";
        this.checked = false;
        this.disabled = false;
        this.name = undefined;
        this.disableFocus = false;
    }
    checkedChanged() {
        if (this.getInputType() === "radio") {
            if (this.checked) {
                this.dispatch({ type: InputGroupActionTypes.selectInputItemEl, inputItemEl: this.el });
            }
        }
        else {
            this.dispatch({ type: InputGroupActionTypes.selectInputItemEl, inputItemEl: this.el });
        }
        this.updateHiddenFormInputEl();
    }
    valueChanged() {
        this.updateHiddenFormInputEl();
    }
    nameChanged() {
        this.updateHiddenFormInputEl();
    }
    nameStateChanged() {
        this.updateHiddenFormInputEl();
    }
    selectedInputItemElsChanged() {
        if (this.getInputType() === "radio") {
            if (this.selectedInputItemEls[0] !== this.el) {
                this.checked = false;
            }
            else if (!this.checked) {
                this.checked = true;
                this.inputEl.focus();
            }
        }
        this.updateHiddenFormInputEl();
    }
    changeCallbackChanged() {
        this.setInvokeChangeCallback();
    }
    onClick(e) {
        if (this.disableFocus) {
            e.preventDefault();
        }
    }
    handleKeyDown(e) {
        const key = e.key;
        if (key === "ArrowDown" || key === "ArrowRight") {
            this.dispatch({
                type: InputGroupActionTypes.selectNextInputItemEl,
                currentSelectedInputItemEl: this.el
            });
            e.preventDefault();
        }
        else if (key === "ArrowUp" || key === "ArrowLeft") {
            this.dispatch({
                type: InputGroupActionTypes.selectPreviousInputItemEl,
                currentSelectedInputItemEl: this.el
            });
            e.preventDefault();
        }
    }
    componentWillLoad() {
        this.setInvokeChangeCallback();
        this.initHiddenFormInputEl();
        this.store = getStore(this);
        if (this.checked) {
            this.dispatch({ type: InputGroupActionTypes.selectInputItemEl, inputItemEl: this.el });
        }
        this.unsubscribe = mapStateToProps(this, this.store, [
            "typeState",
            "nameState",
            "inline",
            "selectedInputItemEls"
        ]);
    }
    componentDidLoad() {
        this.dispatch({ type: InputGroupActionTypes.registerInputItemEl, inputItemEl: this.el });
    }
    componentDidUnload() {
        this.unsubscribe();
        this.dispatch({ type: InputGroupActionTypes.unregisterInputItemEl, inputItemEl: this.el });
    }
    getInputType() {
        return this.typeState || this.type;
    }
    select() {
        if (this.getInputType() === "radio") {
            if (!this.checked) {
                this.checked = true;
                this.invokeChangeCallback(this.checked);
            }
        }
        else {
            this.checked = !this.checked;
            this.invokeChangeCallback(this.checked);
        }
    }
    dispatch(action) {
        if (this.store) {
            this.store.dispatch(action);
        }
    }
    getComponentClassNames() {
        return {
            component: true,
            checked: this.checked,
            disabled: this.disabled,
            [this.getInputType()]: true
        };
    }
    initHiddenFormInputEl() {
        this.lightDOMHiddenFormInputEl = document.createElement("input");
        this.lightDOMHiddenFormInputEl.type = "hidden";
        this.updateHiddenFormInputEl();
        this.el.appendChild(this.lightDOMHiddenFormInputEl);
    }
    updateHiddenFormInputEl() {
        delete this.lightDOMHiddenFormInputEl.name;
        this.lightDOMHiddenFormInputEl.removeAttribute("name");
        const name = this.getName();
        if (this.checked && name) {
            this.lightDOMHiddenFormInputEl.name = name;
            this.lightDOMHiddenFormInputEl.value = this.getInputType() === "radio" ? this.value : "on";
        }
    }
    setInvokeChangeCallback() {
        this.invokeChangeCallback = wcHelpers.parseFunction(this.changeCallback);
    }
    getName() {
        return this.nameState || this.name;
    }
    hostData() {
        return {
            role: this.getInputType(),
            class: {
                inline: this.inline
            }
        };
    }
    render() {
        const inputType = this.getInputType();
        return (h("div", { class: this.getComponentClassNames() },
            h("label", null,
                h("input", { type: inputType, onClick: () => this.select(), checked: this.checked, disabled: this.disabled, "aria-describedby": "description", ref: (el) => this.inputEl = el, tabindex: this.disableFocus ? -1 : undefined }),
                h("span", { class: "sdx-icon" }, inputType === "checkbox" && h("sdx-icon", { "icon-name": "icon-011-check-mark", size: 1 })),
                h("slot", null)),
            h("div", { id: "description", class: "description" },
                h("slot", { name: "description" }))));
    }
    static get is() { return "sdx-input-item"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "changeCallback": {
            "type": String,
            "attr": "change-callback",
            "watchCallbacks": ["changeCallbackChanged"]
        },
        "checked": {
            "type": Boolean,
            "attr": "checked",
            "mutable": true,
            "watchCallbacks": ["checkedChanged"]
        },
        "disabled": {
            "type": Boolean,
            "attr": "disabled"
        },
        "disableFocus": {
            "type": Boolean,
            "attr": "disable-focus"
        },
        "el": {
            "elementRef": true
        },
        "inline": {
            "state": true
        },
        "name": {
            "type": String,
            "attr": "name",
            "watchCallbacks": ["nameChanged"]
        },
        "nameState": {
            "state": true,
            "watchCallbacks": ["nameStateChanged"]
        },
        "selectedInputItemEls": {
            "state": true,
            "watchCallbacks": ["selectedInputItemElsChanged"]
        },
        "type": {
            "type": String,
            "attr": "type"
        },
        "typeState": {
            "state": true
        },
        "value": {
            "type": "Any",
            "attr": "value",
            "watchCallbacks": ["valueChanged"]
        }
    }; }
    static get listeners() { return [{
            "name": "click",
            "method": "onClick"
        }, {
            "name": "keydown",
            "method": "handleKeyDown"
        }]; }
    static get style() { return "/**style-placeholder:sdx-input-item:**/"; }
}
