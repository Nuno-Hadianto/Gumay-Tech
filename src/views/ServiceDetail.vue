<template>
  <div>
    <div class="view-section" v-if="service">
      <ServiceActionBar
        @back="$router.push('/services')"
        @send-wa="sendWhatsApp"
        @print-nota="printNota"
        @print-receipt="printReceipt"
      />

      <div class="dashboard-grid">
        <div class="card" style="padding: 25px">
          <ServiceInfo :service="service" />
          <ServiceStatusUpdate :service="service" @save="saveUpdate" />
          <ServiceHistory :history="history" />
        </div>

        <div>
          <ServiceItems
            :items="items"
            :parts="parts"
            :total-cost="service.total_cost"
            @add="addItem"
            @delete="deleteItem"
          />
          <ServicePayments
            :payments="payments"
            :payment-status="service.payment_status"
            :total-paid="totalPaid"
            :remaining-bill="remainingBill"
            @add="addPayment"
            @delete="deletePayment"
          />
        </div>
      </div>
    </div>

    <ServiceWaModal
      :is-open="isWaModalOpen"
      :initial-message="waMessage"
      @close="isWaModalOpen = false"
      @send="confirmSendWa"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

import type {
  ServiceOrder,
  ServiceHistory as ServiceHistoryType,
  ServiceItem as ServiceItemType,
  Payment,
  Part,
  Settings
} from '../../shared/types'
import { ServiceItemSchema, PaymentSchema } from '@/utils/validators'
import { ServiceOrderService } from '@/services/ServiceOrderService'
import { PartService } from '@/services/PartService'
import { SettingsService } from '@/services/SettingsService'
import { generateInvoiceHtml, generateNotaHtml, printHtml } from '@/utils/printUtils'
import { Toast, AppAlert, ConfirmDialog } from '@/utils/alert'
import { useAppCacheStore } from '@/stores/appCacheStore'

import ServiceActionBar from '@/components/ServiceDetail/ServiceActionBar.vue'
import ServiceInfo from '@/components/ServiceDetail/ServiceInfo.vue'
import ServiceStatusUpdate from '@/components/ServiceDetail/ServiceStatusUpdate.vue'
import ServiceHistory from '@/components/ServiceDetail/ServiceHistory.vue'
import ServiceItems from '@/components/ServiceDetail/ServiceItems.vue'
import ServicePayments from '@/components/ServiceDetail/ServicePayments.vue'
import ServiceWaModal from '@/components/ServiceDetail/ServiceWaModal.vue'

const route = useRoute()
const cacheStore = useAppCacheStore()
const service = ref<ServiceOrder | null>(null)

const history = ref<ServiceHistoryType[]>([])
const items = ref<ServiceItemType[]>([])
const payments = ref<Payment[]>([])
const parts = ref<Part[]>([])

const isWaModalOpen = ref<boolean>(false)
const waMessage = ref<string>('')

const totalPaid = computed(() => {
  return payments.value.reduce((acc, p) => acc + p.amount, 0)
})

const remainingBill = computed(() => {
  if (!service.value) return 0
  const rem = service.value.total_cost - totalPaid.value
  return rem > 0 ? rem : 0
})

const formatCurrency = (amount: number | string | undefined | null) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(amount || 0))
}

const loadServiceDetail = async () => {
  const id = route.params.id as string
  try {
    const detail = (await ServiceOrderService.getById(Number(id))) as ServiceOrder
    if (detail) {
      service.value = detail
    }
  } catch (error) {
    console.error(error)
  }
}

const loadHistory = async () => {
  const id = route.params.id as string
  try {
    history.value = (await ServiceOrderService.getHistory(Number(id))) as ServiceHistoryType[]
  } catch (e) {
    console.error(e)
  }
}

const loadItems = async () => {
  const id = route.params.id as string
  try {
    items.value = (await ServiceOrderService.getItems(Number(id))) as ServiceItemType[]
  } catch (e) {
    console.error(e)
  }
}

const loadPayments = async () => {
  const id = route.params.id as string
  try {
    payments.value = (await ServiceOrderService.getPayments(Number(id))) as Payment[]
  } catch (e) {
    console.error(e)
  }
}

const loadParts = async () => {
  try {
    const res = await PartService.getAll('', 1, 1000)
    parts.value = (res.data as Part[]) || []
  } catch (e) {
    console.error(e)
  }
}

const waTemplate = ref<string>('')
const loadSettings = async () => {
  try {
    const settings = await SettingsService.getSettings()
    if (settings && settings.wa_template_status) {
      waTemplate.value = settings.wa_template_status
    }
  } catch (e) {
    console.error(e)
  }
}

const saveUpdate = async (updateForm: {
  diagnosis_result: string
  actions_taken: string
  status: string
}) => {
  if (!service.value) return
  try {
    const data = {
      diagnosis_result: updateForm.diagnosis_result,
      actions_taken: updateForm.actions_taken
    }
    await ServiceOrderService.updateDetails(service.value.id as number, data)

    if (updateForm.status !== service.value.service_status) {
      let warrantyDays = 0
      if (updateForm.status.includes('Selesai')) {
        const { value: days, isConfirmed } = await ConfirmDialog.fire({
          title: 'Atur Garansi',
          text: 'Berapa hari garansi untuk servis ini? (Isi 0 jika tidak ada)',
          input: 'number',
          inputValue: 0,
          confirmButtonText: 'Simpan',
          cancelButtonText: 'Batal'
        })
        if (isConfirmed && days !== undefined) {
          warrantyDays = parseInt(days as string)
        }
      }
      await ServiceOrderService.updateStatus(
        service.value.id as number,
        updateForm.status,
        updateForm.actions_taken || 'Status diupdate',
        warrantyDays
      )
    }

    Toast.fire({
      icon: 'success',
      title: 'Detail servis berhasil diperbarui'
    })
    cacheStore.invalidateServiceCache()
    cacheStore.invalidateDashboardCache()
    await loadServiceDetail()
    await loadHistory()
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    AppAlert.fire('Error', msg || 'Gagal menyimpan.', 'error')
  }
}

const addItem = async (itemForm: {
  desc: string
  type: string
  qty: number
  costPrice?: number
  price: number
  selectedPartId?: string | number
}) => {
  if (!service.value) return
  const desc = itemForm.desc

  if (!desc) return AppAlert.fire('Info', 'Keterangan wajib diisi!', 'info')

  let finalSparePartId = itemForm.selectedPartId ? Number(itemForm.selectedPartId) : null

  if (itemForm.type === 'Sparepart' && !finalSparePartId) {
    try {
      const newPartId = await PartService.create({
        part_code: '',
        name: desc,
        category: 'Umum',
        buy_price: itemForm.costPrice || 0,
        sell_price: itemForm.price || 0
      })
      finalSparePartId = newPartId
    } catch (e) {
      console.warn('Gagal menyimpan otomatis ke katalog:', e)
    }
  }

  const data = {
    service_order_id: service.value.id,
    item_type: itemForm.type,
    spare_part_id: finalSparePartId,
    description: desc,
    quantity: Number(itemForm.qty),
    price: Number(itemForm.price),
    cost_price: itemForm.costPrice ? Number(itemForm.costPrice) : 0
  }

  try {
    ServiceItemSchema.parse(data)
  } catch (validationError: unknown) {
    const err = validationError as { issues: { message: string }[] }
    const errMsgs = err.issues?.map((e) => e.message).join('<br/>') || 'Validasi Gagal'
    return window.Swal.fire({ icon: 'error', title: 'Validasi Gagal', html: errMsgs })
  }

  const finalData = {
    ...data,
    total: data.quantity * data.price
  }

  try {
    await ServiceOrderService.addItem(finalData)

    cacheStore.invalidateServiceCache()
    cacheStore.invalidateDashboardCache()
    if (itemForm.type === 'Sparepart') {
      cacheStore.invalidatePartCache()
    }

    await loadItems()
    await loadServiceDetail()
    if (itemForm.type === 'Sparepart') await loadParts()
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    AppAlert.fire('Error', msg || 'Gagal menambah item.', 'error')
  }
}

const deleteItem = async (itemId: number) => {
  const result = await ConfirmDialog.fire({
    title: 'Hapus item ini?',
    confirmButtonText: 'Ya, Hapus'
  })
  if (result.isConfirmed) {
    await ServiceOrderService.deleteItem(itemId)
    cacheStore.invalidateServiceCache()
    cacheStore.invalidateDashboardCache()
    cacheStore.invalidatePartCache()
    await loadItems()
    await loadServiceDetail()
    await loadParts()
  }
}

const addPayment = async (paymentForm: { amount: number; method: string }) => {
  if (!service.value) return
  if (paymentForm.amount <= 0) return AppAlert.fire('Info', 'Nominal harus lebih dari 0', 'info')
  if (paymentForm.amount > remainingBill.value) {
    const confirm = await ConfirmDialog.fire({
      title: 'Nominal Berlebih',
      text: `Nominal yang dimasukkan (${formatCurrency(paymentForm.amount)}) lebih besar dari sisa tagihan (${formatCurrency(remainingBill.value)}). Tetap lanjutkan?`,
      confirmButtonText: 'Lanjutkan'
    })
    if (!confirm.isConfirmed) return
  }

  const data = {
    service_order_id: service.value.id,
    amount: Number(paymentForm.amount),
    payment_method: paymentForm.method,
    notes: ''
  }

  try {
    PaymentSchema.parse(data)
  } catch (validationError: unknown) {
    const err = validationError as { issues: { message: string }[] }
    const errMsgs = err.issues?.map((e) => e.message).join('<br/>') || 'Validasi Gagal'
    return AppAlert.fire({ icon: 'error', title: 'Validasi Gagal', html: errMsgs })
  }

  try {
    await ServiceOrderService.addPayment(data as Payment)
    cacheStore.invalidateServiceCache()
    cacheStore.invalidateDashboardCache()
    await loadPayments()
    await loadServiceDetail()
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    AppAlert.fire('Error', msg || 'Gagal memproses pembayaran.', 'error')
  }
}

const deletePayment = async (paymentId: number) => {
  if (!service.value) return
  const result = await ConfirmDialog.fire({
    title: 'Hapus pembayaran?',
    confirmButtonText: 'Ya, Hapus'
  })
  if (result.isConfirmed) {
    await ServiceOrderService.deletePayment(paymentId)
    cacheStore.invalidateServiceCache()
    cacheStore.invalidateDashboardCache()
    await loadPayments()
    await loadServiceDetail()
  }
}

const getCommonData = async () => {
  const settings = (await SettingsService.getSettings()) as Settings
  const logoBase64 = window.api && window.api.getLogoBase64 ? await window.api.getLogoBase64() : ''
  const signatureBase64 =
    window.api && window.api.getSignatureBase64 ? await window.api.getSignatureBase64() : ''
  return { settings, logoBase64, signatureBase64 }
}

const sendWhatsApp = () => {
  if (!service.value) return
  const phone = service.value.customer_phone
  if (!phone) {
    return AppAlert.fire('Info', 'Pelanggan tidak memiliki nomor telepon', 'info')
  }

  let text = `Halo Kak ${service.value.customer_name},
Perangkat ${service.value.brand || ''} ${service.value.model || ''} dengan No Tiket *${service.value.ticket_number}* saat ini berstatus: *${service.value.service_status}*.
Sisa Tagihan: *${formatCurrency(remainingBill.value)}*.
Terima kasih telah mempercayakan perbaikan kepada kami.`

  if (waTemplate.value) {
    text = waTemplate.value
      .replace(/{nama}/g, service.value.customer_name || '')
      .replace(/{tiket}/g, service.value.ticket_number || '')
      .replace(/{status}/g, service.value.service_status || '')
  }

  waMessage.value = text
  isWaModalOpen.value = true
}

const confirmSendWa = (finalMessage: string) => {
  if (!service.value) return
  const phone = service.value.customer_phone || ''
  const targetPhone = phone.replace(/^0/, '62')

  const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(finalMessage)}`
  if (window.api && window.api.openExternalUrl) {
    window.api.openExternalUrl(url)
  } else {
    window.open(url, '_blank')
  }
  isWaModalOpen.value = false
}

const printNota = async () => {
  if (!service.value) return
  try {
    const { settings, logoBase64, signatureBase64 } = await getCommonData()
    const html = generateNotaHtml(settings, service.value, logoBase64, signatureBase64)
    await printHtml(html, true) // landscape for nota
  } catch (error: unknown) {
    console.error(error)
    const msg = error instanceof Error ? error.message : String(error)
    AppAlert.fire('Error', msg || 'Gagal mencetak tanda terima.', 'error')
  }
}

const printReceipt = async () => {
  if (!service.value) return
  try {
    const { settings, logoBase64, signatureBase64 } = await getCommonData()
    const html = generateInvoiceHtml(
      settings,
      service.value,
      items.value,
      payments.value,
      logoBase64,
      signatureBase64
    )
    await printHtml(html, false) // portrait for invoice
  } catch (error: unknown) {
    console.error(error)
    const msg = error instanceof Error ? error.message : String(error)
    AppAlert.fire('Error', msg || 'Gagal mencetak invoice.', 'error')
  }
}

onMounted(async () => {
  await Promise.all([
    loadServiceDetail(),
    loadHistory(),
    loadItems(),
    loadPayments(),
    loadParts(),
    loadSettings()
  ])
})

onUnmounted(() => {})
</script>
