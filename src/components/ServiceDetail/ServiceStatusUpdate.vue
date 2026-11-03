<template>
  <div class="hover-container" style="margin-top: 25px">
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
      <ClipboardEdit :size="20" /> Update Status & Catatan
    </h3>
    <div style="display: flex; flex-direction: column; gap: 15px">
      <div class="form-group" style="margin: 0">
        <label style="font-size: 0.85rem">Ubah Status</label>
        <select
          v-model="form.status"
          class="form-control"
          style="padding: 10px; border-radius: var(--radius-sm)"
        >
          <option :value="ServiceStatus.DITERIMA">Diterima</option>
          <option value="Pengecekan">Pengecekan</option>
          <option :value="ServiceStatus.MENUNGGU_SPAREPART">Menunggu Sparepart</option>
          <option :value="ServiceStatus.PROSES_PERBAIKAN">Proses Perbaikan</option>
          <option :value="ServiceStatus.SELESAI_BELUM_DIAMBIL">Selesai (Belum Diambil)</option>
          <option :value="ServiceStatus.SELESAI_SUDAH_DIAMBIL">Selesai (Sudah Diambil)</option>
          <option :value="ServiceStatus.BATAL">Batal</option>
        </select>
        <div
          v-if="form.status === ServiceStatus.SELESAI_SUDAH_DIAMBIL && (remainingBill || 0) > 0"
          style="
            margin-top: 8px;
            padding: 8px 12px;
            background: rgba(245, 158, 11, 0.1);
            border-left: 3px solid #f59e0b;
            border-radius: var(--radius-sm);
            font-size: 0.85rem;
            color: #d97706;
            display: flex;
            align-items: center;
            gap: 8px;
          "
        >
          <AlertCircle :size="16" style="flex-shrink: 0" />
          <span>
            <b>Catatan Kasir:</b> Perangkat masih memiliki sisa tagihan sebesar
            <strong style="color: #b45309">{{ formatCurrency(remainingBill) }}</strong> (belum lunas).
          </span>
        </div>
      </div>
      <div class="form-group" style="margin: 0">
        <label
          style="
            font-size: 0.85rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          "
        >
          Pemeriksaan & Perbaikan
        </label>
        <div style="display: flex; gap: 15px; width: 100%">
          <div style="flex: 1; display: flex; flex-direction: column; gap: 5px">
            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500"
              >HASIL DIAGNOSIS</span
            >
            <textarea
              v-model="form.diagnosis_result"
              rows="3"
              class="form-control"
              placeholder="Jelaskan kerusakan..."
              style="
                padding: 10px;
                border-radius: var(--radius-sm);
                resize: vertical;
                width: 100%;
                box-sizing: border-box;
              "
            ></textarea>
          </div>
          <div style="flex: 1; display: flex; flex-direction: column; gap: 5px">
            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500"
              >TINDAKAN DILAKUKAN</span
            >
            <textarea
              v-model="form.actions_taken"
              rows="3"
              class="form-control"
              placeholder="Jelaskan tindakan perbaikan..."
              style="
                padding: 10px;
                border-radius: var(--radius-sm);
                resize: vertical;
                width: 100%;
                box-sizing: border-box;
              "
            ></textarea>
          </div>
        </div>
      </div>
      <button
        class="btn btn-primary"
        @click="saveUpdate"
        style="align-self: flex-end; display: flex; align-items: center; gap: 6px"
      >
        <Save :size="18" /> Simpan Perubahan
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { Save, ClipboardEdit, AlertCircle } from 'lucide-vue-next'
import type { ServiceOrder } from '../../../shared/types'
import { ServiceStatus } from '../../../shared/types'

const props = defineProps<{
  service: ServiceOrder
  remainingBill?: number
}>()

const formatCurrency = (amount: number | string | undefined | null) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(amount || 0))
}

const emit = defineEmits(['save'])

const form = reactive({
  status: '',
  diagnosis_result: '',
  actions_taken: ''
})

// Initialize form when service data changes
watch(
  () => props.service,
  (newService) => {
    if (newService) {
      form.status = newService.service_status
      form.diagnosis_result = newService.diagnosis_result || ''
      form.actions_taken = newService.actions_taken || ''
    }
  },
  { immediate: true }
)

const saveUpdate = () => {
  emit('save', { ...form })
}
</script>
