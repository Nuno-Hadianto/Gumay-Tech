<template>
  <div class="view-section">
    <div class="action-bar header-actions">
      <div class="filter-group">
        <Calendar class="calendar-icon" :size="18" />
        <span class="filter-label">Filter:</span>
        <input
          type="date"
          v-model="startDate"
          @change="generateReport"
          class="form-control modern-date-input"
        />
        <span class="filter-label">s/d</span>
        <input
          type="date"
          v-model="endDate"
          @change="generateReport"
          class="form-control modern-date-input"
        />
        <button @click="generateReport" class="btn btn-primary btn-generate">
          <Filter :size="16" /> Tampilkan
        </button>
      </div>
    </div>

    <!-- Stats Summary -->
    <div class="stats-grid">
      <StatCard
        title="Omset Keseluruhan"
        :value="formatCurrency(totalOmset)"
        variant="primary"
        :center="true"
        :borderTop="true"
      >
        <template #icon-small><Wallet :size="16" /></template>
      </StatCard>
      <StatCard
        title="Total Modal (HPP)"
        :value="formatCurrency(totalModal)"
        variant="danger"
        :center="true"
        :borderTop="true"
      >
        <template #icon-small><TrendingDown :size="16" /></template>
      </StatCard>
      <StatCard
        title="Laba Bersih (Estimasi)"
        :value="formatCurrency(netProfit)"
        variant="success"
        :center="true"
        :borderTop="true"
      >
        <template #icon-small><TrendingUp :size="16" /></template>
      </StatCard>
      <StatCard
        title="Transaksi Selesai"
        :value="services.length"
        variant="warning"
        :center="true"
        :borderTop="true"
      >
        <template #icon-small><CheckCircle :size="16" /></template>
      </StatCard>
    </div>

    <!-- Breakdown Section -->
    <h3 class="section-title">Rincian Pendapatan & Margin</h3>
    <div class="breakdown-grid">
      <StatCard
        title="Omset Jasa Servis"
        :value="formatCurrency(breakdownData?.jasa?.omset)"
        variant="primary"
        :center="true"
        :borderTop="true"
      >
        <template #icon-small><Wallet :size="16" /></template>
      </StatCard>
      <StatCard
        title="Omset Sparepart"
        :value="formatCurrency(breakdownData?.sparepart?.omset)"
        variant="primary"
        :center="true"
        :borderTop="true"
      >
        <template #icon-small><Wallet :size="16" /></template>
      </StatCard>
      <StatCard
        title="Modal Sparepart (HPP)"
        :value="formatCurrency(breakdownData?.sparepart?.modal)"
        variant="danger"
        :center="true"
        :borderTop="true"
      >
        <template #icon-small><TrendingDown :size="16" /></template>
      </StatCard>
      <StatCard
        title="Margin Sparepart (Laba)"
        :value="
          formatCurrency(
            (breakdownData?.sparepart?.omset || 0) - (breakdownData?.sparepart?.modal || 0)
          )
        "
        variant="success"
        :center="true"
        :borderTop="true"
      >
        <template #icon-small><TrendingUp :size="16" /></template>
      </StatCard>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>No. Tiket</th>
            <th>Tanggal Selesai</th>
            <th>Pelanggan</th>
            <th>Perangkat</th>
            <th>Total Biaya</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="services.length === 0">
            <td colspan="5" class="empty-state">
              <div class="empty-state-content">
                <div class="empty-icon">
                  <Inbox :size="48" />
                </div>
                <h3>Tidak Ada Transaksi</h3>
                <p>Tidak ada transaksi selesai pada periode ini.</p>
              </div>
            </td>
          </tr>
          <tr v-for="s in services" :key="s.id">
            <td>{{ s.ticket_number }}</td>
            <td>{{ new Date(s.completed_date + 'Z').toLocaleDateString('id-ID') }}</td>
            <td>{{ s.customer_name }}</td>
            <td>{{ s.brand || '' }} {{ s.model || '' }}</td>
            <td>{{ formatCurrency(s.total_cost) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Calendar,
  Wallet,
  TrendingDown,
  TrendingUp,
  CheckCircle,
  Filter,
  Inbox
} from 'lucide-vue-next'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import StatCard from '@/components/StatCard.vue'
import type { ServiceOrder } from '../../shared/types'
import { ReportService } from '@/services/ReportService'
import { useAppCacheStore } from '@/stores/appCacheStore'

const cacheStore = useAppCacheStore()

const startDate = ref<string>('')
const endDate = ref<string>('')
const services = ref<ServiceOrder[]>([])

const totalOmset = ref<number>(0)
const totalModal = ref<number>(0)
const netProfit = ref<number>(0)
const breakdownData = ref<Record<string, Record<string, number>> | null>(null)

const formatCurrency = (val: number | string | undefined | null) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(val || 0))

// Auto-refresh laporan jika data transaksi/servis di-update di modul lain
watch(
  () => cacheStore.services.hasCached,
  (hasCached) => {
    if (!hasCached) {
      generateReport()
    }
  }
)

onMounted(() => {
  const d = new Date()
  endDate.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  startDate.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
  generateReport()

  window.addEventListener('focus', generateReport)
})

onUnmounted(() => {
  window.removeEventListener('focus', generateReport)
})

const generateReport = async () => {
  if (!startDate.value || !endDate.value) return
  try {
    const data = (await ReportService.getCompletedServices(
      startDate.value,
      endDate.value
    )) as unknown as (ServiceOrder & { total_modal?: number })[]
    services.value = data

    let omset = 0
    let modal = 0
    data.forEach((s) => {
      omset += s.total_cost || 0
      modal += s.total_modal || 0
    })

    totalOmset.value = omset
    totalModal.value = modal
    netProfit.value = omset - modal

    const bd = await ReportService.getReportBreakdown(startDate.value, endDate.value)
    breakdownData.value = bd as Record<string, Record<string, number>>
  } catch (error) {
    console.error(error)
  }
}
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 25px;
}
.filter-group {
  display: flex;
  gap: 10px;
  align-items: center;
}
.filter-label {
  font-weight: 500;
  color: var(--text-muted);
}
.modern-date-input {
  width: 170px;
  border-radius: 20px;
  padding: 8px 15px;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}
.btn-generate {
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}
.section-title {
  margin-bottom: 15px;
  color: var(--text-primary);
}
.breakdown-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
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

.calendar-icon {
  opacity: 0.5;
  color: var(--text-primary);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
}
.calendar-icon:hover {
  opacity: 1;
  color: var(--primary);
  transform: scale(1.2) rotate(-10deg);
}
</style>
