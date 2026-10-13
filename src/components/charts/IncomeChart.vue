<template>
  <div class="chart-wrapper-main">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import Chart from 'chart.js/auto'
import { useThemeStore } from '@/stores/theme'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  data: { labels: string[]; values: number[] }
}>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

const getTextColor = () => (isDark.value ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)')
const getGridColor = () => (isDark.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')

const renderChart = () => {
  if (chartInstance) chartInstance.destroy()
  if (!chartCanvas.value) return
  if (!props.data || !props.data.labels) return

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: props.data.labels,
      datasets: [
        {
          label: 'Pendapatan',
          data: props.data.values,
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1500,
        easing: 'easeOutQuart'
      },
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: getGridColor() },
          ticks: {
            color: getTextColor(),
            callback: function (value: number | string) {
              return 'Rp ' + Number(value).toLocaleString('id-ID')
            }
          }
        },
        x: {
          grid: { display: false },
          ticks: { color: getTextColor() }
        }
      }
    }
  })
}

watch(
  () => props.data,
  () => {
    renderChart()
  },
  { deep: true }
)

watch(isDark, () => {
  if (chartInstance && chartInstance.options && chartInstance.options.scales) {
    if (chartInstance.options.scales.x && chartInstance.options.scales.x.ticks) {
      chartInstance.options.scales.x.ticks.color = getTextColor()
    }
    if (chartInstance.options.scales.y && chartInstance.options.scales.y.ticks) {
      chartInstance.options.scales.y.ticks.color = getTextColor()
    }
    if (chartInstance.options.scales.y && chartInstance.options.scales.y.grid) {
      chartInstance.options.scales.y.grid.color = getGridColor()
    }
    chartInstance.update()
  }
})

onMounted(() => {
  renderChart()
})

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>

<style scoped>
.chart-wrapper-main {
  position: relative;
  height: 250px;
  width: 100%;
}
</style>
