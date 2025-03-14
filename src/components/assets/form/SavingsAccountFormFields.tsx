
import React from 'react';

interface SavingsAccountFormFieldsProps {
  interestRate: string;
  maturityDate: string;
  setInterestRate: (value: string) => void;
  setMaturityDate: (value: string) => void;
}

const SavingsAccountFormFields: React.FC<SavingsAccountFormFieldsProps> = ({
  interestRate,
  maturityDate,
  setInterestRate,
  setMaturityDate,
}) => {
  return (
    <>
      <div>
        <label htmlFor="interestRate" className="block text-sm font-medium mb-1">
          Taux d'intérêt (%)
        </label>
        <input
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
        <label htmlFor="maturityDate" className="block text-sm font-medium mb-1">
          Date d'échéance (optionnel)
        </label>
        <input
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
