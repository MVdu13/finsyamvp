
import React, { useState } from 'react';
import { Asset } from '@/types/assets';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import FormHeader from './FormHeader';
import FormActions from './FormActions';

interface CryptoAccountFormProps {
  onSubmit: (asset: Omit<Asset, 'id'>) => void;
  onCancel: () => void;
  initialValues?: Asset;
  isEditing?: boolean;
}

const CryptoAccountForm: React.FC<CryptoAccountFormProps> = ({
  onSubmit,
  onCancel,
  initialValues,
  isEditing = false
}) => {
  const [accountName, setAccountName] = useState(initialValues?.name || '');
  const [cryptoPlatform, setCryptoPlatform] = useState<'Binance' | 'Bitget' | 'Kucoin' | 'Coinbase' | 'Metamask' | 'Phantom' | 'Ledger' | 'Autre'>(
    (initialValues?.cryptoPlatform as any) || 'Autre'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const accountData: Omit<Asset, 'id'> = {
      name: accountName,
      type: 'crypto-account',
      value: initialValues?.value || 0,
      cryptoPlatform
    };
    
    onSubmit(accountData);
  };

  return (
    <div>
      <FormHeader 
        title={isEditing ? "Modifier le compte crypto" : "Ajouter un compte crypto"} 
        type="crypto-account"
        emoji="₿"
      />
      
      <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="Ex: Mon wallet Binance"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="cryptoPlatform" className="block text-sm font-medium mb-1">
            Plateforme
          </Label>
          <Select
            value={cryptoPlatform}
            onValueChange={(value) => setCryptoPlatform(value as any)}
          >
            <SelectTrigger 
              id="cryptoPlatform" 
              className="wealth-input w-full border border-input bg-background"
            >
              <SelectValue placeholder="Sélectionner une plateforme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Binance">Binance</SelectItem>
              <SelectItem value="Bitget">Bitget</SelectItem>
              <SelectItem value="Kucoin">Kucoin</SelectItem>
              <SelectItem value="Coinbase">Coinbase</SelectItem>
              <SelectItem value="Metamask">Metamask</SelectItem>
              <SelectItem value="Phantom">Phantom</SelectItem>
              <SelectItem value="Ledger">Ledger</SelectItem>
              <SelectItem value="Autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <FormActions onCancel={onCancel} isEditing={isEditing} />
      </form>
    </div>
  );
};

export default CryptoAccountForm;
