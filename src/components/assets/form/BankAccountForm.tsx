
import React, { useState } from 'react';
import { Asset } from '@/types/assets';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import BankAccountFormFields from './BankAccountFormFields';

interface BankAccountFormProps {
  onSubmit: (asset: Omit<Asset, 'id'>) => void;
  onCancel: () => void;
  initialValues?: Asset;
  isEditing?: boolean;
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({ 
  onSubmit, 
  onCancel,
  initialValues,
  isEditing = false 
}) => {
  const [bankName, setBankName] = useState(initialValues?.bankName || '');
  const [accountName, setAccountName] = useState(initialValues?.accountName || '');
  const [value, setValue] = useState(initialValues?.value ? initialValues.value.toString() : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bankName.trim() || !accountName.trim() || !value.trim()) {
      return;
    }
    
    const finalName = `${bankName.trim()} - ${accountName.trim()}`;
    const finalDescription = `Banque: ${bankName.trim()} - Compte: ${accountName.trim()}`;
    
    const asset: Omit<Asset, 'id'> = {
      name: finalName,
      description: finalDescription,
      type: 'bank-account',
      value: parseFloat(value),
      performance: 0,
      updatedAt: new Date().toISOString(),
      ...(initialValues?.createdAt && { createdAt: initialValues.createdAt }),
    };
    
    onSubmit(asset);
  };

  return (
    <div className="p-4 bg-white rounded-xl w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <BankAccountFormFields
          bankName={bankName}
          accountName={accountName}
          setBankName={setBankName}
          setAccountName={setAccountName}
        />
        
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
        
        <div className="flex justify-end gap-3 mt-6">
          <button 
            type="button" 
            className="wealth-btn"
            onClick={onCancel}
          >
            Annuler
          </button>
          <button 
            type="submit"
            className="wealth-btn wealth-btn-primary"
          >
            {isEditing ? 'Mettre à jour' : 'Ajouter le compte'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BankAccountForm;
