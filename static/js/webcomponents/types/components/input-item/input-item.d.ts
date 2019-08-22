import '../../stencil.core';
import { Type } from "./types";
import { InputGroupState } from "./input-group-store";
export declare class InputItem {
    private store?;
    private unsubscribe;
    private inputEl;
    private lightDOMHiddenFormInputEl;
    private invokeChangeCallback;
    typeState: InputGroupState["typeState"];
    nameState: InputGroupState["nameState"];
    inline: InputGroupState["inline"];
    selectedInputItemEls: InputGroupState["selectedInputItemEls"];
    el: HTMLSdxInputItemElement;
    /**
     * The form input variant of the item.
     */
    type: Type;
    /**
     * Whether the item is turned on or off.
     */
    checked: boolean;
    /**
     * Value of the input item.
     */
    value: any;
    /**
     * Not selectable.
     */
    disabled: boolean;
    /**
     * Callback whenever the user checks/unchecks the component.
     */
    changeCallback: ((checked: boolean) => void) | string | undefined;
    /**
     * Name parameter (useful when the item is embedded in a traditional HTML form submit).
     */
    name: string | undefined;
    /**
     * Make sure that the input item does not receive focus.
     * Use this when the input item is used within a component that already
     * handles focus (e.g. sdx-select-option in sdx-select with multiselect).
     */
    disableFocus: boolean;
    checkedChanged(): void;
    valueChanged(): void;
    nameChanged(): void;
    nameStateChanged(): void;
    selectedInputItemElsChanged(): void;
    changeCallbackChanged(): void;
    onClick(e: MouseEvent): void;
    handleKeyDown(e: KeyboardEvent): void;
    componentWillLoad(): void;
    componentDidLoad(): void;
    componentDidUnload(): void;
    private getInputType;
    private select;
    private dispatch;
    private getComponentClassNames;
    private initHiddenFormInputEl;
    private updateHiddenFormInputEl;
    private setInvokeChangeCallback;
    private getName;
    hostData(): {
        role: Type;
        class: {
            inline: boolean;
        };
    };
    render(): JSX.Element;
}
