
import React from 'react';

interface BankAccountFormFieldsProps {
  bankName: string;
  accountNumber: string;
  setBankName: (value: string) => void;
  setAccountNumber: (value: string) => void;
}

const BankAccountFormFields: React.FC<BankAccountFormFieldsProps> = ({
  bankName,
  accountNumber,
  setBankName,
  setAccountNumber,
}) => {
  return (
    <>
      <div>
        <label htmlFor="bankName" className="block text-sm font-medium mb-1">
          Nom de la banque
        </label>
        <input
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
        <label htmlFor="accountNumber" className="block text-sm font-medium mb-1">
          Numéro de compte (optionnel)
        </label>
        <input
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
