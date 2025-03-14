
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from "@/components/ui/switch";

interface RealEstateFormFieldsProps {
  address: string;
  surface: string;
  propertyType: string;
  usageType: string;
  currentValue: string;
  propertyTax: string;
  housingTax: string;
  annualRent: string;
  annualFees: string;
  annualCharges: string;
  setAddress: (value: string) => void;
  setSurface: (value: string) => void;
  setPropertyType: (value: string) => void;
  setUsageType: (value: string) => void;
  setCurrentValue: (value: string) => void;
  setPropertyTax: (value: string) => void;
  setHousingTax: (value: string) => void;
  setAnnualRent: (value: string) => void;
  setAnnualFees: (value: string) => void;
  setAnnualCharges: (value: string) => void;
}

const RealEstateFormFields: React.FC<RealEstateFormFieldsProps> = ({
  address,
  surface,
  propertyType,
  usageType,
  currentValue,
  propertyTax,
  housingTax,
  annualRent,
  annualFees,
  annualCharges,
  setAddress,
  setSurface,
  setPropertyType,
  setUsageType,
  setCurrentValue,
  setPropertyTax,
  setHousingTax,
  setAnnualRent,
  setAnnualFees,
  setAnnualCharges
}) => {
  const isRental = usageType === 'rental';
  const isMainOrSecondary = usageType === 'main' || usageType === 'secondary';

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address" className="block text-sm font-medium mb-1">
          Nom *
        </Label>
        <Input
          id="address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: Appartement Paris 11ème"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="propertyType" className="block text-sm font-medium mb-1">
          Type *
        </Label>
        <Select 
          value={propertyType} 
          onValueChange={setPropertyType}
        >
          <SelectTrigger id="propertyType" className="wealth-input w-full">
            <SelectValue placeholder="Sélectionner un type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apartment">Appartement</SelectItem>
            <SelectItem value="house">Maison</SelectItem>
            <SelectItem value="building">Immeuble</SelectItem>
            <SelectItem value="commercial">Local commercial</SelectItem>
            <SelectItem value="land">Terrain</SelectItem>
            <SelectItem value="other">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="surface" className="block text-sm font-medium mb-1">
          Surface (m²)
        </Label>
        <Input
          id="surface"
          type="number"
          value={surface}
          onChange={(e) => setSurface(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: 80"
          min="0"
          step="0.01"
        />
      </div>
      
      <div>
        <Label htmlFor="usageType" className="block text-sm font-medium mb-1">
          Usage *
        </Label>
        <Select 
          value={usageType} 
          onValueChange={setUsageType}
        >
          <SelectTrigger id="usageType" className="wealth-input w-full">
            <SelectValue placeholder="Sélectionner un usage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="main">Résidence principale</SelectItem>
            <SelectItem value="secondary">Résidence secondaire</SelectItem>
            <SelectItem value="rental">Locatif</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="currentValue" className="block text-sm font-medium mb-1">
          Valeur actuelle (€) *
        </Label>
        <Input
          id="currentValue"
          type="number"
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: 300000"
          min="0"
          step="0.01"
          required
        />
      </div>
      
      {isMainOrSecondary && (
        <>
          <div>
            <Label htmlFor="propertyTax" className="block text-sm font-medium mb-1">
              Taxe foncière annuelle (€) *
            </Label>
            <Input
              id="propertyTax"
              type="number"
              value={propertyTax}
              onChange={(e) => setPropertyTax(e.target.value)}
              className="wealth-input w-full"
              placeholder="Ex: 1200"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          {usageType === 'secondary' && (
            <div>
              <Label htmlFor="housingTax" className="block text-sm font-medium mb-1">
                Taxe d'habitation annuelle (€)
              </Label>
              <Input
                id="housingTax"
                type="number"
                value={housingTax}
                onChange={(e) => setHousingTax(e.target.value)}
                className="wealth-input w-full"
                placeholder="Ex: 800"
                min="0"
                step="0.01"
              />
            </div>
          )}
        </>
      )}
      
      {isRental && (
        <>
          <div>
            <Label htmlFor="annualRent" className="block text-sm font-medium mb-1">
              Loyer annuel (€)
            </Label>
            <Input
              id="annualRent"
              type="number"
              value={annualRent}
              onChange={(e) => setAnnualRent(e.target.value)}
              className="wealth-input w-full"
              placeholder="Ex: 12000"
              min="0"
              step="0.01"
            />
          </div>
          
          <div>
            <Label htmlFor="propertyTax" className="block text-sm font-medium mb-1">
              Taxe foncière annuelle (€) *
            </Label>
            <Input
              id="propertyTax"
              type="number"
              value={propertyTax}
              onChange={(e) => setPropertyTax(e.target.value)}
              className="wealth-input w-full"
              placeholder="Ex: 1200"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="annualFees" className="block text-sm font-medium mb-1">
              Frais annuels (impôts, prélèvements sociaux...) (€)
            </Label>
            <Input
              id="annualFees"
              type="number"
              value={annualFees}
              onChange={(e) => setAnnualFees(e.target.value)}
              className="wealth-input w-full"
              placeholder="Ex: 2000"
              min="0"
              step="0.01"
            />
          </div>
          
          <div>
            <Label htmlFor="annualCharges" className="block text-sm font-medium mb-1">
              Charges annuelles (syndic, travaux...) (€)
            </Label>
            <Input
              id="annualCharges"
              type="number"
              value={annualCharges}
              onChange={(e) => setAnnualCharges(e.target.value)}
              className="wealth-input w-full"
              placeholder="Ex: 1500"
              min="0"
              step="0.01"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default RealEstateFormFields;
