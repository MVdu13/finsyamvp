
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Asset } from '@/types/assets';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useInvestmentAccount } from '@/hooks/useInvestmentAccount';

interface InvestmentFieldsBaseProps {
  assetName: string;
  assetQty: string;
  purchasePrice: string;
  accountId: string;
  setAssetName: (value: string) => void;
  setAssetQty: (value: string) => void;
  setPurchasePrice: (value: string) => void;
  setAccountId: (value: string) => void;
  accounts: Asset[];
  onAddAccount?: (account: Omit<Asset, 'id'>) => Asset | null | undefined;
  existingAssets?: Asset[];
  accountLabel: string;
  accountSelectPlaceholder: string;
  assetNameLabel: string;
  assetNamePlaceholder: string;
  qtyLabel: string;
  qtyPlaceholder: string;
  priceLabel: string;
  pricePlaceholder: string;
  qtyStep?: string;
  dialogTitle: string;
  renderAccountFormFields: (props: {
    accountName: string;
    setAccountName: (value: string) => void;
    otherProps: any;
    setOtherProps: (value: any) => void;
  }) => React.ReactNode;
  accountTypeKey: string;
  existingAssetsMessageFn?: (matchingAssets: Asset[]) => string;
}

const InvestmentFieldsBase: React.FC<InvestmentFieldsBaseProps> = ({
  assetName,
  assetQty,
  purchasePrice,
  accountId,
  setAssetName,
  setAssetQty,
  setPurchasePrice,
  setAccountId,
  accounts,
  onAddAccount,
  existingAssets = [],
  accountLabel,
  accountSelectPlaceholder,
  assetNameLabel,
  assetNamePlaceholder,
  qtyLabel,
  qtyPlaceholder,
  priceLabel,
  pricePlaceholder,
  qtyStep = "0.01",
  dialogTitle,
  renderAccountFormFields,
  accountTypeKey,
  existingAssetsMessageFn
}) => {
  const { toast } = useToast();
  const [newAccountName, setNewAccountName] = useState('');
  const [otherProps, setOtherProps] = useState<any>({});
  const [matchingAssets, setMatchingAssets] = useState<Asset[]>([]);

  const { 
    accountDialogOpen, 
    setAccountDialogOpen, 
    handleAddAccount 
  } = useInvestmentAccount({
    accountId,
    setAccountId,
    accounts,
    onAddAccount
  });

  const handleAddAccountClick = () => {
    if (newAccountName.trim()) {
      const newAccount = {
        name: newAccountName.trim(),
        type: accountTypeKey as any,
        ...otherProps,
        value: 0,
        performance: 0,
      };
      
      handleAddAccount(newAccount);
      
      // Reset the form but don't close the dialog yet
      setNewAccountName('');
    }
  };

  // Vérifier si l'asset existe déjà dans le compte sélectionné
  useEffect(() => {
    if (assetName && accountId && existingAssets.length > 0) {
      const matching = existingAssets.filter(
        asset => asset.name.toLowerCase() === assetName.toLowerCase() && 
                ((accountTypeKey === 'investment-account' && asset.investmentAccountId === accountId) ||
                 (accountTypeKey === 'crypto-account' && asset.cryptoAccountId === accountId))
      );
      
      setMatchingAssets(matching);
      
      if (matching.length > 0) {
        toast({
          title: `${assetName} déjà existant`,
          description: `${assetName} existe déjà dans ce compte. Les ${accountTypeKey === 'investment-account' ? 'actions' : 'cryptos'} seront empilées.`,
        });
      }
    } else {
      setMatchingAssets([]);
    }
  }, [assetName, accountId, existingAssets, toast, accountTypeKey]);

  return (
    <>
      <div className="mb-4">
        <Label htmlFor="accountId" className="block text-sm font-medium mb-1">
          {accountLabel} <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-2">
          <select
            id="accountId"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className={`wealth-input flex-grow ${!accountId ? 'border-red-300 focus:border-red-500' : ''}`}
            required
          >
            <option value="">{accountSelectPlaceholder}</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} ({
                  accountTypeKey === 'investment-account' 
                    ? account.accountType 
                    : account.cryptoPlatform
                })
              </option>
            ))}
          </select>
          <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
            <DialogTrigger asChild>
              <button 
                type="button"
                className="wealth-btn flex items-center gap-1 px-3"
              >
                <Plus size={16} />
                <span>Nouveau</span>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {renderAccountFormFields({
                  accountName: newAccountName,
                  setAccountName: setNewAccountName,
                  otherProps,
                  setOtherProps
                })}
                <div className="flex justify-end gap-3 mt-4">
                  <button 
                    type="button" 
                    className="wealth-btn"
                    onClick={() => setAccountDialogOpen(false)}
                  >
                    Annuler
                  </button>
                  <button 
                    type="button" 
                    className="wealth-btn wealth-btn-primary"
                    onClick={handleAddAccountClick}
                  >
                    Ajouter le compte
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {!accountId && (
          <p className="text-red-500 text-xs mt-1">{accountLabel} est requis</p>
        )}
      </div>

      <div>
        <Label htmlFor="assetName" className="block text-sm font-medium mb-1">
          {assetNameLabel} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="assetName"
          type="text"
          value={assetName}
          onChange={(e) => setAssetName(e.target.value)}
          className="wealth-input w-full"
          placeholder={assetNamePlaceholder}
          required
        />
        {matchingAssets.length > 0 && existingAssetsMessageFn && (
          <p className="text-xs text-wealth-primary mt-1">
            {existingAssetsMessageFn(matchingAssets)}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="assetQty" className="block text-sm font-medium mb-1">
          {qtyLabel} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="assetQty"
          type="number"
          value={assetQty}
          onChange={(e) => setAssetQty(e.target.value)}
          className="wealth-input w-full"
          placeholder={qtyPlaceholder}
          min="0"
          step={qtyStep}
          required
        />
      </div>
      <div>
        <Label htmlFor="purchasePrice" className="block text-sm font-medium mb-1">
          {priceLabel} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="purchasePrice"
          type="number"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
          className="wealth-input w-full"
          placeholder={pricePlaceholder}
          min="0"
          step="0.01"
          required
        />
      </div>
    </>
  );
};

export default InvestmentFieldsBase;
