"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const invokeSafe = async (channel, ...args) => {
    try {
        return await electron_1.ipcRenderer.invoke(channel, ...args);
    }
    catch (error) {
        if (error instanceof Error && error.message) {
            error.message = error.message.replace(/Error invoking remote method '.*?':\s*(Error:\s*)?/, '');
        }
        throw error;
    }
};
electron_1.contextBridge.exposeInMainWorld('api', {
    appReady: () => electron_1.ipcRenderer.send('app-ready'),
    getDashboardStats: () => invokeSafe('get-dashboard-stats'),
    getAlerts: () => invokeSafe('get-alerts'),
    // Customers
    getCustomers: (searchQuery, page, limit, sortBy = 'name_asc') => invokeSafe('get-customers', searchQuery, page, limit, sortBy),
    getCustomer: (id) => invokeSafe('get-customer', id),
    addCustomer: (data) => invokeSafe('add-customer', data),
    updateCustomer: (id, data) => invokeSafe('update-customer', id, data),
    deleteCustomer: (id) => invokeSafe('delete-customer', id),
    // Devices
    getDevices: (searchQuery, sortBy = 'name_asc') => invokeSafe('get-devices', searchQuery, sortBy),
    getDevice: (id) => invokeSafe('get-device', id),
    getDevicesByCustomer: (customerId) => invokeSafe('get-devices-by-customer', customerId),
    addDevice: (data) => invokeSafe('add-device', data),
    updateDevice: (id, data) => invokeSafe('update-device', id, data),
    deleteDevice: (id) => invokeSafe('delete-device', id),
    // Services
    getServices: (searchQuery, page, limit, technicianFilter, sortBy = 'name_asc') => invokeSafe('get-services', searchQuery, page, limit, technicianFilter, sortBy),
    getService: (id) => invokeSafe('get-service', id),
    getServiceByTicket: (ticket) => invokeSafe('get-service-by-ticket', ticket),
    getServiceHistory: (id) => invokeSafe('get-service-history', id),
    addService: (data) => invokeSafe('add-service', data),
    updateServiceStatus: (id, status, notes, warrantyDays = 0) => invokeSafe('update-service-status', id, status, notes, warrantyDays),
    updateServiceDetails: (id, data) => invokeSafe('update-service-details', id, data),
    deleteService: (id) => invokeSafe('delete-service', id),
    // Warranty
    checkWarranty: (deviceId) => invokeSafe('check-warranty', deviceId),
    // Parts
    getParts: (searchQuery, page, limit, sortBy = 'name_asc') => invokeSafe('get-parts', searchQuery, page, limit, sortBy),
    getPart: (id) => invokeSafe('get-part', id),
    addPart: (data) => invokeSafe('add-part', data),
    updatePart: (id, data) => invokeSafe('update-part', id, data),
    deletePart: (id) => invokeSafe('delete-part', id),
    // Service Items
    getServiceItems: (serviceId) => invokeSafe('get-service-items', serviceId),
    addServiceItem: (data) => invokeSafe('add-service-item', data),
    deleteServiceItem: (id) => invokeSafe('delete-service-item', id),
    // Payments
    getPayments: (serviceId) => invokeSafe('get-payments', serviceId),
    addPayment: (data) => invokeSafe('add-payment', data),
    deletePayment: (id) => invokeSafe('delete-payment', id),
    // Settings
    getSettings: () => invokeSafe('get-settings'),
    updateSettings: (data) => invokeSafe('update-settings', data),
    // Reports
    getIncomeReport: (start, end) => invokeSafe('get-income-report', start, end),
    getCompletedServices: (start, end) => invokeSafe('get-completed-services', start, end),
    getTopSpareparts: (start, end) => invokeSafe('get-top-spareparts', start, end),
    getReportBreakdown: (start, end) => invokeSafe('get-report-breakdown', start, end),
    // Backup & Restore
    getDbSize: () => invokeSafe('get-db-size'),
    backupDatabase: () => invokeSafe('backup-database'),
    restoreDatabase: () => invokeSafe('restore-database'),
    selectDirectory: () => invokeSafe('select-directory'),
    // Export
    exportPdf: (data) => invokeSafe('export-pdf', data),
    openExternalUrl: (url) => invokeSafe('open-external-url', url),
    getLogoBase64: () => invokeSafe('get-logo-base64'),
    getSignatureBase64: () => invokeSafe('get-signature-base64'),
    showNotification: (title, body) => invokeSafe('show-notification', { title, body }),
    // Print & Preview
    printPreview: (options) => invokeSafe('print-preview', options),
    // Keranjang Sampah (Recycle Bin)
    getDeletedItems: () => invokeSafe('get-deleted-items'),
    restoreItem: (id, type) => invokeSafe('restore-item', id, type),
    hardDeleteItem: (id, type) => invokeSafe('hard-delete-item', id, type),
    // System Events (Backend -> Frontend)
    onSystemEvent: (callback) => {
        electron_1.ipcRenderer.on('system-event', callback);
        return () => electron_1.ipcRenderer.removeListener('system-event', callback);
    }
});
