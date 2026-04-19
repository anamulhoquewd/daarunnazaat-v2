'use client';

import { VoucherActions } from '@/components/expenses/voucherAction';
import { VoucherDisplay } from '@/components/expenses/voucherDisplay';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/axios/intercepter';
import { IExpense } from '@/validations';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VoucherPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [expense, setExpense] = useState<IExpense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchExpense = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await api.get(`/expenses/${id}`);

        if (!response.data.success) {
          throw new Error(response.data.error.message);
        }

        setExpense(response.data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpense();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-sm border-neutral-200">
            <CardContent className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
                <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
                <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !expense) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            No Voucher Data
          </h1>
          <p className="text-muted-foreground">
            {error || 'Please create an expense first'}
          </p>
        </div>
      </main>
    );
  }

  
  return (
    <main className="min-h-screen bg-background py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Action Buttons */}
        <div className="mb-8">
          <VoucherActions voucherNumber={expense.voucherNumber!} />
        </div>

        {/* Voucher Display */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <VoucherDisplay data={expense} />
        </div>

        {/* Bottom Action Buttons */}
        <div className="mt-8 text-center">
          <VoucherActions voucherNumber={expense.voucherNumber!} />
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          main {
            background-color: white;
            padding: 0;
          }
          
          .bg-white {
            box-shadow: none;
            border-radius: 0;
          }
          
          button,
          .no-print {
            display: none;
          }
          
          #voucher-content {
            max-width: 100%;
            margin: 0;
            padding: 20mm;
            background: white;
          }
        }
      `}</style>
    </main>
  );
}
