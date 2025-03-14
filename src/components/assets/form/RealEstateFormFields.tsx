
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface RealEstateFormFieldsProps {
  address: string;
  surface: string;
  setAddress: (value: string) => void;
  setSurface: (value: string) => void;
}

const RealEstateFormFields: React.FC<RealEstateFormFieldsProps> = ({
  address,
  surface,
  setAddress,
  setSurface
}) => {
  return (
    <>
      <div>
        <Label htmlFor="address" className="block text-sm font-medium mb-1">
          Adresse
        </Label>
        <Input
          id="address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: 1 rue de la Paix, 75001 Paris"
        />
      </div>
      <div>
        <Label htmlFor="surface" className="block text-sm font-medium mb-1">
          Surface (m²)
        </Label>
        <Input
          id="surface"
          type="number"
          value={surface}
          onChange={(e) => setSurface(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: 80"
          min="0"
          step="0.01"
        />
      </div>
    </>
  );
};

export default RealEstateFormFields;
