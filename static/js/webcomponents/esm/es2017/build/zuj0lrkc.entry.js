/*! Built with http://stenciljs.com */
import { h } from '../webcomponents.core.js';

import { c as getStore, b as mapStateToProps } from './chunk-6a8011c5.js';
import { a as getSlot, b as installSlotObserver, c as isNativeSlot, d as getAllSlotChildNodes, e as parseFunction, f as closest, g as getPreviousFromList, h as getNextFromList } from './chunk-c2033b1f.js';
import { a as InputGroupActionTypes } from './chunk-45c4a97b.js';
import { b as SelectActionTypes } from './chunk-ad9f4763.js';

class InputItem {
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
        this.invokeChangeCallback = parseFunction(this.changeCallback);
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
    static get style() { return ":host{-webkit-box-sizing:border-box;box-sizing:border-box}*,:after,:before{-webkit-box-sizing:inherit;box-sizing:inherit}:host,:host(.inline){display:inline-block}:host(.inline){margin-right:27px}.component{display:-ms-flexbox;display:flex;-ms-flex-flow:column;flex-flow:column}.component ::slotted([slot=description]){display:block;font-weight:400;line-height:24px;letter-spacing:0;font-size:16px;padding-top:5px;padding-left:37px;color:#666}.component>label{cursor:pointer;display:-ms-inline-flexbox;display:inline-flex;position:relative;padding-left:37px;color:#333;font-weight:400;line-height:24px;font-size:18px;margin-bottom:0}.component>label>input{position:absolute;opacity:0;height:0;width:0}.component>label>input+.sdx-icon:before{content:\"\";position:absolute;margin-left:-37px;margin-top:1px}.component.checkbox>label:hover>input+.sdx-icon sdx-icon{color:#adadad;-webkit-transform:scale(.5) translateZ(0);transform:scale(.5) translateZ(0)}.component.checkbox>label:hover>input:checked+.sdx-icon:before{border:2px solid #0851da}.component.checkbox>label:hover>input:checked+.sdx-icon sdx-icon{color:#1781e3}.component.checkbox>label>input+.sdx-icon:before{border:2px solid #adadad;border-radius:5px;width:22px;height:22px;-webkit-transition:all .3s cubic-bezier(.4,0,.2,1);transition:all .3s cubic-bezier(.4,0,.2,1)}.component.checkbox>label>input+.sdx-icon sdx-icon{position:absolute;margin-left:-34px;color:#adadad;-webkit-transform:scale(0) translateZ(0);transform:scale(0) translateZ(0);-webkit-transition:all .2s cubic-bezier(.4,0,.2,1);transition:all .2s cubic-bezier(.4,0,.2,1);-webkit-transform-origin:50% 50%;transform-origin:50% 50%}.component.checkbox>label>input:checked+.sdx-icon:before,.component.checkbox>label>input:focus+.sdx-icon:before{border:2px solid #1781e3}.component.checkbox>label>input:checked+.sdx-icon sdx-icon{color:#1781e3;-webkit-transform:scale(1) translateZ(0);transform:scale(1) translateZ(0)}.component.checkbox>label.disabled>label>input+.sdx-icon:after,.component.checkbox>label.disabled>label>input+.sdx-icon:before{-webkit-filter:inherit;filter:inherit}.component.checkbox>label.disabled>label>input+.sdx-icon:after{-webkit-transform:scale(0) translateZ(0);transform:scale(0) translateZ(0)}.component.checkbox>label.disabled>label>input:checked+.sdx-icon:after{-webkit-transform:scale(1) translateZ(0);transform:scale(1) translateZ(0)}.component.radio>label:hover>input+.sdx-icon:after{-webkit-transform:scale(.5) translateZ(0);transform:scale(.5) translateZ(0)}.component.radio>label:hover>input:checked+.sdx-icon:before{border:2px solid #0851da}.component.radio>label:hover>input:checked+.sdx-icon:after{border:5px solid #0851da;-webkit-transform:scale(1) translateZ(0);transform:scale(1) translateZ(0)}.component.radio>label>input+.sdx-icon:before{border:2px solid #adadad;border-radius:50%;width:22px;height:22px;-webkit-transition:border color 2s cubic-bezier(.4,0,.2,1);transition:border color 2s cubic-bezier(.4,0,.2,1)}.component.radio>label>input+.sdx-icon:after{content:\"\";position:absolute;margin-left:-31px;margin-top:7px;border:5px solid #adadad;border-radius:50%;-webkit-transform:scale(0) translateZ(0);transform:scale(0) translateZ(0);-webkit-transition:-webkit-transform .2s cubic-bezier(.4,0,.2,1);transition:-webkit-transform .2s cubic-bezier(.4,0,.2,1);transition:transform .2s cubic-bezier(.4,0,.2,1);transition:transform .2s cubic-bezier(.4,0,.2,1),-webkit-transform .2s cubic-bezier(.4,0,.2,1);-webkit-transform-origin:50% 50%;transform-origin:50% 50%}.component.radio>label>input:checked+.sdx-icon:before,.component.radio>label>input:focus+.sdx-icon:before{border:2px solid #1781e3}.component.radio>label>input:checked+.sdx-icon:after{border:5px solid #1781e3;-webkit-transform:scale(1) translateZ(0);transform:scale(1) translateZ(0)}.component.radio.disabled>label>input+.sdx-icon:before,.component.radio.disabled>label>input+.sdx-icon sdx-icon{-webkit-filter:inherit;filter:inherit}.component.radio.disabled>label>input+.sdx-icon sdx-icon{-webkit-transform:scale(0) translateZ(0);transform:scale(0) translateZ(0)}.component.radio.disabled>label>input:checked+.sdx-icon sdx-icon{-webkit-transform:scale(1) translateZ(0);transform:scale(1) translateZ(0)}.component.disabled ::slotted([slot=description]){opacity:.4}.component.disabled>label{opacity:.4;pointer-events:none;filter:alpha(opacity=40)}"; }
}

class SelectOption {
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
    static get style() { return ":host{-webkit-box-sizing:border-box;box-sizing:border-box}*,:after,:before{-webkit-box-sizing:inherit;box-sizing:inherit}:host{display:-ms-flexbox;display:flex;border:1px solid #d6d6d6;height:48px;cursor:pointer;color:#333}:host .component{height:100%;width:100%}:host .component .option{height:100%;width:100%;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;padding:0 16px;max-width:100%}:host(.focus:not(.disabled)),:host(:hover:not(.disabled)){background-color:#eef3f6}:host(.selected:not(.multiple)){border-color:#1781e3;background-color:#1781e3;color:#fff}:host(.selected.focus:not(.multiple)),:host(.selected:not(.multiple):hover){border-color:#0851da;background-color:#0851da}:host(.top){border-top:none}:host(.bottom){border-bottom:none}:host(.disabled){cursor:not-allowed;color:#d6d6d6}"; }
}

export { InputItem as SdxInputItem, SelectOption as SdxSelectOption };
