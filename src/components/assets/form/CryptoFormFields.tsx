
import React, { useState } from 'react';
import CryptoSearch from '../CryptoSearch';
import { CryptoInfo } from '@/services/cryptoService';

interface CryptoFormFieldsProps {
  cryptoQty: string;
  cryptoPrice: string;
  setCryptoQty: (value: string) => void;
  setCryptoPrice: (value: string) => void;
  onCryptoSelect: (crypto: CryptoInfo) => void;
}

const CryptoFormFields: React.FC<CryptoFormFieldsProps> = ({
  cryptoQty,
  cryptoPrice,
  setCryptoQty,
  setCryptoPrice,
  onCryptoSelect
}) => {
  const [showCryptoSearch, setShowCryptoSearch] = useState(false);

  return (
    <>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium">
            Rechercher une cryptomonnaie
          </label>
          <button 
            type="button" 
            onClick={() => setShowCryptoSearch(!showCryptoSearch)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {showCryptoSearch ? 'Fermer' : 'Rechercher'}
          </button>
        </div>
        
        {showCryptoSearch && (
          <div className="mb-2">
            <CryptoSearch onSelect={(crypto) => {
              onCryptoSelect(crypto);
              setShowCryptoSearch(false);
            }} />
          </div>
        )}
      </div>
      <div>
        <label htmlFor="cryptoQty" className="block text-sm font-medium mb-1">
          Quantité
        </label>
        <input
          id="cryptoQty"
          type="number"
          value={cryptoQty}
          onChange={(e) => {
            const newQty = e.target.value;
            setCryptoQty(newQty);
            if (cryptoPrice && newQty) {
              // This logic is handled by the parent
            }
          }}
          className="wealth-input w-full"
          placeholder="Ex: 0.5"
          min="0"
          step="0.000001"
        />
      </div>
      <div>
        <label htmlFor="cryptoPrice" className="block text-sm font-medium mb-1">
          Prix unitaire (€)
        </label>
        <input
          id="cryptoPrice"
          type="number"
          value={cryptoPrice}
          onChange={(e) => {
            const newPrice = e.target.value;
            setCryptoPrice(newPrice);
            if (cryptoQty && newPrice) {
              // This logic is handled by the parent
            }
          }}
          className="wealth-input w-full"
          placeholder="Ex: 30000"
          min="0"
          step="0.01"
        />
      </div>
    </>
  );
};

export default CryptoFormFields;
