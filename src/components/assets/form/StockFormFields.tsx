
import React from 'react';
import { Asset } from '@/types/assets';
import InvestmentFieldsBase from './InvestmentFieldsBase';
import InvestmentAccountFormFields from './InvestmentAccountFormFields';

interface StockFormFieldsProps {
  ticker: string;
  shares: string;
  purchasePrice: string;
  investmentAccountId: string;
  setTicker: (value: string) => void; 
  setShares: (value: string) => void;
  setPurchasePrice: (value: string) => void;
  setInvestmentAccountId: (value: string) => void;
  investmentAccounts: Asset[];
  onAddAccount?: (account: Omit<Asset, 'id'>) => Asset | null | undefined;
  existingStocks?: Asset[];
  isEditing?: boolean;
  editingAssetId?: string;
}

const StockFormFields: React.FC<StockFormFieldsProps> = ({ 
  ticker, 
  shares, 
  purchasePrice,
  investmentAccountId,
  setTicker, 
  setShares,
  setPurchasePrice,
  setInvestmentAccountId,
  investmentAccounts,
  onAddAccount,
  existingStocks = [],
  isEditing = false,
  editingAssetId
}) => {
  return (
    <InvestmentFieldsBase
      assetName={ticker}
      assetQty={shares}
      purchasePrice={purchasePrice}
      accountId={investmentAccountId}
      setAssetName={setTicker}
      setAssetQty={setShares}
      setPurchasePrice={setPurchasePrice}
      setAccountId={setInvestmentAccountId}
      accounts={investmentAccounts}
      onAddAccount={onAddAccount}
      existingAssets={existingStocks}
      accountLabel="Compte d'investissement"
      accountSelectPlaceholder="-- Sélectionner un compte --"
      assetNameLabel="Nom de l'action/ETF"
      assetNamePlaceholder="Ex: AAPL"
      qtyLabel="Quantité d'actions"
      qtyPlaceholder="Ex: 10"
      priceLabel="Prix d'achat par action (€)"
      pricePlaceholder="Ex: 150"
      dialogTitle="Ajouter un compte d'investissement"
      accountTypeKey="investment-account"
      isEditing={isEditing}
      editingAssetId={editingAssetId}
      renderAccountFormFields={({ accountName, setAccountName, otherProps, setOtherProps }) => (
        <InvestmentAccountFormFields
          accountName={accountName}
          accountType={otherProps.accountType || 'PEA'}
          setAccountName={setAccountName}
          setAccountType={(value) => setOtherProps({ ...otherProps, accountType: value })}
        />
      )}
      existingAssetsMessageFn={(matchingAssets) => 
        `Vous possédez déjà ${matchingAssets.reduce((sum, stock) => sum + (stock.quantity || 0), 0)} actions de ${ticker}`
      }
    />
  );
};

export default StockFormFields;
