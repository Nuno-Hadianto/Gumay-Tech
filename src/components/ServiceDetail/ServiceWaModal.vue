<template>
  <div
    v-if="isOpen"
    class="modal-overlay"
    style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    "
  >
    <div
      class="modal-content"
      style="
        background: var(--bg-color);
        padding: 30px;
        border-radius: var(--radius-lg);
        width: 100%;
        max-width: 500px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      "
    >
      <h2 style="margin-bottom: 20px; color: var(--primary-color)">📱 Pratinjau Pesan WhatsApp</h2>

      <div class="form-group" style="margin-bottom: 20px">
        <label
          style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-color)"
          >Isi Pesan</label
        >
        <textarea
          v-model="localMessage"
          rows="8"
          style="
            width: 100%;
            padding: 12px;
            border: 1px solid var(--border-color);
            border-radius: var(--radius-sm);
            font-family: inherit;
            font-size: 0.95rem;
            line-height: 1.5;
            resize: vertical;
          "
        ></textarea>
        <small style="color: #64748b; margin-top: 5px; display: block"
          >Anda bisa mengedit pesan ini sebelum mengirimnya.</small
        >
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px">
        <button
          @click="$emit('close')"
          class="btn btn-secondary"
          style="padding: 10px 20px; border-radius: 8px"
        >
          Batal
        </button>
        <button
          @click="confirmSend"
          class="btn"
          style="
            background-color: #25d366;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
          "
        >
          Buka di WhatsApp
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
  initialMessage: string
}>()

const emit = defineEmits(['close', 'send'])

const localMessage = ref(props.initialMessage)

watch(
  () => props.initialMessage,
  (newVal) => {
    localMessage.value = newVal
  }
)

const confirmSend = () => {
  emit('send', localMessage.value)
}
</script>
