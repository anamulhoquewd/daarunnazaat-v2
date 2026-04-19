export async function generatePDFFromElement(elementId: string, fileName: string): Promise<void> {
  try {
    // Dynamically import html2pdf to avoid SSR issues
    const html2pdf = (await import('html2pdf.js')).default;
    
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found for PDF generation');
      return;
    }

    const options = {
      margin: [10, 10, 10, 10], // margins in mm
      filename: `${fileName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
    };

    html2pdf().set(options).from(element).save();
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}

export function printElement(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found for printing');
    return;
  }

  const printWindow = window.open('', '', 'height=600,width=800');
  if (printWindow) {
    printWindow.document.write(element.innerHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}
