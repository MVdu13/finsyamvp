
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
        <Select
          value={accountType}
          onValueChange={(value) => setAccountType(value as 'PEA' | 'CTO' | 'Assurance Vie' | 'PER' | 'Autre')}
        >
          <SelectTrigger 
            id="accountType" 
            className="wealth-input w-full border border-input bg-background"
          >
            <SelectValue placeholder="Sélectionner un type de compte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PEA">PEA</SelectItem>
            <SelectItem value="CTO">CTO</SelectItem>
            <SelectItem value="Assurance Vie">Assurance Vie</SelectItem>
            <SelectItem value="PER">PER</SelectItem>
            <SelectItem value="Autre">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default InvestmentAccountFormFields;
