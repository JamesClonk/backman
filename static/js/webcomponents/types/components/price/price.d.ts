import '../../stencil.core';
import { Size } from "./types";
export declare class Price {
    /**
     * The amount to be paid.
     */
    amount: number;
    /**
     * Time period, for example "/mo.".
     */
    period: string;
    /**
     * The font size.
     */
    size: Size;
    /**
     * Description text read by the screen reader.
     */
    srHint: string;
    /**
     * Formats a price like 5.–, 5.50, –.50, or 0.–
     */
    private getFormattedAmount;
    private isInteger;
    private getClassNames;
    render(): JSX.Element[];
}
