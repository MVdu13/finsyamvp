
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CryptoAccountFormFieldsProps {
  accountName: string;
  accountType: 'Binance' | 'BitGet' | 'KuCoin' | 'MetaMask' | 'Phantom' | 'Autre';
  setAccountName: (value: string) => void;
  setAccountType: (value: 'Binance' | 'BitGet' | 'KuCoin' | 'MetaMask' | 'Phantom' | 'Autre') => void;
}

const CryptoAccountFormFields: React.FC<CryptoAccountFormFieldsProps> = ({
  accountName,
  accountType,
  setAccountName,
  setAccountType
}) => {
  return (
    <>
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
        />
      </div>
      <div>
        <Label htmlFor="accountType" className="block text-sm font-medium mb-1">
          Type de compte
        </Label>
        <Select
          value={accountType}
          onValueChange={(value) => setAccountType(value as 'Binance' | 'BitGet' | 'KuCoin' | 'MetaMask' | 'Phantom' | 'Autre')}
        >
          <SelectTrigger 
            id="accountType" 
            className="wealth-input w-full border border-input bg-background"
          >
            <SelectValue placeholder="Sélectionner un type de compte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Binance">Binance</SelectItem>
            <SelectItem value="BitGet">BitGet</SelectItem>
            <SelectItem value="KuCoin">KuCoin</SelectItem>
            <SelectItem value="MetaMask">MetaMask</SelectItem>
            <SelectItem value="Phantom">Phantom</SelectItem>
            <SelectItem value="Autre">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default CryptoAccountFormFields;
