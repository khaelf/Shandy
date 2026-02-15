
import React, { useState } from 'react';
import useInvoice from './hooks/useInvoice';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import HistoryModal from './components/HistoryModal';
import SalesModal from './components/SalesModal';
import { HistoryIcon, SalesIcon } from './components/icons';

function App() {
  const invoiceHook = useInvoice();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSalesOpen, setIsSalesOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-gray-100 text-gray-800">
        <header className="bg-white shadow-sm print:hidden">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-gray-900">
              SHANDI ELECTRO
            </h1>
            <div className="flex items-center gap-4 sm:gap-6">
              <button
                onClick={() => setIsSalesOpen(true)}
                className="flex items-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                aria-label="Buka Rekap Belanja"
              >
                <SalesIcon />
                <span className="ml-2 hidden sm:block">Rekap Belanja</span>
              </button>
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="flex items-center bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                aria-label="Buka Riwayat"
              >
                <HistoryIcon />
                <span className="ml-2 hidden sm:block">Riwayat</span>
              </button>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 print:hidden">
              <InvoiceForm {...invoiceHook} />
            </div>
            <div className="lg:col-span-2">
              <InvoicePreview {...invoiceHook} />
            </div>
          </div>
        </main>
      </div>
      <HistoryModal 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={invoiceHook.history}
        loadInvoice={invoiceHook.loadInvoice}
      />
      <SalesModal
        isOpen={isSalesOpen}
        onClose={() => setIsSalesOpen(false)}
        salesData={invoiceHook.salesData}
        history={invoiceHook.history}
        chartData={invoiceHook.monthlyChartData}
      />
    </>
  );
}

export default App;