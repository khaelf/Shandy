
export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface CustomerDetails {
  name: string;
  address: string;
}

export interface StoreDetails {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

export interface SavedInvoice {
  id: string;
  storeDetails: StoreDetails;
  customerDetails: CustomerDetails;
  items: InvoiceItem[];
  invoiceNumber: string;
  invoiceDate: string;
  totals: {
    subtotal: number;
    tax: number;
    total: number;
  };
}
