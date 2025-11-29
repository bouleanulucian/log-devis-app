import { Quote, QuoteItem, QuoteSection } from '../types';

/**
 * CalculationService - Centralized calculation logic for quotes
 * Handles all financial calculations including discounts, taxes, and margins
 */
export class CalculationService {
    /**
     * Calculate total for a single item
     */
    static calculateItemTotal(item: QuoteItem): number {
        if (item.type !== 'item') {
            return 0; // Non-item types don't have totals
        }
        return item.quantity * item.unitPrice;
    }

    /**
     * Calculate total for a section (sum of all items)
     */
    static calculateSectionTotal(section: QuoteSection): number {
        return section.items.reduce((total, item) => {
            return total + this.calculateItemTotal(item);
        }, 0);
    }

    /**
     * Calculate quote subtotal (before discount and tax)
     */
    static calculateQuoteSubtotal(sections: QuoteSection[]): number {
        return sections.reduce((total, section) => {
            return total + this.calculateSectionTotal(section);
        }, 0);
    }

    /**
     * Apply discount to an amount
     */
    static applyDiscount(
        amount: number,
        discount: number,
        type: 'percentage' | 'fixed' = 'percentage'
    ): number {
        if (!discount || discount === 0) {
            return amount;
        }

        if (type === 'percentage') {
            // Discount is a percentage (e.g., 10 means 10%)
            const discountAmount = amount * (discount / 100);
            return amount - discountAmount;
        } else {
            // Discount is a fixed amount
            const result = amount - discount;
            return Math.max(0, result); // Don't allow negative totals
        }
    }

    /**
     * Calculate discount amount
     */
    static calculateDiscountAmount(
        amount: number,
        discount: number,
        type: 'percentage' | 'fixed' = 'percentage'
    ): number {
        if (!discount || discount === 0) {
            return 0;
        }

        if (type === 'percentage') {
            return amount * (discount / 100);
        } else {
            return Math.min(discount, amount); // Don't exceed the total amount
        }
    }

    /**
     * Calculate tax (TVA) amount
     */
    static calculateTax(amountHT: number, taxRate: number = 20): number {
        return amountHT * (taxRate / 100);
    }

    /**
     * Calculate total TTC (including tax)
     */
    static calculateTotalTTC(amountHT: number, taxRate: number = 20): number {
        const tax = this.calculateTax(amountHT, taxRate);
        return amountHT + tax;
    }

    /**
     * Calculate margin breakdown
     */
    static calculateMargin(totalHT: number, marginPercentage: number): {
        cost: number;
        profit: number;
        sellingPrice: number;
    } {
        if (!marginPercentage || marginPercentage === 0) {
            return {
                cost: totalHT,
                profit: 0,
                sellingPrice: totalHT
            };
        }

        // If margin is 20%, selling price = cost / (1 - 0.20) = cost / 0.80
        const sellingPrice = totalHT / (1 - marginPercentage / 100);
        const profit = sellingPrice - totalHT;

        return {
            cost: totalHT,
            profit: profit,
            sellingPrice: sellingPrice
        };
    }

    /**
     * Calculate all quote totals with discount and tax
     */
    static calculateQuoteTotals(quote: Quote): {
        subtotal: number;
        discountAmount: number;
        totalHT: number;
        taxAmount: number;
        totalTTC: number;
        margin?: {
            cost: number;
            profit: number;
            sellingPrice: number;
        };
    } {
        // Calculate subtotal (sum of all items)
        const subtotal = this.calculateQuoteSubtotal(quote.sections);

        // Apply discount
        const discountAmount = this.calculateDiscountAmount(
            subtotal,
            quote.discount || 0,
            quote.discountType || 'percentage'
        );
        const totalHT = subtotal - discountAmount;

        // Calculate tax
        const taxRate = quote.taxRate || 20;
        const taxAmount = this.calculateTax(totalHT, taxRate);
        const totalTTC = totalHT + taxAmount;

        // Calculate margin if specified
        let margin;
        if (quote.margin && quote.margin > 0) {
            margin = this.calculateMargin(totalHT, quote.margin);
        }

        return {
            subtotal,
            discountAmount,
            totalHT,
            taxAmount,
            totalTTC,
            margin
        };
    }

    /**
     * Recalculate and update quote totals
     */
    static updateQuoteTotals(quote: Quote): Quote {
        const totals = this.calculateQuoteTotals(quote);

        return {
            ...quote,
            totalHT: Math.round(totals.totalHT * 100) / 100,
            totalTTC: Math.round(totals.totalTTC * 100) / 100
        };
    }

    /**
     * Format currency value
     */
    static formatCurrency(amount: number, currency: string = '€'): string {
        const formatted = amount.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return `${formatted} ${currency}`;
    }

    /**
     * Parse currency string to number
     */
    static parseCurrency(value: string): number {
        // Remove currency symbols and spaces, replace comma with dot
        const cleaned = value.replace(/[€\s]/g, '').replace(',', '.');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    }

    /**
     * Calculate percentage of total
     */
    static calculatePercentage(part: number, total: number): number {
        if (total === 0) return 0;
        return (part / total) * 100;
    }

    /**
     * Round to 2 decimal places
     */
    static roundCurrency(amount: number): number {
        return Math.round(amount * 100) / 100;
    }

    /**
     * Validate discount value
     */
    static validateDiscount(
        discount: number,
        type: 'percentage' | 'fixed',
        total: number
    ): { valid: boolean; error?: string } {
        if (discount < 0) {
            return { valid: false, error: 'La réduction ne peut pas être négative' };
        }

        if (type === 'percentage') {
            if (discount > 100) {
                return { valid: false, error: 'La réduction ne peut pas dépasser 100%' };
            }
        } else {
            if (discount > total) {
                return { valid: false, error: 'La réduction ne peut pas dépasser le montant total' };
            }
        }

        return { valid: true };
    }

    /**
     * Calculate break-even price (cost + margin)
     */
    static calculateBreakEven(cost: number, desiredMarginPercent: number): number {
        return cost / (1 - desiredMarginPercent / 100);
    }

    /**
     * Calculate markup percentage from cost and selling price
     */
    static calculateMarkup(cost: number, sellingPrice: number): number {
        if (cost === 0) return 0;
        return ((sellingPrice - cost) / cost) * 100;
    }

    /**
     * Calculate profit margin percentage from cost and selling price
     */
    static calculateProfitMargin(cost: number, sellingPrice: number): number {
        if (sellingPrice === 0) return 0;
        return ((sellingPrice - cost) / sellingPrice) * 100;
    }

    /**
     * Sum multiple amounts safely
     */
    static sum(...amounts: number[]): number {
        return amounts.reduce((total, amount) => total + (amount || 0), 0);
    }

    /**
     * Calculate average
     */
    static average(amounts: number[]): number {
        if (amounts.length === 0) return 0;
        return this.sum(...amounts) / amounts.length;
    }

    /**
     * Calculate weighted average (e.g., for tax rates across items)
     */
    static weightedAverage(values: number[], weights: number[]): number {
        if (values.length !== weights.length || values.length === 0) {
            return 0;
        }

        const totalWeight = this.sum(...weights);
        if (totalWeight === 0) return 0;

        const weightedSum = values.reduce((sum, value, index) => {
            return sum + (value * weights[index]);
        }, 0);

        return weightedSum / totalWeight;
    }
}
