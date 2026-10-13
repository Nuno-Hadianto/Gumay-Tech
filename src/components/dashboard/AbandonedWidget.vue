<template>
  <div class="card warning-card">
    <div class="warning-header">
      <h2 class="warning-title text-danger">
        <AlertOctagon style="width: 24px; height: 24px" /> Peringatan Follow-up Pelanggan
      </h2>
    </div>
    <div class="table-container table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 20%; white-space: nowrap">No. Tiket</th>
            <th style="width: 45%; white-space: nowrap">Status</th>
            <th style="width: 20%; white-space: nowrap">Lama (Hari)</th>
            <th style="width: 15%; white-space: nowrap">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <!-- Skeleton Loading -->
          <template v-if="isLoading">
            <tr v-for="i in 3" :key="'abandoned-skeleton-' + i">
              <td><SkeletonLoader width="80px" height="20px" /></td>
              <td><SkeletonLoader width="100px" height="20px" borderRadius="10px" /></td>
              <td><SkeletonLoader width="60px" height="20px" borderRadius="10px" /></td>
              <td><SkeletonLoader width="40px" height="20px" borderRadius="12px" /></td>
            </tr>
          </template>

          <!-- Actual Data -->
          <template v-else>
            <tr v-if="!items || items.length === 0">
              <td colspan="4" class="text-center empty-state">
                Tidak ada barang tertunda/terlantar.
              </td>
            </tr>
            <tr
              v-for="srv in items"
              :key="srv.id"
              @click="$router.push('/services/' + srv.id)"
              class="clickable-row"
              title="Klik untuk Buka Detail"
            >
              <td class="ticket-col">{{ srv.ticket_number }}</td>
              <td>
                <span class="badge badge-warning" style="white-space: nowrap">{{
                  srv.service_status
                }}</span>
              </td>
              <td>
                <span class="badge badge-danger" style="white-space: nowrap">
                  {{ srv.days_pending }} Hari
                </span>
              </td>
              <td>
                <button @click.stop="$emit('send-wa', srv)" class="btn-wa">
                  <MessageCircle :size="14" :stroke-width="2.5" /> WhatsApp
                </button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertOctagon, MessageCircle } from 'lucide-vue-next'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import type { AbandonedService } from '../../../shared/types'
import { useRouter } from 'vue-router'

defineProps<{
  items: AbandonedService[]
  isLoading: boolean
}>()

defineEmits(['send-wa'])

const $router = useRouter()
</script>

<style scoped>
.warning-title {
  margin-bottom: 15px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 8px;
}
.warning-card:hover .warning-title svg {
  animation: wiggle 0.4s ease-in-out forwards;
}
.table-scroll {
  max-height: 250px;
}
.empty-state {
  padding: 20px;
  color: #64748b;
}
.clickable-row {
  cursor: pointer;
}
.ticket-col {
  color: var(--primary);
  font-weight: bold;
  white-space: nowrap;
}
.btn-wa {
  background: linear-gradient(135deg, #25d366, #128c7e);
  color: white;
  border: none;
  padding: 6px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  box-shadow: 0 4px 10px rgba(37, 211, 102, 0.3);
  transition: all 0.2s ease;
  cursor: pointer;
}
.btn-wa:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(37, 211, 102, 0.4);
  background: linear-gradient(135deg, #2ef176, #128c7e);
}
.btn-wa:hover svg {
  animation: wiggle 0.4s ease-in-out forwards;
}
.btn-wa:active {
  transform: scale(0.95);
}
.text-center {
  text-align: center;
}
</style>
