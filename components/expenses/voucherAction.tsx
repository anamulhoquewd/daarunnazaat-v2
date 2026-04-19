'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Printer, Download, ArrowLeft, Loader2 } from 'lucide-react';
import { generatePDFFromElement, printElement } from '@/lib/pdf-generator';


export function VoucherActions({ voucherNumber }: {voucherNumber: string}) {
  const router = useRouter();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      printElement('voucher-content');
    } catch (error) {
      console.error('Print error:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await generatePDFFromElement('voucher-content', `Receipt-${voucherNumber}`);
    } catch (error) {
      console.error('PDF generation error:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="flex gap-3 flex-wrap justify-center">
      <Button
        onClick={() => router.push('/expenses')}
        variant="outline"
        size="lg"
        className="gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Create New Receipt
      </Button>
      <Button
        onClick={handlePrint}
        disabled={isPrinting}
        size="lg"
        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isPrinting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
        Print
      </Button>
      <Button
        onClick={handleDownloadPDF}
        disabled={isGeneratingPDF}
        size="lg"
        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isGeneratingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        Download PDF
      </Button>
    </div>
  );
}
