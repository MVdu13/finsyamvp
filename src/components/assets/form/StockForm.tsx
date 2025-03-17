
import React, { useState, useEffect } from 'react';
import { Asset, InvestmentAccountType } from '@/types/assets';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StockFormProps {
  onSubmit: (asset: Omit<Asset, 'id'>) => void;
  onCancel: () => void;
  initialValues?: Asset;
  isEditing?: boolean;
  accounts: Asset[];
  onCreateNewAccount: () => void;
  selectedAccountId?: string;
}

const StockForm: React.FC<StockFormProps> = ({
  onSubmit,
  onCancel,
  initialValues,
  isEditing = false,
  accounts,
  onCreateNewAccount,
  selectedAccountId,
}) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [ticker, setTicker] = useState(initialValues?.symbol || '');
  const [quantity, setQuantity] = useState(initialValues?.quantity ? initialValues.quantity.toString() : '');
  const [purchasePrice, setPurchasePrice] = useState(initialValues?.purchasePrice ? initialValues.purchasePrice.toString() : '');
  const [performance, setPerformance] = useState(initialValues?.performance ? initialValues.performance.toString() : '0');
  const [value, setValue] = useState(initialValues?.value ? initialValues.value.toString() : '0');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [accountId, setAccountId] = useState(initialValues?.parentAccountId || selectedAccountId || '');

  // Update value when quantity or purchase price changes
  useEffect(() => {
    if (quantity && purchasePrice) {
      const calculatedValue = parseFloat(quantity) * parseFloat(purchasePrice);
      setValue(calculatedValue.toString());
    }
  }, [quantity, purchasePrice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const stockDescription = description || `${quantity} actions à ${purchasePrice}€`;
    
    const asset = {
      name: name || ticker,
      description: stockDescription,
      type: 'stock' as const,
      value: parseFloat(value) || 0,
      performance: parseFloat(performance) || 0,
      quantity: parseFloat(quantity) || 0,
      purchasePrice: parseFloat(purchasePrice) || 0,
      symbol: ticker,
      parentAccountId: accountId,
      updatedAt: new Date().toISOString(),
      ...(initialValues?.createdAt && { createdAt: initialValues.createdAt }),
    };
    
    onSubmit(asset);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="account" className="block text-sm font-medium mb-1">
          Compte d'investissement
        </Label>
        <div className="flex gap-2">
          <Select 
            value={accountId} 
            onValueChange={setAccountId}
          >
            <SelectTrigger className="wealth-input flex-1">
              <SelectValue placeholder="Sélectionner un compte" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map(account => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} ({account.accountType})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={onCreateNewAccount}
            className="wealth-btn"
          >
            Nouveau
          </button>
        </div>
        {accounts.length === 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Aucun compte disponible. Veuillez en créer un nouveau.
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="ticker" className="block text-sm font-medium mb-1">
          Ticker/Symbole
        </Label>
        <Input
          id="ticker"
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: AAPL"
          required
        />
      </div>

      <div>
        <Label htmlFor="name" className="block text-sm font-medium mb-1">
          Nom de l'action (optionnel)
        </Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: Apple Inc."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity" className="block text-sm font-medium mb-1">
            Quantité
          </Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="wealth-input w-full"
            placeholder="Ex: 10"
            min="0"
            step="0.001"
            required
          />
        </div>
        <div>
          <Label htmlFor="purchasePrice" className="block text-sm font-medium mb-1">
            Prix d'achat (€)
          </Label>
          <Input
            id="purchasePrice"
            type="number"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            className="wealth-input w-full"
            placeholder="Ex: 150"
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
            placeholder="Calculé automatiquement"
            min="0"
            step="0.01"
            required
            readOnly
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
          disabled={!accountId}
        >
          {isEditing ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
};

export default StockForm;
