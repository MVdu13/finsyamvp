import React, { useState } from 'react';
import { Building2, Plus, Map, LineChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from '@/lib/formatters';
import { Asset, AssetType } from '@/types/assets';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LineChartComponent from '@/components/charts/LineChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AssetForm from '@/components/assets/AssetForm';
import { cn } from '@/lib/utils';

interface RealEstatePageProps {
  assets: Asset[];
  onAddAsset: (asset: Omit<Asset, 'id'>) => void;
}

const RealEstatePage: React.FC<RealEstatePageProps> = ({ assets, onAddAsset }) => {
  // Properties are passed from parent
  const properties = assets;

  const totalValue = properties.reduce((sum, property) => sum + property.value, 0);
  const avgPerformance = properties.length > 0 
    ? properties.reduce((sum, property) => sum + property.performance, 0) / properties.length
    : 0;

  // Générer un historique cohérent basé sur la valeur totale actuelle
  const generateChartData = () => {
    const baseValue = totalValue > 0 ? totalValue : 0;
    
    // Si aucun bien immobilier, retourner des valeurs à zéro
    if (baseValue === 0) {
      return {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
        datasets: [
          {
            label: 'Valeur immobilière',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            color: '#FA5003',
            fill: true,
          }
        ]
      };
    }
    
    // Sinon, générer un historique basé sur la valeur actuelle
    const values = [
      Math.round(baseValue * 0.98),
      Math.round(baseValue * 0.985),
      Math.round(baseValue * 0.99),
      Math.round(baseValue * 0.975),
      Math.round(baseValue * 0.98),
      Math.round(baseValue * 0.99),
      Math.round(baseValue * 0.998),
      Math.round(baseValue * 0.985),
      Math.round(baseValue * 0.992),
      Math.round(baseValue * 0.98),
      Math.round(baseValue * 0.975),
      baseValue
    ];
    
    return {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
      datasets: [
        {
          label: 'Valeur immobilière',
          data: values,
          color: '#FA5003',
          fill: true,
        }
      ]
    };
  };

  const chartData = generateChartData();

  const handleAddProperty = (newProperty: Omit<Asset, 'id'>) => {
    // Make sure we're adding a real-estate asset
    const realEstateAsset = {
      ...newProperty,
      type: 'real-estate' as AssetType
    };
    
    // Call the parent's onAddAsset function
    onAddAsset(realEstateAsset);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patrimoine Immobilier</h1>
          <p className="text-muted-foreground">Gérez vos biens immobiliers et suivez leur performance</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <button className="wealth-btn wealth-btn-primary flex items-center gap-2">
              <Plus size={16} />
              <span>Ajouter un bien</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Ajouter un bien immobilier</DialogTitle>
            </DialogHeader>
            <AssetForm onSubmit={handleAddProperty} onCancel={() => {}} defaultType="real-estate" />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valeur Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <div className={cn(
              "text-xs flex items-center mt-1",
              avgPerformance >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {avgPerformance >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              <span>{avgPerformance > 0 ? "+" : ""}{avgPerformance.toFixed(1)}% cette année</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nombre de Biens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Biens immobiliers en portefeuille
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rendement Moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              avgPerformance >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {avgPerformance > 0 ? "+" : ""}{avgPerformance.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Performance estimée sur l'année
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Évolution de la valeur</CardTitle>
          <CardDescription>
            Suivi de la valeur totale de votre patrimoine immobilier sur 12 mois
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <LineChartComponent data={chartData} />
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Vos Biens Immobiliers</h2>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Date d'acquisition</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">{property.name}</TableCell>
                  <TableCell>{property.description}</TableCell>
                  <TableCell>{formatCurrency(property.value)}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center",
                      property.performance >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {property.performance >= 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                      {property.performance > 0 ? "+" : ""}{property.performance}%
                    </span>
                  </TableCell>
                  <TableCell>{new Date(property.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {properties.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    Aucun bien immobilier enregistré
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default RealEstatePage;
