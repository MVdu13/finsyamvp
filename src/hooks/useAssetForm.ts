import { useState, useEffect } from 'react';
import { Asset, AssetType } from '@/types/assets';
import { useToast } from '@/hooks/use-toast';

interface UseAssetFormProps {
  onSubmit: (asset: Omit<Asset, 'id'>) => void;
  initialValues?: Asset;
  isEditing?: boolean;
  defaultType?: AssetType;
}

export const useAssetForm = ({ 
  onSubmit, 
  initialValues, 
  isEditing = false,
  defaultType
}: UseAssetFormProps) => {
  const { toast } = useToast();
  const [name, setName] = useState(initialValues?.name || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [type, setType] = useState<AssetType>(initialValues?.type || defaultType || 'stock');
  const [value, setValue] = useState(initialValues?.value ? initialValues.value.toString() : '');
  const [performance, setPerformance] = useState(initialValues?.performance !== undefined ? initialValues.performance.toString() : '');
  
  // Stock fields
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [investmentAccountId, setInvestmentAccountId] = useState(initialValues?.investmentAccountId || '');
  
  // Crypto fields
  const [cryptoAccountId, setCryptoAccountId] = useState(initialValues?.cryptoAccountId || '');
  const [cryptoQty, setCryptoQty] = useState('');
  const [cryptoPurchasePrice, setCryptoPurchasePrice] = useState('');
  const [cryptoName, setCryptoName] = useState(initialValues?.name || '');
  
  // Real estate fields
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
  
  // Bank account fields
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  
  // Savings account fields
  const [savingsBankName, setSavingsBankName] = useState('');
  const [savingsAccountName, setSavingsAccountName] = useState('');
  const [interestRate, setInterestRate] = useState('');

  // Extract initial values from description field if editing
  useEffect(() => {
    if (initialValues?.description) {
      const desc = initialValues.description;
      
      if (initialValues.type === 'stock' && desc.includes('actions à')) {
        const match = desc.match(/(\d+\.?\d*) actions à (\d+\.?\d*)€/);
        if (match) {
          setShares(match[1]);
          setPurchasePrice(match[2]);
          setTicker(initialValues.name.split(' ')[0] || '');
        }
      } 
      else if (initialValues.type === 'crypto' && desc.includes('unités à')) {
        const match = desc.match(/(\d+\.?\d*) unités à (\d+\.?\d*)€/);
        if (match) {
          setCryptoQty(match[1]);
          setCryptoPurchasePrice(match[2]);
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

  // Effect for real estate value
  useEffect(() => {
    if (type === 'real-estate' && currentValue) {
      setValue(currentValue);
    }
  }, [type, currentValue]);

  // Effect for stock value calculation
  useEffect(() => {
    if (type === 'stock' && shares && purchasePrice) {
      setValue((parseFloat(shares) * parseFloat(purchasePrice)).toString());
    }
  }, [type, shares, purchasePrice]);

  // Effect for crypto value calculation
  useEffect(() => {
    if (type === 'crypto' && cryptoQty && cryptoPurchasePrice) {
      setValue((parseFloat(cryptoQty) * parseFloat(cryptoPurchasePrice)).toString());
    }
  }, [type, cryptoQty, cryptoPurchasePrice]);

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
    } else if (type === 'crypto') {
      finalName = cryptoName;
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
    
    const asset: Omit<Asset, 'id'> = {
      name: finalName,
      description: finalDescription,
      type,
      value: parseFloat(value),
      performance: parseFloat(finalPerformance || '0'),
      ...(initialValues?.createdAt && { createdAt: initialValues.createdAt }),
      updatedAt: new Date().toISOString(),
      ...(type === 'stock' && investmentAccountId && { investmentAccountId }),
      ...(type === 'crypto' && cryptoAccountId && { cryptoAccountId }),
      ...(type === 'stock' && { quantity: parseFloat(shares) || 0 }),
      ...(type === 'stock' && { purchasePrice: parseFloat(purchasePrice) || 0 }),
      ...(type === 'crypto' && { quantity: parseFloat(cryptoQty) || 0 }),
      ...(type === 'crypto' && { purchasePrice: parseFloat(cryptoPurchasePrice) || 0 }),
    };
    
    if (type === 'real-estate') {
      asset.propertyType = propertyType as any;
      asset.usageType = usageType as any;
      asset.surface = parseFloat(surface) || undefined;
      asset.propertyTax = parseFloat(propertyTax) || undefined;
      
      if (usageType === 'secondary') {
        asset.housingTax = parseFloat(housingTax) || undefined;
      }
      
      if (usageType === 'rental') {
        asset.annualRent = parseFloat(annualRent) || undefined;
        asset.annualFees = parseFloat(annualFees) || undefined;
        asset.annualCharges = parseFloat(annualCharges) || undefined;
      }
    }
    
    onSubmit(asset);

    if (!isEditing) {
      resetForm();
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setType('stock');
    setValue('');
    setPerformance('');
    setTicker('');
    setShares('');
    setPurchasePrice('');
    setCryptoAccountId('');
    setCryptoQty('');
    setCryptoPurchasePrice('');
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
    setBankName('');
    setAccountName('');
    setSavingsBankName('');
    setSavingsAccountName('');
    setInterestRate('');
    setCryptoName('');
  };

  const updateCryptoValue = (qty: string) => {
    if (qty && cryptoPurchasePrice) {
      setValue((parseFloat(cryptoPurchasePrice) * parseFloat(qty)).toString());
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

  const shouldShowPerformanceField = () => {
    return type !== 'bank-account' && type !== 'savings-account';
  };

  return {
    // Form state
    name,
    description,
    type,
    value,
    performance,
    ticker,
    shares,
    purchasePrice,
    investmentAccountId,
    cryptoAccountId,
    cryptoName,
    cryptoQty,
    cryptoPurchasePrice,
    address,
    surface,
    propertyType,
    usageType,
    currentValue,
    propertyTax,
    housingTax,
    annualRent,
    annualFees,
    annualCharges,
    bankName,
    accountName,
    savingsBankName,
    savingsAccountName,
    interestRate,
    
    // Setters
    setName,
    setDescription,
    setType,
    setValue,
    setPerformance,
    setTicker,
    setShares,
    setPurchasePrice,
    setInvestmentAccountId,
    setCryptoAccountId,
    setCryptoName,
    setCryptoQty,
    setCryptoPurchasePrice,
    setAddress,
    setSurface,
    setPropertyType,
    setUsageType,
    setCurrentValue,
    setPropertyTax,
    setHousingTax,
    setAnnualRent,
    setAnnualFees,
    setAnnualCharges,
    setBankName,
    setAccountName,
    setSavingsBankName,
    setSavingsAccountName,
    setInterestRate,
    
    // Helper functions
    updateCryptoValue,
    getFormTitle,
    shouldShowPerformanceField,
    handleSubmit,
  };
};
