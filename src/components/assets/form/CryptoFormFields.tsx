
import React, { useState } from 'react';
import CryptoSearch from '../CryptoSearch';
import { CryptoInfo } from '@/services/cryptoService';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CryptoFormFieldsProps {
  cryptoQty: string;
  cryptoPrice: string;
  purchasePrice: string;
  setCryptoQty: (value: string) => void;
  setCryptoPrice: (value: string) => void;
  setPurchasePrice: (value: string) => void;
  onCryptoSelect: (crypto: CryptoInfo) => void;
}

const CryptoFormFields: React.FC<CryptoFormFieldsProps> = ({
  cryptoQty,
  cryptoPrice,
  purchasePrice,
  setCryptoQty,
  setCryptoPrice,
  setPurchasePrice,
  onCryptoSelect
}) => {
  const [showCryptoSearch, setShowCryptoSearch] = useState(true);

  return (
    <>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <Label className="block text-sm font-medium">
            Rechercher une cryptomonnaie
          </Label>
          <Button 
            type="button" 
            onClick={() => setShowCryptoSearch(!showCryptoSearch)}
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
          >
            {showCryptoSearch ? 'Masquer' : <Search className="h-4 w-4 mr-1" />}
            {!showCryptoSearch && 'Rechercher'}
          </Button>
        </div>
        
        {showCryptoSearch && (
          <div className="mb-2">
            <CryptoSearch onSelect={(crypto) => {
              onCryptoSelect(crypto);
              // Laissons la recherche visible pour que l'utilisateur puisse chercher une autre crypto s'il le souhaite
            }} />
          </div>
        )}
      </div>
      <div>
        <Label htmlFor="cryptoQty" className="block text-sm font-medium mb-1">
          Quantité
        </Label>
        <Input
          id="cryptoQty"
          type="number"
          value={cryptoQty}
          onChange={(e) => {
            const newQty = e.target.value;
            setCryptoQty(newQty);
            if (cryptoPrice && newQty) {
              // La logique est gérée par le parent
            }
          }}
          className="wealth-input w-full"
          placeholder="Ex: 0.5"
          min="0"
          step="0.000001"
        />
      </div>
      <div>
        <Label htmlFor="cryptoPrice" className="block text-sm font-medium mb-1">
          Prix unitaire actuel (€)
        </Label>
        <Input
          id="cryptoPrice"
          type="number"
          value={cryptoPrice}
          onChange={(e) => {
            const newPrice = e.target.value;
            setCryptoPrice(newPrice);
            if (cryptoQty && newPrice) {
              // La logique est gérée par le parent
            }
          }}
          className="wealth-input w-full"
          placeholder="Ex: 30000"
          min="0"
          step="0.01"
        />
      </div>
      <div>
        <Label htmlFor="purchasePrice" className="block text-sm font-medium mb-1">
          Prix d'achat unitaire (€)
        </Label>
        <Input
          id="purchasePrice"
          type="number"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: 25000"
          min="0"
          step="0.01"
        />
      </div>
    </>
  );
};

export default CryptoFormFields;
