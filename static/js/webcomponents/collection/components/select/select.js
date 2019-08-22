import anime from "animejs";
import bodyScrollLock from "body-scroll-lock";
import { selectReducer, SelectActionTypes } from "./select-store";
import * as wcHelpers from "../../core/helpers/webcomponent-helpers";
import { createAndInstallStore, mapStateToProps } from "../../core/helpers/store-helpers";
import { isDesktopOrLarger } from "../../core/helpers/breakpoint-helpers";
export class Select {
    constructor() {
        this.invokeSelectCallback = () => null;
        this.invokeChangeCallback = () => null;
        this.dimensionMetaData = this.getDimensionMetaData();
        this.clicking = false;
        this.placeholderWhenOpened = null;
        this.componentChildrenWillLoadComplete = false;
        this.componentDidLoadComplete = false;
        this.hasFilterInputFieldElFocus = false;
        this.hadFilterInputFieldElFocus = false;
        this.maxDropdownHeight = Infinity;
        this.lightDOMHiddenFormInputEls = [];
        this.easing = {
            inQuadOutQuint: [0.550, 0.085, 0.320, 1]
        };
        this.blockScrollingWhenOpened = false;
        this.filter = "";
        this.display = "closed";
        this.foundMatches = 0;
        this.focussed = false;
        this.filterInputFieldElValue = "";
        this.placeholder = "";
        this.multiple = false;
        this.label = "";
        this.disabled = false;
        this.loading = false;
        this.keyboardBehavior = "focus";
        this.filterable = false;
        this.maxHeight = Infinity;
        this.noMatchesFoundLabel = "No matches found...";
        this.backgroundTheme = "light";
        this.value = [];
        this.name = undefined;
        this.animated = true;
    }
    selectionSortedChanged() {
        if (!this.componentChildrenWillLoadComplete) {
            return;
        }
        if (this.optionElsSorted.length && !this.selectionSorted.length && !this.placeholder) {
            this.store.dispatch({
                type: SelectActionTypes.select,
                optionEl: this.optionElsSorted[0],
                strategy: "add"
            });
            this.store.dispatch({ type: SelectActionTypes.commitSelectionBatch });
        }
        this.selection = this.selectionSorted.map((optionEl) => optionEl.value);
        this.value = this.selection;
        if (this.isFilterable()) {
            this.resetFilterInputField();
        }
    }
    selectCallbackChanged() {
        this.setInvokeSelectCallback();
    }
    changeCallbackChanged() {
        this.setInvokeChangeCallback();
    }
    placeholderChanged() {
        this.resetFilter();
    }
    valueChanged() {
        this.updateHiddenFormInputEl();
        if (this.componentDidLoadComplete) {
            this.invokeChangeCallback(this.value);
        }
        if (this.isAutocomplete()) {
            const filter = this.value[0] || "";
            this.store.dispatch({
                type: SelectActionTypes.setFilter,
                filter
            });
            this.filterInputFieldElValue = filter;
            return;
        }
        if (this.componentDidLoadComplete) {
            this.invokeSelectCallback(this.value);
        }
        if (this.value === this.selection) {
            return;
        }
        const foundOptionEls = [];
        if (Array.isArray(this.value)) {
            for (let i = 0; i < this.value.length; i++) {
                const value = this.value[i];
                const foundOptionEl = this.optionElsSorted.find((optionEl) => optionEl.value === value);
                if (foundOptionEl) {
                    if (this.multiple || (!this.multiple && i === 0)) {
                        foundOptionEls.push(foundOptionEl);
                    }
                }
            }
        }
        this.store.dispatch({ type: SelectActionTypes.setSelectionBatch, optionEls: foundOptionEls });
        this.store.dispatch({ type: SelectActionTypes.commitSelectionBatch });
    }
    nameChanged() {
        this.updateHiddenFormInputEl();
    }
    filterFunctionChanged() {
        this.setFilterFunction();
    }
    onFocus() {
        if (!this.clicking) {
        }
        this.focussed = true;
    }
    onMouseDown() {
        this.clicking = true;
    }
    onMouseUp() {
        this.clicking = false;
    }
    onBlur() {
        if (!this.clicking) {
            this.close();
        }
        this.focussed = false;
    }
    onWindowClick(e) {
        if (!this.isSelectEl(e.target)) {
            this.close();
        }
    }
    onKeyDown(e) {
        if (!this.focussed) {
            return;
        }
        switch (e.which) {
            case 32:
                const shadowRoot = this.el.shadowRoot;
                if (!shadowRoot.activeElement || shadowRoot.activeElement !== this.filterInputFieldEl) {
                    e.preventDefault();
                    if (this.isOpenOrOpening() && !this.multiple && this.focussedEl) {
                        this.focussedEl.click();
                    }
                    else {
                        this.toggle();
                    }
                }
                break;
            case 13:
                e.preventDefault();
                if (this.focussedEl) {
                    this.focussedEl.click();
                }
                break;
            case 38:
                e.preventDefault();
                this.setFocussedEl("previous");
                if (!this.isAutocomplete()) {
                    this.open();
                }
                break;
            case 40:
                e.preventDefault();
                this.setFocussedEl("next");
                if (!this.isAutocomplete()) {
                    this.open();
                }
                break;
            case 27:
                this.close();
                break;
            default:
                const letter = this.getLetterByCharCode(e.which);
                if (letter) {
                    if (!this.isFilterable()) {
                        this.setFocussedElByFirstLetter(letter);
                    }
                }
        }
    }
    getSelection() {
        return this.selection;
    }
    toggle() {
        return new Promise((resolve) => {
            if (this.isAutocomplete()) {
                if (this.isValidAutocomplete(this.filterInputFieldElValue)) {
                    this.open().then(resolve);
                }
                else {
                    resolve();
                }
                return;
            }
            if (this.isOpenOrOpening()) {
                this.close().then(resolve);
            }
            else if (this.isClosedOrClosing()) {
                this.open().then(resolve);
            }
            else {
                resolve();
            }
        });
    }
    open() {
        return new Promise((resolve) => {
            if (!this.isClosedOrClosing()) {
                resolve();
                return;
            }
            if (this.blockScrollingWhenOpened) {
                bodyScrollLock.disableBodyScroll(this.listContainerEl, {
                    allowTouchMove: (el) => {
                        let currentEl = el;
                        while (currentEl && currentEl !== document.body) {
                            if (currentEl.classList.contains("list-container")) {
                                if (currentEl.scrollHeight > currentEl.clientHeight) {
                                    return true;
                                }
                            }
                            currentEl = currentEl.parentNode;
                        }
                        return false;
                    }
                });
            }
            this.placeholderWhenOpened = this.showPlaceholder();
            this.dimensionMetaData = this.getDimensionMetaData();
            this.store.dispatch({ type: SelectActionTypes.setDirection, direction: this.dimensionMetaData.direction });
            this.display = "opening";
            anime({
                targets: this.listContainerEl,
                scaleY: 1,
                opacity: 1,
                duration: this.animationDuration,
                easing: this.easing.inQuadOutQuint,
                complete: () => {
                    this.display = "open";
                    this.listContainerEl.style.transform = null;
                    resolve();
                }
            });
        });
    }
    close() {
        return new Promise((resolve) => {
            if (this.display !== "open") {
                resolve();
                return;
            }
            if (this.blockScrollingWhenOpened) {
                bodyScrollLock.enableBodyScroll(this.listContainerEl);
            }
            this.display = "closing";
            this.setFocussedEl(null);
            anime({
                targets: this.listContainerEl,
                scaleY: 0,
                opacity: .2,
                duration: this.animationDuration,
                easing: this.easing.inQuadOutQuint,
                complete: () => {
                    this.display = "closed";
                    this.placeholderWhenOpened = null;
                    if (this.isKeyboardBehavior("filter")) {
                        this.filterInputFieldEl.unsetFocus();
                    }
                    resolve();
                }
            });
        });
    }
    componentWillLoad() {
        this.updateHiddenFormInputEl();
        this.store = createAndInstallStore(this, selectReducer, this.getInitialState());
        this.unsubscribe = mapStateToProps(this, this.store, [
            "selectionBatch",
            "selectionSorted",
            "animationDuration",
            "optionElsSorted",
            "optgroupEls",
            "filter"
        ]);
        this.store.dispatch({ type: SelectActionTypes.setMultiple, multiple: this.multiple });
        this.store.dispatch({ type: SelectActionTypes.setSelect, select: this.select.bind(this) });
        this.store.dispatch({ type: SelectActionTypes.setAnimationDuration, animationDuration: this.animationDuration });
        this.setInvokeSelectCallback();
        this.setInvokeChangeCallback();
        this.setFilterFunction();
        this.maxDropdownHeight = this.maxHeight;
        this.resetFilterInputField();
    }
    componentDidLoad() {
        this.componentChildrenWillLoadComplete = true;
        this.commitChildrensValues();
        this.listContainerEl.style.opacity = ".2";
        this.listContainerEl.style.transform = "scaleY(0)";
        this.componentDidLoadComplete = true;
    }
    componentDidUpdate() {
        this.store.dispatch({ type: SelectActionTypes.setMultiple, multiple: this.multiple });
        this.commitChildrensValues();
    }
    componentDidUnload() {
        this.unsubscribe();
    }
    getInitialState() {
        return {
            selection: [],
            selectionBatch: [],
            selectionSorted: [],
            multiple: false,
            direction: "bottom",
            select: () => null,
            animationDuration: this.animated ? 200 : 0,
            optionEls: [],
            optionElsBatch: [],
            optionElsSorted: [],
            optgroupEls: [],
            optgroupElsBatch: [],
            filter: "",
            filterFunction: () => true
        };
    }
    resetFilter() {
        if (this.isFilterable()) {
            this.resetFilterInputField();
            this.clearFilter();
        }
    }
    setFilterFunction() {
        this.store.dispatch({
            type: SelectActionTypes.setFilterFunction,
            filterFunction: this.optionElMatchesFilter.bind(this)
        });
    }
    commitChildrensValues() {
        this.store.dispatch({ type: SelectActionTypes.commitOptionElsBatch });
        this.store.dispatch({ type: SelectActionTypes.commitOptGroupElsBatch });
        this.store.dispatch({ type: SelectActionTypes.commitSelectionBatch });
    }
    resetFilterInputField() {
        this.filterInputFieldElValue = this.getFormattedSelection();
    }
    clearFilter() {
        this.store.dispatch({ type: SelectActionTypes.setFilter, filter: "" });
    }
    getListContainerStyle() {
        if (!this.componentChildrenWillLoadComplete) {
            return {};
        }
        const elRect = this.el.getBoundingClientRect();
        const wrapperElRect = this.wrapperEl.getBoundingClientRect();
        let offset = this.dimensionMetaData.direction === "bottom"
            ? wrapperElRect.top - elRect.top + wrapperElRect.height
            : wrapperElRect.height;
        offset = offset - 1;
        return {
            top: this.dimensionMetaData.direction === "bottom" ? `${offset}px` : "auto",
            bottom: this.dimensionMetaData.direction === "top" ? `${offset}px` : "auto",
            transformOrigin: (this.dimensionMetaData.direction === "top") ? "0 100%" : "50% 0",
            maxHeight: this.dimensionMetaData.maxHeight
                ? `${this.dimensionMetaData.maxHeight}px`
                : "0"
        };
    }
    getDimensionMetaData() {
        if (!(this.wrapperEl && this.listEl)) {
            return {
                direction: "bottom",
                maxHeight: null
            };
        }
        const wrapperElRect = this.wrapperEl.getBoundingClientRect();
        let spaceTowardsTop = wrapperElRect.top - Select.minSpaceToWindow;
        let spaceTowardsBottom = innerHeight - wrapperElRect.bottom - Select.minSpaceToWindow;
        const listElHeight = this.listEl.clientHeight;
        if (this.maxDropdownHeight < Infinity) {
            spaceTowardsTop = spaceTowardsTop < this.maxDropdownHeight
                ? spaceTowardsTop
                : this.maxDropdownHeight;
            spaceTowardsBottom = spaceTowardsBottom < this.maxDropdownHeight
                ? spaceTowardsBottom
                : this.maxDropdownHeight;
        }
        if (spaceTowardsBottom >= listElHeight) {
            return {
                direction: "bottom",
                maxHeight: spaceTowardsBottom
            };
        }
        else if (spaceTowardsTop >= listElHeight) {
            return {
                direction: "top",
                maxHeight: spaceTowardsTop
            };
        }
        else if (spaceTowardsTop > spaceTowardsBottom) {
            return {
                direction: "top",
                maxHeight: spaceTowardsTop
            };
        }
        else {
            return {
                direction: "bottom",
                maxHeight: spaceTowardsBottom
            };
        }
    }
    defaultFilterFunction(optionEl, keyword) {
        const textContent = optionEl.textContent;
        if (!textContent) {
            return false;
        }
        return textContent.toLowerCase().indexOf(keyword.toLowerCase()) > -1;
    }
    optionElMatchesFilter(el, keyword) {
        let filterFunction = this.defaultFilterFunction;
        if (this.filterFunction) {
            filterFunction = wcHelpers.parseFunction(this.filterFunction);
        }
        let match = filterFunction(el, keyword);
        if (this.isAutocomplete() && !keyword) {
            match = false;
        }
        if (this.isAutocomplete()) {
            const allOptionEls = this.el.querySelectorAll("sdx-select-option");
            let visibleOptionElsCount = 0;
            for (let i = 0; i < allOptionEls.length; i++) {
                const optionEl = allOptionEls[i];
                if (el !== optionEl && optionEl.style.display !== "none") {
                    visibleOptionElsCount++;
                }
            }
            if ((isDesktopOrLarger() && visibleOptionElsCount >= Select.maxAutocompleteOptionsDesktop)
                ||
                    (!isDesktopOrLarger() && visibleOptionElsCount >= Select.maxAutocompleteOptionsMobile)) {
                match = false;
            }
        }
        this.el.forceUpdate();
        return match;
    }
    isValidFilter(keyword) {
        return (keyword.length >= 2 &&
            keyword !== this.getFormattedSelection());
    }
    isValidAutocomplete(keyword) {
        return keyword.length >= 3;
    }
    setFocussedEl(which) {
        for (let i = 0; i < this.optionElsSorted.length; ++i) {
            const optionEl = this.optionElsSorted[i];
            optionEl.classList.remove("focus");
        }
        if (which === null) {
            delete this.focussedEl;
            return;
        }
        if (which === "previous" || which === "next") {
            const lastSelectedOptionEl = this.selectionSorted[this.selectionSorted.length - 1];
            let focussedEl = this.focussedEl || lastSelectedOptionEl;
            if (which === "previous") {
                let previousElement = wcHelpers.getPreviousFromList(this.optionElsSorted, focussedEl);
                while (previousElement !== focussedEl && (previousElement.disabled || previousElement.style.display === "none")) {
                    previousElement = wcHelpers.getPreviousFromList(this.optionElsSorted, previousElement);
                }
                this.focussedEl = previousElement;
            }
            else {
                let nextElement = wcHelpers.getNextFromList(this.optionElsSorted, focussedEl);
                while (nextElement !== focussedEl && (nextElement.disabled || nextElement.style.display === "none")) {
                    nextElement = wcHelpers.getNextFromList(this.optionElsSorted, nextElement);
                }
                this.focussedEl = nextElement;
            }
        }
        else {
            this.focussedEl = which;
        }
        this.focussedEl.classList.add("focus");
        this.scrollToOption(this.focussedEl);
    }
    scrollToOption(option) {
        const parent = this.listContainerEl;
        const optionRect = option.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        const isFullyVisible = optionRect.top >= parentRect.top && optionRect.bottom <= parentRect.top + parent.clientHeight;
        if (!isFullyVisible) {
            parent.scrollTop = optionRect.top + parent.scrollTop - parentRect.top;
        }
    }
    getLetterByCharCode(code) {
        if (code < 48 || code > 105) {
            return "";
        }
        return String.fromCharCode(96 <= code && code <= 105 ? code - 48 : code).toLowerCase();
    }
    getOptionsByFirstLetter(letter) {
        const results = [];
        for (let i = 0; i < this.optionElsSorted.length; ++i) {
            const option = this.optionElsSorted[i];
            if (option.textContent && option.textContent.toLowerCase().charAt(0) === letter) {
                results.push(option);
            }
        }
        return results;
    }
    setFocussedElByFirstLetter(letter) {
        const optionsByFirstLetter = this.getOptionsByFirstLetter(letter);
        if (optionsByFirstLetter.length) {
            let startIndex = 0;
            if (this.focussedEl) {
                const focussedElIndex = optionsByFirstLetter.indexOf(this.focussedEl);
                if (focussedElIndex > -1) {
                    startIndex = focussedElIndex;
                }
            }
            let option = optionsByFirstLetter[startIndex];
            if (option.disabled || option === this.focussedEl) {
                for (let i = 0; i < optionsByFirstLetter.length; ++i) {
                    option = wcHelpers.getNextFromList(optionsByFirstLetter, optionsByFirstLetter[startIndex]);
                    if (option.disabled) {
                        option = null;
                    }
                    else {
                        break;
                    }
                    if (startIndex < optionsByFirstLetter.length) {
                        ++startIndex;
                    }
                    else {
                        startIndex = 0;
                    }
                }
            }
            if (option) {
                this.setFocussedEl(option);
            }
        }
    }
    isSelectEl(el) {
        return !!wcHelpers.closest(el, this.el);
    }
    showPlaceholder() {
        const showPlaceholder = !!this.selectionSorted.length && !!this.placeholder && !this.multiple;
        if (this.placeholderWhenOpened !== null) {
            return this.placeholderWhenOpened;
        }
        return showPlaceholder;
    }
    getFormattedSelection() {
        return this.selectionSorted.length
            ? this.selectionSorted.map((optionEl) => {
                const text = optionEl.textContent;
                return text ? text.trim() : "";
            }).join(", ")
            : "";
    }
    setInvokeSelectCallback() {
        this.invokeSelectCallback = wcHelpers.parseFunction(this.selectCallback);
    }
    setInvokeChangeCallback() {
        this.invokeChangeCallback = wcHelpers.parseFunction(this.changeCallback);
    }
    onHeaderClick(e) {
        const targetEl = e.target;
        const didClickOnSdxInputEl = !!wcHelpers.closest(targetEl, this.filterInputFieldEl);
        if (this.isFilterable() && this.isOpenOrOpening() && didClickOnSdxInputEl && !this.hadFilterInputFieldElFocus) {
        }
        else {
            this.toggle();
        }
        this.hadFilterInputFieldElFocus = this.hasFilterInputFieldElFocus;
    }
    onFilterInputFieldFocus() {
        this.hasFilterInputFieldElFocus = true;
    }
    onFilterInputFieldBlur() {
        this.hasFilterInputFieldElFocus = false;
    }
    onFilterInputFieldChange(value) {
        if (this.isAutocomplete()) {
            this.value = [value];
        }
    }
    onFilterInputFieldInput(value) {
        this.store.dispatch({
            type: SelectActionTypes.setFilter,
            filter: this.isValidFilter(value) ? value : ""
        });
        if (this.isKeyboardBehavior("filter")) {
            if (this.isValidFilter(this.filter)) {
                this.open();
            }
        }
        else if (this.isKeyboardBehavior("autocomplete")) {
            if (this.isValidAutocomplete(value)) {
                this.open();
            }
            else {
                this.close();
            }
        }
    }
    select(option, strategy, doClose = false) {
        if (!this.multiple) {
            if (option.isSelected() || option.disabled) {
                if (doClose) {
                    this.close();
                }
                if (option.disabled) {
                    return;
                }
                this.resetFilter();
            }
        }
        if (this.isAutocomplete()) {
            if (strategy === "add") {
                this.filterInputFieldElValue = option.el.textContent;
            }
        }
        else {
            this.store.dispatch({
                type: SelectActionTypes.select,
                optionEl: option.placeholder === true ? null : option.el,
                strategy
            });
        }
        if (!this.multiple) {
            if (!this.isAutocomplete()) {
                this.resetFilterInputField();
            }
            setTimeout(() => {
                let close = Promise.resolve();
                if (doClose) {
                    close = this.close();
                }
                close.then(() => {
                    if (!this.isAutocomplete()) {
                        this.clearFilter();
                    }
                });
            }, this.animationDuration);
        }
    }
    updateHiddenFormInputEl() {
        if (this.value && this.name) {
            this.lightDOMHiddenFormInputEls.forEach((lightDOMHiddenFormInputEl) => {
                this.el.removeChild(lightDOMHiddenFormInputEl);
            });
            this.lightDOMHiddenFormInputEls = [];
            for (let i = 0; i < this.value.length; i++) {
                const value = this.value[i];
                const lightDOMHiddenFormInputEl = document.createElement("input");
                lightDOMHiddenFormInputEl.type = "hidden";
                lightDOMHiddenFormInputEl.name = this.name;
                lightDOMHiddenFormInputEl.value = value;
                this.lightDOMHiddenFormInputEls.push(lightDOMHiddenFormInputEl);
                this.el.appendChild(lightDOMHiddenFormInputEl);
            }
        }
    }
    isFilterable() {
        return this.isKeyboardBehavior("filter") || this.isKeyboardBehavior("autocomplete");
    }
    isKeyboardBehavior(keyboardBehavior) {
        const isMatch = keyboardBehavior === this.keyboardBehavior;
        if (keyboardBehavior === "filter" && (isMatch || this.filterable)) {
            return true;
        }
        return isMatch;
    }
    getMatchingOptionElsCount() {
        const optionEls = this.el.querySelectorAll("sdx-select-option");
        let count = 0;
        for (let i = 0; i < optionEls.length; i++) {
            if (optionEls[i].style.display !== "none") {
                count++;
            }
        }
        return count;
    }
    isAutocomplete() {
        return this.keyboardBehavior === "autocomplete";
    }
    isOpenOrOpening() {
        return this.display === "open" || this.display === "opening";
    }
    isClosedOrClosing() {
        return this.display === "closed" || this.display === "closing";
    }
    getComponentClassNames() {
        return {
            component: true,
            [this.backgroundTheme]: true,
            [this.display]: true,
            [this.dimensionMetaData.direction]: !this.isClosedOrClosing(),
            disabled: this.disabled,
            loading: this.loading,
            filterable: this.isFilterable(),
            autocomplete: this.isAutocomplete(),
            focus: this.focussed
        };
    }
    getInputStyle() {
        const openOrOpening = this.isOpenOrOpening();
        const directionToTop = this.dimensionMetaData.direction === "top";
        const directionToBottom = this.dimensionMetaData.direction === "bottom";
        return {
            paddingRight: this.isAutocomplete() ? "" : "48px",
            borderTopLeftRadius: openOrOpening && directionToTop ? "0" : "",
            borderTopRightRadius: openOrOpening && directionToTop ? "0" : "",
            borderBottomLeftRadius: openOrOpening && directionToBottom ? "0" : "",
            borderBottomRightRadius: openOrOpening && directionToBottom ? "0" : ""
        };
    }
    hostData() {
        return {
            "aria-expanded": (this.display === "open").toString()
        };
    }
    render() {
        return (h("div", { class: this.getComponentClassNames() },
            this.label &&
                h("label", { class: "label", onClick: () => this.toggle() }, this.label),
            h("div", { class: "wrapper", ref: (el) => this.wrapperEl = el },
                h("div", { class: "header-wrapper" },
                    h("div", { class: "header", onClick: (e) => this.onHeaderClick(e) },
                        h("div", { class: "selection" }, this.isFilterable()
                            ? (h("sdx-input", { value: this.filterInputFieldElValue, ref: (el) => this.filterInputFieldEl = el, changeCallback: (value) => this.onFilterInputFieldChange(value), inputCallback: (value) => this.onFilterInputFieldInput(value), focusCallback: () => this.onFilterInputFieldFocus(), blurCallback: () => this.onFilterInputFieldBlur(), autocomplete: false, placeholder: this.placeholder, selectTextOnFocus: this.isKeyboardBehavior("filter"), inputStyle: this.getInputStyle() }))
                            : (h("sdx-input", { value: this.getFormattedSelection() || this.placeholder, editable: false, inputStyle: Object.assign({}, this.getInputStyle(), { color: this.isOpenOrOpening() ? "#1781e3" : "" }) }))),
                        (!this.isAutocomplete() || this.loading) &&
                            h("div", { class: "thumb" }, this.loading
                                ? h("sdx-loading-spinner", null)
                                : h("div", { class: "icon" })))),
                h("div", { class: "list-container", ref: (el) => this.listContainerEl = el, style: this.getListContainerStyle(), tabIndex: -1 },
                    h("div", { class: "list", ref: (el) => this.listEl = el },
                        this.showPlaceholder() &&
                            h("sdx-select-option", { placeholder: true }, this.placeholder),
                        h("div", { class: "slot" },
                            h("slot", null)),
                        this.isValidFilter(this.filter) && this.getMatchingOptionElsCount() === 0 &&
                            h("div", { class: "no-matches-found" }, this.noMatchesFoundLabel))))));
    }
    static get is() { return "sdx-select"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "animated": {
            "type": Boolean,
            "attr": "animated"
        },
        "animationDuration": {
            "state": true
        },
        "backgroundTheme": {
            "type": String,
            "attr": "background-theme"
        },
        "changeCallback": {
            "type": String,
            "attr": "change-callback",
            "watchCallbacks": ["changeCallbackChanged"]
        },
        "close": {
            "method": true
        },
        "disabled": {
            "type": Boolean,
            "attr": "disabled"
        },
        "display": {
            "state": true
        },
        "el": {
            "elementRef": true
        },
        "filter": {
            "state": true
        },
        "filterable": {
            "type": Boolean,
            "attr": "filterable"
        },
        "filterFunction": {
            "type": String,
            "attr": "filter-function",
            "watchCallbacks": ["filterFunctionChanged"]
        },
        "filterInputFieldElValue": {
            "state": true
        },
        "focussed": {
            "state": true
        },
        "foundMatches": {
            "state": true
        },
        "getSelection": {
            "method": true
        },
        "keyboardBehavior": {
            "type": String,
            "attr": "keyboard-behavior"
        },
        "label": {
            "type": String,
            "attr": "label"
        },
        "loading": {
            "type": Boolean,
            "attr": "loading"
        },
        "maxHeight": {
            "type": Number,
            "attr": "max-height"
        },
        "multiple": {
            "type": Boolean,
            "attr": "multiple"
        },
        "name": {
            "type": String,
            "attr": "name",
            "watchCallbacks": ["nameChanged"]
        },
        "noMatchesFoundLabel": {
            "type": String,
            "attr": "no-matches-found-label"
        },
        "open": {
            "method": true
        },
        "optgroupEls": {
            "state": true
        },
        "optionElsSorted": {
            "state": true
        },
        "placeholder": {
            "type": String,
            "attr": "placeholder",
            "watchCallbacks": ["placeholderChanged"]
        },
        "selectCallback": {
            "type": String,
            "attr": "select-callback",
            "watchCallbacks": ["selectCallbackChanged"]
        },
        "selectionBatch": {
            "state": true
        },
        "selectionSorted": {
            "state": true,
            "watchCallbacks": ["selectionSortedChanged"]
        },
        "toggle": {
            "method": true
        },
        "value": {
            "type": "Any",
            "attr": "value",
            "mutable": true,
            "watchCallbacks": ["valueChanged"]
        }
    }; }
    static get listeners() { return [{
            "name": "focus",
            "method": "onFocus",
            "capture": true
        }, {
            "name": "mousedown",
            "method": "onMouseDown",
            "passive": true
        }, {
            "name": "mouseup",
            "method": "onMouseUp",
            "passive": true
        }, {
            "name": "blur",
            "method": "onBlur",
            "capture": true
        }, {
            "name": "window:click",
            "method": "onWindowClick"
        }, {
            "name": "window:touchend",
            "method": "onWindowClick",
            "passive": true
        }, {
            "name": "window:keydown",
            "method": "onKeyDown"
        }]; }
    static get style() { return "/**style-placeholder:sdx-select:**/"; }
}
Select.maxAutocompleteOptionsMobile = 5;
Select.maxAutocompleteOptionsDesktop = 10;
Select.minSpaceToWindow = 24;
