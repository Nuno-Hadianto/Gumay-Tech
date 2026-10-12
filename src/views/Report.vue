<template>
  <div class="view-section">
    <div class="action-bar header-actions">
      <div class="filter-group">
        <Calendar class="calendar-icon" :size="18" />
        <span class="filter-label">Filter:</span>
        <input
          type="date"
          v-model="startDate"
          class="form-control modern-date-input"
        />
        <span class="filter-label">s/d</span>
        <input
          type="date"
          v-model="endDate"
          class="form-control modern-date-input"
        />
        <button
          @click="generateReport"
          class="btn btn-primary btn-generate"
        >
          <Filter :size="16" /> Tampilkan
        </button>
      </div>
      <div class="export-actions">
        <button
          @click="exportPdf"
          class="btn btn-danger btn-export"
        >
          <Printer :size="16" /> Ekspor PDF
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
        :value="formatCurrency((breakdownData?.sparepart?.omset || 0) - (breakdownData?.sparepart?.modal || 0))"
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
  Printer,
  Wallet,
  TrendingDown,
  TrendingUp,
  CheckCircle,
  Filter,
  Inbox
} from 'lucide-vue-next'
import { ref, onMounted } from 'vue'
import {
  generateReportHtml,
  exportHtmlToPdf
} from '../utils/printUtils'
import { Toast, AppAlert } from '@/utils/alert'
import StatCard from '@/components/StatCard.vue'
import type { ServiceOrder, Settings } from '../../shared/types'
import { ReportService } from '@/services/ReportService'
import { SettingsService } from '@/services/SettingsService'

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

onMounted(() => {
  const d = new Date()
  endDate.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  startDate.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
  generateReport()
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



const getCommonData = async () => {
  const settings = (await SettingsService.getSettings()) as Settings
  const logoBase64 = window.api && window.api.getLogoBase64 ? await window.api.getLogoBase64() : ''
  return { settings, logoBase64 }
}

const exportPdf = async () => {
  if (services.value.length === 0) {
    return AppAlert.fire('Info', 'Tidak ada data untuk diekspor pada periode ini.', 'info')
  }
  try {
    const { settings, logoBase64 } = await getCommonData()
    let topParts: { part_name: string; total_sold: number; }[] = []
    try {
      topParts = (await ReportService.getTopSpareparts(startDate.value, endDate.value)) as { part_name: string; total_sold: number; }[]
    } catch (e) {
      console.error(e)
    }

    const html = generateReportHtml(
      settings,
      services.value,
      startDate.value,
      endDate.value,
      totalOmset.value,
      totalModal.value,
      netProfit.value,
      logoBase64,
      topParts
    )
    const filename = `Laporan_Keuangan_${startDate.value}_sd_${endDate.value}.pdf`

    const result = await exportHtmlToPdf(html, filename)
    if (result && result.success) {
      Toast.fire({
        icon: 'success',
        title: 'Laporan PDF berhasil disimpan!'
      })
    } else if (result && !result.canceled) {
      AppAlert.fire('Error', 'Gagal menyimpan laporan PDF: ' + (result.error || ''), 'error')
    }
  } catch (error: unknown) {
    console.error(error)
    const err = error as Error
    AppAlert.fire('Error', `Terjadi kesalahan saat memproses PDF: ${err?.message || String(error)}`, 'error')
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
.btn-generate, .btn-export {
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.export-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
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
