import '../../stencil.core';
export declare class Input {
    private invokeHitEnterCallback;
    private invokeChangeCallback;
    private invokeInputCallback;
    private invokeFocusCallback;
    private invokeBlurCallback;
    private inputEl?;
    el: HTMLSdxInputElement;
    id: string;
    /**
     * Text for the screen reader labelling the input field.
     */
    srHint: string;
    /**
     * Callback that will fire on hitting enter.
     */
    hitEnterCallback?: (() => void) | string;
    /**
     * Callback that will fire on change (regardless of method, keyboard or programmatical).
     */
    changeCallback?: ((value: string) => void) | string;
    /**
     * Callback that will fire when the value changes using the keyboard.
     */
    inputCallback?: ((value: string) => void) | string;
    /**
     * Callback that will fire when the input gets focus.
     */
    focusCallback?: (() => void) | string;
    /**
     * Callback that will fire when the input loses focus.
     */
    blurCallback?: (() => void) | string;
    /**
     * Default text that will be shown unless there's a value.
     */
    placeholder: string;
    /**
     * Default input field type (e.g. search, password etc.).
     */
    type: string;
    /**
     * The initial value.
     */
    value: string;
    /**
     * Renders an icon to clear the input value.
     */
    clearable: boolean;
    /**
     * Marks the text within the input on focus.
     */
    selectTextOnFocus: boolean;
    /**
     * CSS styles applied to the input element.
     */
    inputStyle: {
        [key: string]: string;
    };
    /**
     * Disables browser dropdown.
     */
    autocomplete: boolean;
    /**
     * Similar to "readonly" or "disabled", but visually not distinguishable from an
     * editable input field. Overflowing content will have an ellipsis.
     */
    editable: boolean;
    valueState: string;
    valueChanged(): void;
    hitEnterCallbackChanged(): void;
    changeCallbackChanged(): void;
    inputCallbackChanged(): void;
    focusCallbackChanged(): void;
    blurCallbackChanged(): void;
    valueStateChanged(): void;
    /**
     * Returns the current value.
     */
    getValue(): string;
    /**
     * Focusses the input field.
     */
    setFocus(): void;
    /**
     * Unfocusses the input field.
     */
    unsetFocus(): void;
    componentWillLoad(): void;
    onFocus(): void;
    private resetInput;
    private onInputKeyPress;
    private onInputInput;
    private setInvokeHitEnterCallback;
    private setInvokeChangeCallback;
    private setInvokeInputCallback;
    private setInvokeFocusCallback;
    private setInvokeBlurCallback;
    private onInputFocus;
    private onInputBlur;
    private selectText;
    render(): JSX.Element;
}
