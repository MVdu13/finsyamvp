
import React, { useState } from 'react';
import { Asset } from '@/types/assets';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import SavingsAccountFormFields from './SavingsAccountFormFields';

interface SavingsAccountFormProps {
  onSubmit: (asset: Omit<Asset, 'id'>) => void;
  onCancel: () => void;
  initialValues?: Asset;
  isEditing?: boolean;
}

const SavingsAccountForm: React.FC<SavingsAccountFormProps> = ({ 
  onSubmit, 
  onCancel,
  initialValues,
  isEditing = false 
}) => {
  const [bankName, setBankName] = useState(initialValues?.savingsBankName || '');
  const [accountName, setAccountName] = useState(initialValues?.savingsAccountName || '');
  const [interestRate, setInterestRate] = useState(initialValues?.interestRate?.toString() || '');
  const [value, setValue] = useState(initialValues?.value ? initialValues.value.toString() : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bankName.trim() || !accountName.trim() || !value.trim() || !interestRate.trim()) {
      return;
    }
    
    const finalName = `${bankName.trim()} - ${accountName.trim()}`;
    const finalDescription = `Banque: ${bankName.trim()} - Livret: ${accountName.trim()} - Taux: ${interestRate}%`;
    
    const asset: Omit<Asset, 'id'> = {
      name: finalName,
      description: finalDescription,
      type: 'savings-account',
      value: parseFloat(value),
      performance: parseFloat(interestRate),
      updatedAt: new Date().toISOString(),
      ...(initialValues?.createdAt && { createdAt: initialValues.createdAt }),
    };
    
    onSubmit(asset);
  };

  return (
    <div className="p-4 bg-white rounded-xl w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <SavingsAccountFormFields
          bankName={bankName}
          accountName={accountName}
          interestRate={interestRate}
          setBankName={setBankName}
          setAccountName={setAccountName}
          setInterestRate={setInterestRate}
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
            {isEditing ? 'Mettre à jour' : 'Ajouter le livret'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SavingsAccountForm;
