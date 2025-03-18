
import React from 'react';
import { Asset } from '@/types/assets';
import { formatCurrency } from '@/lib/formatters';
import { Home, MapPin, Building, ArrowDownCircle, ArrowUpCircle, CalendarRange, Calculator } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface RealEstateDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  property: Asset | null;
}

const RealEstateDetailsDialog: React.FC<RealEstateDetailsDialogProps> = ({
  isOpen,
  onClose,
  property
}) => {
  if (!property) return null;

  const propertyType = property.metadata?.propertyType || 'Appartement';
  const usageType = property.metadata?.usageType || 'primary';
  const address = property.metadata?.address || 'Non spécifié';
  const yearBuilt = property.metadata?.yearBuilt || 'Non spécifié';
  const area = property.metadata?.area || 0;
  const monthlyRent = property.metadata?.monthlyRent || 0;
  const yearlyTaxes = property.metadata?.yearlyTaxes || 0;
  const yearlyFees = property.metadata?.yearlyFees || 0;
  const purchaseYear = property.metadata?.purchaseYear || new Date().getFullYear();
  const purchasePrice = property.metadata?.purchasePrice || 0;
  
  // Calculate metrics
  const yearlyRent = monthlyRent * 12;
  const grossYield = property.value > 0 ? (yearlyRent / property.value) * 100 : 0;
  const yearlyExpenses = yearlyTaxes + yearlyFees;
  const netRent = yearlyRent - yearlyExpenses;
  const netYield = property.value > 0 ? (netRent / property.value) * 100 : 0;
  const pricePerSqm = area > 0 ? property.value / area : 0;
  const appreciation = purchasePrice > 0 
    ? ((property.value - purchasePrice) / purchasePrice) * 100
    : 0;
  const appreciationPerYear = purchaseYear < new Date().getFullYear()
    ? appreciation / (new Date().getFullYear() - purchaseYear)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{property.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Basic information */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-10 h-10 rounded-md flex items-center justify-center",
                  "bg-green-100"
                )}>
                  {propertyType === 'Maison' ? (
                    <Home className="text-green-600" />
                  ) : (
                    <Building className="text-green-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium">{propertyType}</h4>
                  <p className="text-sm text-muted-foreground">
                    {usageType === 'primary' ? 'Résidence principale' : 
                     usageType === 'secondary' ? 'Résidence secondaire' : 
                     'Bien locatif'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(property.value)}</p>
                {pricePerSqm > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(pricePerSqm)}/m²
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin size={16} />
              <span>{address}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="text-sm">
                <p className="text-muted-foreground">Superficie</p>
                <p className="font-medium">{area} m²</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Année de construction</p>
                <p className="font-medium">{yearBuilt}</p>
              </div>
            </div>
          </div>
          
          {/* Financial details */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-lg mb-3">Détails financiers</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-md">
                <div className="flex items-center gap-2">
                  <CalendarRange size={18} className="text-wealth-primary" />
                  <span className="text-sm">Achat</span>
                </div>
                <p className="font-medium mt-1">{formatCurrency(purchasePrice)}</p>
                <p className="text-xs text-muted-foreground">en {purchaseYear}</p>
              </div>
              
              <div className="p-3 bg-muted/30 rounded-md">
                <div className="flex items-center gap-2">
                  <Calculator size={18} className="text-wealth-primary" />
                  <span className="text-sm">Valorisation</span>
                </div>
                <p className={cn(
                  "font-medium mt-1 flex items-center gap-1",
                  appreciation >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {appreciation >= 0 ? (
                    <ArrowUpCircle size={14} />
                  ) : (
                    <ArrowDownCircle size={14} />
                  )}
                  {appreciation.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {appreciationPerYear.toFixed(1)}% par an
                </p>
              </div>
            </div>

            {usageType === 'rental' && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Loyer mensuel</p>
                    <p className="font-medium">{formatCurrency(monthlyRent)}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Loyer annuel</p>
                    <p className="font-medium">{formatCurrency(yearlyRent)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Taxe foncière</p>
                    <p className="font-medium">{formatCurrency(yearlyTaxes)}/an</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Charges annuelles</p>
                    <p className="font-medium">{formatCurrency(yearlyFees)}/an</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <h5 className="font-medium mb-2">Rendement</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-sm">
                      <p className="text-muted-foreground">Rendement brut</p>
                      <p className="font-medium">{grossYield.toFixed(2)}%</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Rendement net</p>
                      <p className="font-medium">{netYield.toFixed(2)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RealEstateDetailsDialog;
