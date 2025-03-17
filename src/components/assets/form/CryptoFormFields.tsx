
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Asset } from '@/types/assets';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CryptoAccountFormFields from './CryptoAccountFormFields';
import { CryptoInfo } from '@/services/cryptoService';
import CryptoSearch from '@/components/assets/CryptoSearch';

interface CryptoFormFieldsProps {
  cryptoQty: string;
  cryptoPrice: string;
  purchasePrice: string;
  cryptoAccountId: string;
  setCryptoQty: (value: string) => void;
  setCryptoPrice: (value: string) => void;
  setPurchasePrice: (value: string) => void;
  setCryptoAccountId: (value: string) => void;
  cryptoAccounts: Asset[];
  onCryptoSelect?: (crypto: CryptoInfo) => void;
  onAddAccount?: (account: Omit<Asset, 'id'>) => Asset | null | undefined;
}

const CryptoFormFields: React.FC<CryptoFormFieldsProps> = ({
  cryptoQty,
  cryptoPrice,
  purchasePrice,
  cryptoAccountId,
  setCryptoQty,
  setCryptoPrice,
  setPurchasePrice,
  setCryptoAccountId,
  cryptoAccounts,
  onCryptoSelect,
  onAddAccount
}) => {
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState<'Binance' | 'BitGet' | 'KuCoin' | 'MetaMask' | 'Phantom' | 'Autre'>('Binance');
  const [lastAddedAccountId, setLastAddedAccountId] = useState<string | null>(null);

  const handleAddAccount = () => {
    if (onAddAccount && newAccountName.trim()) {
      const newAccount = {
        name: newAccountName.trim(),
        type: 'crypto-account' as const,
        cryptoAccountType: newAccountType,
        value: 0,
        performance: 0,
      };
      
      // Ajouter le compte
      const addedAccount = onAddAccount(newAccount);
      
      // On réinitialise le formulaire mais on ne ferme PAS la dialog
      setNewAccountName('');
      
      // Si l'ID est disponible immédiatement (si onAddAccount retourne le compte créé)
      if (addedAccount && addedAccount.id) {
        setCryptoAccountId(addedAccount.id);
        setAccountDialogOpen(false); // Fermer seulement si on a l'ID
      } else {
        // Sinon, on utilisera l'effet pour sélectionner le compte quand il sera disponible
        setLastAddedAccountId('pending');
      }
    }
  };

  // Effet pour sélectionner automatiquement le compte nouvellement ajouté
  React.useEffect(() => {
    if (lastAddedAccountId === 'pending' && cryptoAccounts.length > 0) {
      // On cherche le compte le plus récemment ajouté (qui aura l'ID le plus récent)
      const mostRecentAccount = cryptoAccounts[cryptoAccounts.length - 1];
      if (mostRecentAccount) {
        setCryptoAccountId(mostRecentAccount.id);
        setLastAddedAccountId(null); // On réinitialise pour ne pas refaire la sélection
        setAccountDialogOpen(false); // Fermer la dialog après avoir sélectionné le compte
      }
    }
  }, [cryptoAccounts, lastAddedAccountId, setCryptoAccountId]);

  return (
    <>
      <div className="mb-4">
        <Label htmlFor="cryptoAccount" className="block text-sm font-medium mb-1">
          Compte crypto <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-2">
          <select
            id="cryptoAccount"
            value={cryptoAccountId}
            onChange={(e) => setCryptoAccountId(e.target.value)}
            className={`wealth-input flex-grow ${!cryptoAccountId ? 'border-red-300 focus:border-red-500' : ''}`}
            required
          >
            <option value="">-- Sélectionner un compte --</option>
            {cryptoAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.cryptoAccountType})
              </option>
            ))}
          </select>
          <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
            <DialogTrigger asChild>
              <button 
                type="button"
                className="wealth-btn flex items-center gap-1 px-3"
              >
                <Plus size={16} />
                <span>Nouveau</span>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un compte crypto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <CryptoAccountFormFields
                  accountName={newAccountName}
                  accountType={newAccountType}
                  setAccountName={setNewAccountName}
                  setAccountType={setNewAccountType}
                />
                <div className="flex justify-end gap-3 mt-4">
                  <button 
                    type="button" 
                    className="wealth-btn"
                    onClick={() => setAccountDialogOpen(false)}
                  >
                    Annuler
                  </button>
                  <button 
                    type="button" 
                    className="wealth-btn wealth-btn-primary"
                    onClick={handleAddAccount}
                  >
                    Ajouter le compte
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {!cryptoAccountId && (
          <p className="text-red-500 text-xs mt-1">Un compte crypto est requis</p>
        )}
      </div>

      <div className="mb-4">
        <Label htmlFor="cryptoSearch" className="block text-sm font-medium mb-1">
          Rechercher une crypto
        </Label>
        <CryptoSearch onSelect={onCryptoSelect} />
      </div>

      <div>
        <Label htmlFor="cryptoQty" className="block text-sm font-medium mb-1">
          Quantité <span className="text-red-500">*</span>
        </Label>
        <Input
          id="cryptoQty"
          type="number"
          value={cryptoQty}
          onChange={(e) => setCryptoQty(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: 0.5"
          min="0"
          step="0.000001"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="cryptoPrice" className="block text-sm font-medium mb-1">
          Prix actuel par unité (€) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="cryptoPrice"
          type="number"
          value={cryptoPrice}
          onChange={(e) => setCryptoPrice(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: 30000"
          min="0"
          step="0.01"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="purchasePrice" className="block text-sm font-medium mb-1">
          Prix d'achat par unité (€) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="purchasePrice"
          type="number"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: 28000"
          min="0"
          step="0.01"
          required
        />
      </div>
    </>
  );
};

export default CryptoFormFields;
