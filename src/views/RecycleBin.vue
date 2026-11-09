<template>
  <div class="view-section">
    <div
      class="action-bar"
      style="display: flex; gap: 15px; align-items: center; margin-bottom: 20px; flex-wrap: wrap"
    >
      <div style="position: relative; flex: 1; min-width: 200px; max-width: 400px">
        <Search
          class="search-icon"
          :size="18"
          style="
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            opacity: 0.5;
            color: var(--text-primary);
          "
        />
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Cari data terhapus..."
          class="form-control"
          style="width: 100%; padding-left: 38px; border-radius: 20px"
        />
      </div>

      <select
        v-model="filterType"
        class="form-control"
        style="
          width: max-content;
          min-width: 150px;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
        "
      >
        <option value="all">Semua Data</option>
        <option value="customer">Pelanggan</option>
        <option value="device">Perangkat</option>
        <option value="service">Servis</option>
        <option value="part">Sparepart</option>
      </select>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Jenis Data</th>
            <th>Nama / Deskripsi</th>
            <th>Tanggal Dihapus</th>
            <th style="width: 250px">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredItems.length === 0 && !loading">
            <td colspan="4" style="text-align: center; padding: 40px 20px">
              <div
                style="
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  opacity: 0.7;
                "
              >
                <div
                  class="empty-icon"
                  style="margin-bottom: 15px; color: var(--primary); display: inline-flex"
                >
                  <Trash2 :size="48" />
                </div>
                <h3 style="margin: 0 0 10px; font-weight: 600; font-size: 1.2rem">
                  Keranjang Sampah Kosong
                </h3>
                <p style="margin: 0; font-size: 0.95rem">Belum ada data yang dihapus saat ini.</p>
              </div>
            </td>
          </tr>
          <tr v-if="loading">
            <td colspan="4" style="text-align: center; padding: 40px 20px">Memuat data...</td>
          </tr>
          <tr v-for="item in filteredItems" :key="`${item.type}-${item.id}`">
            <td>
              <span class="badge" :class="getBadgeClass(item.type)">
                {{ getTypeName(item.type) }}
              </span>
            </td>
            <td style="font-weight: 500">{{ item.name }}</td>
            <td>{{ formatDate(item.deleted_at) }}</td>
            <td>
              <div style="display: flex; gap: 8px; flex-wrap: wrap">
                <button
                  class="btn btn-primary btn-sm"
                  @click="restoreItem(item)"
                  style="
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    flex: 1;
                    min-width: 110px;
                    white-space: nowrap;
                  "
                >
                  <RefreshCcw :size="14" /> Pulihkan
                </button>
                <button
                  class="btn btn-danger btn-sm"
                  @click="hardDeleteItem(item)"
                  style="
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    flex: 1;
                    min-width: 140px;
                    white-space: nowrap;
                  "
                >
                  <Trash :size="14" /> Hapus Permanen
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RefreshCcw, Trash, Trash2, Search } from 'lucide-vue-next'
import type { RecycleBinItem } from '../../shared/types'
import { ConfirmDialog, Toast, AppAlert } from '@/utils/alert'
import { RecycleBinService } from '@/services/RecycleBinService'
import { useAppCacheStore } from '@/stores/appCacheStore'

const cacheStore = useAppCacheStore()

const invalidateCacheForType = (type: string) => {
  if (type === 'customer') {
    cacheStore.invalidateCustomerCache()
    cacheStore.invalidateServiceCache()
  }
  if (type === 'device') {
    cacheStore.invalidateDeviceCache()
    cacheStore.invalidateServiceCache()
  }
  if (type === 'service') cacheStore.invalidateServiceCache()
  if (type === 'part') cacheStore.invalidatePartCache()
  cacheStore.invalidateDashboardCache()
}

const deletedItems = ref<RecycleBinItem[]>([])
const loading = ref(false)
const searchQuery = ref('')
const filterType = ref('all')

const filteredItems = computed(() => {
  return deletedItems.value.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchType = filterType.value === 'all' || item.type === filterType.value
    return matchSearch && matchType
  })
})

const getTypeName = (type: string) => {
  switch (type) {
    case 'customer':
      return 'Pelanggan'
    case 'device':
      return 'Perangkat'
    case 'service':
      return 'Servis'
    case 'part':
      return 'Sparepart'
    default:
      return type
  }
}

const getBadgeClass = (type: string) => {
  switch (type) {
    case 'customer':
      return 'badge-success'
    case 'device':
      return 'badge-primary'
    case 'service':
      return 'badge-warning'
    case 'part':
      return 'badge-info'
    default:
      return 'badge-secondary'
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadDeletedItems = async () => {
  loading.value = true
  try {
    const response = await RecycleBinService.getAll()
    if (response.success) {
      deletedItems.value = response.data || []
    } else {
      console.error(response.error)
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const restoreItem = async (item: RecycleBinItem) => {
  const result = await ConfirmDialog.fire({
    title: 'Pulihkan Data?',
    text: `Anda yakin ingin memulihkan ${getTypeName(item.type)} "${item.name}"? Data akan dikembalikan seperti semula.`,
    confirmButtonText: 'Ya, Pulihkan'
  })

  if (result.isConfirmed) {
    try {
      const res = await RecycleBinService.restoreItem(
        item.id,
        item.type as 'customer' | 'device' | 'service' | 'part'
      )
      if (res.success) {
        Toast.fire({ icon: 'success', title: 'Data telah dipulihkan.' })
        invalidateCacheForType(item.type)
        loadDeletedItems()
      } else {
        AppAlert.fire('Gagal', res.error || 'Terjadi kesalahan', 'error')
      }
    } catch (e) {
      console.error(e)
      AppAlert.fire('Error', 'Terjadi kesalahan sistem', 'error')
    }
  }
}

const hardDeleteItem = async (item: RecycleBinItem) => {
  const result = await ConfirmDialog.fire({
    title: 'Hapus Permanen?',
    text: `PERINGATAN: ${getTypeName(item.type)} "${item.name}" akan dihapus SELAMANYA dari database dan tidak bisa dipulihkan kembali!`,
    icon: 'warning',
    confirmButtonText: 'Ya, Hapus Permanen'
  })

  if (result.isConfirmed) {
    try {
      const res = await RecycleBinService.deletePermanent(
        item.id,
        item.type as 'customer' | 'device' | 'service' | 'part'
      )
      if (res.success) {
        Toast.fire({ icon: 'success', title: 'Data telah dihapus permanen.' })
        invalidateCacheForType(item.type)
        loadDeletedItems()
      } else {
        AppAlert.fire('Gagal', res.error || 'Terjadi kesalahan', 'error')
      }
    } catch (e) {
      console.error(e)
      AppAlert.fire('Error', 'Terjadi kesalahan sistem', 'error')
    }
  }
}

onMounted(() => {
  loadDeletedItems()
})
</script>

<style scoped>
.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
}
.badge-success {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.2);
}
.badge-primary {
  background: rgba(243, 118, 36, 0.15);
  color: var(--primary);
  border: 1px solid rgba(243, 118, 36, 0.3);
  box-shadow: 0 0 8px rgba(243, 118, 36, 0.3);
}
.badge-warning {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.2);
}
.badge-info {
  background: rgba(14, 165, 233, 0.15);
  color: #0ea5e9;
  border: 1px solid rgba(14, 165, 233, 0.3);
  box-shadow: 0 0 8px rgba(14, 165, 233, 0.2);
}
.badge-secondary {
  background: rgba(107, 114, 128, 0.15);
  color: var(--text-muted);
  border: 1px solid rgba(107, 114, 128, 0.3);
  box-shadow: 0 0 8px rgba(107, 114, 128, 0.2);
}

.spin-anim {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
