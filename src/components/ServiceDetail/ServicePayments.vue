<template>
  <div class="card hover-container">
    <h2 style="display: flex; align-items: center; gap: 10px; color: var(--primary-color)">
      <CreditCard :size="22" /> Pembayaran
    </h2>
    <div
      style="
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        align-items: center;
      "
    >
      <span
        >Status:
        <strong :style="paymentStatusStyle(paymentStatus)">{{
          paymentStatus.toUpperCase()
        }}</strong></span
      >
    </div>

    <ul style="list-style: none; padding: 0; margin-bottom: 15px">
      <li
        v-for="p in payments"
        :key="p.id"
        style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px dashed #e2e8f0"
      >
        <div style="display: flex; justify-content: space-between">
          <strong>{{ p.payment_number }}</strong>
          <span style="color: #4f46e5; font-weight: bold">{{ formatCurrency(p.amount) }}</span>
        </div>
        <div
          style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #64748b"
        >
          <span
            >{{ new Date(p.payment_date + 'Z').toLocaleString('id-ID') }} -
            {{ p.payment_method }}</span
          >
          <button
            @click="$emit('delete', p.id)"
            class="btn-icon-danger"
            title="Hapus"
            style="width: 24px; height: 24px"
          >
            <Trash2 :size="12" />
          </button>
        </div>
      </li>
    </ul>

    <div style="background: #f8fafc; padding: 10px; border-radius: 6px">
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px">
        <span>Total Dibayar:</span>
        <strong>{{ formatCurrency(totalPaid) }}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; color: #ef4444; font-weight: bold">
        <span>Sisa Tagihan:</span>
        <span>{{ formatCurrency(remainingBill) }}</span>
      </div>
      <div v-if="remainingBill > 0" style="margin-top: 10px; display: flex; gap: 10px">
        <input
          type="number"
          v-model.number="form.amount"
          placeholder="Nominal"
          style="flex: 1; padding: 6px; border: 1px solid #e2e8f0; border-radius: 4px"
        />
        <select
          v-model="form.method"
          style="padding: 6px; border: 1px solid #e2e8f0; border-radius: 4px"
        >
          <option value="Tunai">Tunai</option>
          <option value="Transfer">Transfer</option>
          <option value="Debit/Kredit">Debit/Kredit</option>
          <option value="QRIS">QRIS</option>
        </select>
        <button @click="addPayment" class="btn btn-primary" style="padding: 6px 12px">Bayar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { Trash2, CreditCard } from 'lucide-vue-next'
import type { Payment } from '../../../shared/types'
import { PaymentStatus } from '../../../shared/types'

const props = defineProps<{
  payments: Payment[]
  paymentStatus: string
  totalPaid: number
  remainingBill: number
}>()

const emit = defineEmits(['add', 'delete'])

const form = reactive({
  amount: 0,
  method: 'Tunai'
})

// Auto-fill amount when remaining bill changes
watch(
  () => props.remainingBill,
  (newVal) => {
    if (newVal > 0) {
      form.amount = newVal
    }
  },
  { immediate: true }
)

const formatCurrency = (amount: number | string | undefined | null) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(amount || 0))
}

const paymentStatusStyle = (status: string) => {
  if (status === PaymentStatus.LUNAS) return { color: '#10b981' }
  if (status === PaymentStatus.BELUM_LUNAS) return { color: '#ef4444' }
  if (status === PaymentStatus.DP) return { color: '#f59e0b' }
  return { color: '#64748b' }
}

const addPayment = () => {
  emit('add', { ...form })
  // parent will handle resetting form state if needed, or we just leave it
}
</script>
