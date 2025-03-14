
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
          placeholder="Ex: BNP Paribas, Société Générale..."
          required
        />
      </div>
      
      <div>
        <label htmlFor="accountNumber" className="block text-sm font-medium mb-1">
          Numéro de compte (IBAN)
        </label>
        <input
          id="accountNumber"
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: FR76 XXXX XXXX XXXX XXXX XXXX XXX"
        />
      </div>
    </>
  );
};

export default BankAccountFormFields;
