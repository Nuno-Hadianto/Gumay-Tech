<template>
  <div
    class="hover-container"
    style="margin-top: 30px; border-top: 1px solid var(--border-color); padding-top: 20px"
  >
    <h3
      style="
        margin-bottom: 15px;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--text-color);
      "
    >
      <History :size="20" /> Riwayat Status
    </h3>
    <div
      style="
        background: var(--bg-color);
        padding: 15px;
        border-radius: var(--radius-md);
        max-height: 250px;
        overflow-y: auto;
      "
    >
      <ul
        style="
          list-style: none;
          padding: 0;
          margin: 0;
          position: relative;
          border-left: 2px solid #cbd5e1;
          margin-left: 10px;
        "
      >
        <li
          v-for="h in history"
          :key="h.id"
          style="margin-bottom: 15px; padding-left: 15px; position: relative"
        >
          <span
            style="
              position: absolute;
              left: -6px;
              top: 5px;
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: var(--primary-color);
            "
          ></span>
          <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 2px">
            {{ new Date(h.created_at + 'Z').toLocaleString('id-ID') }}
          </div>
          <div style="font-weight: 600; color: var(--text-color)">{{ h.status }}</div>
          <div
            v-if="h.notes"
            style="
              font-size: 0.85rem;
              color: var(--text-muted);
              margin-top: 4px;
              background: white;
              padding: 8px;
              border-radius: 4px;
              border: 1px solid var(--border-color);
            "
          >
            {{ h.notes }}
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { History } from 'lucide-vue-next'
import type { ServiceHistory } from '../../../shared/types'

defineProps<{
  history: ServiceHistory[]
}>()
</script>
