
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface BankAccountValueFieldProps {
  value: string;
  setValue: (value: string) => void;
}

const BankAccountValueField: React.FC<BankAccountValueFieldProps> = ({ value, setValue }) => {
  return (
    <div>
      <Label htmlFor="value" className="block text-sm font-medium mb-1">
        Solde (€)
      </Label>
      <Input
        id="value"
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="wealth-input w-full"
        placeholder="Ex: 1500"
        min="0"
        step="0.01"
        required
      />
    </div>
  );
};

export default BankAccountValueField;
