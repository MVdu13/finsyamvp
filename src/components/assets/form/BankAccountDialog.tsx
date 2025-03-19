
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Asset } from '@/types/assets';
import BankAccountValueField from './BankAccountValueField';

interface BankAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (account: Omit<Asset, 'id'>) => Asset | null | undefined;
}

const BankAccountDialog: React.FC<BankAccountDialogProps> = ({
  isOpen,
  onClose,
  onAddAccount
}) => {
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [value, setValue] = useState('');

  const handleAddAccount = () => {
    if (bankName.trim() && accountName.trim() && parseFloat(value) >= 0) {
      const newAccount = {
        name: accountName.trim(),
        type: 'bank-account' as const,
        bankName: bankName.trim(),
        value: parseFloat(value),
        performance: 0,
      };
      
      onAddAccount(newAccount);
      
      // Reset the form
      setBankName('');
      setAccountName('');
      setValue('');
      
      // Close the dialog
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un compte bancaire</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="bankName" className="block text-sm font-medium mb-1">
              Nom de la banque <span className="text-red-500">*</span>
            </Label>
            <Input
              id="bankName"
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="wealth-input w-full"
              placeholder="Ex: BNP Paribas"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="accountName" className="block text-sm font-medium mb-1">
              Nom du compte <span className="text-red-500">*</span>
            </Label>
            <Input
              id="accountName"
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="wealth-input w-full"
              placeholder="Ex: Compte courant"
              required
            />
          </div>
          
          <BankAccountValueField 
            value={value} 
            setValue={setValue} 
          />
          
          <div className="flex justify-end gap-3 mt-4">
            <button 
              type="button" 
              className="wealth-btn"
              onClick={onClose}
            >
              Annuler
            </button>
            <button 
              type="button" 
              className="wealth-btn wealth-btn-primary"
              onClick={handleAddAccount}
            >
              Ajouter le compte
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BankAccountDialog;
