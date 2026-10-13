import type { Part } from '../../shared/types'

export const PartService = {
  async getAll(
    searchQuery: string,
    page: number,
    limit: number,
    sortBy?: string
  ): Promise<{ data: Part[]; total: number }> {
    if (!window.api?.getParts) throw new Error('API not available')
    return window.api.getParts(searchQuery, page, limit, sortBy)
  },

  async getById(id: number): Promise<Part> {
    if (!window.api?.getPart) throw new Error('API not available')
    return window.api.getPart(id)
  },

  async create(data: Omit<Part, 'id'>): Promise<number> {
    if (!window.api?.addPart) throw new Error('API not available')
    return window.api.addPart(data)
  },

  async update(id: number, data: Partial<Part>): Promise<number> {
    if (!window.api?.updatePart) throw new Error('API not available')
    return window.api.updatePart(id, data)
  },

  async delete(id: number): Promise<number> {
    if (!window.api?.deletePart) throw new Error('API not available')
    return window.api.deletePart(id)
  }
}
