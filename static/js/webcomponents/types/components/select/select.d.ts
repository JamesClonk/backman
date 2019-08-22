import '../../stencil.core';
import { KeyboardBehavior } from "./types";
import { SelectState } from "./select-store";
import { BackgroundTheme, Display } from "../../core/types/types";
export declare class Select {
    private selection;
    private listEl?;
    private listContainerEl?;
    private wrapperEl?;
    private filterInputFieldEl?;
    private focussedEl?;
    private invokeSelectCallback;
    private invokeChangeCallback;
    private dimensionMetaData;
    private clicking;
    private placeholderWhenOpened;
    private componentChildrenWillLoadComplete;
    private componentDidLoadComplete;
    private store;
    private unsubscribe;
    private hasFilterInputFieldElFocus;
    private hadFilterInputFieldElFocus;
    private maxDropdownHeight;
    private static readonly maxAutocompleteOptionsMobile;
    private static readonly maxAutocompleteOptionsDesktop;
    private static readonly minSpaceToWindow;
    private lightDOMHiddenFormInputEls;
    private easing;
    private blockScrollingWhenOpened;
    el: HTMLSdxSelectElement;
    selectionSorted: SelectState["selectionSorted"];
    selectionBatch: SelectState["selectionBatch"];
    animationDuration: SelectState["animationDuration"];
    optionElsSorted: SelectState["optionElsSorted"];
    optgroupEls: SelectState["optgroupEls"];
    filter: SelectState["filter"];
    display: Display;
    foundMatches: number;
    focussed: boolean;
    filterInputFieldElValue: SelectState["filter"];
    /**
     * Text to be displayed when nothing is selected.
     */
    placeholder: string;
    /**
     * Enable multi select.
     */
    multiple: boolean;
    /**
     * Will be written on the top of the sdx-select.
     */
    label: string;
    /**
     * Disables the sdx-select.
     */
    disabled: boolean;
    /**
     * Shows a loading spinner and disables the sdx-select.
     */
    loading: boolean;
    /**
     * How the component should behave if the user types something on the keyboard.
     * "focus" jumps to and focuses the option starting with the typed character.
     * "filter" lists only options (and optgroups) that match the entered keyword.
     * "autocomplete" is similar to "filter", but makes the component behave more
     * like an input field, e.g. the "value" reflects the content of the filter and
     * there is no thumb to open or close.
     */
    keyboardBehavior: KeyboardBehavior;
    /**
     * @private Deprecated, use "keyboard-behavior"
     * Filter the options of the sdx-select by typing.
     * Shortcut for keyboard-behavior="filter"
     */
    filterable: boolean;
    /**
     * Maximum dropdown height in px.
     */
    maxHeight: number;
    /**
     * Callback when user selects an option (and the select is *not* in "autocomplete" mode).
     */
    selectCallback: ((selection: any[]) => void) | string | undefined;
    /**
     * Callback when user selects an option (or types something while in "autocomplete" mode).
     */
    changeCallback: ((selection: any[]) => void) | string | undefined;
    /**
     * Label for "no matches found".
     */
    noMatchesFoundLabel: string;
    /**
     * Background color scheme.
     */
    backgroundTheme: BackgroundTheme;
    /**
     * The value(s) of the currently selected option(s).
     * Please note that this is always an array, even without the "multiple" attribute,
     * for both getting and setting the value (e.g. mySelect.value = [ "value1" ]).
     */
    value: any[];
    /**
     * Name parameter (useful when the item is embedded in a traditional HTML form submit).
     */
    name: string | undefined;
    /**
     * Function that decides whether an option element matches a filter by returning true or
     * false. Defaults to a function that performs a simple string match test on the option
     * elements textContent property. Used when "keyboard-behavior" is "filter" or "autocomplete".
     */
    filterFunction: ((optionEl: HTMLSdxSelectOptionElement, keyword: string) => boolean) | string | undefined;
    /**
     * @private
     * Disable animations for testing.
     */
    animated: boolean;
    selectionSortedChanged(): void;
    selectCallbackChanged(): void;
    changeCallbackChanged(): void;
    placeholderChanged(): void;
    valueChanged(): void;
    nameChanged(): void;
    filterFunctionChanged(): void;
    onFocus(): void;
    onMouseDown(): void;
    onMouseUp(): void;
    onBlur(): void;
    onWindowClick(e: MouseEvent): void;
    onKeyDown(e: KeyboardEvent): void;
    /**
     * Returns the current selection.
     */
    getSelection(): any[];
    /**
     * Toggles the sdx-select.
     */
    toggle(): Promise<void>;
    /**
     * Opens the sdx-select.
     */
    open(): Promise<void>;
    /**
     * Closes the sdx-select.
     */
    close(): Promise<void>;
    componentWillLoad(): void;
    componentDidLoad(): void;
    componentDidUpdate(): void;
    componentDidUnload(): void;
    private getInitialState;
    private resetFilter;
    private setFilterFunction;
    private commitChildrensValues;
    private resetFilterInputField;
    private clearFilter;
    private getListContainerStyle;
    /**
     * Measures the sdx-select and return the results, for example
     * if there's enough space or if scrolling is required.
     */
    private getDimensionMetaData;
    private defaultFilterFunction;
    /**
     * Returns true if an option element matches the filter (e.g. in "ca" in "Car").
     * @param el The option to be tested.
     * @param keyword The Filter to be tested.
     */
    private optionElMatchesFilter;
    private isValidFilter;
    private isValidAutocomplete;
    private setFocussedEl;
    /**
     * Scrolls the list the way that an option is visible in the center.
     */
    private scrollToOption;
    /**
     * Takes a keycode and returns the corresponding character (or an empty string if invalid)
     * @param code Keycode from a keyboard event.
     */
    private getLetterByCharCode;
    /**
     * Returns all options starting with a certain letter.
     * @param letter Key value to look for.
     */
    private getOptionsByFirstLetter;
    /**
     * Sets the focussed option starting by a given letter.
     * @param letter Key value to look for.
     */
    private setFocussedElByFirstLetter;
    /**
     * Checks if a given element is part of the sdx-select or the sdx-select itself.
     * Warning: this only works if the sdx-select isn't inside of a shadow-root!
     * @param el Element to check.
     */
    private isSelectEl;
    /**
     * Determines whether the placeholder option should be rendered:
     *  - when no selection is in progress (user experience: list should not rerender while open),
     *  - when something is selected,
     *  - the placeholder prop exists
     *  - and when single select
     */
    private showPlaceholder;
    /**
     * Get the text that will be displayed in the selection header.
     * Fall back to an empty string if there's no selection.
     */
    private getFormattedSelection;
    private setInvokeSelectCallback;
    private setInvokeChangeCallback;
    private onHeaderClick;
    private onFilterInputFieldFocus;
    private onFilterInputFieldBlur;
    private onFilterInputFieldChange;
    private onFilterInputFieldInput;
    /**
     * Selects an option.
     * @param option Instance of SelectOption to be selected.
     * @param strategy How to handle the selection (e.g. add or remove).
     * @param doClose If the select should be closed (this is intended to happen after user interaction; not after programmatic changes)
     */
    private select;
    private updateHiddenFormInputEl;
    /**
     * True if this sdx-select is filterable using a filter input field.
     */
    private isFilterable;
    /**
     * Checks which "keyboard-behavior" prop is set, including backwards
     * compatibility with the deprecated "filterable" prop.
     * @param keyboardBehavior Behavior to test.
     */
    private isKeyboardBehavior;
    private getMatchingOptionElsCount;
    private isAutocomplete;
    private isOpenOrOpening;
    private isClosedOrClosing;
    private getComponentClassNames;
    private getInputStyle;
    hostData(): {
        "aria-expanded": string;
    };
    render(): JSX.Element;
}
