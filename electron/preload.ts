import type { Customer, Device, ServiceOrder, Part, ServiceItem, Payment, Settings, SystemEvent } from '../shared/types';
import { contextBridge, ipcRenderer } from 'electron';
import type { IpcRendererEvent } from 'electron';

const invokeSafe = async (channel: string, ...args: unknown[]) => {
  try {
    return await ipcRenderer.invoke(channel, ...args);
  } catch (error: unknown) {
    if (error instanceof Error && error.message) {
      error.message = error.message.replace(/Error invoking remote method '.*?':\s*(Error:\s*)?/, '');
    }
    throw error;
  }
};

contextBridge.exposeInMainWorld('api', {
  appReady: () => ipcRenderer.send('app-ready'),
  getDashboardStats: () => invokeSafe('get-dashboard-stats'),
  getAlerts: () => invokeSafe('get-alerts'),
  
  // Customers
  getCustomers: (searchQuery: string, page: number, limit: number, sortBy: string = 'name_asc') => invokeSafe('get-customers', searchQuery, page, limit, sortBy),
  getCustomer: (id: number) => invokeSafe('get-customer', id),
  addCustomer: (data: Omit<Customer, 'id'>) => invokeSafe('add-customer', data),
  updateCustomer: (id: number, data: Partial<Customer>) => invokeSafe('update-customer', id, data),
  deleteCustomer: (id: number) => invokeSafe('delete-customer', id),

  // Devices
  getDevices: (searchQuery: string, sortBy: string = 'name_asc') => invokeSafe('get-devices', searchQuery, sortBy),
  getDevice: (id: number) => invokeSafe('get-device', id),
  getDevicesByCustomer: (customerId: number) => invokeSafe('get-devices-by-customer', customerId),
  addDevice: (data: Omit<Device, 'id'>) => invokeSafe('add-device', data),
  updateDevice: (id: number, data: Partial<Device>) => invokeSafe('update-device', id, data),
  deleteDevice: (id: number) => invokeSafe('delete-device', id),

  // Services
  getServices: (searchQuery: string, page: number, limit: number, technicianFilter?: string, sortBy: string = 'name_asc') => invokeSafe('get-services', searchQuery, page, limit, technicianFilter, sortBy),
  getService: (id: number) => invokeSafe('get-service', id),
  getServiceByTicket: (ticket: string) => invokeSafe('get-service-by-ticket', ticket),
  getServiceHistory: (id: number) => invokeSafe('get-service-history', id),
  addService: (data: Omit<ServiceOrder, 'id'>) => invokeSafe('add-service', data),
  updateServiceStatus: (id: number, status: string, notes: string, warrantyDays: number = 0) => invokeSafe('update-service-status', id, status, notes, warrantyDays),
  updateServiceDetails: (id: number, data: Partial<ServiceOrder>) => invokeSafe('update-service-details', id, data),
  deleteService: (id: number) => invokeSafe('delete-service', id),

  // Warranty
  checkWarranty: (deviceId: number) => invokeSafe('check-warranty', deviceId),

  // Parts
  getParts: (searchQuery: string, page: number, limit: number, sortBy: string = 'name_asc') => invokeSafe('get-parts', searchQuery, page, limit, sortBy),
  getPart: (id: number) => invokeSafe('get-part', id),
  addPart: (data: Omit<Part, 'id'>) => invokeSafe('add-part', data),
  updatePart: (id: number, data: Partial<Part>) => invokeSafe('update-part', id, data),

  deletePart: (id: number) => invokeSafe('delete-part', id),


  // Service Items
  getServiceItems: (serviceId: number) => invokeSafe('get-service-items', serviceId),
  addServiceItem: (data: Omit<ServiceItem, 'id'>) => invokeSafe('add-service-item', data),
  deleteServiceItem: (id: number) => invokeSafe('delete-service-item', id),

  // Payments
  getPayments: (serviceId: number) => invokeSafe('get-payments', serviceId),
  addPayment: (data: Omit<Payment, 'id'>) => invokeSafe('add-payment', data),
  deletePayment: (id: number) => invokeSafe('delete-payment', id),

  // Settings
  getSettings: () => invokeSafe('get-settings'),
  updateSettings: (data: Settings) => invokeSafe('update-settings', data),

  // Reports
  getIncomeReport: (start: string, end: string) => invokeSafe('get-income-report', start, end),
  getCompletedServices: (start: string, end: string) => invokeSafe('get-completed-services', start, end),
  getTopSpareparts: (start: string, end: string) => invokeSafe('get-top-spareparts', start, end),
  getReportBreakdown: (start: string, end: string) => invokeSafe('get-report-breakdown', start, end),


  // Backup & Restore
  getDbSize: () => invokeSafe('get-db-size'),
  backupDatabase: () => invokeSafe('backup-database'),
  restoreDatabase: () => invokeSafe('restore-database'),
  selectDirectory: () => invokeSafe('select-directory'),

  // Export
  exportPdf: (data: unknown) => invokeSafe('export-pdf', data),
  openExternalUrl: (url: string) => invokeSafe('open-external-url', url),
  getLogoBase64: () => invokeSafe('get-logo-base64'),
  getSignatureBase64: () => invokeSafe('get-signature-base64'),
  showNotification: (title: string, body: string) => invokeSafe('show-notification', { title, body }),
  
  // Print & Preview
  printPreview: (options?: Record<string, unknown>) => invokeSafe('print-preview', options),

  // Keranjang Sampah (Recycle Bin)
  getDeletedItems: () => invokeSafe('get-deleted-items'),
  restoreItem: (id: number, type: 'customer' | 'device' | 'service' | 'part') => invokeSafe('restore-item', id, type),
  hardDeleteItem: (id: number, type: 'customer' | 'device' | 'service' | 'part') => invokeSafe('hard-delete-item', id, type),

  // System Events (Backend -> Frontend)
  onSystemEvent: (callback: (event: IpcRendererEvent, data: SystemEvent) => void) => {
    ipcRenderer.on('system-event', callback);
    return () => ipcRenderer.removeListener('system-event', callback);
  }
});
