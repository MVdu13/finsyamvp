
import React from 'react';
import { Asset } from '@/types/assets';

interface CommonFormFieldsProps {
  name: string;
  value: string;
  performance: string;
  description: string;
  setName: (value: string) => void;
  setValue: (value: string) => void;
  setPerformance: (value: string) => void;
  setDescription: (value: string) => void;
  assetType: string;
}

const CommonFormFields: React.FC<CommonFormFieldsProps> = ({
  name,
  value,
  performance,
  description,
  setName,
  setValue,
  setPerformance,
  setDescription,
  assetType,
}) => {
  return (
    <>
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Nom de l'actif
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="wealth-input w-full"
          placeholder={
            assetType === 'stock'
              ? "Ex: Actions Apple"
              : assetType === 'crypto'
              ? "Ex: Bitcoin"
              : "Ex: Appartement Paris"
          }
          required
        />
      </div>
      
      <div>
        <label htmlFor="value" className="block text-sm font-medium mb-1">
          Valeur totale (€)
        </label>
        <input
          id="value"
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: 1500"
          min="0"
          step="0.01"
          required
        />
      </div>
      
      <div>
        <label htmlFor="performance" className="block text-sm font-medium mb-1">
          Performance (%)
        </label>
        <input
          id="performance"
          type="number"
          value={performance}
          onChange={(e) => setPerformance(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: 5.2"
          step="0.1"
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description (optionnel)
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="wealth-input w-full"
          placeholder="Laissez vide pour génération automatique"
        />
      </div>
    </>
  );
};

export default CommonFormFields;
