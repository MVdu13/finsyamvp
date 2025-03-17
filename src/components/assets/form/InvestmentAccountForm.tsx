
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Asset, InvestmentAccountType } from '@/types/assets';
import InvestmentAccountFormFields from './InvestmentAccountFormFields';

interface InvestmentAccountFormProps {
  onSubmit: (asset: Omit<Asset, 'id'>) => void;
  onCancel: () => void;
  initialValues?: Asset;
}

const InvestmentAccountForm: React.FC<InvestmentAccountFormProps> = ({
  onSubmit,
  onCancel,
  initialValues,
}) => {
  const [accountName, setAccountName] = useState(initialValues?.name || '');
  const [accountType, setAccountType] = useState<InvestmentAccountType>(initialValues?.accountType || 'cto');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const accountTypeLabels = {
      'cto': 'Compte-Titres Ordinaire',
      'pea': 'Plan d\'Épargne en Actions',
      'per': 'Plan d\'Épargne Retraite',
      'assurance-vie': 'Assurance Vie'
    };
    
    const accountAsset = {
      name: accountName,
      description: `Type: ${accountTypeLabels[accountType]}`,
      accountType,
      value: 0, // Default to zero, no value input required
      performance: 0, // Default to zero, no performance input required
      updatedAt: new Date().toISOString()
    };
    
    onSubmit(accountAsset);
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <InvestmentAccountFormFields
          accountName={accountName}
          accountType={accountType}
          setAccountName={setAccountName}
          setAccountType={setAccountType}
        />
        
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
            disabled={!accountName}
          >
            Créer le compte
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvestmentAccountForm;
