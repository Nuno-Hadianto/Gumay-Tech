/// <reference types="vite/client" />
import type {
  Customer,
  Device,
  ServiceOrder,
  Part,
  ServiceItem,
  Payment,
  Settings,
  DashboardStats,
  ServiceHistory,
  RecycleBinItem
} from '../shared/types'

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

declare global {
  interface Window {
    api: {
      appReady: () => void
      getDashboardStats: () => Promise<DashboardStats>
      getAlerts: () => Promise<unknown[]>

      // Customers
      getCustomers: (
        searchQuery: string,
        page: number,
        limit: number,
        sortBy?: string
      ) => Promise<{ data: Customer[]; total: number; page: number }>
      getCustomer: (id: number) => Promise<Customer>
      addCustomer: (data: Omit<Customer, 'id'>) => Promise<number>
      updateCustomer: (id: number, data: Partial<Customer>) => Promise<number>
      deleteCustomer: (id: number) => Promise<number>

      // Devices
      getDevices: (searchQuery: string, sortBy?: string) => Promise<Device[]>
      getDevice: (id: number) => Promise<Device>
      getDevicesByCustomer: (customerId: number) => Promise<Device[]>
      addDevice: (data: Omit<Device, 'id'>) => Promise<number>
      updateDevice: (id: number, data: Partial<Device>) => Promise<number>
      deleteDevice: (id: number) => Promise<number>

      // Services
      getServices: (
        searchQuery: string,
        page: number,
        limit: number,
        technicianFilter?: string,
        sortBy?: string
      ) => Promise<{ data: ServiceOrder[]; total: number; page: number }>
      getService: (id: number) => Promise<ServiceOrder>
      getServiceByTicket: (ticket: string) => Promise<ServiceOrder>
      getServiceHistory: (id: number) => Promise<ServiceHistory[]>
      addService: (data: Partial<ServiceOrder>) => Promise<number>
      updateServiceStatus: (
        id: number,
        status: string,
        notes: string,
        warrantyDays?: number
      ) => Promise<number>
      updateServiceDetails: (id: number, data: Partial<ServiceOrder>) => Promise<number>
      deleteService: (id: number) => Promise<number>
      checkWarranty: (
        deviceId: number
      ) => Promise<{
        status: string
        days_left?: number
        message?: string
        warranty_end_date?: string
        ticket_number?: string
      }>

      // Parts
      getParts: (
        searchQuery: string,
        page: number,
        limit: number,
        sortBy?: string
      ) => Promise<{ data: Part[]; total: number }>
      getPart: (id: number) => Promise<Part>
      addPart: (data: Omit<Part, 'id'>) => Promise<number>
      updatePart: (id: number, data: Partial<Part>) => Promise<number>

      deletePart: (id: number) => Promise<number>

      // Service Items
      getServiceItems: (serviceId: number) => Promise<ServiceItem[]>
      addServiceItem: (data: Omit<ServiceItem, 'id'>) => Promise<number>
      deleteServiceItem: (id: number) => Promise<number>

      // Payments
      getPayments: (serviceId: number) => Promise<Payment[]>
      addPayment: (data: Omit<Payment, 'id'>) => Promise<number>
      deletePayment: (id: number) => Promise<number>

      // Settings
      getSettings: () => Promise<Settings>
      updateSettings: (data: Settings) => Promise<number>

      // Reports
      getIncomeReport: (
        start: string,
        end: string
      ) => Promise<{ total_income: number; transaction_count: number }>
      getCompletedServices: (start: string, end: string) => Promise<Record<string, unknown>[]>
      getTopSpareparts: (start: string, end: string) => Promise<Record<string, unknown>[]>
      getReportBreakdown: (
        start: string,
        end: string
      ) => Promise<{
        jasa: { omset: number; modal: number }
        sparepart: { omset: number; modal: number }
        lainnya: { omset: number; modal: number }
      }>

      // Backup & Utilities
      backupDatabase: () => Promise<boolean>
      restoreDatabase: () => Promise<boolean>
      askAi: (prompt: string) => Promise<{ success: boolean; result?: string; error?: string }>
      selectDirectory: () => Promise<string | null>
      exportPdf: (data: {
        html: string
        filename: string
      }) => Promise<{ success: boolean; filePath?: string; canceled?: boolean; error?: string }>
      openExternalUrl: (url: string) => Promise<boolean>
      getLogoBase64: () => Promise<string | null>
      getSignatureBase64: () => Promise<string | null>
      printPreview: (options?: Record<string, unknown>) => Promise<boolean>

      // Keranjang Sampah (Recycle Bin)
      getDeletedItems: () => Promise<{ success: boolean; data?: RecycleBinItem[]; error?: string }>
      restoreItem: (
        id: number,
        type: 'customer' | 'device' | 'service' | 'part'
      ) => Promise<{ success: boolean; message?: string; error?: string }>
      hardDeleteItem: (
        id: number,
        type: 'customer' | 'device' | 'service' | 'part'
      ) => Promise<{ success: boolean; message?: string; error?: string }>
      onSystemEvent: (
        callback: (event: unknown, data: import('../shared/types').SystemEvent) => void
      ) => () => void
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Swal: any
  }
}
