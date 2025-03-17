
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InvestmentAccountFormFieldsProps {
  accountName: string;
  accountType: 'PEA' | 'CTO' | 'Assurance Vie' | 'PER' | 'Autre';
  setAccountName: (value: string) => void;
  setAccountType: (value: 'PEA' | 'CTO' | 'Assurance Vie' | 'PER' | 'Autre') => void;
}

const InvestmentAccountFormFields: React.FC<InvestmentAccountFormFieldsProps> = ({
  accountName,
  accountType,
  setAccountName,
  setAccountType
}) => {
  return (
    <>
      <div>
        <Label htmlFor="accountName" className="block text-sm font-medium mb-1">
          Nom du compte
        </Label>
        <Input
          id="accountName"
          type="text"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: Mon PEA Boursorama"
        />
      </div>
      <div>
        <Label htmlFor="accountType" className="block text-sm font-medium mb-1">
          Type de compte
        </Label>
        <select
          id="accountType"
          value={accountType}
          onChange={(e) => setAccountType(e.target.value as 'PEA' | 'CTO' | 'Assurance Vie' | 'PER' | 'Autre')}
          className="wealth-input w-full"
        >
          <option value="PEA">PEA</option>
          <option value="CTO">CTO</option>
          <option value="Assurance Vie">Assurance Vie</option>
          <option value="PER">PER</option>
          <option value="Autre">Autre</option>
        </select>
      </div>
    </>
  );
};

export default InvestmentAccountFormFields;
