<template>
  <div
    class="action-bar"
    style="
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 25px;
    "
  >
    <button
      @click="$emit('back')"
      class="btn btn-secondary"
      style="display: flex; align-items: center; gap: 6px"
    >
      <span>&larr;</span> Kembali
    </button>
    <div style="display: flex; gap: 10px; flex-wrap: wrap">
      <button
        @click="$emit('send-wa')"
        class="btn btn-success"
        style="display: flex; align-items: center; gap: 6px"
      >
        <MessageCircle :size="18" /> Kirim WA
      </button>

      <button
        @click="$emit('print-nota')"
        class="btn btn-secondary"
        style="display: flex; align-items: center; gap: 6px"
      >
        <FileText :size="18" /> Cetak Tanda Terima
      </button>
      <button
        @click="$emit('print-receipt')"
        class="btn btn-primary"
        style="display: flex; align-items: center; gap: 6px"
      >
        <Printer :size="18" /> Cetak Invoice
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MessageCircle, Printer, FileText } from 'lucide-vue-next'

defineEmits(['back', 'send-wa', 'print-nota', 'print-receipt'])
</script>
