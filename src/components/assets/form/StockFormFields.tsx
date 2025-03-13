
import React from 'react';

interface StockFormFieldsProps {
  ticker: string;
  shares: string;
  setTicker: (value: string) => void; 
  setShares: (value: string) => void;
}

const StockFormFields: React.FC<StockFormFieldsProps> = ({ 
  ticker, 
  shares, 
  setTicker, 
  setShares 
}) => {
  return (
    <>
      <div>
        <label htmlFor="ticker" className="block text-sm font-medium mb-1">
          Ticker/Symbole
        </label>
        <input
          id="ticker"
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: AAPL"
        />
      </div>
      <div>
        <label htmlFor="shares" className="block text-sm font-medium mb-1">
          Nombre d'actions
        </label>
        <input
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
    </>
  );
};

export default StockFormFields;
