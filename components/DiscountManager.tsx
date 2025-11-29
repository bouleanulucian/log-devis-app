import React from 'react';
import { Percent, DollarSign } from 'lucide-react';
import { CalculationService } from '../services/calculationService';

interface DiscountManagerProps {
    discount?: number;
    discountType?: 'percentage' | 'fixed';
    subtotal: number;
    currency: string;
    onChange: (discount: number, type: 'percentage' | 'fixed') => void;
}

export const DiscountManager: React.FC<DiscountManagerProps> = ({
    discount = 0,
    discountType = 'percentage',
    subtotal,
    currency,
    onChange
}) => {
    const [localDiscount, setLocalDiscount] = React.useState(discount);
    const [localType, setLocalType] = React.useState(discountType);

    const discountAmount = CalculationService.calculateDiscountAmount(
        subtotal,
        localDiscount,
        localType
    );

    const finalTotal = subtotal - discountAmount;

    const handleDiscountChange = (value: string) => {
        const numValue = parseFloat(value) || 0;
        setLocalDiscount(numValue);
        onChange(numValue, localType);
    };

    const handleTypeChange = (type: 'percentage' | 'fixed') => {
        setLocalType(type);
        onChange(localDiscount, type);
    };

    const validation = CalculationService.validateDiscount(localDiscount, localType, subtotal);

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
                <label className="font-medium text-gray-700">Reducere:</label>

                <div className="flex gap-2">
                    <button
                        onClick={() => handleTypeChange('percentage')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${localType === 'percentage'
                                ? 'bg-amber-500 text-white'
                                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        <Percent className="w-4 h-4" />
                        <span className="text-sm">%</span>
                    </button>

                    <button
                        onClick={() => handleTypeChange('fixed')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${localType === 'fixed'
                                ? 'bg-amber-500 text-white'
                                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm">{currency}</span>
                    </button>
                </div>

                <input
                    type="number"
                    value={localDiscount}
                    onChange={(e) => handleDiscountChange(e.target.value)}
                    min="0"
                    max={localType === 'percentage' ? 100 : subtotal}
                    step={localType === 'percentage' ? 1 : 0.01}
                    className="w-32 px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="0"
                />

                {localDiscount > 0 && (
                    <button
                        onClick={() => handleDiscountChange('0')}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Șterge
                    </button>
                )}
            </div>

            {!validation.valid && (
                <div className="text-sm text-red-600 mb-2">
                    ⚠️ {validation.error}
                </div>
            )}

            {localDiscount > 0 && validation.valid && (
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal:</span>
                        <span>{CalculationService.formatCurrency(subtotal, currency)}</span>
                    </div>
                    <div className="flex justify-between text-amber-700 font-medium">
                        <span>Reducere:</span>
                        <span>-{CalculationService.formatCurrency(discountAmount, currency)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-amber-200">
                        <span>Total după reducere:</span>
                        <span>{CalculationService.formatCurrency(finalTotal, currency)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};
