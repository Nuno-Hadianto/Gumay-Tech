<template>
  <div class="view-section">
    <div class="action-bar-container">
      <SearchBar
        v-model="searchQuery"
        @input="debounceSearch"
        placeholder="Cari tiket, pelanggan, perangkat..."
      />

      <div class="action-buttons">
        <select v-model="sortBy" @change="loadServices(1)" class="form-control sort-select">
          <option value="name_asc">Urutan: Nama Pelanggan (A-Z)</option>
          <option value="name_desc">Urutan: Nama Pelanggan (Z-A)</option>
          <option value="id_desc">Urutan: Terbaru Dibuat</option>
          <option value="id_asc">Urutan: Terlama Dibuat</option>
        </select>

        <button @click="openAddModal" class="btn btn-primary add-btn">
          <Plus :size="18" /> Buat Tiket Servis
        </button>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>No. Tiket</th>
            <th>Pelanggan</th>
            <th>Perangkat</th>
            <th>Status</th>
            <th>Total Biaya</th>
            <th style="text-align: center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="services.length === 0">
            <td colspan="6" class="empty-state">
              <div class="empty-state-content">
                <div class="empty-icon">
                  <Wrench :size="48" />
                </div>
                <h3>Belum Ada Data Servis</h3>
                <p>Klik tombol "Buat Tiket Servis" di atas untuk menambahkan data pertama Anda.</p>
              </div>
            </td>
          </tr>
          <tr v-for="s in services" :key="s.id">
            <td>
              <strong>{{ s.ticket_number }}</strong>
            </td>
            <td>{{ s.customer_name }}</td>
            <td>{{ s.brand || '' }} {{ s.model || '' }}</td>
            <td>
              <StatusBadge :status="s.service_status" />
              <div v-if="isWarrantyActive(s.warranty_end_date)" class="warranty-badge">
                🛡️ Garansi Aktif
              </div>
            </td>
            <td>
              <div>{{ formatCurrency(s.total_cost) }}</div>
              <div
                v-if="
                  s.payment_status === 'Gratis' &&
                  s.customer_complaint &&
                  s.customer_complaint.includes('Klaim Garansi')
                "
                class="claim-badge"
              >
                🛠️ Klaim Garansi
              </div>
            </td>
            <td>
              <div class="action-cell">
                <button class="btn btn-secondary btn-sm action-btn" @click="openEditModal(s)">
                  <Edit :size="14" /> Edit
                </button>
                <button class="btn btn-primary btn-sm action-btn" @click="goToDetail(s.id)">
                  <Info :size="14" /> Detail
                </button>
                <button
                  class="btn btn-danger btn-sm action-btn"
                  @click="deleteService(s.id, s.ticket_number)"
                >
                  <Trash2 :size="14" /> Hapus
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination :current-page="currentPage" :total-pages="totalPages" @change="loadServices" />

    <ServiceFormModal
      :is-open="isModalOpen"
      :title="modalTitle"
      :is-add-mode="!editId"
      :customers="customers"
      :initial-data="formInitialData"
      @close="isModalOpen = false"
      @save="saveService"
    />
  </div>
</template>

<script setup lang="ts">
import { Plus, Edit, Trash2, Info, Wrench } from 'lucide-vue-next'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { ServiceOrder, Customer } from '../../shared/types'
import { ServiceOrderSchema } from '@/utils/validators'
import { ServiceOrderService } from '@/services/ServiceOrderService'
import { CustomerService } from '@/services/CustomerService'
import { useAppCacheStore } from '@/stores/appCacheStore'
import { Toast, AppAlert, ConfirmDialog } from '@/utils/alert'
import { useDataTable } from '@/composables/useDataTable'

import SearchBar from '@/components/common/SearchBar.vue'
import Pagination from '@/components/common/Pagination.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ServiceFormModal from '@/components/modals/ServiceFormModal.vue'

const router = useRouter()
const route = useRoute()
const cacheStore = useAppCacheStore()

const {
  items: services,
  searchQuery,
  sortBy,
  currentPage,
  totalPages,
  loadData: loadServices,
  debounceSearch
} = useDataTable<ServiceOrder>({
  fetchFn: (search, page, limit, sort) =>
    ServiceOrderService.getAll(search, page, limit, undefined, sort),
  defaultSort: 'id_desc',
  cacheData: cacheStore.services,
  setCache: cacheStore.setServiceCache
})

const customers = ref<Customer[]>([])

const formatCurrency = (amount: number | string | undefined | null) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(amount || 0))
}

const isWarrantyActive = (dateStr?: string) => {
  if (!dateStr) return false
  return new Date(dateStr) >= new Date()
}

const loadCustomersDropdown = async () => {
  try {
    const result = await CustomerService.getAll('', 1, 1000)
    customers.value = (result.data as Customer[]) || []
  } catch (error) {
    console.error('Failed to load customers for dropdown:', error)
  }
}

const goToDetail = (id: number) => {
  router.push(`/services/${id}`)
}

const deleteService = async (id: number, ticketNo: string) => {
  const result = await ConfirmDialog.fire({
    title: 'Hapus Tiket Servis?',
    text: `Anda yakin ingin menghapus tiket ${ticketNo}? Tindakan ini tidak bisa dibatalkan!`,
    confirmButtonText: 'Ya, Hapus!'
  })

  if (result.isConfirmed) {
    try {
      await ServiceOrderService.delete(id)
      Toast.fire({ icon: 'success', title: 'Tiket servis berhasil dihapus.' })
      cacheStore.invalidateServiceCache()
      cacheStore.invalidateDashboardCache()
      loadServices(currentPage.value)
    } catch (error: unknown) {
      console.error(error)
      const msg = error instanceof Error ? error.message : String(error)
      AppAlert.fire('Gagal', msg || 'Gagal menghapus tiket servis.', 'error')
    }
  }
}

// Modal Form Logic
const isModalOpen = ref<boolean>(false)
const editId = ref<number | null>(null)
const modalTitle = computed(() => (editId.value ? 'Edit Tiket Servis' : 'Buat Tiket Servis Baru'))

const formInitialData = ref<{
  customer_id: string | number
  device_id: string | number
  customer_complaint: string
  physical_condition: string
  accessories: string
}>({
  customer_id: '',
  device_id: '',
  customer_complaint: '',
  physical_condition: '',
  accessories: ''
})

const openAddModal = async () => {
  editId.value = null
  formInitialData.value = {
    customer_id: '',
    device_id: '',
    customer_complaint: '',
    physical_condition: '',
    accessories: ''
  }
  await loadCustomersDropdown()
  isModalOpen.value = true
}

const openEditModal = async (s: ServiceOrder) => {
  editId.value = s.id
  await loadCustomersDropdown()

  formInitialData.value = {
    customer_id: s.customer_id,
    device_id: s.device_id,
    customer_complaint: s.customer_complaint,
    physical_condition: s.physical_condition || '',
    accessories: s.accessories || ''
  }

  isModalOpen.value = true
}

const saveService = async (data: {
  customer_id: number
  device_id: number
  customer_complaint: string
  physical_condition: string
  accessories: string
}) => {
  try {
    // Validasi dengan Zod
    try {
      const payload = {
        ...data,
        customer_id: Number(data.customer_id),
        device_id: Number(data.device_id)
      }
      ServiceOrderSchema.parse(payload)
    } catch (validationError: unknown) {
      const err = validationError as { issues?: { message: string }[] }
      const errMsgs = err.issues?.map((e) => e.message).join('<br/>') || 'Validasi Gagal'
      AppAlert.fire({
        icon: 'error',
        title: 'Validasi Gagal',
        html: errMsgs
      })
      return
    }

    const finalPayload = {
      ...data,
      customer_id: Number(data.customer_id),
      device_id: Number(data.device_id)
    }

    if (editId.value) {
      await ServiceOrderService.updateDetails(editId.value, finalPayload)
    } else {
      await ServiceOrderService.create(finalPayload)
    }

    isModalOpen.value = false
    cacheStore.invalidateServiceCache()
    cacheStore.invalidateDashboardCache()
    loadServices(currentPage.value)
    Toast.fire({
      icon: 'success',
      title: editId.value ? 'Perubahan berhasil disimpan.' : 'Tiket servis berhasil dibuat.'
    })
  } catch (error: unknown) {
    console.error(error)
    const msg = error instanceof Error ? error.message : String(error)
    AppAlert.fire('Error', msg || 'Gagal membuat tiket servis.', 'error')
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault()
    if (!isModalOpen.value) {
      openAddModal()
    }
  }
}

onMounted(() => {
  if (route.query.search) {
    searchQuery.value = route.query.search as string
  }
  loadServices()
  loadCustomersDropdown()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
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
.warranty-badge {
  display: inline-block;
  margin-top: 6px;
  padding: 3px 8px;
  border-radius: 6px;
  background: #10b981;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}
.claim-badge {
  display: inline-block;
  margin-top: 6px;
  padding: 3px 8px;
  border-radius: 6px;
  background: #f59e0b;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2);
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
