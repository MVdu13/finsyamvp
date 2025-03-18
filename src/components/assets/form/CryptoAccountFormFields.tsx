
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CryptoAccountFormFieldsProps {
  accountName: string;
  cryptoPlatform: 'Binance' | 'Bitget' | 'Kucoin' | 'Coinbase' | 'Metamask' | 'Phantom' | 'Ledger' | 'Autre';
  setAccountName: (value: string) => void;
  setCryptoPlatform: (value: 'Binance' | 'Bitget' | 'Kucoin' | 'Coinbase' | 'Metamask' | 'Phantom' | 'Ledger' | 'Autre') => void;
}

const CryptoAccountFormFields: React.FC<CryptoAccountFormFieldsProps> = ({
  accountName,
  cryptoPlatform,
  setAccountName,
  setCryptoPlatform
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
          placeholder="Ex: Mon compte Binance"
        />
      </div>
      <div>
        <Label htmlFor="cryptoPlatform" className="block text-sm font-medium mb-1">
          Plateforme
        </Label>
        <Select
          value={cryptoPlatform}
          onValueChange={(value) => setCryptoPlatform(value as 'Binance' | 'Bitget' | 'Kucoin' | 'Coinbase' | 'Metamask' | 'Phantom' | 'Ledger' | 'Autre')}
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
    </>
  );
};

export default CryptoAccountFormFields;
