import type { Customer } from '../../shared/types'

export const CustomerService = {
  async getAll(
    searchQuery: string,
    page: number,
    limit: number,
    sortBy?: string
  ): Promise<{ data: Customer[]; total: number; page: number }> {
    if (!window.api?.getCustomers) throw new Error('API not available')
    return window.api.getCustomers(searchQuery, page, limit, sortBy)
  },

  async getById(id: number): Promise<Customer> {
    if (!window.api?.getCustomer) throw new Error('API not available')
    return window.api.getCustomer(id)
  },

  async create(data: Omit<Customer, 'id'>): Promise<number> {
    if (!window.api?.addCustomer) throw new Error('API not available')
    return window.api.addCustomer(data)
  },

  async update(id: number, data: Partial<Customer>): Promise<number> {
    if (!window.api?.updateCustomer) throw new Error('API not available')
    return window.api.updateCustomer(id, data)
  },

  async delete(id: number): Promise<number> {
    if (!window.api?.deleteCustomer) throw new Error('API not available')
    return window.api.deleteCustomer(id)
  }
}
