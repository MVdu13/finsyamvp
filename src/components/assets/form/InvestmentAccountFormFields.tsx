
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InvestmentAccountType } from '@/types/assets';

interface InvestmentAccountFormFieldsProps {
  accountName: string;
  accountType: InvestmentAccountType;
  setAccountName: (value: string) => void;
  setAccountType: (value: InvestmentAccountType) => void;
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
        <input
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
          onValueChange={(value) => setAccountType(value as InvestmentAccountType)}
        >
          <SelectTrigger id="accountType" className="w-full">
            <SelectValue placeholder="Sélectionner un type de compte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cto">Compte-Titres Ordinaire (CTO)</SelectItem>
            <SelectItem value="pea">Plan d'Épargne en Actions (PEA)</SelectItem>
            <SelectItem value="per">Plan d'Épargne Retraite (PER)</SelectItem>
            <SelectItem value="assurance-vie">Assurance Vie</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default InvestmentAccountFormFields;
