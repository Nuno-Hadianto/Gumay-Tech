<template>
  <div class="view-section" style="position: relative">
    <div class="action-bar-container">
      <SearchBar
        v-model="searchQuery"
        @input="debounceSearch"
        placeholder="Cari item di katalog (Kode / Nama)..."
      />
      <div class="action-buttons">
        <select v-model="sortBy" @change="loadParts(1)" class="form-control sort-select">
          <option value="name_asc">Urutan: Nama (A-Z)</option>
          <option value="name_desc">Urutan: Nama (Z-A)</option>
          <option value="id_desc">Urutan: Terbaru Ditambah</option>
          <option value="id_asc">Urutan: Terlama Ditambah</option>
        </select>

        <button @click="openAddModal" class="btn btn-primary add-btn">
          <Plus :size="18" /> Tambah Item
        </button>
      </div>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama Item</th>
            <th>Kategori</th>
            <th>Harga Modal</th>
            <th>Harga Jual</th>
            <th>Margin/Pcs</th>
            <th style="text-align: center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="parts.length === 0">
            <td colspan="7" class="empty-state">
              <div class="empty-state-content">
                <div class="empty-icon">
                  <Box :size="48" />
                </div>
                <h3>Belum Ada Data Sparepart</h3>
                <p>Klik tombol "Tambah Sparepart" di atas untuk menambahkan data pertama Anda.</p>
              </div>
            </td>
          </tr>
          <tr v-for="p in parts" :key="p.id">
            <td>{{ p.part_code || '-' }}</td>
            <td>{{ p.name }}</td>
            <td>{{ p.category || '-' }}</td>
            <td>{{ formatCurrency(p.buy_price) }}</td>
            <td>{{ formatCurrency(p.sell_price) }}</td>
            <td
              :style="{
                color:
                  p.sell_price > p.buy_price
                    ? '#10b981'
                    : p.sell_price < p.buy_price
                      ? '#ef4444'
                      : 'inherit',
                fontWeight: 'bold'
              }"
            >
              {{ formatCurrency((p.sell_price || 0) - (p.buy_price || 0)) }}
              <span v-if="p.buy_price > 0" class="margin-percent">
                ({{ Math.round(((p.sell_price - p.buy_price) / p.buy_price) * 100) }}%)
              </span>
            </td>
            <td>
              <div class="action-cell">
                <button class="btn btn-secondary btn-sm action-btn" @click="editPart(p)">
                  <Edit :size="14" /> Edit
                </button>
                <button class="btn btn-danger btn-sm action-btn" @click="deletePart(p.id)">
                  <Trash2 :size="14" /> Hapus
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination :current-page="currentPage" :total-pages="totalPages" @change="loadParts" />

    <PartFormModal
      :is-open="isModalOpen"
      :title="modalTitle"
      :initial-data="formInitialData"
      @close="isModalOpen = false"
      @save="savePart"
    />
  </div>
</template>

<script setup lang="ts">
import { Plus, Edit, Trash2, Box } from 'lucide-vue-next'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { Part } from '../../shared/types'
import { PartService } from '@/services/PartService'
import { useAppCacheStore } from '@/stores/appCacheStore'
import { Toast, AppAlert, ConfirmDialog } from '@/utils/alert'
import { useDataTable } from '@/composables/useDataTable'

import SearchBar from '@/components/common/SearchBar.vue'
import Pagination from '@/components/common/Pagination.vue'
import PartFormModal from '@/components/modals/PartFormModal.vue'

const route = useRoute()
const cacheStore = useAppCacheStore()

const {
  items: parts,
  searchQuery,
  sortBy,
  currentPage,
  totalPages,
  loadData: loadParts,
  debounceSearch
} = useDataTable<Part>({
  fetchFn: PartService.getAll,
  defaultSort: 'name_asc',
  itemsPerPage: 15,
  cacheData: cacheStore.parts,
  setCache: cacheStore.setPartCache
})

watch(
  () => route.query.search,
  (newSearch) => {
    if (newSearch !== undefined) {
      searchQuery.value = newSearch as string
      loadParts(1)
    }
  }
)

const formatCurrency = (amount: number | string | undefined | null) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(amount || 0))
}

// Modal Form Logic
const isModalOpen = ref<boolean>(false)
const modalTitle = ref<string>('Tambah Sparepart')
const formId = ref<number | null>(null)
const formInitialData = ref<{
  part_code: string
  name: string
  category: string
  buy_price: number | ''
  sell_price: number | ''
}>({
  part_code: '',
  name: '',
  category: 'Sparepart',
  buy_price: '',
  sell_price: ''
})

const openAddModal = () => {
  modalTitle.value = 'Tambah Sparepart'
  formId.value = null
  formInitialData.value = {
    part_code: '',
    name: '',
    category: 'Sparepart',
    buy_price: '',
    sell_price: ''
  }
  isModalOpen.value = true
}

const editPart = async (p: Part) => {
  try {
    const detail = (await PartService.getById(p.id)) as Part
    if (detail) {
      modalTitle.value = 'Edit Sparepart'
      formId.value = detail.id || null
      formInitialData.value = {
        part_code: detail.part_code || '',
        name: detail.name || '',
        category: detail.category || '',
        buy_price: detail.buy_price || '',
        sell_price: detail.sell_price || ''
      }
      isModalOpen.value = true
    }
  } catch (error) {
    console.error(error)
    AppAlert.fire('Error', 'Gagal memuat detail data.', 'error')
  }
}

const savePart = async (data: {
  part_code: string
  name: string
  category: string
  buy_price: number | ''
  sell_price: number | ''
}) => {
  try {
    const parsedData: Omit<Part, 'id'> = {
      ...data,
      buy_price: typeof data.buy_price === 'number' ? data.buy_price : 0,
      sell_price: typeof data.sell_price === 'number' ? data.sell_price : 0
    }

    if (formId.value) {
      await PartService.update(formId.value, parsedData)
    } else {
      await PartService.create(parsedData)
    }
    isModalOpen.value = false
    cacheStore.invalidatePartCache()
    cacheStore.invalidateDashboardCache()
    loadParts(currentPage.value)
    Toast.fire({
      icon: 'success',
      title: 'Data berhasil disimpan.'
    })
  } catch (error: unknown) {
    console.error(error)
    const msg = error instanceof Error ? error.message : String(error)
    AppAlert.fire('Error', msg || 'Gagal menyimpan data.', 'error')
  }
}

const deletePart = async (id: number) => {
  const result = await ConfirmDialog.fire({
    title: 'Hapus Data?',
    text: 'Apakah Anda yakin ingin menghapus item ini?',
    confirmButtonText: 'Ya, Hapus!'
  })

  if (result.isConfirmed) {
    try {
      await PartService.delete(id)
      Toast.fire({ icon: 'success', title: 'Data berhasil dihapus.' })
      cacheStore.invalidatePartCache()
      cacheStore.invalidateDashboardCache()
      loadParts(currentPage.value)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      AppAlert.fire('Error', msg || 'Gagal menghapus.', 'error')
    }
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
  loadParts(1)
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
  gap: 6px;
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
.margin-percent {
  font-size: 0.8em;
  opacity: 0.8;
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
