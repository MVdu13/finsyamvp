
// Modifications to InvestmentFieldsBase.tsx to support editing without duplicate crypto warnings
import React, { useState, useEffect } from 'react';
import { Asset } from '@/types/assets';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info, Plus } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccountFormFieldsProps {
  accountName: string;
  setAccountName: (name: string) => void;
  otherProps: Record<string, any>;
  setOtherProps: (props: Record<string, any>) => void;
}

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
  qtyStep?: string;
  priceLabel: string;
  pricePlaceholder: string;
  dialogTitle: string;
  accountTypeKey: string;
  accountTypeProp?: string;
  isEditing?: boolean;
  editingAssetId?: string;
  renderAccountFormFields: (props: AccountFormFieldsProps) => React.ReactNode;
  existingAssetsMessageFn?: (assets: Asset[]) => string;
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
  qtyStep = "1",
  priceLabel,
  pricePlaceholder,
  dialogTitle,
  accountTypeKey,
  isEditing = false,
  editingAssetId,
  renderAccountFormFields,
  existingAssetsMessageFn
}) => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [otherProps, setOtherProps] = useState<Record<string, any>>({});
  const [showExistingWarning, setShowExistingWarning] = useState(false);
  const [matchingAssets, setMatchingAssets] = useState<Asset[]>([]);

  useEffect(() => {
    if (!isEditing && assetName && accountId) {
      const matches = existingAssets.filter(
        asset => 
          asset.name.toLowerCase() === assetName.toLowerCase() && 
          asset.type === accountTypeKey.replace('-account', '') &&
          asset[`${accountTypeKey}Id`] === accountId &&
          (!editingAssetId || asset.id !== editingAssetId)
      );
      
      setMatchingAssets(matches);
      setShowExistingWarning(matches.length > 0);
    } else {
      setShowExistingWarning(false);
      setMatchingAssets([]);
    }
  }, [assetName, accountId, existingAssets, accountTypeKey, isEditing, editingAssetId]);

  const handleAddAccount = () => {
    if (onAddAccount && newAccountName) {
      const accountData: Omit<Asset, 'id'> = {
        name: newAccountName,
        type: accountTypeKey as any,
        value: 0,
        ...otherProps
      };
      
      const newAccount = onAddAccount(accountData);
      
      if (newAccount) {
        setAccountId(newAccount.id);
        toast({
          title: "Compte ajouté",
          description: `Le compte ${newAccountName} a été créé et sélectionné.`,
        });
      }
      
      setDialogOpen(false);
      setNewAccountName('');
      setOtherProps({});
    }
  };

  return (
    <>
      <div>
        <Label htmlFor="accountSelect" className="block text-sm font-medium mb-1">
          {accountLabel}
        </Label>
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <Select
              value={accountId}
              onValueChange={setAccountId}
            >
              <SelectTrigger id="accountSelect" className="w-full border border-input bg-background">
                <SelectValue placeholder={accountSelectPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {onAddAccount && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-none"
                  title={`Ajouter un nouveau ${accountLabel.toLowerCase()}`}
                >
                  <Plus size={16} />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{dialogTitle}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  {renderAccountFormFields({
                    accountName: newAccountName,
                    setAccountName: setNewAccountName,
                    otherProps,
                    setOtherProps,
                  })}
                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleAddAccount}
                      disabled={!newAccountName}
                    >
                      Ajouter
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      <div>
        <Label htmlFor="assetName" className="block text-sm font-medium mb-1">
          {assetNameLabel}
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
      </div>
      
      {showExistingWarning && existingAssetsMessageFn && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-800">
              {existingAssetsMessageFn(matchingAssets)}
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              L'ajout de cette action sera fusionné avec l'existante.
            </p>
          </div>
        </div>
      )}
      
      <div>
        <Label htmlFor="assetQty" className="block text-sm font-medium mb-1">
          {qtyLabel}
        </Label>
        <Input
          id="assetQty"
          type="number"
          value={assetQty}
          onChange={(e) => setAssetQty(e.target.value)}
          className="wealth-input w-full"
          placeholder={qtyPlaceholder}
          step={qtyStep}
          min="0"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="purchasePrice" className="block text-sm font-medium mb-1">
          {priceLabel}
        </Label>
        <Input
          id="purchasePrice"
          type="number"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
          className="wealth-input w-full"
          placeholder={pricePlaceholder}
          step="0.01"
          min="0"
          required
        />
      </div>
    </>
  );
};

export default InvestmentFieldsBase;
