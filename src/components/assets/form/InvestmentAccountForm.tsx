
import React, { useState } from 'react';
import { Asset, InvestmentAccountType } from '@/types/assets';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InvestmentAccountFormProps {
  onSubmit: (asset: Omit<Asset, 'id'>) => void;
  onCancel: () => void;
  initialValues?: Asset;
  isEditing?: boolean;
}

const InvestmentAccountForm: React.FC<InvestmentAccountFormProps> = ({
  onSubmit,
  onCancel,
  initialValues,
  isEditing = false,
}) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [value, setValue] = useState(initialValues?.value ? initialValues.value.toString() : '0');
  const [performance, setPerformance] = useState(initialValues?.performance ? initialValues.performance.toString() : '0');
  const [accountType, setAccountType] = useState<InvestmentAccountType>(initialValues?.accountType || 'PEA');
  const [description, setDescription] = useState(initialValues?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const asset = {
      name,
      description: description || `Compte ${accountType}`,
      type: 'investment-account' as const,
      accountType,
      value: parseFloat(value) || 0,
      performance: parseFloat(performance) || 0,
      updatedAt: new Date().toISOString(),
      ...(initialValues?.createdAt && { createdAt: initialValues.createdAt }),
    };
    
    onSubmit(asset);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="accountType" className="block text-sm font-medium mb-1">
          Type de compte
        </Label>
        <Select value={accountType} onValueChange={(value) => setAccountType(value as InvestmentAccountType)}>
          <SelectTrigger className="wealth-input w-full">
            <SelectValue placeholder="Sélectionner un type de compte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PEA">PEA</SelectItem>
            <SelectItem value="PER">PER</SelectItem>
            <SelectItem value="CTO">CTO</SelectItem>
            <SelectItem value="Assurance-vie">Assurance-vie</SelectItem>
            <SelectItem value="Autre">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="name" className="block text-sm font-medium mb-1">
          Nom du compte
        </Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="wealth-input w-full"
          placeholder={`${accountType} principal`}
          required
        />
      </div>

      <div>
        <Label htmlFor="description" className="block text-sm font-medium mb-1">
          Description (optionnel)
        </Label>
        <Input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="wealth-input w-full"
          placeholder="Entrez une description"
        />
      </div>

      <div>
        <Label htmlFor="value" className="block text-sm font-medium mb-1">
          Valeur totale (€)
        </Label>
        <Input
          id="value"
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: 10000"
          min="0"
          step="0.01"
        />
      </div>

      <div>
        <Label htmlFor="performance" className="block text-sm font-medium mb-1">
          Performance (%)
        </Label>
        <Input
          id="performance"
          type="number"
          value={performance}
          onChange={(e) => setPerformance(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: 5.2"
          step="0.1"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="wealth-btn wealth-btn-secondary flex-1"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="wealth-btn wealth-btn-primary flex-1"
        >
          {isEditing ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
};

export default InvestmentAccountForm;
