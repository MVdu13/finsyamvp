import React, { useState } from 'react';
import { Asset, AssetType } from '@/types/assets';
import { X } from 'lucide-react';
import { CryptoInfo } from '@/services/cryptoService';
import TypeSelector from './form/TypeSelector';
import CommonFormFields from './form/CommonFormFields';
import StockFormFields from './form/StockFormFields';
import CryptoFormFields from './form/CryptoFormFields';
import RealEstateFormFields from './form/RealEstateFormFields';

interface AssetFormProps {
  onSubmit: (asset: Omit<Asset, 'id'>) => void;
  onCancel: () => void;
  defaultType?: AssetType;
  showTypeSelector?: boolean;
}

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
      performance: parseFloat(performance)
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
  };
  
  // Update crypto value when quantity or price changes
  const updateCryptoValue = (qty: string, price: string) => {
    if (qty && price) {
      setValue((parseFloat(price) * parseFloat(qty)).toString());
    }
  };

  // Render type-specific fields
  const renderTypeSpecificFields = () => {
    switch (type) {
      case 'stock':
        return (
          <StockFormFields
            ticker={ticker}
            shares={shares}
            setTicker={setTicker}
            setShares={setShares}
          />
        );
      case 'crypto':
        return (
          <CryptoFormFields
            cryptoQty={cryptoQty}
            cryptoPrice={cryptoPrice}
            setCryptoQty={(newQty) => {
              setCryptoQty(newQty);
              updateCryptoValue(newQty, cryptoPrice);
            }}
            setCryptoPrice={(newPrice) => {
              setCryptoPrice(newPrice);
              updateCryptoValue(cryptoQty, newPrice);
            }}
            onCryptoSelect={handleCryptoSelect}
          />
        );
      case 'real-estate':
        return (
          <RealEstateFormFields
            address={address}
            surface={surface}
            setAddress={setAddress}
            setSurface={setSurface}
          />
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
          <TypeSelector type={type} setType={setType} />
        )}
        
        <CommonFormFields
          name={name}
          value={value}
          performance={performance}
          description={description}
          setName={setName}
          setValue={setValue}
          setPerformance={setPerformance}
          setDescription={setDescription}
          assetType={type}
        />
        
        {renderTypeSpecificFields()}
        
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
