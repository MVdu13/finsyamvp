
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Asset, InvestmentAccountType } from '@/types/assets';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StockFormFields from './StockFormFields';
import InvestmentAccountFormFields from './InvestmentAccountFormFields';

interface StockFormProps {
  onSubmit: (asset: Omit<Asset, 'id'>) => void;
  onCancel: () => void;
  initialValues?: Asset;
  investmentAccounts?: Asset[];
  onNeedAccount?: () => void;
}

const StockForm: React.FC<StockFormProps> = ({
  onSubmit,
  onCancel,
  initialValues,
  investmentAccounts = [],
  onNeedAccount
}) => {
  const [ticker, setTicker] = useState(initialValues?.name || '');
  const [shares, setShares] = useState(initialValues?.quantity?.toString() || '');
  const [purchasePrice, setPurchasePrice] = useState(initialValues?.purchasePrice?.toString() || '');
  
  // Investment account related
  const [selectedAccountId, setSelectedAccountId] = useState(initialValues?.parentAccountId || '');
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [investmentAccountName, setInvestmentAccountName] = useState('');
  const [accountType, setAccountType] = useState<InvestmentAccountType>('cto');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate the total value based on shares and purchase price
    const calculatedValue = shares && purchasePrice 
      ? parseFloat(shares) * parseFloat(purchasePrice) 
      : 0;

    const stockAsset = {
      name: ticker,
      description: `${shares} actions à ${purchasePrice}€`,
      value: calculatedValue,
      performance: 0, // Default performance for new stocks
      quantity: parseFloat(shares),
      purchasePrice: parseFloat(purchasePrice),
      parentAccountId: selectedAccountId || undefined,
      updatedAt: new Date().toISOString()
    };
    
    onSubmit(stockAsset);
  };

  const handleCreateAccountToggle = () => {
    if (showCreateAccount) {
      // User wants to go back to selecting an account
      setShowCreateAccount(false);
    } else if (investmentAccounts.length === 0) {
      // No accounts available and user clicked "Create Account"
      if (onNeedAccount) {
        onNeedAccount();
      } else {
        setShowCreateAccount(true);
      }
    } else {
      // User has accounts but wants to create a new one
      setShowCreateAccount(true);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Account Selection or Creation Section */}
        <div className="mb-4">
          <Label htmlFor="accountSelect" className="block text-sm font-medium mb-1">
            Compte d'investissement
          </Label>
          
          {!showCreateAccount ? (
            <div className="flex gap-2">
              {investmentAccounts.length > 0 ? (
                <>
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
                    onClick={handleCreateAccountToggle}
                  >
                    Nouveau
                  </button>
                </>
              ) : (
                <button 
                  type="button"
                  className="wealth-btn wealth-btn-secondary w-full"
                  onClick={handleCreateAccountToggle}
                >
                  Créer un compte d'investissement
                </button>
              )}
            </div>
          ) : (
            <>
              <InvestmentAccountFormFields
                accountName={investmentAccountName}
                accountType={accountType}
                setAccountName={setInvestmentAccountName}
                setAccountType={setAccountType}
                simplified={true}
              />
              <button 
                type="button" 
                className="text-sm text-blue-600 mt-2"
                onClick={handleCreateAccountToggle}
              >
                Revenir à la sélection
              </button>
            </>
          )}
        </div>
        
        {/* Stock Details Section */}
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
        
        {/* Form Actions */}
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
            disabled={showCreateAccount || (!ticker || !shares || !purchasePrice || (!selectedAccountId && !showCreateAccount))}
          >
            Ajouter
          </button>
        </div>
      </form>
    </div>
  );
};

export default StockForm;
