<template>
  <div class="fade-in dashboard-page">
    <div class="stats-grid">
      <StatCard
        title="Servis Hari Ini"
        :value="stats.todayServices"
        variant="primary"
        clickable
        @click="$router.push('/services?search=Hari Ini')"
      >
        <template #icon><Wrench :size="28" :stroke-width="2" /></template>
      </StatCard>

      <StatCard
        title="Sedang Dikerjakan"
        :value="stats.inProgress"
        variant="warning"
        clickable
        @click="$router.push('/services?search=Sedang Dikerjakan')"
      >
        <template #icon><Hourglass :size="28" :stroke-width="2" /></template>
      </StatCard>

      <StatCard
        title="Selesai"
        :value="stats.completed"
        variant="success"
        clickable
        @click="$router.push('/services?search=Selesai')"
      >
        <template #icon><CheckCircle :size="28" :stroke-width="2" /></template>
      </StatCard>

      <StatCard
        title="Pendapatan Bulan Ini"
        :value="formatCurrency(stats.incomeMonth)"
        variant="info"
      >
        <template #icon><Wallet :size="28" :stroke-width="2" /></template>
      </StatCard>

      <StatCard
        title="Laba Bersih Bulan Ini"
        :value="formatCurrency(stats.labaBersih)"
        variant="success"
        :valueClass="stats.labaBersih >= 0 ? 'text-success' : 'text-danger'"
      >
        <template #icon><TrendingUp :size="28" :stroke-width="2" /></template>
      </StatCard>
    </div>

    <div class="dashboard-grid">
      <!-- Kiri Atas (2fr): Tren Pendapatan -->
      <div class="card chart-container">
        <h2 class="chart-title">
          <LineChart style="width: 24px; height: 24px" class="text-primary" /> Tren Pendapatan (6
          Bulan)
        </h2>
        <IncomeChart v-if="stats.chartData" :data="stats.chartData" />
      </div>

      <!-- Kanan Atas (1fr): Distribusi Status -->
      <div class="card chart-container">
        <h2 class="chart-title">
          <PieChart style="width: 24px; height: 24px" class="text-info" /> Distribusi Status Servis
        </h2>
        <StatusChart v-if="stats.serviceStatusChart" :data="stats.serviceStatusChart" />
      </div>

      <!-- Bawah: Todo Teknisi (Full Width) -->
      <TodoWidget :items="stats.todoItems" :isLoading="isLoading" style="grid-column: 1 / -1" />

      <!-- Paling Bawah: Peringatan Follow-up (Full Width) -->
      <AbandonedWidget
        :items="stats.abandonedServices"
        :isLoading="isLoading"
        @send-wa="sendWaDashboard"
        style="grid-column: 1 / -1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

import {
  Wrench,
  Hourglass,
  CheckCircle,
  Wallet,
  TrendingUp,
  LineChart,
  PieChart
} from 'lucide-vue-next'
import StatCard from '@/components/StatCard.vue'
import TodoWidget from '@/components/dashboard/TodoWidget.vue'
import AbandonedWidget from '@/components/dashboard/AbandonedWidget.vue'
import IncomeChart from '@/components/charts/IncomeChart.vue'
import StatusChart from '@/components/charts/StatusChart.vue'
import type { DashboardStats, AbandonedService } from '../../shared/types'
import { DashboardService } from '@/services/DashboardService'
import { SettingsService } from '@/services/SettingsService'
import { useAppCacheStore } from '@/stores/appCacheStore'

const isLoading = ref(true)

const stats = ref<DashboardStats>({
  todayServices: 0,
  inProgress: 0,
  completed: 0,
  incomeMonth: 0,
  labaBersih: 0,
  chartData: { labels: [], values: [] },
  serviceStatusChart: { labels: [], values: [] },
  topPartsChart: { labels: [], values: [] },
  abandonedServices: [],
  todoItems: []
})

const waTemplate = ref<string>('')

const formatCurrency = (amount: number | string | undefined | null) => {
  return 'Rp ' + parseInt(String(amount || 0)).toLocaleString('id-ID')
}

const sendWaDashboard = (srv: AbandonedService) => {
  if (!srv.customer_phone) {
    if (window.Swal) window.Swal.fire('Info', 'Pelanggan tidak memiliki nomor telepon', 'info')
    return
  }

  const targetPhone = srv.customer_phone.replace(/^0/, '62')

  let text = `Halo Kak ${srv.customer_name},
Mengingatkan bahwa perangkat Anda dengan No Tiket *${srv.ticket_number}* saat ini berstatus: *${srv.service_status}*.
Mohon konfirmasinya. Terima kasih.`

  if (waTemplate.value) {
    text = waTemplate.value
      .replace(/{nama}/g, srv.customer_name)
      .replace(/{tiket}/g, srv.ticket_number)
      .replace(/{status}/g, srv.service_status)
  }

  const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`
  if (window.api && window.api.openExternalUrl) {
    window.api.openExternalUrl(url)
  } else {
    window.open(url, '_blank')
  }
}

const loadDashboard = async () => {
  const cacheStore = useAppCacheStore()

  if (cacheStore.dashboard.hasCached && cacheStore.dashboard.stats) {
    stats.value = cacheStore.dashboard.stats
    isLoading.value = false
  } else {
    isLoading.value = true
  }

  try {
    const data = await DashboardService.getStats()
    stats.value = data
    cacheStore.setDashboardCache(data)

    const settings = await SettingsService.getSettings()
    if (settings && settings.wa_template_status) {
      waTemplate.value = settings.wa_template_status
    }
  } catch (error) {
    console.error('Failed to load dashboard stats:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadDashboard()
})
</script>

<style scoped>
.dashboard-page {
  padding-bottom: 20px;
}

.chart-title {
  font-size: 1.1rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.chart-container:hover .chart-title svg {
  animation: wiggle 0.4s ease-in-out forwards;
}
.text-primary {
  color: var(--primary);
}
.text-info {
  color: var(--info);
}
.text-success {
  color: #10b981;
}
.text-danger {
  color: #ef4444;
}
</style>
