import React, { useState } from 'react';
import { Asset, AssetType } from '@/types/assets';
import { X, Search } from 'lucide-react';
import CryptoSearch from './CryptoSearch';
import { CryptoInfo } from '@/services/cryptoService';

interface AssetFormProps {
  onSubmit: (asset: Omit<Asset, 'id'>) => void;
  onCancel: () => void;
  defaultType?: AssetType;
  showTypeSelector?: boolean;
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

const AssetForm: React.FC<AssetFormProps> = ({ 
  onSubmit, 
  onCancel, 
  defaultType = 'stock',
  showTypeSelector = true 
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AssetType>(defaultType);
  const [value, setValue] = useState('');
  const [performance, setPerformance] = useState('');
  
  // Type specific fields
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [address, setAddress] = useState('');
  const [surface, setSurface] = useState('');
  const [cryptoQty, setCryptoQty] = useState('');
  const [cryptoPrice, setCryptoPrice] = useState('');
  const [showCryptoSearch, setShowCryptoSearch] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a description based on the asset type if not provided
    let finalDescription = description;
    if (!description) {
      if (type === 'stock') {
        finalDescription = `${shares} actions à ${parseFloat(value) / parseFloat(shares)}€`;
      } else if (type === 'crypto') {
        finalDescription = `${cryptoQty} unités à ${cryptoPrice}€`;
      } else if (type === 'real-estate') {
        finalDescription = `${surface} m² - ${address}`;
      }
    }
    
    onSubmit({
      name,
      description: finalDescription,
      type,
      value: parseFloat(value),
      performance: parseFloat(performance),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Reset form
    setName('');
    setDescription('');
    setType(defaultType);
    setValue('');
    setPerformance('');
    setTicker('');
    setShares('');
    setAddress('');
    setSurface('');
    setCryptoQty('');
    setCryptoPrice('');
  };

  // Get form title based on asset type
  const getFormTitle = () => {
    switch (type) {
      case 'stock': return 'Ajouter une action/ETF';
      case 'crypto': return 'Ajouter une cryptomonnaie';
      case 'real-estate': return 'Ajouter un bien immobilier';
      case 'cash': return 'Ajouter des liquidités';
      case 'bonds': return 'Ajouter des obligations';
      case 'commodities': return 'Ajouter des matières premières';
      default: return 'Ajouter un nouvel actif';
    }
  };

  const handleCryptoSelect = (crypto: CryptoInfo) => {
    setName(crypto.name);
    setTicker(crypto.symbol.toUpperCase());
    setCryptoPrice(crypto.current_price.toString());
    setPerformance(crypto.price_change_percentage_24h.toString());
    setCryptoQty('1'); // Valeur par défaut
    setValue((crypto.current_price * 1).toString()); // Valeur par défaut pour 1 unité
    setShowCryptoSearch(false);
  };

  // Render type-specific fields
  const renderTypeSpecificFields = () => {
    switch (type) {
      case 'stock':
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
      case 'crypto':
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
                  <CryptoSearch onSelect={handleCryptoSelect} />
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
                    setValue((parseFloat(cryptoPrice) * parseFloat(newQty)).toString());
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
                    setValue((parseFloat(newPrice) * parseFloat(cryptoQty)).toString());
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
      case 'real-estate':
        return (
          <>
            <div>
              <label htmlFor="address" className="block text-sm font-medium mb-1">
                Adresse
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="wealth-input w-full"
                placeholder="Ex: 1 rue de la Paix, 75001 Paris"
              />
            </div>
            <div>
              <label htmlFor="surface" className="block text-sm font-medium mb-1">
                Surface (m²)
              </label>
              <input
                id="surface"
                type="number"
                value={surface}
                onChange={(e) => setSurface(e.target.value)}
                className="wealth-input w-full"
                placeholder="Ex: 80"
                min="0"
                step="0.01"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg w-full max-w-md border border-border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">{getFormTitle()}</h2>
        <button
          onClick={onCancel}
          className="p-1 rounded-full hover:bg-muted transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {showTypeSelector && (
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
        )}
        
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
            placeholder={type === 'stock' ? "Ex: Actions Apple" : type === 'crypto' ? "Ex: Bitcoin" : "Ex: Appartement Paris"}
            required
          />
        </div>
        
        {renderTypeSpecificFields()}
        
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
