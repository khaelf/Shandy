
import React, { useState } from 'react';
import useInvoice from '../hooks/useInvoice';
import { ResetIcon, DownloadIcon, PrintIcon } from './icons';

type InvoicePreviewProps = ReturnType<typeof useInvoice>;

// Inform TypeScript that these libraries are globally available from the script tags in index.html
declare const html2canvas: any;
declare const jspdf: any;

const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  storeDetails,
  customerDetails,
  items,
  invoiceNumber,
  invoiceDate,
  totals,
  resetInvoice,
}) => {
  const [isJpgLoading, setIsJpgLoading] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const captureInvoice = () => {
    const invoiceElement = document.getElementById('invoice-preview');
    if (!invoiceElement) {
      return Promise.reject('Invoice element not found');
    }
    return html2canvas(invoiceElement, {
      scale: 2.5, // Increase scale for better quality
      useCORS: true,
      logging: false,
    });
  };

  const handleDownloadJpg = async () => {
    setIsJpgLoading(true);
    try {
      const canvas = await captureInvoice();
      const image = canvas.toDataURL('image/jpeg', 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = `Nota-${invoiceNumber.replace('/', '-')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading JPG:', error);
      alert('Gagal mengunduh JPG. Silakan coba lagi.');
    } finally {
      setIsJpgLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsPdfLoading(true);
    try {
      const canvas = await captureInvoice();
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = jspdf;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;

      let imgWidth = pdfWidth;
      let imgHeight = imgWidth / ratio;
      
      // If the image height exceeds the page height, scale it down.
      if (imgHeight > pdfHeight) {
        imgHeight = pdfHeight;
        imgWidth = imgHeight * ratio;
      }
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Nota-${invoiceNumber.replace('/', '-')}.pdf`);

    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Gagal mengunduh PDF. Silakan coba lagi.');
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="sticky top-6">
       <div className="bg-white p-8 rounded-lg shadow-lg" id="invoice-preview">
          {/* Header */}
          <div className="flex justify-between items-start pb-4 border-b">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{storeDetails.name}</h1>
              <p className="text-sm text-gray-500 whitespace-pre-line">{storeDetails.address}</p>
              <p className="text-sm text-gray-500">{storeDetails.phone}</p>
            </div>
            <h2 className="text-3xl font-bold text-gray-400 uppercase tracking-wider">Nota</h2>
          </div>
          
          {/* Details */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-sm font-semibold text-gray-600">Ditagihkan kepada:</p>
              <p className="font-bold text-gray-800">{customerDetails.name || 'Nama Pelanggan'}</p>
              <p className="text-sm text-gray-500 whitespace-pre-line">{customerDetails.address || 'Alamat Pelanggan'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-600">Nomor Nota:</p>
              <p className="text-gray-800">{invoiceNumber}</p>
              <p className="text-sm font-semibold text-gray-600 mt-2">Tanggal Dibuat:</p>
              <p className="text-gray-800">{invoiceDate}</p>
            </div>
          </div>
          
          {/* Items Table */}
          <div className="mt-8">
            <table className="w-full text-left table-fixed">
              <thead>
                <tr className="bg-green-100 text-sm font-semibold text-green-800">
                  <th className="p-2 rounded-l-lg" style={{ width: '30%' }}>Barang</th>
                  <th className="p-2 text-center" style={{ width: '17.5%' }}>Jumlah</th>
                  <th className="p-2 text-center" style={{ width: '17.5%' }}>Satuan</th>
                  <th className="p-2 text-right" style={{ width: '17.5%' }}>Harga</th>
                  <th className="p-2 text-right rounded-r-lg" style={{ width: '17.5%' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map(item => (
                    <tr key={item.id} className="border-b border-gray-100 text-xs">
                      <td className="p-2 font-medium truncate">{item.name}</td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-center">{item.unit}</td>
                      <td className="p-2 text-right">{formatCurrency(item.price)}</td>
                      <td className="p-2 text-right">{formatCurrency(item.quantity * item.price)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-400">Belum ada barang yang ditambahkan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Totals */}
          <div className="flex justify-end mt-6">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="mt-16 flex justify-end">
              <div className="text-center w-48">
                  <p className="text-sm text-gray-600">Hormat kami,</p>
                  <div className="h-16"></div> {/* Spacer for signature */}
                  <p className="font-bold text-gray-800 pt-1 border-t border-gray-400">SHANDI ELECTRO</p>
              </div>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-4 border-t text-center text-sm text-gray-500">
            <p>Terima kasih telah berbelanja!</p>
            <p className="font-semibold mt-1">Barang yang sudah dibeli tidak dapat dikembalikan.</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap justify-end gap-3 print:hidden">
          <button onClick={handlePrint} disabled={isJpgLoading || isPdfLoading} className="flex items-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed">
            <PrintIcon />
            <span className="ml-2">Cetak Nota</span>
          </button>
          <button onClick={handleDownloadJpg} disabled={isJpgLoading || isPdfLoading} className="flex items-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed">
            <DownloadIcon />
            <span className="ml-2">{isJpgLoading ? 'Proses...' : 'Unduh JPG'}</span>
          </button>
          <button onClick={handleDownloadPdf} disabled={isPdfLoading || isJpgLoading} className="flex items-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed">
            <DownloadIcon />
            <span className="ml-2">{isPdfLoading ? 'Proses...' : 'Unduh PDF'}</span>
          </button>
          <button onClick={resetInvoice} disabled={isJpgLoading || isPdfLoading} className="flex items-center bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
            <ResetIcon />
            <span className="ml-2">Nota Baru</span>
          </button>
        </div>
        
        <style>
          {`
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .print\\:hidden { display: none; }
              #invoice-preview {
                box-shadow: none;
                border-radius: 0;
                padding: 0;
                margin: 0;
              }
            }
          `}
        </style>
    </div>
  );
};

export default InvoicePreview;