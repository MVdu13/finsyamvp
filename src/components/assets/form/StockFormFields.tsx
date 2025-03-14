
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface StockFormFieldsProps {
  ticker: string;
  shares: string;
  purchasePrice: string;
  setTicker: (value: string) => void; 
  setShares: (value: string) => void;
  setPurchasePrice: (value: string) => void;
}

const StockFormFields: React.FC<StockFormFieldsProps> = ({ 
  ticker, 
  shares, 
  purchasePrice,
  setTicker, 
  setShares,
  setPurchasePrice
}) => {
  return (
    <>
      <div>
        <Label htmlFor="ticker" className="block text-sm font-medium mb-1">
          Nom de l'action/ETF
        </Label>
        <Input
          id="ticker"
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: AAPL"
        />
      </div>
      <div>
        <Label htmlFor="shares" className="block text-sm font-medium mb-1">
          Quantité d'actions
        </Label>
        <Input
          id="shares"
          type="number"
          value={shares}
          onChange={(e) => setShares(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: 10"
          min="0"
          step="0.01"
        />
      </div>
      <div>
        <Label htmlFor="purchasePrice" className="block text-sm font-medium mb-1">
          Prix d'achat par action (€)
        </Label>
        <Input
          id="purchasePrice"
          type="number"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: 150"
          min="0"
          step="0.01"
        />
      </div>
    </>
  );
};

export default StockFormFields;
