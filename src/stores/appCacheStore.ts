import { defineStore } from 'pinia'
import type { Customer, Device, ServiceOrder, Part, DashboardStats } from '../../shared/types'

// Tipe data cache generik untuk list berhalaman (paginated)
interface ListCache<T> {
  data: T[]
  total: number
  hasCached: boolean
}

// Tipe untuk mempermudah inisialisasi state awal
function createEmptyListCache<T>(): ListCache<T> {
  return {
    data: [],
    total: 0,
    hasCached: false
  }
}

export const useAppCacheStore = defineStore('appCache', {
  state: () => ({
    customers: createEmptyListCache<Customer>(),
    devices: createEmptyListCache<Device>(),
    services: createEmptyListCache<ServiceOrder>(),
    parts: createEmptyListCache<Part>(),

    // Khusus dashboard stats (bukan list array, melainkan object stat)
    dashboard: {
      stats: null as DashboardStats | null,
      hasCached: false
    }
  }),
  actions: {
    setCustomerCache(data: Customer[], total: number) {
      this.customers.data = data
      this.customers.total = total
      this.customers.hasCached = true
    },
    setDeviceCache(data: Device[], total: number) {
      this.devices.data = data
      this.devices.total = total
      this.devices.hasCached = true
    },
    setServiceCache(data: ServiceOrder[], total: number) {
      this.services.data = data
      this.services.total = total
      this.services.hasCached = true
    },
    setPartCache(data: Part[], total: number) {
      this.parts.data = data
      this.parts.total = total
      this.parts.hasCached = true
    },
    setDashboardCache(stats: DashboardStats) {
      this.dashboard.stats = stats
      this.dashboard.hasCached = true
    },
    invalidateCustomerCache() {
      this.customers.hasCached = false
    },
    invalidateDeviceCache() {
      this.devices.hasCached = false
    },
    invalidateServiceCache() {
      this.services.hasCached = false
    },
    invalidatePartCache() {
      this.parts.hasCached = false
    },
    invalidateDashboardCache() {
      this.dashboard.hasCached = false
    },
    invalidateAllCache() {
      this.customers.hasCached = false
      this.devices.hasCached = false
      this.services.hasCached = false
      this.parts.hasCached = false
      this.dashboard.hasCached = false
    }
  }
})
