
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BankAccountFormFieldsProps {
  bankName: string;
  accountName: string;
  setBankName: (value: string) => void;
  setAccountName: (value: string) => void;
}

const BankAccountFormFields: React.FC<BankAccountFormFieldsProps> = ({
  bankName,
  accountName,
  setBankName,
  setAccountName,
}) => {
  return (
    <>
      <div>
        <Label htmlFor="bankName" className="block text-sm font-medium mb-1">
          Nom de la banque
        </Label>
        <Input
          id="bankName"
          type="text"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: BNP Paribas, Crédit Agricole..."
          required
        />
      </div>
      
      <div>
        <Label htmlFor="accountName" className="block text-sm font-medium mb-1">
          Type de compte
        </Label>
        <Input
          id="accountName"
          type="text"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: Compte courant, Compte joint..."
          required
        />
      </div>
    </>
  );
};

export default BankAccountFormFields;
