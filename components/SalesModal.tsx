
import React from 'react';
import { SavedInvoice, MonthlySales } from '../types';
import { ExportIcon } from './icons';
import SalesChart from './SalesChart';

type SalesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  salesData: {
    invoiceCount: number;
    totalSales: number;
  };
  history: SavedInvoice[];
  chartData: MonthlySales[];
};

const SalesModal: React.FC<SalesModalProps> = ({ isOpen, onClose, salesData, history, chartData }) => {
  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const handleExportCsv = () => {
    if (history.length === 0) {
        alert('Tidak ada data untuk diekspor.');
        return;
    }

    const headers = [
        'Nomor Nota', 'Tanggal', 'Nama Pelanggan', 'Alamat Pelanggan',
        'Nama Barang', 'Jumlah', 'Satuan', 'Harga Satuan', 'Total Harga Barang'
    ];
    let csvContent = headers.join(',') + '\n';

    const escapeCsvCell = (cell: string | number | undefined) => {
        const strCell = String(cell ?? '');
        if (strCell.includes(',')) {
            return `"${strCell.replace(/"/g, '""')}"`;
        }
        return strCell;
    };

    history.forEach(invoice => {
        invoice.items.forEach(item => {
            const row = [
                invoice.invoiceNumber,
                invoice.invoiceDate,
                invoice.customerDetails.name,
                invoice.customerDetails.address,
                item.name,
                item.quantity,
                item.unit,
                item.price,
                item.quantity * item.price
            ].map(escapeCsvCell).join(',');
            csvContent += row + '\n';
        });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_Penjualan_Total_SHANDI_ELECTRO.csv`);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Rekap Penjualan</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 font-bold text-2xl" aria-label="Tutup modal">&times;</button>
        </header>
        
        <main className="p-6 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
                <div>
                    <p className="text-sm text-gray-600">Total Nota Dibuat (Sepanjang Masa)</p>
                    <p className="text-3xl font-bold text-indigo-600">{salesData.invoiceCount}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">Total Penjualan (Sepanjang Masa)</p>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(salesData.totalSales)}</p>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 text-center">
                    Tren Penjualan 6 Bulan Terakhir
                </h3>
                <div className="h-64 w-full">
                   <SalesChart data={chartData} />
                </div>
            </div>
        </main>
        
        <footer className="p-4 bg-gray-50 rounded-b-lg border-t">
          <div className="flex justify-end">
            <button
              onClick={handleExportCsv}
              className="flex items-center bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              aria-label="Ekspor data ke CSV"
            >
              <ExportIcon />
              <span className="ml-2">Ekspor CSV</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SalesModal;