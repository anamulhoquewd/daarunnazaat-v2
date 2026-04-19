'use client';

import { calculateItemTotal, calculateSubtotal, calculateTax, calculateTotal, formatCurrency, formatDate } from '@/lib/receipt-utils';
import { IExpense } from '@/validations';


export function VoucherDisplay({ data }: {data: IExpense}) {

  return (
    <div
      id="voucher-content"
      className="bg-white w-full max-w-2xl mx-auto p-8 text-foreground"
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header Section */}
      <div className="border-b-2 border-foreground pb-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{"data.companyName"}</h1>
            <p className="text-sm text-muted-foreground mt-1">{"data.companyAddress"}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">RECEIPT / VOUCHER</p>
            <p className="text-xs text-muted-foreground mt-1">#{"data.receiptNumber"}</p>
          </div>
        </div>
      </div>

      {/* Receipt Info Section */}
      <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
        <div>
          <p className="font-semibold text-foreground mb-1">Paid to:</p>
          <p className="text-foreground">{"data.vendorName"}</p>
          {"data.vendorAddress" && <p className="text-muted-foreground">{"data.vendorAddress"}</p>}
        </div>
        <div className="text-right">
          <p className="font-semibold text-foreground mb-1">Receipt Date:</p>
          <p className="text-foreground">{formatDate( new Date(data.expenseDate || new Date()).toString())}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Payment Method: {data.paymentMethod || 'Not specified'}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-foreground">
              <th className="text-left py-2 font-semibold text-foreground">Description</th>
              <th className="text-right py-2 font-semibold text-foreground w-20">Qty</th>
              <th className="text-right py-2 font-semibold text-foreground w-24">Unit Price</th>
              <th className="text-right py-2 font-semibold text-foreground w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className="border-b border-border">
                <td className="py-3 text-foreground">{item.name}</td>
                <td className="py-3 text-foreground">{item.unit}</td>
                <td className="text-right py-3 text-foreground">{item.quantity}</td>
                <td className="text-right py-3 text-foreground">{formatCurrency(item.unitPrice)}</td>
                <td className="text-right py-3 text-foreground">{item.total}</td>
                              <td className="text-right py-3 text-foreground font-semibold">
                  {data.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground">Subtotal:</span>
            <span className="text-foreground">{"formatCurrency(subtotal)"}</span>
          </div>
                    <div className="flex justify-between border-t border-foreground pt-2 font-bold text-base">
            <span className="text-foreground">TOTAL:</span>
            <span className="text-foreground">{"formatCurrency(total)"}</span>
          </div>
        </div>
      </div>

      {/* Remarks Section */}
      {data.remarks && (
        <div className="mb-8 p-4 bg-muted rounded-lg text-sm">
          <p className="font-semibold text-foreground mb-1">Remarks:</p>
          <p className="text-foreground whitespace-pre-wrap">{data.remarks}</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-foreground pt-6 text-center text-xs text-muted-foreground">
        <p>Thank you for your business!</p>
        <p className="mt-2">
          {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
