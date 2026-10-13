<template>
  <div class="view-section" style="position: relative">
    <div class="action-bar-container">
      <SearchBar
        v-model="searchQuery"
        @input="debounceSearch"
        placeholder="Cari perangkat (Merek / Model / SN)..."
      />
      <div class="action-buttons">
        <select v-model="sortBy" @change="loadDevices()" class="form-control sort-select">
          <option value="id_desc">Urutan: Terbaru</option>
          <option value="id_asc">Urutan: Terlama</option>
        </select>

        <button @click="openAddModal" class="btn btn-primary add-btn">
          <Plus :size="18" /> Tambah Perangkat
        </button>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Pelanggan</th>
            <th>Tipe & Merek</th>
            <th>SN / Warna</th>
            <th>Catatan</th>
            <th style="text-align: center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="devices.length === 0">
            <td colspan="6" class="empty-state">
              <div class="empty-state-content">
                <div class="empty-icon">
                  <Monitor :size="48" />
                </div>
                <h3>Belum Ada Data Perangkat</h3>
                <p>Klik tombol "Tambah Perangkat" di atas untuk menambahkan data pertama Anda.</p>
              </div>
            </td>
          </tr>
          <tr v-for="d in devices" :key="d.id">
            <td>{{ d.id }}</td>
            <td>
              <div style="font-weight: 500">{{ d.customer_name || 'Tidak Diketahui' }}</div>
              <div style="font-size: 0.85em; opacity: 0.8">{{ d.customer_phone || '-' }}</div>
            </td>
            <td>
              <div>{{ d.device_type }}</div>
              <div style="font-size: 0.85em; opacity: 0.8">{{ d.brand }} {{ d.model }}</div>
            </td>
            <td>
              <div>SN: {{ d.serial_number || '-' }}</div>
              <div style="font-size: 0.85em; opacity: 0.8">Warna: {{ d.color || '-' }}</div>
            </td>
            <td>
              <div
                v-if="d.notes"
                style="
                  font-size: 0.85em;
                  max-width: 200px;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  margin-top: 2px;
                "
                :title="d.notes"
              >
                {{ d.notes }}
              </div>
            </td>
            <td>
              <div class="action-cell">
                <button class="btn btn-secondary btn-sm action-btn" @click="editDevice(d)">
                  <Edit :size="14" /> Edit
                </button>
                <button class="btn btn-danger btn-sm action-btn" @click="deleteDevice(d.id)">
                  <Trash2 :size="14" /> Hapus
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination :current-page="currentPage" :total-pages="totalPages" @change="loadDevices" />

    <DeviceFormModal
      :is-open="isModalOpen"
      :title="modalTitle"
      :initial-data="formInitialData"
      :customers="customers"
      @close="isModalOpen = false"
      @save="saveDevice"
    />
  </div>
</template>

<script setup lang="ts">
import { Plus, Edit, Trash2, Monitor } from 'lucide-vue-next'
import { ref, onMounted } from 'vue'
import type { Device, Customer } from '../../shared/types'
import { DeviceService } from '@/services/DeviceService'
import { useAppCacheStore } from '@/stores/appCacheStore'
import { CustomerService } from '@/services/CustomerService'
import { Toast, AppAlert, ConfirmDialog } from '@/utils/alert'
import { useDataTable } from '@/composables/useDataTable'

import SearchBar from '@/components/common/SearchBar.vue'
import Pagination from '@/components/common/Pagination.vue'
import DeviceFormModal from '@/components/modals/DeviceFormModal.vue'

const cacheStore = useAppCacheStore()
const customers = ref<Customer[]>([])

const {
  items: devices,
  searchQuery,
  sortBy,
  currentPage,
  totalPages,
  loadData: loadDevices,
  debounceSearch
} = useDataTable<Device>({
  fetchFn: (search, page, limit, sort) => DeviceService.getAll(search, sort),
  defaultSort: 'id_desc',
  cacheData: cacheStore.devices,
  setCache: cacheStore.setDeviceCache
})

const loadCustomersDropdown = async () => {
  try {
    const result = await CustomerService.getAll('', 1, 1000)
    customers.value = (result.data as Customer[]) || []
  } catch (error) {
    console.error('Failed to load customers for dropdown:', error)
  }
}

// Modal Form Logic
const isModalOpen = ref<boolean>(false)
const modalTitle = ref<string>('Tambah Perangkat')
const formId = ref<number | null>(null)
const formInitialData = ref<{
  customer_id: string | number
  device_type: string
  brand: string
  model: string
  serial_number: string
  color: string
  notes: string
}>({
  customer_id: '',
  device_type: 'Laptop',
  brand: '',
  model: '',
  serial_number: '',
  color: '',
  notes: ''
})

const openAddModal = async () => {
  modalTitle.value = 'Tambah Perangkat'
  formId.value = null
  formInitialData.value = {
    customer_id: '',
    device_type: 'Laptop',
    brand: '',
    model: '',
    serial_number: '',
    color: '',
    notes: ''
  }

  await loadCustomersDropdown()
  isModalOpen.value = true
}

const editDevice = async (d: Device) => {
  try {
    const detail = (await DeviceService.getById(d.id)) as Device
    if (detail) {
      modalTitle.value = 'Edit Perangkat'
      formId.value = detail.id || null

      await loadCustomersDropdown()

      formInitialData.value = {
        customer_id: detail.customer_id,
        device_type: detail.device_type || '',
        brand: detail.brand || '',
        model: detail.model || '',
        serial_number: detail.serial_number || '',
        color: detail.color || '',
        notes: detail.notes || ''
      }

      isModalOpen.value = true
    }
  } catch (error) {
    console.error(error)
    AppAlert.fire('Error', 'Gagal memuat detail perangkat.', 'error')
  }
}

const saveDevice = async (data: Omit<Device, 'id'>) => {
  try {
    if (formId.value) {
      await DeviceService.update(formId.value, data)
    } else {
      await DeviceService.create(data)
    }
    isModalOpen.value = false
    cacheStore.invalidateDeviceCache()
    cacheStore.invalidateServiceCache()
    loadDevices(currentPage.value)
    Toast.fire({
      icon: 'success',
      title: 'Data perangkat berhasil disimpan.'
    })
  } catch (error: unknown) {
    console.error(error)
    const msg = error instanceof Error ? error.message : String(error)
    AppAlert.fire('Error', msg || 'Gagal menyimpan perangkat.', 'error')
  }
}

const deleteDevice = async (id: number) => {
  const result = await ConfirmDialog.fire({
    title: 'Hapus Perangkat?',
    text: 'Apakah Anda yakin ingin menghapus perangkat ini?',
    confirmButtonText: 'Ya, Hapus!'
  })

  if (result.isConfirmed) {
    try {
      await DeviceService.delete(id)
      Toast.fire({ icon: 'success', title: 'Perangkat berhasil dihapus.' })
      cacheStore.invalidateDeviceCache()
      cacheStore.invalidateServiceCache()
      loadDevices(currentPage.value)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      AppAlert.fire('Error', msg || 'Gagal menghapus.', 'error')
    }
  }
}

onMounted(() => {
  loadDevices(1)
})
</script>

<style scoped>
.action-bar-container {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
}
.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.sort-select {
  width: max-content;
  min-width: 200px;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
}
.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 20px;
}
.empty-state {
  text-align: center;
  padding: 40px 20px;
}
.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
}
.empty-icon {
  margin-bottom: 15px;
  color: var(--primary);
  display: inline-flex;
}
.empty-state-content h3 {
  margin: 0 0 10px;
  font-weight: 600;
  font-size: 1.2rem;
}
.empty-state-content p {
  margin: 0;
  font-size: 0.95rem;
}
.action-cell {
  display: flex;
  justify-content: center;
  gap: 8px;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>
