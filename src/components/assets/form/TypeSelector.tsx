
import React from 'react';
import { AssetType } from '@/types/assets';

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
  { value: 'other', label: 'Autre' },
];

const TypeSelector: React.FC<TypeSelectorProps> = ({ type, setType }) => {
  return (
    <div>
      <label htmlFor="type" className="block text-sm font-medium mb-1">
        Type d'actif
      </label>
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
