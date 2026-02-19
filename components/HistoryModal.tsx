import React, { useState, useMemo } from 'react';
import { SavedInvoice } from '../types';

type HistoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  history: SavedInvoice[];
  loadInvoice: (invoice: SavedInvoice) => void;
  deleteInvoice: (id: string) => void;
};

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, loadInvoice, deleteInvoice }) => {
  if (!isOpen) return null;

  const [selectedMonth, setSelectedMonth] = useState('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const handleLoadInvoice = (invoice: SavedInvoice) => {
    loadInvoice(invoice);
    onClose();
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

  const filteredHistory = useMemo(() => {
    if (selectedMonth === 'all') {
      return history;
    }
    return history.filter(inv => inv.invoiceDate.startsWith(selectedMonth));
  }, [history, selectedMonth]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="p-4 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-800">Riwayat Nota</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 font-bold text-2xl" aria-label="Tutup modal">&times;</button>
        </header>
        
        <div className="p-4 border-b">
          <label htmlFor="history-month-filter" className="block text-sm font-medium text-gray-700">Filter berdasarkan Bulan</label>
          <select
            id="history-month-filter"
            name="history-month-filter"
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

        <main className="p-6 overflow-y-auto">
          {filteredHistory.length === 0 ? (
            <p className="text-center text-gray-500">
              {selectedMonth === 'all' ? 'Belum ada riwayat nota.' : 'Tidak ada nota pada bulan yang dipilih.'}
            </p>
          ) : (
            <ul className="space-y-3">
              {filteredHistory.map((invoice) => (
                <li key={invoice.id} className="p-3 bg-white rounded-md border hover:shadow-md transition-shadow flex flex-wrap justify-between items-center gap-y-2 gap-x-4">
                  <div className="flex-grow min-w-[200px]">
                    <p className="font-semibold text-gray-800">{invoice.customerDetails.name || 'Tanpa Nama'}</p>
                    <p className="text-sm text-gray-600">{invoice.invoiceNumber}</p>
                  </div>
                  <div className="flex-shrink-0 text-left sm:text-right">
                    <p className="font-medium text-gray-700">{formatCurrency(invoice.totals.total)}</p>
                    <p className="text-xs text-gray-500">{invoice.invoiceDate}</p>
                  </div>
                  <div className="w-full sm:w-auto flex justify-end">
                    <button 
                      onClick={() => handleLoadInvoice(invoice)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium py-1 px-3 rounded-md transition-colors"
                    >
                      Muat
                    </button>
                    <button 
                      onClick={() => deleteInvoice(invoice.id)}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-1 px-3 rounded-md transition-colors ml-2"
                    >
                      Hapus
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
};

export default HistoryModal;