
import React from 'react';
import { Asset } from '@/types/assets';
import InvestmentFieldsBase from './InvestmentFieldsBase';
import CryptoAccountFormFields from './CryptoAccountFormFields';

interface CryptoFormFieldsProps {
  cryptoName: string;
  cryptoQty: string;
  purchasePrice: string;
  cryptoAccountId: string;
  setCryptoName: (value: string) => void;
  setCryptoQty: (value: string) => void;
  setPurchasePrice: (value: string) => void;
  setCryptoAccountId: (value: string) => void;
  cryptoAccounts: Asset[];
  onAddAccount?: (account: Omit<Asset, 'id'>) => Asset | null | undefined;
  existingCryptos?: Asset[];
}

const CryptoFormFields: React.FC<CryptoFormFieldsProps> = ({
  cryptoName,
  cryptoQty,
  purchasePrice,
  cryptoAccountId,
  setCryptoName,
  setCryptoQty,
  setPurchasePrice,
  setCryptoAccountId,
  cryptoAccounts,
  onAddAccount,
  existingCryptos = []
}) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-lg font-medium">Ajouter une cryptomonnaie</h2>
      </div>
      <InvestmentFieldsBase
        assetName={cryptoName}
        assetQty={cryptoQty}
        purchasePrice={purchasePrice}
        accountId={cryptoAccountId}
        setAssetName={setCryptoName}
        setAssetQty={setCryptoQty}
        setPurchasePrice={setPurchasePrice}
        setAccountId={setCryptoAccountId}
        accounts={cryptoAccounts}
        onAddAccount={onAddAccount}
        existingAssets={existingCryptos}
        accountLabel="Compte crypto"
        accountSelectPlaceholder="-- Sélectionner un compte --"
        assetNameLabel="Nom de la cryptomonnaie"
        assetNamePlaceholder="Ex: Bitcoin"
        qtyLabel="Quantité"
        qtyPlaceholder="Ex: 0.5"
        qtyStep="0.000001"
        priceLabel="Prix d'achat unitaire (€)"
        pricePlaceholder="Ex: 25000"
        dialogTitle="Ajouter un compte crypto"
        accountTypeKey="crypto-account"
        renderAccountFormFields={({ accountName, setAccountName, otherProps, setOtherProps }) => (
          <CryptoAccountFormFields
            accountName={accountName}
            cryptoPlatform={otherProps.cryptoPlatform || 'Binance'}
            setAccountName={setAccountName}
            setCryptoPlatform={(value) => setOtherProps({ ...otherProps, cryptoPlatform: value })}
          />
        )}
        existingAssetsMessageFn={(matchingAssets) => 
          `Vous possédez déjà ${matchingAssets.reduce((sum, crypto) => sum + (crypto.quantity || 0), 0)} ${cryptoName}`
        }
      />
    </div>
  );
};

export default CryptoFormFields;
