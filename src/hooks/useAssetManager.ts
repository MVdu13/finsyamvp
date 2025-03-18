
import { useState, useEffect } from 'react';
import { Asset, Transaction } from '@/types/assets';
import { useToast } from '@/hooks/use-toast';
import { mockAssets } from '@/lib/mockData';

export const useAssetManager = () => {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedAssets = localStorage.getItem('financial-assets');
    if (storedAssets) {
      setAssets(JSON.parse(storedAssets));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('financial-assets', JSON.stringify(assets));
    window.dispatchEvent(new Event('storage'));
  }, [assets]);

  const totalWealth = assets.reduce((sum, asset) => sum + asset.value, 0);

  const addAsset = (newAsset: Omit<Asset, 'id'>) => {
    if (newAsset.type === 'stock' && newAsset.name && newAsset.investmentAccountId) {
      const existingStock = assets.find(asset => 
        asset.type === 'stock' && 
        asset.name.toLowerCase() === newAsset.name.toLowerCase() && 
        asset.investmentAccountId === newAsset.investmentAccountId
      );

      if (existingStock) {
        const transaction: Transaction = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          quantity: newAsset.quantity || 0,
          price: newAsset.purchasePrice || 0,
          total: (newAsset.quantity || 0) * (newAsset.purchasePrice || 0),
          type: 'buy'
        };

        const newQuantity = (existingStock.quantity || 0) + (newAsset.quantity || 0);
        const newValue = (existingStock.value || 0) + transaction.total;
        
        const newWeightedPrice = newValue / newQuantity;
        
        const updatedAsset: Asset = {
          ...existingStock,
          quantity: newQuantity,
          value: newValue,
          purchasePrice: newWeightedPrice,
          transactions: [...(existingStock.transactions || []), transaction],
          updatedAt: new Date().toISOString()
        };
        
        setAssets(prevAssets => 
          prevAssets.map(asset => 
            asset.id === existingStock.id ? updatedAsset : asset
          )
        );
        
        toast({
          title: "Action mise à jour",
          description: `${newAsset.quantity} ${newAsset.name} ont été ajoutées à votre portefeuille.`
        });
        
        return updatedAsset;
      }
    }
    
    if (newAsset.type === 'crypto' && newAsset.name && newAsset.cryptoAccountId) {
      const existingCrypto = assets.find(asset => 
        asset.type === 'crypto' && 
        asset.name.toLowerCase() === newAsset.name.toLowerCase() && 
        asset.cryptoAccountId === newAsset.cryptoAccountId
      );

      if (existingCrypto) {
        const transaction: Transaction = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          quantity: newAsset.quantity || 0,
          price: newAsset.purchasePrice || 0,
          total: (newAsset.quantity || 0) * (newAsset.purchasePrice || 0),
          type: 'buy'
        };

        const newQuantity = (existingCrypto.quantity || 0) + (newAsset.quantity || 0);
        const newValue = (existingCrypto.value || 0) + ((newAsset.quantity || 0) * (newAsset.purchasePrice || 0));
        
        const newWeightedPrice = newValue / newQuantity;
        
        const updatedAsset: Asset = {
          ...existingCrypto,
          quantity: newQuantity,
          value: newValue,
          purchasePrice: newWeightedPrice,
          transactions: [...(existingCrypto.transactions || []), transaction],
          updatedAt: new Date().toISOString()
        };
        
        setAssets(prevAssets => 
          prevAssets.map(asset => 
            asset.id === existingCrypto.id ? updatedAsset : asset
          )
        );
        
        toast({
          title: "Crypto mise à jour",
          description: `${newAsset.quantity} ${newAsset.name} ont été ajoutées à votre portefeuille.`
        });
        
        return updatedAsset;
      }
    }
    
    const asset = {
      ...newAsset,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    if (asset.type === 'stock' && asset.quantity && asset.purchasePrice) {
      const transaction: Transaction = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        quantity: asset.quantity,
        price: asset.purchasePrice,
        total: asset.quantity * asset.purchasePrice,
        type: 'buy'
      };
      
      asset.transactions = [transaction];
    }
    
    if (asset.type === 'crypto' && asset.quantity && asset.purchasePrice) {
      const transaction: Transaction = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        quantity: asset.quantity,
        price: asset.purchasePrice,
        total: asset.quantity * asset.purchasePrice,
        type: 'buy'
      };
      
      asset.transactions = [transaction];
    }
    
    setAssets(prevAssets => [...prevAssets, asset as Asset]);
    
    toast({
      title: "Actif ajouté",
      description: `${newAsset.name} a été ajouté avec succès.`
    });
    
    return asset as Asset;
  };
  
  const updateAsset = (idOrAsset: string | Asset, maybeAsset?: Partial<Asset>) => {
    if (typeof idOrAsset === 'string' && maybeAsset) {
      setAssets(prevAssets => 
        prevAssets.map(asset => 
          asset.id === idOrAsset ? { ...asset, ...maybeAsset } : asset
        )
      );
      
      toast({
        title: "Actif mis à jour",
        description: `L'actif a été mis à jour avec succès.`
      });
    } 
    else if (typeof idOrAsset === 'object' && 'id' in idOrAsset) {
      const updatedAsset = idOrAsset;
      setAssets(prevAssets => 
        prevAssets.map(asset => 
          asset.id === updatedAsset.id ? updatedAsset : asset
        )
      );
      
      toast({
        title: "Actif mis à jour",
        description: `${updatedAsset.name} a été mis à jour avec succès.`
      });
    }
  };
  
  const deleteAsset = (assetId: string) => {
    setAssets(prevAssets => prevAssets.filter(asset => asset.id !== assetId));
    
    toast({
      title: "Actif supprimé",
      description: "L'actif a été supprimé avec succès."
    });
  };

  return {
    assets,
    editingAsset,
    setEditingAsset,
    totalWealth,
    addAsset,
    updateAsset,
    deleteAsset
  };
};
