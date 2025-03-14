
import React, { useState, useEffect } from 'react';
import { Asset, AssetType } from '@/types/assets';
import { X, Banknote, Wallet, BookText } from 'lucide-react';
import { CryptoInfo } from '@/services/cryptoService';
import TypeSelector from './form/TypeSelector';
import CommonFormFields from './form/CommonFormFields';
import StockFormFields from './form/StockFormFields';
import CryptoFormFields from './form/CryptoFormFields';
import RealEstateFormFields from './form/RealEstateFormFields';
import BankAccountFormFields from './form/BankAccountFormFields';
import SavingsAccountFormFields from './form/SavingsAccountFormFields';

interface AssetFormProps {
  onSubmit: (asset: Omit<Asset, 'id'>) => void;
  onCancel: () => void;
  defaultType?: AssetType;
  showTypeSelector?: boolean;
  initialValues?: Asset;
  isEditing?: boolean;
}

const AssetForm: React.FC<AssetFormProps> = ({ 
  onSubmit, 
  onCancel, 
  defaultType = 'stock',
  showTypeSelector = true,
  initialValues,
  isEditing = false
}) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [type, setType] = useState<AssetType>(initialValues?.type || defaultType);
  const [value, setValue] = useState(initialValues?.value ? initialValues.value.toString() : '');
  const [performance, setPerformance] = useState(initialValues?.performance !== undefined ? initialValues.performance.toString() : '');
  
  // Type specific fields
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [address, setAddress] = useState('');
  const [surface, setSurface] = useState('');
  const [cryptoQty, setCryptoQty] = useState('');
  const [cryptoPrice, setCryptoPrice] = useState('');
  
  // Bank account fields
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  
  // Savings account fields
  const [interestRate, setInterestRate] = useState('');
  const [maturityDate, setMaturityDate] = useState('');

  // Extraire les informations spécifiques du champ description pour l'édition
  useEffect(() => {
    if (initialValues?.description) {
      const desc = initialValues.description;
      
      if (initialValues.type === 'stock' && desc.includes('actions à')) {
        const match = desc.match(/(\d+\.?\d*) actions à (\d+\.?\d*)€/);
        if (match) {
          setShares(match[1]);
          // Le prix est calculé à partir de la valeur et des actions
          const calculatedPrice = initialValues.value / parseFloat(match[1]);
          setTicker(initialValues.name.split(' ')[0] || '');
        }
      } 
      else if (initialValues.type === 'crypto' && desc.includes('unités à')) {
        const match = desc.match(/(\d+\.?\d*) unités à (\d+\.?\d*)€/);
        if (match) {
          setCryptoQty(match[1]);
          setCryptoPrice(match[2]);
        }
      } 
      else if (initialValues.type === 'real-estate' && desc.includes('m²')) {
        const match = desc.match(/(\d+\.?\d*) m² - (.*)/);
        if (match) {
          setSurface(match[1]);
          setAddress(match[2]);
        }
      } 
      else if (initialValues.type === 'bank-account') {
        const bankDetails = desc.split(' - ');
        setBankName(bankDetails[0] || '');
        if (bankDetails.length > 1) {
          setAccountNumber(bankDetails[1].replace('...', '') + '...');
        }
      } 
      else if (initialValues.type === 'savings-account' && desc.includes('Taux:')) {
        const rateMatch = desc.match(/Taux: (\d+\.?\d*)%/);
        if (rateMatch) {
          setInterestRate(rateMatch[1]);
        }
        
        const dateMatch = desc.match(/Échéance: (.*)/);
        if (dateMatch) {
          setMaturityDate(dateMatch[1]);
        }
      }
    }
  }, [initialValues]);

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
      } else if (type === 'bank-account') {
        finalDescription = bankName + (accountNumber ? ` - ${accountNumber.substring(0, 4)}...` : '');
      } else if (type === 'savings-account') {
        finalDescription = `Taux: ${interestRate}%${maturityDate ? ` - Échéance: ${maturityDate}` : ''}`;
      }
    }
    
    // Pour les comptes bancaires et livrets, attribuer une performance par défaut de 0
    let finalPerformance = performance;
    if ((type === 'bank-account' || type === 'savings-account') && !performance) {
      finalPerformance = "0";
    }
    
    const asset = {
      name,
      description: finalDescription,
      type,
      value: parseFloat(value),
      performance: parseFloat(finalPerformance || '0'),
      // Si on édite, on conserve la date de création
      ...(initialValues?.createdAt && { createdAt: initialValues.createdAt }),
      // Mettre à jour la date de modification
      updatedAt: new Date().toISOString()
    };
    
    onSubmit(asset);

    // Reset form if not editing
    if (!isEditing) {
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
      setBankName('');
      setAccountNumber('');
      setInterestRate('');
      setMaturityDate('');
    }
  };

  // Get form title based on asset type and editing mode
  const getFormTitle = () => {
    const action = isEditing ? 'Modifier' : 'Ajouter';
    switch (type) {
      case 'stock': return `${action} une action/ETF`;
      case 'crypto': return `${action} une cryptomonnaie`;
      case 'real-estate': return `${action} un bien immobilier`;
      case 'cash': return `${action} des liquidités`;
      case 'bonds': return `${action} des obligations`;
      case 'commodities': return `${action} des matières premières`;
      case 'bank-account': return `${action} un compte bancaire`;
      case 'savings-account': return `${action} un livret d\'épargne`;
      default: return `${action} un nouvel actif`;
    }
  };

  // Get form icon based on asset type
  const getFormIcon = () => {
    switch (type) {
      case 'bank-account': return <Wallet size={24} className="text-blue-500" />;
      case 'savings-account': return <BookText size={24} className="text-purple-500" />;
      default: return null;
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

  // Déterminer si on affiche le champ performance selon le type d'actif
  const shouldShowPerformanceField = () => {
    return type !== 'bank-account' && type !== 'savings-account';
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
      case 'bank-account':
        return (
          <BankAccountFormFields
            bankName={bankName}
            accountNumber={accountNumber}
            setBankName={setBankName}
            setAccountNumber={setAccountNumber}
          />
        );
      case 'savings-account':
        return (
          <SavingsAccountFormFields
            interestRate={interestRate}
            maturityDate={maturityDate}
            setInterestRate={setInterestRate}
            setMaturityDate={setMaturityDate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg w-full max-w-md border border-border">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          {getFormIcon()}
          <h2 className="text-lg font-medium">{getFormTitle()}</h2>
        </div>
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
          showPerformance={shouldShowPerformanceField()}
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
            {isEditing ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssetForm;
