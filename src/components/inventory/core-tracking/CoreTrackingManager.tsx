
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InventoryItemExtended } from '@/types/inventory';
import { DollarSign, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCoreTracking } from '@/hooks/inventory/useCoreTracking';

interface CoreTrackingManagerProps {
  item: InventoryItemExtended;
}

export function CoreTrackingManager({ item }: CoreTrackingManagerProps) {
  const { recordCoreReturn, recordCoreCharge, coreTransactions, loading } = useCoreTracking(item.id);
  const [coreId, setCoreId] = useState('');
  const [amount, setAmount] = useState(item.coreCharge?.toString() || '');

  const handleCoreReturn = async () => {
    if (!coreId.trim()) return;
    await recordCoreReturn(coreId, Number(amount) || 0);
    setCoreId('');
  };

  const handleCoreCharge = async () => {
    if (!coreId.trim()) return;
    await recordCoreCharge(coreId, Number(amount) || 0);
    setCoreId('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold">Core Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="coreId">Core ID / Reference</Label>
                <Input
                  id="coreId"
                  value={coreId}
                  onChange={(e) => setCoreId(e.target.value)}
                  placeholder="Enter core ID or reference"
                />
              </div>
              <div>
                <Label htmlFor="amount">
                  Amount (<DollarSign className="inline-block h-4 w-4" />)
                </Label>
                <Input
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  step="0.01"
                  placeholder="Core charge amount"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <Button 
                  onClick={handleCoreCharge} 
                  disabled={loading}
                  className="flex gap-1 items-center"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Record Core Charge
                </Button>
                <Button 
                  onClick={handleCoreReturn} 
                  disabled={loading} 
                  variant="outline"
                  className="flex gap-1 items-center"
                >
                  <ArrowRight className="h-4 w-4" />
                  Record Core Return
                </Button>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Current Core Details</div>
              <div className="bg-slate-50 p-3 rounded-md border">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Default Core Charge:</div>
                  <div className="text-sm">${item.coreCharge?.toFixed(2) || '0.00'}</div>
                  <div className="text-sm font-medium">Core Returns Balance:</div>
                  <div className="text-sm">${(coreTransactions?.returnedAmount || 0).toFixed(2)}</div>
                  <div className="text-sm font-medium">Core Charges Balance:</div>
                  <div className="text-sm">${(coreTransactions?.chargedAmount || 0).toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Core Transaction History</h3>
            {coreTransactions?.transactions && coreTransactions.transactions.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Core ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coreTransactions.transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                        <TableCell>{transaction.coreId}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            transaction.type === 'charge' 
                              ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                              : 'bg-green-100 text-green-800 border border-green-300'
                          }`}>
                            {transaction.type === 'charge' ? 'Core Charge' : 'Core Return'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">${transaction.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center p-4 bg-slate-50 border rounded-md">
                No core transactions found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
