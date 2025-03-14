
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormItem } from "@/components/ui/form";

interface SavingsAccountFormFieldsProps {
  bankName: string;
  accountName: string;
  interestRate: string;
  maturityDate: string;
  setBankName: (value: string) => void;
  setAccountName: (value: string) => void;
  setInterestRate: (value: string) => void;
  setMaturityDate: (value: string) => void;
}

const SavingsAccountFormFields: React.FC<SavingsAccountFormFieldsProps> = ({
  bankName,
  accountName,
  interestRate,
  maturityDate,
  setBankName,
  setAccountName,
  setInterestRate,
  setMaturityDate,
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
          Nom du livret
        </Label>
        <Input
          id="accountName"
          type="text"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: Livret A, LEP, LDDS..."
          required
        />
      </div>
      
      <div>
        <Label htmlFor="interestRate" className="block text-sm font-medium mb-1">
          Taux d'intérêt (%)
        </Label>
        <Input
          id="interestRate"
          type="number"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: 2.0"
          step="0.01"
          min="0"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="maturityDate" className="block text-sm font-medium mb-1">
          Date d'échéance (optionnel)
        </Label>
        <Input
          id="maturityDate"
          type="date"
          value={maturityDate}
          onChange={(e) => setMaturityDate(e.target.value)}
          className="wealth-input w-full"
        />
      </div>
    </>
  );
};

export default SavingsAccountFormFields;
