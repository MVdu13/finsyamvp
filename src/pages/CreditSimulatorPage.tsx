
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { formatCurrency } from '@/lib/formatters';

const CreditSimulatorPage = () => {
  const [loanAmount, setLoanAmount] = useState<number>(200000);
  const [interestRate, setInterestRate] = useState<number>(3.5);
  const [loanTermYears, setLoanTermYears] = useState<number>(20);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);
  const [amortizationTable, setAmortizationTable] = useState<any[]>([]);
  const [yearlyData, setYearlyData] = useState<any[]>([]);

  useEffect(() => {
    calculateLoan();
  }, [loanAmount, interestRate, loanTermYears]);

  const calculateLoan = () => {
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTermYears * 12;
    const monthlyPmt = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    setMonthlyPayment(monthlyPmt);
    
    let balance = loanAmount;
    let totalInterestPaid = 0;
    const amortizationData = [];
    const yearData = [];
    
    for (let payment = 1; payment <= numberOfPayments; payment++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPmt - interestPayment;
      balance -= principalPayment;
      totalInterestPaid += interestPayment;
      
      amortizationData.push({
        payment,
        principalPayment,
        interestPayment,
        balance: balance > 0 ? balance : 0,
        totalPrincipal: loanAmount - balance,
        totalInterest: totalInterestPaid
      });
      
      if (payment % 12 === 0 || payment === numberOfPayments) {
        const year = Math.ceil(payment / 12);
        yearData.push({
          year,
          balance: balance > 0 ? balance : 0,
          principalPaid: loanAmount - balance,
          interestPaid: totalInterestPaid,
          totalPaid: (loanAmount - balance) + totalInterestPaid
        });
      }
    }
    
    setAmortizationTable(amortizationData);
    setYearlyData(yearData);
    setTotalInterest(totalInterestPaid);
    setTotalPayment(loanAmount + totalInterestPaid);
  };

  const handleLoanAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setLoanAmount(value);
  };

  const handleInterestRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setInterestRate(value);
  };

  const handleInterestRateSlider = (value: number[]) => {
    setInterestRate(value[0]);
  };

  const handleLoanTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setLoanTermYears(value);
  };

  const handleLoanTermSlider = (value: number[]) => {
    setLoanTermYears(value[0]);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Simulateur de Crédit</h1>
            <p className="text-muted-foreground">Calculez vos mensualités et planifiez votre emprunt</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Paramètres du crédit</CardTitle>
              <CardDescription>Personnalisez votre simulation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="loanAmount">Montant de l'emprunt (€)</Label>
                <Input 
                  id="loanAmount" 
                  type="number" 
                  value={loanAmount} 
                  onChange={handleLoanAmountChange}
                  min={1000}
                  step={1000}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="interestRate">Taux d'intérêt annuel (%)</Label>
                  <span className="text-sm font-medium">{interestRate.toFixed(2)}%</span>
                </div>
                <Input 
                  id="interestRate" 
                  type="number" 
                  value={interestRate} 
                  onChange={handleInterestRateChange}
                  min={0.1}
                  max={10}
                  step={0.1}
                />
                <Slider
                  value={[interestRate]}
                  onValueChange={handleInterestRateSlider}
                  min={0.1}
                  max={10}
                  step={0.1}
                  className="mt-2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="loanTerm">Durée du prêt (années)</Label>
                  <span className="text-sm font-medium">{loanTermYears} ans</span>
                </div>
                <Input 
                  id="loanTerm" 
                  type="number" 
                  value={loanTermYears} 
                  onChange={handleLoanTermChange}
                  min={1}
                  max={35}
                />
                <Slider
                  value={[loanTermYears]}
                  onValueChange={handleLoanTermSlider}
                  min={1}
                  max={35}
                  step={1}
                  className="mt-2"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 pt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Mensualité</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(monthlyPayment)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Coût total du crédit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(totalPayment)}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      dont {formatCurrency(loanAmount)} de capital et <span className="text-[#FA5003]">{formatCurrency(totalInterest)}</span> d'intérêts
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Visualisation du crédit</CardTitle>
              <CardDescription>Remboursement sur {loanTermYears} ans</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="charts" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="charts">Graphiques</TabsTrigger>
                  <TabsTrigger value="amortization">Tableau d'amortissement</TabsTrigger>
                </TabsList>
                
                <TabsContent value="charts" className="space-y-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={yearlyData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`} />
                        <Tooltip
                          formatter={(value) => [formatCurrency(value as number), ""]}
                          labelFormatter={(label) => `Année ${label}`}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="balance" 
                          name="Capital restant dû" 
                          stackId="1" 
                          stroke="#2563eb" 
                          fill="#93c5fd" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="principalPaid" 
                          name="Capital remboursé" 
                          stackId="2" 
                          stroke="#16a34a" 
                          fill="#86efac" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="interestPaid" 
                          name="Intérêts payés" 
                          stackId="2" 
                          stroke="#FA5003" 
                          fill="#FEC6A1" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">Répartition du coût total</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-full h-8 rounded-full overflow-hidden bg-gray-200">
                        <div 
                          className="h-full bg-blue-500"
                          style={{ width: `${(loanAmount / totalPayment) * 100}%` }}
                        ></div>
                        <div 
                          className="h-full bg-[#FA5003]"
                          style={{ 
                            width: `${(totalInterest / totalPayment) * 100}%`,
                            marginLeft: `${(loanAmount / totalPayment) * 100}%`,
                            marginTop: "-2rem" 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>Capital: {formatCurrency(loanAmount)} ({((loanAmount / totalPayment) * 100).toFixed(1)}%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#FA5003]"></div>
                        <span className="text-[#FA5003]">Intérêts: {formatCurrency(totalInterest)} ({((totalInterest / totalPayment) * 100).toFixed(1)}%)</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="amortization">
                  <div className="rounded-md border overflow-auto max-h-96">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Année</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Mensualité</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Capital</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Intérêts</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Capital restant</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-background">
                        {yearlyData.map((entry) => (
                          <tr key={entry.year}>
                            <td className="px-3 py-2 text-sm">{entry.year}</td>
                            <td className="px-3 py-2 text-sm text-right">{formatCurrency(monthlyPayment)}</td>
                            <td className="px-3 py-2 text-sm text-right">
                              {entry.year > 1 
                                ? formatCurrency(yearlyData[entry.year - 2].principalPaid - yearlyData[entry.year - 1].principalPaid) 
                                : formatCurrency(loanAmount - yearlyData[0].balance)}
                            </td>
                            <td className="px-3 py-2 text-sm text-right text-[#FA5003]">
                              {entry.year > 1 
                                ? formatCurrency(yearlyData[entry.year - 1].interestPaid - yearlyData[entry.year - 2].interestPaid) 
                                : formatCurrency(yearlyData[0].interestPaid)}
                            </td>
                            <td className="px-3 py-2 text-sm text-right font-medium">{formatCurrency(entry.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreditSimulatorPage;
