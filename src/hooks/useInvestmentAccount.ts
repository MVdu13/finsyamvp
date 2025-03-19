
import { useState, useEffect } from 'react';
import { Asset } from '@/types/assets';
import { useToast } from '@/hooks/use-toast';

interface UseInvestmentAccountProps {
  accountId: string;
  setAccountId: (id: string) => void;
  accounts: Asset[];
  onAddAccount?: (account: Omit<Asset, 'id'>) => Asset | null | undefined;
}

export const useInvestmentAccount = ({
  accountId,
  setAccountId,
  accounts,
  onAddAccount
}: UseInvestmentAccountProps) => {
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [lastAddedAccountId, setLastAddedAccountId] = useState<string | null>(null);
  const { toast } = useToast();

  // Effet pour sélectionner automatiquement le compte nouvellement ajouté
  useEffect(() => {
    if (lastAddedAccountId === 'pending' && accounts.length > 0) {
      // On cherche le compte le plus récemment ajouté (qui aura l'ID le plus récent)
      const mostRecentAccount = accounts[accounts.length - 1];
      if (mostRecentAccount) {
        setAccountId(mostRecentAccount.id);
        setLastAddedAccountId(null); // On réinitialise pour ne pas refaire la sélection
        setAccountDialogOpen(false); // Fermer la dialog après avoir sélectionné le compte
      }
    }
  }, [accounts, lastAddedAccountId, setAccountId]);

  const handleAddAccount = (accountData: Omit<Asset, 'id'>) => {
    if (onAddAccount) {
      // Ajouter le compte
      const addedAccount = onAddAccount(accountData);
      
      // Si l'ID est disponible immédiatement (si onAddAccount retourne le compte créé)
      if (addedAccount && addedAccount.id) {
        setAccountId(addedAccount.id);
        setAccountDialogOpen(false); // Fermer seulement si on a l'ID
        
        toast({
          title: "Compte ajouté",
          description: `Le compte ${accountData.name} a été créé et sélectionné.`,
        });
      } else {
        // Sinon, on utilisera l'effet pour sélectionner le compte quand il sera disponible
        setLastAddedAccountId('pending');
      }
      
      return addedAccount;
    }
    return null;
  };

  return {
    accountDialogOpen,
    setAccountDialogOpen,
    handleAddAccount
  };
};
