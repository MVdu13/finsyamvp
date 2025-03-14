
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormItem } from "@/components/ui/form";

interface BankAccountFormFieldsProps {
  bankName: string;
  accountName: string;
  accountNumber: string;
  setBankName: (value: string) => void;
  setAccountName: (value: string) => void;
  setAccountNumber: (value: string) => void;
}

const BankAccountFormFields: React.FC<BankAccountFormFieldsProps> = ({
  bankName,
  accountName,
  accountNumber,
  setBankName,
  setAccountName,
  setAccountNumber,
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
          Nom du compte
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
      
      <div>
        <Label htmlFor="accountNumber" className="block text-sm font-medium mb-1">
          Numéro de compte (optionnel)
        </Label>
        <Input
          id="accountNumber"
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: xxxx xxxx xxxx xxxx"
        />
      </div>
    </>
  );
};

export default BankAccountFormFields;
