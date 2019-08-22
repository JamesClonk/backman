import '../../stencil.core';
import { ButtonTheme } from "./types";
export declare class ShowMore {
    private start;
    private invokeIncrementCallback;
    /**
     * How many items are currently shown (counter).
     */
    currentlyDisplayedItems: number;
    /**
     * How many items to add by each turn.
     */
    incrementBy: number;
    /**
     * Number of items to start from.
     */
    initialItems: number;
    /**
     * Number of all items in total.
     */
    totalItems: number;
    /**
     * Label for "from".
     */
    fromLabel: string;
    /**
     * Label for "more".
     */
    moreLabel: string;
    /**
     * Triggered when the number of displayed items has incremented.
     */
    incrementCallback: ((count: number) => void) | string | undefined;
    /**
     * Button theme.
     */
    buttonTheme: ButtonTheme;
    totalItemsChanged(): void;
    incrementCallbackChanged(): void;
    componentWillLoad(): void;
    private reset;
    private showMore;
    private setInvokeIncrementCallback;
    render(): JSX.Element;
}
