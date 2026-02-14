
import { useState, useMemo, ChangeEvent, useEffect } from 'react';
import { InvoiceItem, CustomerDetails, StoreDetails, SavedInvoice } from '../types';

const TAX_RATE = 0; // PPN dihilangkan

// Helper function to convert string to Title Case
const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
};

const initialStoreDetails: StoreDetails = {
  name: 'SHANDI ELECTRO',
  address: 'Jl. Koto Salayan, Kec. Mandiangin Koto Salayan, Kota Bukittinggi',
  phone: '+62 821-7103-2797',
  email: 'sales@shandielectro.com',
  website: 'www.shandielectro.com',
};

const initialCustomerDetails: CustomerDetails = {
  name: '',
  address: '',
};

const initialNewItem: Omit<InvoiceItem, 'id'> = {
  name: '',
  quantity: 0,
  unit: '',
  price: 0,
};

const useInvoice = () => {
  const [storeDetails] = useState<StoreDetails>(initialStoreDetails);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>(initialCustomerDetails);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [newItem, setNewItem] = useState<Omit<InvoiceItem, 'id'>>(initialNewItem);
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // 'YYYY-MM' or 'all'


  const [history, setHistory] = useState<SavedInvoice[]>(() => {
    try {
      const savedHistory = localStorage.getItem('invoiceHistory');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error("Could not load invoice history from local storage", error);
      return [];
    }
  });

  const [invoiceSequence, setInvoiceSequence] = useState(history.length + 1);

  useEffect(() => {
    try {
        localStorage.setItem('invoiceHistory', JSON.stringify(history));
    } catch (error) {
        console.error("Could not save invoice history to local storage", error);
    }
}, [history]);

  const generateInvoiceNumber = (seq: number) => {
    const now = new Date();
    const year = now.getFullYear();
    return `INV-${year}/SE/${String(seq).padStart(3, '0')}`;
  };

  const [invoiceNumber, setInvoiceNumber] = useState<string>(generateInvoiceNumber(invoiceSequence));
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const addItem = (): boolean => {
    if (newItem.name && newItem.quantity > 0 && newItem.price >= 0 && newItem.unit) {
      setItems([...items, { ...newItem, id: crypto.randomUUID() }]);
      setNewItem(initialNewItem);
      return true;
    }
    return false;
  };

  const updateItem = (id: string, updatedField: Partial<InvoiceItem>) => {
    const finalUpdate = { ...updatedField };
    if (typeof finalUpdate.name === 'string') {
        finalUpdate.name = toTitleCase(finalUpdate.name);
    }
    if (typeof finalUpdate.unit === 'string') {
        finalUpdate.unit = toTitleCase(finalUpdate.unit);
    }
    setItems(items.map(item => (item.id === id ? { ...item, ...finalUpdate } : item)));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleCustomerChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomerDetails({ ...customerDetails, [e.target.name]: toTitleCase(e.target.value) });
  };

  const handleNewItemChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'quantity') {
      setNewItem({ ...newItem, quantity: parseInt(value, 10) || 0 });
    } else if (name === 'price') {
      const numericValue = parseInt(value.replace(/\D/g, ''), 10) || 0;
      setNewItem({ ...newItem, price: numericValue });
    } else if (name === 'name' || name === 'unit') {
      setNewItem({ ...newItem, [name as 'name' | 'unit']: toTitleCase(value) });
    }
  };
  
  const totals = useMemo(() => {
    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [items]);

  const resetInvoice = () => {
    let nextHistory = history;
    // Save the current invoice to history if it has items
    if (items.length > 0) {
      const newSavedInvoice: SavedInvoice = {
        id: crypto.randomUUID(),
        storeDetails,
        customerDetails,
        items,
        invoiceNumber,
        invoiceDate,
        totals,
      };
      nextHistory = [newSavedInvoice, ...history];
      setHistory(nextHistory);
    }

    setCustomerDetails(initialCustomerDetails);
    setItems([]);
    setNewItem(initialNewItem);
    const newSequence = nextHistory.length + 1;
    setInvoiceSequence(newSequence);
    setInvoiceNumber(generateInvoiceNumber(newSequence));
    setInvoiceDate(new Date().toISOString().split('T')[0]);
  };

  const loadInvoice = (savedInvoice: SavedInvoice) => {
    setCustomerDetails(savedInvoice.customerDetails);
    setItems(savedInvoice.items);
    setInvoiceNumber(savedInvoice.invoiceNumber);
    setInvoiceDate(savedInvoice.invoiceDate);
  };

  const salesData = useMemo(() => {
    const filteredHistory = selectedMonth === 'all'
        ? history
        : history.filter(inv => inv.invoiceDate.startsWith(selectedMonth));

    const invoiceCount = filteredHistory.length;
    const totalSales = filteredHistory.reduce((acc, inv) => acc + inv.totals.total, 0);
    return { invoiceCount, totalSales };
  }, [history, selectedMonth]);


  return {
    storeDetails,
    customerDetails,
    items,
    newItem,
    invoiceNumber,
    setInvoiceNumber,
    invoiceDate,
    setInvoiceDate,
    totals,
    addItem,
    updateItem,
    removeItem,
    handleCustomerChange,
    handleNewItemChange,
    resetInvoice,
    history,
    salesData,
    loadInvoice,
    selectedMonth,
    setSelectedMonth,
  };
};

export default useInvoice;
