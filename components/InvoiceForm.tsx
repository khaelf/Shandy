
import React, { useRef } from 'react';
import useInvoice from '../hooks/useInvoice';
import { TrashIcon } from './icons';

type InvoiceFormProps = ReturnType<typeof useInvoice>;

// Helper function to format number with dots for display
const formatPrice = (value: number | undefined): string => {
  if (value === undefined || value === null || isNaN(value)) return '';
  return value.toLocaleString('id-ID');
};

// Helper function to parse formatted number from input
const parsePrice = (value: string): number => {
  return parseInt(value.replace(/\D/g, ''), 10) || 0;
};

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  customerDetails,
  items,
  newItem,
  invoiceNumber,
  setInvoiceNumber,
  invoiceDate,
  setInvoiceDate,
  addItem,
  removeItem,
  updateItem,
  handleCustomerChange,
  handleNewItemChange,
}) => {
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addItem()) {
      nameInputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (addItem()) {
        nameInputRef.current?.focus();
      }
    }
  };

  return (
    <div className="bg-blue-50 p-6 rounded-lg shadow-md space-y-8">
      {/* Invoice Details */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-blue-800 border-b border-blue-200 pb-2">Detail Nota</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="invoiceNumber" className="block text-sm font-medium text-blue-900">Nomor Nota</label>
            <input
              type="text"
              id="invoiceNumber"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="invoiceDate" className="block text-sm font-medium text-blue-900">Tanggal Nota</label>
            <input
              type="date"
              id="invoiceDate"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
      
      {/* Customer Details */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-blue-800 border-b border-blue-200 pb-2">Detail Pelanggan</h2>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-blue-900">Nama</label>
          <input
            type="text"
            name="name"
            id="name"
            value={customerDetails.name}
            onChange={handleCustomerChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Nama Pelanggan"
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-blue-900">Alamat</label>
          <textarea
            name="address"
            id="address"
            rows={3}
            value={customerDetails.address}
            onChange={handleCustomerChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Alamat Lengkap Pelanggan"
          />
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-blue-800 border-b border-blue-200 pb-2">Barang</h2>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(item.id, { name: e.target.value })}
                className="col-span-4 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nama Barang"
              />
              <input
                type="number"
                value={item.quantity}
                min="1"
                onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                className="col-span-2 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Jml"
              />
              <input
                type="text"
                value={item.unit}
                onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                className="col-span-2 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Satuan"
              />
              <input
                type="text"
                value={formatPrice(item.price)}
                onChange={(e) => updateItem(item.id, { price: parsePrice(e.target.value) })}
                className="col-span-2 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Harga"
              />
              <div className="col-span-2 flex items-center justify-end">
                <span className="text-gray-600 text-sm hidden sm:block">
                  {(item.quantity * item.price).toLocaleString('id-ID')}
                </span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-2 text-red-500 hover:text-red-700"
                  aria-label="Hapus barang"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-blue-200">
            <div className="grid grid-cols-12 gap-2 text-sm font-medium text-blue-900 mb-1">
                <div className="col-span-12 sm:col-span-4">Nama Barang</div>
                <div className="col-span-4 sm:col-span-2">Jumlah</div>
                <div className="col-span-4 sm:col-span-2">Satuan</div>
                <div className="col-span-4 sm:col-span-2">Harga</div>
            </div>
            <form onSubmit={handleItemSubmit} className="grid grid-cols-12 gap-2">
                <input
                  ref={nameInputRef}
                  type="text"
                  name="name"
                  value={newItem.name}
                  onChange={handleNewItemChange}
                  onKeyDown={handleKeyDown}
                  className="col-span-12 sm:col-span-4 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="cth. Laptop, Printer"
                  required
                />
                <input
                  type="number"
                  name="quantity"
                  value={newItem.quantity || ''}
                  min="1"
                  onChange={handleNewItemChange}
                  onKeyDown={handleKeyDown}
                  className="col-span-4 sm:col-span-2 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                  required
                />
                <input
                  type="text"
                  name="unit"
                  value={newItem.unit}
                  onChange={handleNewItemChange}
                  onKeyDown={handleKeyDown}
                  className="col-span-4 sm:col-span-2 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Pcs, Unit"
                  required
                />
                <input
                  type="text"
                  name="price"
                  value={newItem.price ? formatPrice(newItem.price) : ''}
                  onChange={handleNewItemChange}
                  onKeyDown={handleKeyDown}
                  className="col-span-4 sm:col-span-2 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1.000.000"
                  required
                />
              <div className="col-span-12 sm:col-span-2">
                <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Tambah
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;