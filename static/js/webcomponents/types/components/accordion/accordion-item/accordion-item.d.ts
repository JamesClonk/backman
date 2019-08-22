import '../../../stencil.core';
export declare class Item {
    private itemBodyEl;
    private itemHeaderEl;
    el: HTMLSdxAccordionItemElement;
    /**
     * If the accordion item is initially open.
     */
    open: boolean;
    activeItemChanged(): void;
    componentWillLoad(): void;
    componentDidLoad(): void;
    /**
     * Assign element references to used properties.
     */
    setChildElementsReferences(): void;
    /**
     * Decides based on open property the display of header and its and behaviour.
     */
    decideCollapseHeaderDisplay(): void;
    /**
     * Decides based on open property the display of body.
     */
    decideCollapseBodyDisplay(): void;
    render(): JSX.Element;
}
