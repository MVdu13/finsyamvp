
import React from 'react';
import { Asset } from '@/types/assets';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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
  showPerformance?: boolean;
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
  showPerformance = true,
}) => {
  return (
    <>
      <div>
        <Label htmlFor="name" className="block text-sm font-medium mb-1">
          Nom de l'actif
        </Label>
        <Input
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
              : assetType === 'real-estate'
              ? "Ex: Appartement Paris"
              : assetType === 'bank-account'
              ? "Ex: Compte courant Société Générale"
              : assetType === 'savings-account'
              ? "Ex: Livret A"
              : "Ex: Nom de l'actif"
          }
          required
        />
      </div>
      
      <div>
        <Label htmlFor="value" className="block text-sm font-medium mb-1">
          Valeur totale (€)
        </Label>
        <Input
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
      
      {showPerformance && (
        <div>
          <Label htmlFor="performance" className="block text-sm font-medium mb-1">
            Performance (%)
          </Label>
          <Input
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
      )}
      
      <div>
        <Label htmlFor="description" className="block text-sm font-medium mb-1">
          Description (optionnel)
        </Label>
        <Input
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
