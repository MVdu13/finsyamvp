
import React from 'react';
import { AssetType } from '@/types/assets';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TypeSelectorProps {
  type: AssetType;
  setType: (type: AssetType) => void;
}

const assetTypes: { value: AssetType; label: string }[] = [
  { value: 'stock', label: 'Actions' },
  { value: 'crypto', label: 'Cryptomonnaies' },
  { value: 'real-estate', label: 'Immobilier' },
  { value: 'cash', label: 'Liquidités' },
  { value: 'bonds', label: 'Obligations' },
  { value: 'commodities', label: 'Matières premières' },
  { value: 'bank-account', label: 'Compte bancaire' },
  { value: 'savings-account', label: 'Livret d\'épargne' },
  { value: 'investment-account', label: 'Compte d\'investissement' },
  { value: 'other', label: 'Autre' },
];

const TypeSelector: React.FC<TypeSelectorProps> = ({ type, setType }) => {
  return (
    <div>
      <Label htmlFor="type" className="block text-sm font-medium mb-1">
        Type d'actif
      </Label>
      <select
        id="type"
        value={type}
        onChange={(e) => setType(e.target.value as AssetType)}
        className="wealth-input w-full"
        required
      >
        {assetTypes.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TypeSelector;
