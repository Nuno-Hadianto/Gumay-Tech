<template>
  <span class="badge" :style="badgeStyle">
    {{ status }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ServiceStatus } from '../../../shared/types'

const props = defineProps<{
  status: string | ServiceStatus
}>()

const badgeStyle = computed(() => {
  let bg = '#e2e8f0'
  let color = '#334155'

  if (props.status === ServiceStatus.SELESAI_SUDAH_DIAMBIL) {
    bg = '#10b981'
    color = 'white'
  } else if (props.status === ServiceStatus.SELESAI_BELUM_DIAMBIL) {
    bg = '#34d399'
    color = 'white'
  } else if (props.status === ServiceStatus.PROSES_PERBAIKAN) {
    bg = '#3b82f6'
    color = 'white'
  } else if (props.status === ServiceStatus.MENUNGGU_SPAREPART) {
    bg = '#f59e0b'
    color = 'white'
  } else if (props.status === ServiceStatus.BATAL || props.status === 'Dibatalkan') {
    bg = '#ef4444'
    color = 'white'
  }

  return {
    background: bg,
    color: color
  }
})
</script>
