
import React, { useState, useMemo, useEffect } from 'react';
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

const SalesModal: React.FC<SalesModalProps> = ({ isOpen, onClose, salesData: allTimeSalesData, history, chartData: lastSixMonthsChartData }) => {
  if (!isOpen) return null;

  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all'); // YYYY-MM format

  useEffect(() => {
    setSelectedMonth('all');
  }, [selectedYear]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const { availableYears, availableMonths } = useMemo(() => {
    const years = new Set<string>();
    const months = new Set<string>();
    if (history) {
        history.forEach(inv => {
            const year = inv.invoiceDate.substring(0, 4);
            years.add(year);
            if (selectedYear !== 'all' && inv.invoiceDate.startsWith(selectedYear)) {
                months.add(inv.invoiceDate.substring(0, 7)); // YYYY-MM
            }
        });
    }
    return {
        availableYears: Array.from(years).sort((a, b) => b.localeCompare(a)),
        availableMonths: Array.from(months).sort((a, b) => b.localeCompare(a)),
    };
  }, [history, selectedYear]);

  const { filteredHistory, displaySalesData, displayChartData, periodLabel } = useMemo(() => {
    if (selectedYear === 'all') {
      return { 
        filteredHistory: history, 
        displaySalesData: allTimeSalesData, 
        displayChartData: lastSixMonthsChartData,
        periodLabel: 'Sepanjang Masa'
      };
    }

    const yearFiltered = history.filter(inv => inv.invoiceDate.startsWith(selectedYear));
    const finalFiltered = selectedMonth === 'all' 
      ? yearFiltered 
      : yearFiltered.filter(inv => inv.invoiceDate.startsWith(selectedMonth));
    
    const calculatedSalesData = {
        invoiceCount: finalFiltered.length,
        totalSales: finalFiltered.reduce((acc, inv) => acc + inv.totals.total, 0),
    };

    const yearChartData: MonthlySales[] = [];
    const year = parseInt(selectedYear);
    for (let i = 0; i < 12; i++) {
        const date = new Date(year, i, 1);
        const monthKey = date.toISOString().slice(0, 7);
        const monthName = date.toLocaleString('id-ID', { month: 'short' });
        
        let sales = 0;
        yearFiltered.forEach(invoice => {
            if (invoice.invoiceDate.startsWith(monthKey)) {
                sales += invoice.totals.total;
            }
        });
        yearChartData.push({ month: monthName, sales });
    }
    
    let label = `Tahun ${selectedYear}`;
    if (selectedMonth !== 'all') {
        const [y, m] = selectedMonth.split('-');
        const date = new Date(parseInt(y), parseInt(m) - 1);
        label = date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    }

    return {
      filteredHistory: finalFiltered,
      displaySalesData: calculatedSalesData,
      displayChartData: yearChartData,
      periodLabel: label,
    };
  }, [history, selectedYear, selectedMonth, allTimeSalesData, lastSixMonthsChartData]);

  const handleExportCsv = () => {
    if (filteredHistory.length === 0) {
        alert('Tidak ada data untuk diekspor pada periode yang dipilih.');
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
    const filename = `Rekap_Penjualan_${periodLabel.replace(/ /g, '_')}_SHANDI_ELECTRO.csv`;
    link.setAttribute('download', filename);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const formatMonthForDisplay = (monthStr: string) => { // 'YYYY-MM'
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Rekap Penjualan</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 font-bold text-2xl" aria-label="Tutup modal">&times;</button>
        </header>
        
        <div className="p-4 border-b grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50">
          <div>
            <label htmlFor="sales-year-filter" className="block text-sm font-medium text-gray-700">Filter Tahun</label>
            <select
              id="sales-year-filter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="all">Semua Tahun</option>
              {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="sales-month-filter" className="block text-sm font-medium text-gray-700">Filter Bulan</label>
            <select
              id="sales-month-filter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-200"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              disabled={selectedYear === 'all'}
            >
              <option value="all">Semua Bulan</option>
              {availableMonths.map(month => <option key={month} value={month}>{formatMonthForDisplay(month)}</option>)}
            </select>
          </div>
        </div>

        <main className="p-6 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
                <div>
                    <p className="text-sm text-gray-600">Total Nota Dibuat ({periodLabel})</p>
                    <p className="text-3xl font-bold text-blue-600">{displaySalesData.invoiceCount}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">Total Penjualan ({periodLabel})</p>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(displaySalesData.totalSales)}</p>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 text-center">
                  {selectedYear === 'all' ? 'Tren Penjualan 6 Bulan Terakhir' : `Tren Penjualan Tahun ${selectedYear}`}
                </h3>
                <div className="h-64 w-full">
                   <SalesChart data={displayChartData} />
                </div>
            </div>
        </main>
        
        <footer className="p-4 bg-blue-50 rounded-b-lg border-t">
          <div className="flex justify-end">
            <button
              onClick={handleExportCsv}
              className="flex items-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
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
