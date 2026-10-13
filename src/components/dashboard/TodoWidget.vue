<template>
  <div class="card warning-card">
    <h2 class="warning-title text-primary">
      <ClipboardList style="width: 24px; height: 24px" /> To-Do
    </h2>
    <div class="table-container table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 20%">No. Tiket</th>
            <th style="width: 45%">Keterangan</th>
            <th style="width: 20%">Status</th>
            <th style="width: 15%">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <!-- Skeleton Loading -->
          <template v-if="isLoading">
            <tr v-for="i in 3" :key="'todo-skeleton-' + i">
              <td><SkeletonLoader width="80px" height="20px" /></td>
              <td><SkeletonLoader width="150px" height="20px" /></td>
              <td><SkeletonLoader width="60px" height="20px" borderRadius="10px" /></td>
              <td><SkeletonLoader width="50px" height="20px" borderRadius="12px" /></td>
            </tr>
          </template>

          <!-- Actual Data -->
          <template v-else>
            <tr v-if="!items || items.length === 0">
              <td colspan="4" class="text-center empty-state">
                Tidak ada tugas mendesak hari ini.
              </td>
            </tr>
            <tr
              v-for="todo in items"
              :key="todo.id"
              @click="$router.push('/services/' + todo.id)"
              class="clickable-row"
              title="Klik untuk Buka Detail"
            >
              <td class="ticket-col">{{ todo.ticket_number }}</td>
              <td>
                <strong>{{ todo.description }}</strong>
              </td>
              <td>
                <span v-if="todo.type === 'overdue'" class="badge badge-danger">Terlewat</span>
                <span v-else-if="todo.type === 'deadline_today'" class="badge badge-warning"
                  >Hari Ini</span
                >
                <span v-else class="badge badge-info">Menunggu</span>
              </td>
              <td>
                <button class="btn-action" @click.stop="$router.push('/services/' + todo.id)">
                  <ArrowRight :size="14" :stroke-width="2.5" /> Buka
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
import { ClipboardList, ArrowRight } from 'lucide-vue-next'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import type { TodoItem } from '../../../shared/types'
import { useRouter } from 'vue-router'

defineProps<{
  items: TodoItem[]
  isLoading: boolean
}>()

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
}
.btn-action {
  background: linear-gradient(135deg, var(--primary), #4f46e5);
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
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
  transition: all 0.2s ease;
  cursor: pointer;
}
.btn-action svg {
  transition: transform 0.2s ease;
}
.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(99, 102, 241, 0.4);
  background: linear-gradient(135deg, #6b70f0, #4f46e5);
}
.btn-action:hover svg {
  transform: translateX(3px);
}
.btn-action:active {
  transform: scale(0.95);
}
.text-center {
  text-align: center;
}
</style>
