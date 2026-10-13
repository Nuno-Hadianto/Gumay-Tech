<template>
  <div class="app-container show">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <main class="main-content">
      <Topbar :title="pageTitle" />

      <div class="content-area">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>

  <div id="print-area"></div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import type { Settings } from '../shared/types'
import Sidebar from '@/components/Sidebar.vue'
import Topbar from '@/components/Topbar.vue'
import { Toast } from '@/utils/alert'

const route = useRoute()

const themeStore = useThemeStore()

const handleGlobalKeydown = async (e: KeyboardEvent) => {
  // Abaikan jika mengetik di input, textarea, select
  const target = e.target as HTMLElement
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
    return
  }

  // Tutup modal saat tekan Escape
  if (e.key === 'Escape') {
    const closeBtn = document.querySelector('.modal.show .close-modal') as HTMLElement
    if (closeBtn) closeBtn.click()
  }
}

const pageTitle = computed<string>(() => {
  return (route.meta.title as string) || 'nuNox_servis'
})

onMounted(() => {
  if (window.api && window.api.appReady) {
    window.api.appReady()
  }

  if (window.api && window.api.onSystemEvent) {
    const cleanup = window.api.onSystemEvent(
      (_e: unknown, data: import('../shared/types').SystemEvent) => {
        if (data && data.type === 'toast') {
          Toast.fire({
            icon: data.level,
            title: data.message
          })
        }
      }
    )

    onUnmounted(() => {
      cleanup()
    })
  }

  window.addEventListener('keydown', handleGlobalKeydown)

  themeStore.initTheme()
  loadGlobalSettings()
})

const loadGlobalSettings = async () => {
  if (window.api && window.api.getSettings) {
    try {
      const settings = (await window.api.getSettings()) as Settings
      if (settings && settings.primary_color) {
        document.documentElement.style.setProperty('--primary', settings.primary_color)
      }
    } catch (e) {
      console.error('Failed to load global settings', e)
    }
  }
}

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style>
/* Global styles handled by style.css */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(-15px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(15px);
}
</style>
