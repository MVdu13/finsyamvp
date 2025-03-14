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
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  
  // Savings account fields
  const [savingsBankName, setSavingsBankName] = useState('');
  const [savingsAccountName, setSavingsAccountName] = useState('');
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
        if (bankDetails.length > 0) {
          const bankNamePart = bankDetails[0] || '';
          const bankParts = bankNamePart.split(': ');
          if (bankParts.length > 1) {
            setBankName(bankParts[1]);
          } else {
            setBankName(bankNamePart);
          }
          
          if (bankDetails.length > 1) {
            const accountPart = bankDetails[1] || '';
            if (accountPart.includes('Compte: ')) {
              setAccountName(accountPart.replace('Compte: ', ''));
            } else if (accountPart.includes('...')) {
              setAccountNumber(accountPart.replace('Numéro: ', ''));
            } else {
              setAccountName(accountPart);
            }
          }
        }
      } 
      else if (initialValues.type === 'savings-account') {
        const parts = desc.split(' - ');
        parts.forEach(part => {
          if (part.startsWith('Banque: ')) {
            setSavingsBankName(part.replace('Banque: ', ''));
          } else if (part.startsWith('Livret: ')) {
            setSavingsAccountName(part.replace('Livret: ', ''));
          } else if (part.startsWith('Taux: ')) {
            const rateMatch = part.match(/Taux: (\d+\.?\d*)%/);
            if (rateMatch) {
              setInterestRate(rateMatch[1]);
            }
          } else if (part.startsWith('Échéance: ')) {
            setMaturityDate(part.replace('Échéance: ', ''));
          }
        });
      }
    }
    
    if (initialValues?.name && initialValues.type === 'bank-account' && !accountName) {
      const parts = initialValues.name.split(' - ');
      if (parts.length > 1) {
        if (!bankName) setBankName(parts[0]);
        setAccountName(parts[1]);
      }
    }
    
    if (initialValues?.name && initialValues.type === 'savings-account' && !savingsAccountName) {
      const parts = initialValues.name.split(' - ');
      if (parts.length > 1) {
        if (!savingsBankName) setSavingsBankName(parts[0]);
        setSavingsAccountName(parts[1]);
      }
    }
  }, [initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalName = name;
    if (type === 'bank-account' && bankName && accountName) {
      finalName = `${bankName} - ${accountName}`;
    } else if (type === 'savings-account' && savingsBankName && savingsAccountName) {
      finalName = `${savingsBankName} - ${savingsAccountName}`;
    }
    
    let finalDescription = description;
    if (!description) {
      if (type === 'stock') {
        finalDescription = `${shares} actions à ${parseFloat(value) / parseFloat(shares)}€`;
      } else if (type === 'crypto') {
        finalDescription = `${cryptoQty} unités à ${cryptoPrice}€`;
      } else if (type === 'real-estate') {
        finalDescription = `${surface} m² - ${address}`;
      } else if (type === 'bank-account') {
        finalDescription = `Banque: ${bankName} - Compte: ${accountName}${accountNumber ? ` - Numéro: ${accountNumber.substring(0, 4)}...` : ''}`;
      } else if (type === 'savings-account') {
        finalDescription = `Banque: ${savingsBankName} - Livret: ${savingsAccountName} - Taux: ${interestRate}%${maturityDate ? ` - Échéance: ${maturityDate}` : ''}`;
      }
    }
    
    let finalPerformance = performance;
    if (type === 'bank-account') {
      finalPerformance = "0";
    } else if (type === 'savings-account' && interestRate) {
      finalPerformance = interestRate;
    }
    
    const asset = {
      name: finalName,
      description: finalDescription,
      type,
      value: parseFloat(value),
      performance: parseFloat(finalPerformance || '0'),
      ...(initialValues?.createdAt && { createdAt: initialValues.createdAt }),
      updatedAt: new Date().toISOString()
    };
    
    onSubmit(asset);

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
      setAccountName('');
      setAccountNumber('');
      setSavingsBankName('');
      setSavingsAccountName('');
      setInterestRate('');
      setMaturityDate('');
    }
  };

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
      case 'savings-account': return `${action} un livret d'épargne`;
      default: return `${action} un nouvel actif`;
    }
  };

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
    setCryptoQty('1');
    setValue((crypto.current_price * 1).toString());
  };

  const updateCryptoValue = (qty: string, price: string) => {
    if (qty && price) {
      setValue((parseFloat(price) * parseFloat(qty)).toString());
    }
  };

  const shouldShowPerformanceField = () => {
    return type !== 'bank-account' && type !== 'savings-account';
  };

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
            accountName={accountName}
            accountNumber={accountNumber}
            setBankName={setBankName}
            setAccountName={setAccountName}
            setAccountNumber={setAccountNumber}
          />
        );
      case 'savings-account':
        return (
          <SavingsAccountFormFields
            bankName={savingsBankName}
            accountName={savingsAccountName}
            interestRate={interestRate}
            maturityDate={maturityDate}
            setBankName={setSavingsBankName}
            setAccountName={setSavingsAccountName}
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
        
        {type !== 'bank-account' && type !== 'savings-account' && (
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
        )}
        
        {(type === 'bank-account' || type === 'savings-account') && (
          <div>
            <Label htmlFor="value" className="block text-sm font-medium mb-1">
              Solde (€)
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
        )}
        
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
