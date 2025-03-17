import React, { useState, useEffect } from 'react';
import { Asset, AssetType, InvestmentAccountType } from '@/types/assets';
import { X, Banknote, Wallet, BookText, Home, FileCheck } from 'lucide-react';
import { CryptoInfo } from '@/services/cryptoService';
import TypeSelector from './form/TypeSelector';
import CommonFormFields from './form/CommonFormFields';
import StockFormFields from './form/StockFormFields';
import CryptoFormFields from './form/CryptoFormFields';
import RealEstateFormFields from './form/RealEstateFormFields';
import BankAccountFormFields from './form/BankAccountFormFields';
import SavingsAccountFormFields from './form/SavingsAccountFormFields';
import InvestmentAccountFormFields from './form/InvestmentAccountFormFields';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AssetFormProps {
  onSubmit: (asset: Omit<Asset, 'id'>) => void;
  onCancel: () => void;
  defaultType?: AssetType;
  showTypeSelector?: boolean;
  initialValues?: Asset;
  isEditing?: boolean;
  investmentAccounts?: Asset[];
}

const AssetForm: React.FC<AssetFormProps> = ({ 
  onSubmit, 
  onCancel, 
  defaultType = 'stock',
  showTypeSelector = true,
  initialValues,
  isEditing = false,
  investmentAccounts = []
}) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [type, setType] = useState<AssetType>(initialValues?.type || defaultType);
  const [value, setValue] = useState(initialValues?.value ? initialValues.value.toString() : '');
  const [performance, setPerformance] = useState(initialValues?.performance !== undefined ? initialValues.performance.toString() : '');
  
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  
  // Investment account related fields
  const [investmentAccountName, setInvestmentAccountName] = useState('');
  const [accountType, setAccountType] = useState<InvestmentAccountType>('cto');
  const [selectedAccountId, setSelectedAccountId] = useState(initialValues?.parentAccountId || '');
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  
  // Real Estate Fields
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
  
  const [bankName, setBankName] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  
  const [savingsBankName, setSavingsBankName] = useState('');
  const [savingsAccountName, setSavingsAccountName] = useState('');
  const [interestRate, setInterestRate] = useState('');

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
          // Le prix actuel est différent du prix d'achat
          if (initialValues.value && match[1]) {
            setCryptoPrice((initialValues.value / parseFloat(match[1])).toString());
          }
        }
      } 
      else if (initialValues.type === 'real-estate') {
        // Parse real estate data
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
              setBankAccountName(accountPart.replace('Compte: ', ''));
            } else {
              setBankAccountName(accountPart);
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
      else if (initialValues.type === 'investment-account') {
        setInvestmentAccountName(initialValues.name);
        if (initialValues.accountType) {
          setAccountType(initialValues.accountType);
        }
      }
    }
    
    if (initialValues?.name && initialValues.type === 'bank-account' && !bankAccountName) {
      const parts = initialValues.name.split(' - ');
      if (parts.length > 1) {
        if (!bankName) setBankName(parts[0]);
        setBankAccountName(parts[1]);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalName = name;
    let finalDescription = description;
    let finalType = type;
    let finalParentAccountId = undefined;
    
    if (type === 'bank-account' && bankName && bankAccountName) {
      finalName = `${bankName} - ${bankAccountName}`;
    } else if (type === 'savings-account' && savingsBankName && savingsAccountName) {
      finalName = `${savingsBankName} - ${savingsAccountName}`;
    } else if (type === 'real-estate') {
      finalName = address;
    } else if (type === 'stock') {
      finalName = ticker;
      finalParentAccountId = selectedAccountId || undefined;
    } else if (type === 'investment-account' && investmentAccountName) {
      finalName = investmentAccountName;
    }
    
    if (!description) {
      if (type === 'stock') {
        finalDescription = `${shares} actions à ${purchasePrice}€`;
      } else if (type === 'crypto') {
        finalDescription = `${cryptoQty} unités à ${cryptoPurchasePrice}€`;
      } else if (type === 'bank-account') {
        finalDescription = `Banque: ${bankName} - Compte: ${bankAccountName}`;
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
      } else if (type === 'investment-account') {
        const accountTypeLabels = {
          'cto': 'Compte-Titres Ordinaire',
          'pea': 'Plan d\'Épargne en Actions',
          'per': 'Plan d\'Épargne Retraite',
          'assurance-vie': 'Assurance Vie'
        };
        finalDescription = `Type: ${accountTypeLabels[accountType]}`;
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
      type: finalType,
      value: parseFloat(value),
      performance: parseFloat(finalPerformance || '0'),
      ...(finalParentAccountId && { parentAccountId: finalParentAccountId }),
      ...(type === 'investment-account' && { accountType }),
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
      setBankAccountName('');
      setSavingsBankName('');
      setSavingsAccountName('');
      setInterestRate('');
      setInvestmentAccountName('');
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
      case 'investment-account': return `${action} un compte-titres`;
      default: return `${action} un nouvel actif`;
    }
  };

  const getFormIcon = () => {
    switch (type) {
      case 'bank-account': return <Wallet size={24} className="text-[#FA5003]" />;
      case 'savings-account': return <BookText size={24} className="text-[#FA5003]" />;
      case 'real-estate': return <Home size={24} className="text-[#FA5003]" />;
      case 'investment-account': return <FileCheck size={24} className="text-[#FA5003]" />;
      default: return null;
    }
  };

  const handleCryptoSelect = (crypto: CryptoInfo) => {
    setName(crypto.name);
    setTicker(crypto.symbol.toUpperCase());
    setCryptoPrice(crypto.current_price.toString());
    setCryptoPurchasePrice(crypto.current_price.toString()); // Par défaut, prix d'achat = prix actuel
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
          <>
            {investmentAccounts.length > 0 ? (
              <div className="mb-4">
                <Label htmlFor="accountSelect" className="block text-sm font-medium mb-1">
                  Compte d'investissement
                </Label>
                <div className="flex gap-2">
                  <Select 
                    value={selectedAccountId} 
                    onValueChange={setSelectedAccountId}
                  >
                    <SelectTrigger id="accountSelect" className="w-full">
                      <SelectValue placeholder="Sélectionner un compte" />
                    </SelectTrigger>
                    <SelectContent>
                      {investmentAccounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button 
                    type="button"
                    className="wealth-btn wealth-btn-secondary"
                    onClick={() => setShowCreateAccount(true)}
                  >
                    Nouveau
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-1">
                  Compte d'investissement
                </Label>
                {!showCreateAccount ? (
                  <button 
                    type="button"
                    className="wealth-btn wealth-btn-secondary w-full"
                    onClick={() => setShowCreateAccount(true)}
                  >
                    Créer un compte d'investissement
                  </button>
                ) : (
                  <InvestmentAccountFormFields
                    accountName={investmentAccountName}
                    accountType={accountType}
                    setAccountName={setInvestmentAccountName}
                    setAccountType={setAccountType}
                  />
                )}
              </div>
            )}
            {!showCreateAccount && (
              <StockFormFields
                ticker={ticker}
                shares={shares}
                purchasePrice={purchasePrice}
                setTicker={setTicker}
                setShares={setShares}
                setPurchasePrice={setPurchasePrice}
              />
            )}
          </>
        );
      case 'investment-account':
        return (
          <>
            <InvestmentAccountFormFields
              accountName={investmentAccountName}
              accountType={accountType}
              setAccountName={setInvestmentAccountName}
              setAccountType={setAccountType}
            />
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
                placeholder="Ex: 10000"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <Label htmlFor="performance" className="block text-sm font-medium mb-1">
                Performance annuelle (%)
              </Label>
              <Input
                id="performance"
                type="number"
                value={performance}
                onChange={(e) => setPerformance(e.target.value)}
                className="wealth-input w-full"
                placeholder="Ex: 5"
                min="-100"
                step="0.01"
              />
            </div>
          </>
        );
      case 'crypto':
        return (
          <CryptoFormFields
            cryptoQty={cryptoQty}
            cryptoPrice={cryptoPrice}
            purchasePrice={cryptoPurchasePrice}
            setCryptoQty={(newQty) => {
              setCryptoQty(newQty);
              updateCryptoValue(newQty, cryptoPrice);
            }}
            setCryptoPrice={(newPrice) => {
              setCryptoPrice(newPrice);
              updateCryptoValue(cryptoQty, newPrice);
            }}
            setPurchasePrice={setCryptoPurchasePrice}
            onCryptoSelect={handleCryptoSelect}
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
            accountName={bankAccountName}
            setBankName={setBankName}
            setAccountName={setBankAccountName}
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
        
        {type !== 'bank-account' && type !== 'savings-account' && type !== 'real-estate' && 
         type !== 'stock' && type !== 'crypto' && type !== 'investment-account' && (
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
