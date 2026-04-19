import { z } from 'zod';

export const ExpenseItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Price must be positive'),
});

export const ExpenseFormSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  companyAddress: z.string().min(1, 'Company address is required'),
  receiptNumber: z.string().min(1, 'Receipt number is required'),
  receiptDate: z.string().min(1, 'Receipt date is required'),
  vendorName: z.string().min(1, 'Vendor/Recipient name is required'),
  vendorAddress: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  items: z.array(ExpenseItemSchema).min(1, 'At least one item is required'),
  taxRate: z.number().min(0).max(100).default(0),
  paymentMethod: z.string().optional().default(''),
});

export type ExpenseForm = z.infer<typeof ExpenseFormSchema>;
export type ExpenseItem = z.infer<typeof ExpenseItemSchema>;

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function calculateItemTotal(item: ExpenseItem): number {
  return item.quantity * item.unitPrice;
}

export function calculateSubtotal(items: ExpenseItem[]): number {
  return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
}

export function calculateTax(subtotal: number, taxRate: number): number {
  return (subtotal * taxRate) / 100;
}

export function calculateTotal(items: ExpenseItem[], taxRate: number): number {
  const subtotal = calculateSubtotal(items);
  const tax = calculateTax(subtotal, taxRate);
  return subtotal + tax;
}
