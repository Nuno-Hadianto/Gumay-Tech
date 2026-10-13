<template>
  <header class="topbar">
    <div class="topbar-title" style="display: flex; align-items: center; gap: 20px">
      <h1>{{ title }}</h1>
    </div>
    <div class="topbar-actions" style="display: flex; align-items: center; gap: 15px">
      <div class="badge datetime-badge">
        <Clock style="width: 16px; height: 16px; opacity: 0.7" />
        <span>{{ currentDate }}</span>
        <span style="opacity: 0.4; margin: 0 2px">|</span>
        <span style="font-weight: 700; letter-spacing: 0.5px">{{ currentTime }}</span>
      </div>

      <!-- Notifications -->
      <div style="position: relative" ref="notificationRef">
        <button @click="toggleNotifications" class="topbar-icon-btn">
          <Bell style="width: 18px; height: 18px" />
          <span v-if="alerts.length > 0" class="badge-count">
            {{ alerts.length }}
          </span>
        </button>

        <!-- Dropdown -->
        <div
          v-if="isNotificationOpen"
          style="
            position: absolute;
            top: 50px;
            right: 0;
            width: 320px;
            background: var(--bg-color);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
            z-index: 100;
            overflow: hidden;
          "
        >
          <div
            style="
              padding: 12px 15px;
              border-bottom: 1px solid var(--border-color);
              font-weight: 600;
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <span>Notifikasi Servis</span>
            <span
              style="
                font-size: 0.8rem;
                background: var(--primary);
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
              "
              >{{ alerts.length }} Baru</span
            >
          </div>
          <div style="max-height: 350px; overflow-y: auto">
            <div
              v-if="alerts.length === 0"
              style="
                padding: 20px;
                text-align: center;
                color: var(--text-secondary);
                font-size: 0.9rem;
              "
            >
              Tidak ada peringatan.
            </div>
            <div
              v-else
              v-for="alert in alerts"
              :key="alert.id"
              @click="goToService(alert.id)"
              style="
                padding: 12px 15px;
                border-bottom: 1px solid var(--border-color);
                cursor: pointer;
                transition: background 0.2s;
              "
              onmouseover="this.style.background = 'rgba(128, 128, 128, 0.15)'"
              onmouseout="this.style.background = 'transparent'"
            >
              <div
                style="
                  font-weight: 600;
                  font-size: 0.9rem;
                  margin-bottom: 4px;
                  color: var(--text-primary);
                "
              >
                {{ alert.ticket_number }} - {{ alert.customer_name }}
              </div>
              <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4">
                <span v-if="alert.service_status === 'Menunggu Sparepart'">
                  Menunggu sparepart selama
                  <strong style="color: #ef4444">{{ alert.days_pending }} hari</strong>.
                </span>
                <span v-else>
                  Selesai tapi belum diambil selama
                  <strong style="color: #f59e0b">{{ alert.days_pending }} hari</strong>.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button @click="toggleTheme" class="topbar-icon-btn" title="Toggle Theme">
        <Moon v-if="!isDark" style="width: 18px; height: 18px" />
        <Sun v-else style="width: 18px; height: 18px" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Clock, Sun, Moon, Bell } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/theme'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

defineProps<{
  title?: string
}>()

const currentDate = ref<string>('')
const currentTime = ref<string>('')
let timer: ReturnType<typeof setInterval> | null = null

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

const toggleTheme = () => {
  themeStore.toggleTheme()
}

const updateDateTime = () => {
  const now = new Date()
  currentDate.value = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  currentTime.value = now
    .toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    .replace(/\./g, ':') // Replace dot with colon for standard time format
}

const router = useRouter()

const alerts = ref<
  Array<{
    id: number
    ticket_number: string
    customer_name: string
    service_status: string
    days_pending: number
  }>
>([])
const isNotificationOpen = ref(false)
const notificationRef = ref<HTMLElement | null>(null)
let alertTimer: ReturnType<typeof setInterval> | null = null

const toggleNotifications = () => {
  isNotificationOpen.value = !isNotificationOpen.value
}

const goToService = (id: number) => {
  isNotificationOpen.value = false
  router.push(`/services/${id}`)
}

const loadAlerts = async () => {
  if (window.api && window.api.getAlerts) {
    try {
      alerts.value = (await window.api.getAlerts()) as Array<{
        id: number
        ticket_number: string
        customer_name: string
        service_status: string
        days_pending: number
      }>
    } catch (e) {
      console.error('Failed to load alerts', e)
    }
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (notificationRef.value && !notificationRef.value.contains(event.target as Node)) {
    isNotificationOpen.value = false
  }
}

onMounted(() => {
  updateDateTime()
  timer = setInterval(updateDateTime, 1000)

  loadAlerts()
  alertTimer = setInterval(loadAlerts, 60000) // update every minute

  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (alertTimer) clearInterval(alertTimer)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.topbar-title h1 {
  transition: all 0.3s ease;
  cursor: default;
  display: inline-block;
}

.topbar-title h1:hover {
  transform: translateY(-2px) scale(1.02);
  text-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
  color: var(--primary);
}

.topbar-icon-btn {
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.topbar-icon-btn:hover {
  background: rgba(99, 102, 241, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  border-color: var(--primary);
  color: var(--primary);
}

.topbar-icon-btn:hover svg {
  animation: wiggle 0.4s ease-in-out forwards;
}

.badge-count {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ef4444;
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.datetime-badge {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.9rem;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 20px;
  transition: all 0.2s ease;
  cursor: default;
}

.datetime-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.05);
}
</style>
