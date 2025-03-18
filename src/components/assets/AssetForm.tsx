
import React from 'react';
import { Asset, AssetType } from '@/types/assets';
import TypeSelector from './form/TypeSelector';
import CommonFormFields from './form/CommonFormFields';
import StockFormFields from './form/StockFormFields';
import CryptoFormFields from './form/CryptoFormFields';
import RealEstateFormFields from './form/RealEstateFormFields';
import BankAccountFormFields from './form/BankAccountFormFields';
import SavingsAccountFormFields from './form/SavingsAccountFormFields';
import BankAccountValueField from './form/BankAccountValueField';
import FormHeader from './form/FormHeader';
import FormActions from './form/FormActions';
import { useAssetForm } from '@/hooks/useAssetForm';

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
  existingStocks?: Asset[];
  existingCryptos?: Asset[];
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
  onAddAccount,
  existingStocks = [],
  existingCryptos = []
}) => {
  const {
    // Form state and setters
    type, setType,
    value, setValue,
    performance, setPerformance,
    name, setName,
    description, setDescription,
    ticker, setTicker,
    shares, setShares,
    purchasePrice, setPurchasePrice,
    investmentAccountId, setInvestmentAccountId,
    cryptoAccountId, setCryptoAccountId,
    cryptoName, setCryptoName,
    cryptoQty, setCryptoQty,
    cryptoPurchasePrice, setCryptoPurchasePrice,
    address, setAddress,
    surface, setSurface,
    propertyType, setPropertyType,
    usageType, setUsageType,
    currentValue, setCurrentValue,
    propertyTax, setPropertyTax,
    housingTax, setHousingTax,
    annualRent, setAnnualRent,
    annualFees, setAnnualFees,
    annualCharges, setAnnualCharges,
    bankName, setBankName,
    accountName, setAccountName,
    savingsBankName, setSavingsBankName,
    savingsAccountName, setSavingsAccountName,
    interestRate, setInterestRate,
    
    // Helper functions
    getFormTitle,
    shouldShowPerformanceField,
    handleSubmit,
    updateCryptoValue,
  } = useAssetForm({
    onSubmit,
    initialValues,
    isEditing
  });

  const handleAddAccount = (accountData: Omit<Asset, 'id'>) => {
    if (onAddAccount) {
      return onAddAccount(accountData);
    }
    return null;
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
            existingStocks={existingStocks}
          />
        );
      case 'crypto':
        return (
          <CryptoFormFields
            cryptoName={cryptoName}
            cryptoQty={cryptoQty}
            purchasePrice={cryptoPurchasePrice}
            cryptoAccountId={cryptoAccountId}
            setCryptoName={setCryptoName}
            setCryptoQty={(newQty) => {
              setCryptoQty(newQty);
              updateCryptoValue(newQty);
            }}
            setPurchasePrice={setCryptoPurchasePrice}
            setCryptoAccountId={setCryptoAccountId}
            cryptoAccounts={cryptoAccounts || []}
            onAddAccount={handleAddAccount}
            existingCryptos={existingCryptos}
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
      <FormHeader 
        title={getFormTitle()} 
        type={type} 
        onCancel={onCancel} 
      />
      
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
          <BankAccountValueField value={value} setValue={setValue} />
        )}
        
        {renderTypeSpecificFields()}
        
        <FormActions onCancel={onCancel} isEditing={isEditing} />
      </form>
    </div>
  );
};

export default AssetForm;
