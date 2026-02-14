import React, { useMemo } from 'react';
import { SavedInvoice } from '../types';
import { ExportIcon } from './icons';

type SalesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  salesData: {
    invoiceCount: number;
    totalSales: number;
  };
  history: SavedInvoice[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
};

const SalesModal: React.FC<SalesModalProps> = ({ isOpen, onClose, salesData, history, selectedMonth, setSelectedMonth }) => {
  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const availableMonths = useMemo(() => {
    if (!history) return [];
    const months = new Set(history.map(inv => inv.invoiceDate.substring(0, 7))); // 'YYYY-MM'
    // FIX: Explicitly type sort parameters to resolve TypeScript inference issue.
    return Array.from(months).sort((a: string, b: string) => b.localeCompare(a)); // Sort descending
  }, [history]);

  const formatMonthForDisplay = (monthStr: string) => { // 'YYYY-MM'
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  };

  const handleExportCsv = () => {
    const filteredHistory = selectedMonth === 'all'
        ? history
        : history.filter(inv => inv.invoiceDate.startsWith(selectedMonth));

    if (filteredHistory.length === 0) {
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

    filteredHistory.forEach(invoice => {
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
    
    const monthName = selectedMonth === 'all' 
        ? 'Semua_Bulan' 
        : formatMonthForDisplay(selectedMonth).replace(/\s/g, '_');
    link.setAttribute('download', `Rekap_Penjualan_${monthName}.csv`);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Rekap Penjualan</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 font-bold text-2xl" aria-label="Tutup modal">&times;</button>
        </header>
        
        <div className="p-4 border-b">
          <label htmlFor="month-filter" className="block text-sm font-medium text-gray-700">Filter berdasarkan Bulan</label>
          <select
            id="month-filter"
            name="month-filter"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="all">Semua Bulan</option>
            {availableMonths.map(month => (
              <option key={month} value={month}>
                {formatMonthForDisplay(month)}
              </option>
            ))}
          </select>
        </div>

        <main className="p-8 flex flex-col sm:flex-row gap-8 justify-around">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Nota Dibuat</p>
            <p className="text-3xl font-bold text-indigo-600">{salesData.invoiceCount}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Penjualan</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(salesData.totalSales)}</p>
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