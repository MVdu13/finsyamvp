
import React, { useState } from 'react';
import { Asset, AssetType } from '@/types/assets';
import { X } from 'lucide-react';

interface AssetFormProps {
  onSubmit: (asset: Omit<Asset, 'id'>) => void;
  onCancel: () => void;
}

const assetTypes: { value: AssetType; label: string }[] = [
  { value: 'stock', label: 'Actions' },
  { value: 'crypto', label: 'Cryptomonnaies' },
  { value: 'real-estate', label: 'Immobilier' },
  { value: 'cash', label: 'Liquidités' },
  { value: 'other', label: 'Autre' },
];

const AssetForm: React.FC<AssetFormProps> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AssetType>('stock');
  const [value, setValue] = useState('');
  const [performance, setPerformance] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      name,
      description,
      type,
      value: parseFloat(value),
      performance: parseFloat(performance),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Reset form
    setName('');
    setDescription('');
    setType('stock');
    setValue('');
    setPerformance('');
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg w-full max-w-md border border-border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Ajouter un nouvel actif</h2>
        <button
          onClick={onCancel}
          className="p-1 rounded-full hover:bg-muted transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="Ex: Actions Apple"
            required
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="wealth-input w-full"
            placeholder="Ex: 10 actions à 150€"
            required
          />
        </div>
        
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
        
        <div>
          <label htmlFor="value" className="block text-sm font-medium mb-1">
            Valeur (€)
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
        
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="wealth-btn wealth-btn-secondary flex-1"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="wealth-btn wealth-btn-primary flex-1"
          >
            Ajouter
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssetForm;
