<template>
  <div class="view-section">
    <div class="action-bar-container">
      <SearchBar
        v-model="searchQuery"
        @input="debounceSearch"
        placeholder="Cari pelanggan (Nama / HP)..."
      />

      <select v-model="sortBy" @change="loadCustomers(1)" class="form-control sort-select">
        <option value="name_asc">Urutan: Nama (A-Z)</option>
        <option value="name_desc">Urutan: Nama (Z-A)</option>
        <option value="id_desc">Urutan: Terbaru Ditambah</option>
        <option value="id_asc">Urutan: Terlama Ditambah</option>
      </select>

      <button @click="openAddModal" class="btn btn-primary add-btn">
        <Plus :size="18" /> Tambah Pelanggan
      </button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>No. HP</th>
            <th>Alamat</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="customers.length === 0">
            <td colspan="5" class="empty-state">
              <div class="empty-state-content">
                <div class="empty-icon">
                  <FolderOpen :size="48" />
                </div>
                <h3>Belum Ada Data Pelanggan</h3>
                <p>Klik tombol "Tambah Pelanggan" di atas untuk menambahkan data pertama Anda.</p>
              </div>
            </td>
          </tr>
          <tr v-for="c in customers" :key="c.id">
            <td>{{ c.id }}</td>
            <td>{{ c.name }}</td>
            <td>{{ c.phone || '-' }}</td>
            <td>{{ c.address || '-' }}</td>
            <td>
              <button class="btn btn-secondary btn-sm action-btn" @click="editCustomer(c)">
                <Edit :size="14" /> Edit
              </button>
              <button class="btn btn-danger btn-sm action-btn" @click="deleteCustomer(c.id)">
                <Trash2 :size="14" /> Hapus
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination :current-page="currentPage" :total-pages="totalPages" @change="loadCustomers" />

    <CustomerFormModal
      :is-open="isModalOpen"
      :title="modalTitle"
      :initial-data="formInitialData"
      @close="isModalOpen = false"
      @save="saveCustomer"
    />
  </div>
</template>

<script setup lang="ts">
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-vue-next'
import { ref, onMounted } from 'vue'
import type { Customer } from '../../shared/types'
import { CustomerService } from '@/services/CustomerService'
import { useAppCacheStore } from '@/stores/appCacheStore'
import { Toast, AppAlert, ConfirmDialog } from '@/utils/alert'
import { useDataTable } from '@/composables/useDataTable'

import SearchBar from '@/components/common/SearchBar.vue'
import Pagination from '@/components/common/Pagination.vue'
import CustomerFormModal from '@/components/modals/CustomerFormModal.vue'

const cacheStore = useAppCacheStore()

const {
  items: customers,
  searchQuery,
  sortBy,
  currentPage,
  totalPages,
  loadData: loadCustomers,
  debounceSearch
} = useDataTable<Customer>({
  fetchFn: CustomerService.getAll,
  defaultSort: 'name_asc',
  cacheData: cacheStore.customers,
  setCache: cacheStore.setCustomerCache
})

// Modal Form Logic
const isModalOpen = ref<boolean>(false)
const modalTitle = ref<string>('Tambah Pelanggan')
const formId = ref<number | null>(null)
const formInitialData = ref<{ name: string; phone: string; address: string; notes: string }>({
  name: '',
  phone: '',
  address: '',
  notes: ''
})

const openAddModal = () => {
  modalTitle.value = 'Tambah Pelanggan'
  formId.value = null
  formInitialData.value = { name: '', phone: '', address: '', notes: '' }
  isModalOpen.value = true
}

const editCustomer = async (c: Customer) => {
  try {
    const detail = (await CustomerService.getById(c.id)) as Customer
    if (detail) {
      modalTitle.value = 'Edit Pelanggan'
      formId.value = detail.id || null
      formInitialData.value = {
        name: detail.name || '',
        phone: detail.phone || '',
        address: detail.address || '',
        notes: detail.notes || ''
      }
      isModalOpen.value = true
    }
  } catch (error) {
    console.error(error)
    AppAlert.fire('Error', 'Gagal memuat detail pelanggan.', 'error')
  }
}

const saveCustomer = async (data: Omit<Customer, 'id'>) => {
  try {
    if (formId.value) {
      await CustomerService.update(formId.value, data)
    } else {
      await CustomerService.create(data)
    }
    isModalOpen.value = false
    cacheStore.invalidateCustomerCache()
    cacheStore.invalidateServiceCache()
    cacheStore.invalidateDashboardCache()
    loadCustomers(currentPage.value)
    Toast.fire({
      icon: 'success',
      title: 'Data pelanggan berhasil disimpan.'
    })
  } catch (error: unknown) {
    console.error(error)
    const msg = error instanceof Error ? error.message : String(error)
    AppAlert.fire('Error', msg || 'Gagal menyimpan pelanggan.', 'error')
  }
}

const deleteCustomer = async (id: number) => {
  const result = await ConfirmDialog.fire({
    title: 'Hapus Pelanggan?',
    text: 'Apakah Anda yakin ingin menghapus pelanggan ini?',
    confirmButtonText: 'Ya, Hapus!'
  })

  if (result.isConfirmed) {
    try {
      await CustomerService.delete(id)
      Toast.fire({ icon: 'success', title: 'Pelanggan berhasil dihapus.' })
      cacheStore.invalidateCustomerCache()
      cacheStore.invalidateServiceCache()
      cacheStore.invalidateDashboardCache()
      loadCustomers(currentPage.value)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      AppAlert.fire('Error', msg || 'Gagal menghapus.', 'error')
    }
  }
}

onMounted(() => {
  loadCustomers(1)
})
</script>

<style scoped>
.action-bar-container {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
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

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-right: 5px;
}
</style>
