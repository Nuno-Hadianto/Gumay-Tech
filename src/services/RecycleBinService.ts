import type { RecycleBinItem } from '../../shared/types'

export const RecycleBinService = {
  async getAll(): Promise<{ success: boolean; data?: RecycleBinItem[]; error?: string }> {
    if (!window.api?.getDeletedItems) throw new Error('API not available')
    return window.api.getDeletedItems()
  },

  async restoreItem(
    id: number,
    type: 'customer' | 'device' | 'service' | 'part'
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    if (!window.api?.restoreItem) throw new Error('API not available')
    return window.api.restoreItem(id, type)
  },

  async deletePermanent(
    id: number,
    type: 'customer' | 'device' | 'service' | 'part'
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    if (!window.api?.hardDeleteItem) throw new Error('API not available')
    return window.api.hardDeleteItem(id, type)
  }
}
