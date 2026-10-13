import type { ServiceOrder, ServiceHistory, ServiceItem, Payment } from '../../shared/types'

export const ServiceOrderService = {
  // Service Order Core
  async getAll(
    searchQuery: string,
    page: number,
    limit: number,
    technicianFilter?: string,
    sortBy?: string
  ): Promise<{ data: ServiceOrder[]; total: number; page: number }> {
    if (!window.api?.getServices) throw new Error('API not available')
    return window.api.getServices(searchQuery, page, limit, technicianFilter, sortBy)
  },

  async getById(id: number): Promise<ServiceOrder> {
    if (!window.api?.getService) throw new Error('API not available')
    return window.api.getService(id)
  },

  async getByTicket(ticket: string): Promise<ServiceOrder> {
    if (!window.api?.getServiceByTicket) throw new Error('API not available')
    return window.api.getServiceByTicket(ticket)
  },

  async getHistory(id: number): Promise<ServiceHistory[]> {
    if (!window.api?.getServiceHistory) throw new Error('API not available')
    return window.api.getServiceHistory(id)
  },

  async create(data: Partial<ServiceOrder>): Promise<number> {
    if (!window.api?.addService) throw new Error('API not available')
    return window.api.addService(data)
  },

  async updateStatus(
    id: number,
    status: string,
    notes: string,
    warrantyDays?: number
  ): Promise<number> {
    if (!window.api?.updateServiceStatus) throw new Error('API not available')
    return window.api.updateServiceStatus(id, status, notes, warrantyDays)
  },

  async updateDetails(id: number, data: Partial<ServiceOrder>): Promise<number> {
    if (!window.api?.updateServiceDetails) throw new Error('API not available')
    return window.api.updateServiceDetails(id, data)
  },

  async delete(id: number): Promise<number> {
    if (!window.api?.deleteService) throw new Error('API not available')
    return window.api.deleteService(id)
  },

  async checkWarranty(
    deviceId: number
  ): Promise<{
    status: string
    days_left?: number
    message?: string
    warranty_end_date?: string
    ticket_number?: string
  }> {
    if (!window.api?.checkWarranty) throw new Error('API not available')
    return window.api.checkWarranty(deviceId)
  },

  // Service Items
  async getItems(serviceId: number): Promise<ServiceItem[]> {
    if (!window.api?.getServiceItems) throw new Error('API not available')
    return window.api.getServiceItems(serviceId)
  },

  async addItem(data: Omit<ServiceItem, 'id'>): Promise<number> {
    if (!window.api?.addServiceItem) throw new Error('API not available')
    return window.api.addServiceItem(data)
  },

  async deleteItem(id: number): Promise<number> {
    if (!window.api?.deleteServiceItem) throw new Error('API not available')
    return window.api.deleteServiceItem(id)
  },

  // Payments
  async getPayments(serviceId: number): Promise<Payment[]> {
    if (!window.api?.getPayments) throw new Error('API not available')
    return window.api.getPayments(serviceId)
  },

  async addPayment(data: Omit<Payment, 'id'>): Promise<number> {
    if (!window.api?.addPayment) throw new Error('API not available')
    return window.api.addPayment(data)
  },

  async deletePayment(id: number): Promise<number> {
    if (!window.api?.deletePayment) throw new Error('API not available')
    return window.api.deletePayment(id)
  }
}
