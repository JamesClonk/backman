import '../../stencil.core';
export declare class Search {
    private sdxInputEl?;
    private invokeSearchSubmitCallback;
    private invokeValueChangeCallback;
    private invokeChangeCallback;
    private resizeTimer?;
    el: HTMLSdxSearchElement;
    inputValue: string;
    /**
     * Default text that will disappear on type.
     */
    placeholder: string;
    /**
     * Text for the screen reader labelling the search input field.
     */
    srHint: string;
    /**
     * Button text for the screen reader to read in place of the search icon.
     */
    srHintForButton: string;
    /**
     * Callback that will fire on hitting enter or on clicking the button.
     */
    searchSubmitCallback: ((value: string) => void) | string | undefined;
    /**
     * Callback that will fire on change (same as changeCallback).
     */
    valueChangeCallback: ((value: string) => void) | string | undefined;
    /**
     * Callback that will fire on change (same as valueChangeCallback).
     */
    changeCallback: ((value: string) => void) | string | undefined;
    searchSubmitCallbackChanged(): void;
    valueChangeCallbackChanged(): void;
    changeCallbackChanged(): void;
    onWindowResizeThrottled(): void;
    componentWillLoad(): void;
    private submitSearch;
    private changeHandler;
    private setInvokeSearchSubmitCallback;
    private setInvokeValueChangeCallback;
    private setInvokeChangeCallback;
    private showSearchIcon;
    render(): JSX.Element;
}
