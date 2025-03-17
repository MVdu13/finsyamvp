import React, { useState, useEffect } from 'react';
import { Asset, AssetType } from '@/types/assets';
import { X, Banknote, Wallet, BookText, Home, Bitcoin } from 'lucide-react';
import { CryptoInfo } from '@/services/cryptoService';
import TypeSelector from './form/TypeSelector';
import CommonFormFields from './form/CommonFormFields';
import StockFormFields from './form/StockFormFields';
import CryptoFormFields from './form/CryptoFormFields';
import RealEstateFormFields from './form/RealEstateFormFields';
import BankAccountFormFields from './form/BankAccountFormFields';
import SavingsAccountFormFields from './form/SavingsAccountFormFields';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface AssetFormProps {
  onSubmit: (asset: Omit<Asset, 'id'>) => void;
  onCancel: () => void;
  defaultType?: AssetType;
  showTypeSelector?: boolean;
  initialValues?: Asset;
  isEditing?: boolean;
  investmentAccounts?: Asset[];
  cryptoAccounts?: Asset[];
  onAddAccount?: (account: Omit<Asset, 'id'>) => Asset | null | undefined;
}

const AssetForm: React.FC<AssetFormProps> = ({ 
  onSubmit, 
  onCancel, 
  defaultType = 'stock',
  showTypeSelector = true,
  initialValues,
  isEditing = false,
  investmentAccounts = [],
  cryptoAccounts = [],
  onAddAccount
}) => {
  const { toast } = useToast();
  const [name, setName] = useState(initialValues?.name || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [type, setType] = useState<AssetType>(initialValues?.type || defaultType);
  const [value, setValue] = useState(initialValues?.value ? initialValues.value.toString() : '');
  const [performance, setPerformance] = useState(initialValues?.performance !== undefined ? initialValues.performance.toString() : '');
  
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [investmentAccountId, setInvestmentAccountId] = useState(initialValues?.investmentAccountId || '');
  
  const [address, setAddress] = useState('');
  const [surface, setSurface] = useState('');
  const [propertyType, setPropertyType] = useState('apartment');
  const [usageType, setUsageType] = useState('main');
  const [currentValue, setCurrentValue] = useState('');
  const [propertyTax, setPropertyTax] = useState('');
  const [housingTax, setHousingTax] = useState('');
  const [annualRent, setAnnualRent] = useState('');
  const [annualFees, setAnnualFees] = useState('');
  const [annualCharges, setAnnualCharges] = useState('');
  
  const [cryptoQty, setCryptoQty] = useState('');
  const [cryptoPrice, setCryptoPrice] = useState('');
  const [cryptoPurchasePrice, setCryptoPurchasePrice] = useState('');
  const [cryptoAccountId, setCryptoAccountId] = useState(initialValues?.cryptoAccountId || '');
  
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  
  const [savingsBankName, setSavingsBankName] = useState('');
  const [savingsAccountName, setSavingsAccountName] = useState('');
  const [interestRate, setInterestRate] = useState('');

  const handleAddAccount = (accountData: Omit<Asset, 'id'>) => {
    if (onAddAccount) {
      return onAddAccount(accountData);
    }
    return null;
  };

  useEffect(() => {
    if (initialValues?.description) {
      const desc = initialValues.description;
      
      if (initialValues.type === 'stock' && desc.includes('actions à')) {
        const match = desc.match(/(\d+\.?\d*) actions à (\d+\.?\d*)€/);
        if (match) {
          setShares(match[1]);
          setPurchasePrice(match[2]);
          const calculatedPrice = initialValues.value / parseFloat(match[1]);
          setTicker(initialValues.name.split(' ')[0] || '');
        }
      } 
      else if (initialValues.type === 'crypto' && desc.includes('unités à')) {
        const match = desc.match(/(\d+\.?\d*) unités à (\d+\.?\d*)€/);
        if (match) {
          setCryptoQty(match[1]);
          setCryptoPurchasePrice(match[2]);
          if (initialValues.value && match[1]) {
            setCryptoPrice((initialValues.value / parseFloat(match[1])).toString());
          }
        }
      } 
      else if (initialValues.type === 'real-estate') {
        const parts = desc.split(' | ');
        parts.forEach(part => {
          if (part.startsWith('Surface: ')) {
            setSurface(part.replace('Surface: ', '').replace(' m²', ''));
          } else if (part.startsWith('Type: ')) {
            setPropertyType(part.replace('Type: ', ''));
          } else if (part.startsWith('Usage: ')) {
            setUsageType(part.replace('Usage: ', ''));
          } else if (part.startsWith('Taxe foncière: ')) {
            setPropertyTax(part.replace('Taxe foncière: ', '').replace('€/an', ''));
          } else if (part.startsWith('Taxe habitation: ')) {
            setHousingTax(part.replace('Taxe habitation: ', '').replace('€/an', ''));
          } else if (part.startsWith('Loyer: ')) {
            setAnnualRent(part.replace('Loyer: ', '').replace('€/an', ''));
          } else if (part.startsWith('Frais: ')) {
            setAnnualFees(part.replace('Frais: ', '').replace('€/an', ''));
          } else if (part.startsWith('Charges: ')) {
            setAnnualCharges(part.replace('Charges: ', '').replace('€/an', ''));
          }
        });
        
        setAddress(initialValues.name);
        setCurrentValue(initialValues.value.toString());
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

  useEffect(() => {
    if (type === 'real-estate' && currentValue) {
      setValue(currentValue);
    }
  }, [type, currentValue]);

  useEffect(() => {
    if (type === 'stock' && shares && purchasePrice) {
      setValue((parseFloat(shares) * parseFloat(purchasePrice)).toString());
    }
  }, [type, shares, purchasePrice]);
  
  useEffect(() => {
    if (type === 'crypto' && cryptoQty && cryptoPrice) {
      setValue((parseFloat(cryptoQty) * parseFloat(cryptoPrice)).toString());
    }
  }, [type, cryptoQty, cryptoPrice]);

  const validateForm = (): boolean => {
    if (type === 'stock' && !investmentAccountId) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner un compte d'investissement",
        variant: "destructive",
      });
      return false;
    }
    
    if (type === 'crypto' && !cryptoAccountId) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner un compte crypto",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    let finalName = name;
    if (type === 'bank-account' && bankName && accountName) {
      finalName = `${bankName} - ${accountName}`;
    } else if (type === 'savings-account' && savingsBankName && savingsAccountName) {
      finalName = `${savingsBankName} - ${savingsAccountName}`;
    } else if (type === 'real-estate') {
      finalName = address;
    } else if (type === 'stock' && ticker) {
      finalName = ticker;
    }
    
    let finalDescription = description;
    if (!description) {
      if (type === 'stock') {
        finalDescription = `${shares} actions à ${purchasePrice}€`;
      } else if (type === 'crypto') {
        finalDescription = `${cryptoQty} unités à ${cryptoPurchasePrice}€`;
      } else if (type === 'bank-account') {
        finalDescription = `Banque: ${bankName} - Compte: ${accountName}`;
      } else if (type === 'savings-account') {
        finalDescription = `Banque: ${savingsBankName} - Livret: ${savingsAccountName} - Taux: ${interestRate}%`;
      } else if (type === 'real-estate') {
        const descParts = [`Type: ${propertyType}`, `Usage: ${usageType}`, `Surface: ${surface} m²`];
        
        if (usageType === 'main' || usageType === 'secondary') {
          descParts.push(`Taxe foncière: ${propertyTax}€/an`);
          if (usageType === 'secondary' && housingTax) {
            descParts.push(`Taxe habitation: ${housingTax}€/an`);
          }
        } else if (usageType === 'rental') {
          descParts.push(`Taxe foncière: ${propertyTax}€/an`);
          if (annualRent) descParts.push(`Loyer: ${annualRent}€/an`);
          if (annualFees) descParts.push(`Frais: ${annualFees}€/an`);
          if (annualCharges) descParts.push(`Charges: ${annualCharges}€/an`);
        }
        
        finalDescription = descParts.join(' | ');
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
      updatedAt: new Date().toISOString(),
      ...(type === 'stock' && investmentAccountId && { investmentAccountId }),
      ...(type === 'crypto' && cryptoAccountId && { cryptoAccountId }),
      ...((type === 'stock' || type === 'crypto') && { 
        quantity: type === 'stock' ? parseFloat(shares) || 0 : parseFloat(cryptoQty) || 0,
        purchasePrice: type === 'stock' ? parseFloat(purchasePrice) || 0 : parseFloat(cryptoPurchasePrice) || 0
      }),
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
      setPurchasePrice('');
      setAddress('');
      setSurface('');
      setPropertyType('apartment');
      setUsageType('main');
      setCurrentValue('');
      setPropertyTax('');
      setHousingTax('');
      setAnnualRent('');
      setAnnualFees('');
      setAnnualCharges('');
      setCryptoQty('');
      setCryptoPrice('');
      setCryptoPurchasePrice('');
      setBankName('');
      setAccountName('');
      setSavingsBankName('');
      setSavingsAccountName('');
      setInterestRate('');
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
      case 'bank-account': return <Wallet size={24} className="text-[#FA5003]" />;
      case 'savings-account': return <BookText size={24} className="text-[#FA5003]" />;
      case 'real-estate': return <Home size={24} className="text-[#FA5003]" />;
      case 'crypto': return <Bitcoin size={24} className="text-amber-500" />;
      default: return null;
    }
  };

  const handleCryptoSelect = (crypto: CryptoInfo) => {
    setName(crypto.name);
    setCryptoPrice(crypto.current_price.toString());
    setCryptoPurchasePrice(crypto.current_price.toString());
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
            purchasePrice={purchasePrice}
            investmentAccountId={investmentAccountId}
            setTicker={setTicker}
            setShares={setShares}
            setPurchasePrice={setPurchasePrice}
            setInvestmentAccountId={setInvestmentAccountId}
            investmentAccounts={investmentAccounts || []}
            onAddAccount={handleAddAccount}
          />
        );
      case 'crypto':
        return (
          <CryptoFormFields
            cryptoQty={cryptoQty}
            cryptoPrice={cryptoPrice}
            purchasePrice={cryptoPurchasePrice}
            cryptoAccountId={cryptoAccountId}
            setCryptoQty={(newQty) => {
              setCryptoQty(newQty);
              updateCryptoValue(newQty, cryptoPrice);
            }}
            setCryptoPrice={(newPrice) => {
              setCryptoPrice(newPrice);
              updateCryptoValue(cryptoQty, newPrice);
            }}
            setPurchasePrice={setCryptoPurchasePrice}
            setCryptoAccountId={setCryptoAccountId}
            cryptoAccounts={cryptoAccounts || []}
            onCryptoSelect={handleCryptoSelect}
            onAddAccount={handleAddAccount}
          />
        );
      case 'real-estate':
        return (
          <RealEstateFormFields
            address={address}
            surface={surface}
            propertyType={propertyType}
            usageType={usageType}
            currentValue={currentValue}
            propertyTax={propertyTax}
            housingTax={housingTax}
            annualRent={annualRent}
            annualFees={annualFees}
            annualCharges={annualCharges}
            setAddress={setAddress}
            setSurface={setSurface}
            setPropertyType={setPropertyType}
            setUsageType={setUsageType}
            setCurrentValue={setCurrentValue}
            setPropertyTax={setPropertyTax}
            setHousingTax={setHousingTax}
            setAnnualRent={setAnnualRent}
            setAnnualFees={setAnnualFees}
            setAnnualCharges={setAnnualCharges}
          />
        );
      case 'bank-account':
        return (
          <BankAccountFormFields
            bankName={bankName}
            accountName={accountName}
            setBankName={setBankName}
            setAccountName={setAccountName}
          />
        );
      case 'savings-account':
        return (
          <SavingsAccountFormFields
            bankName={savingsBankName}
            accountName={savingsAccountName}
            interestRate={interestRate}
            setBankName={setSavingsBankName}
            setAccountName={setSavingsAccountName}
            setInterestRate={setInterestRate}
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
        
        {type !== 'bank-account' && type !== 'savings-account' && type !== 'real-estate' && type !== 'stock' && type !== 'crypto' && (
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

