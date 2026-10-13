<template>
  <Transition name="glass-modal">
    <div v-if="isOpen" class="modal show">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ title }}</h2>
          <span class="close-modal" @click="close">&times;</span>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label>Pelanggan</label>
              <CustomSelect
                v-model="form.customer_id"
                :options="customerOptions"
                placeholder="-- Pilih Pelanggan --"
                @change="onCustomerChange"
              />
              <span v-if="formErrors.customer_id" class="text-danger error-text">{{
                formErrors.customer_id
              }}</span>
            </div>
            <div class="form-group">
              <label>Perangkat</label>
              <CustomSelect
                v-model="form.device_id"
                :options="deviceOptions"
                placeholder="-- Pilih Perangkat --"
                @change="onDeviceChange"
                :disabled="!form.customer_id"
              />
              <span v-if="formErrors.device_id" class="text-danger error-text">{{
                formErrors.device_id
              }}</span>
            </div>
            <div class="form-group">
              <label>Estimasi Selesai (Opsional)</label>
              <input
                type="date"
                v-model="form.estimated_completion_date"
                @input="validateField('estimated_completion_date', form.estimated_completion_date)"
                :min="minDate"
                :class="['form-control', { 'border-danger': formErrors.estimated_completion_date }]"
              />
              <span v-if="formErrors.estimated_completion_date" class="text-danger error-text">{{
                formErrors.estimated_completion_date
              }}</span>
            </div>
            <div class="form-group">
              <label>Keluhan / Kerusakan (Diisi berdasarkan laporan pelanggan)</label>
              <textarea
                v-model="form.customer_complaint"
                @input="validateField('customer_complaint', form.customer_complaint)"
                rows="3"
                required
                :class="[
                  'form-control textarea-resize',
                  { 'border-danger': formErrors.customer_complaint }
                ]"
                placeholder="Contoh: Mati total, layar bergaris..."
              ></textarea>
              <span v-if="formErrors.customer_complaint" class="text-danger error-text">{{
                formErrors.customer_complaint
              }}</span>
            </div>
            <div class="form-group">
              <label>Kelengkapan (Opsional)</label>
              <textarea
                v-model="form.accessories"
                @input="validateField('accessories', form.accessories)"
                rows="2"
                :class="[
                  'form-control textarea-resize',
                  { 'border-danger': formErrors.accessories }
                ]"
                placeholder="Contoh: Bawa charger, tas, dus..."
              ></textarea>
              <span v-if="formErrors.accessories" class="text-danger error-text">{{
                formErrors.accessories
              }}</span>
            </div>
            <div class="form-group">
              <label>Kondisi Fisik (Opsional)</label>
              <textarea
                v-model="form.physical_condition"
                @input="validateField('physical_condition', form.physical_condition)"
                rows="2"
                :class="[
                  'form-control textarea-resize',
                  { 'border-danger': formErrors.physical_condition }
                ]"
                placeholder="Contoh: Bodi bawah lecet pemakaian, layar gores..."
              ></textarea>
              <span v-if="formErrors.physical_condition" class="text-danger error-text">{{
                formErrors.physical_condition
              }}</span>
            </div>
            <div class="modal-footer action-footer">
              <button type="button" class="btn btn-cancel" @click="close">
                <X :size="16" class="icon-spacing" /> Batal
              </button>
              <button type="submit" class="btn btn-primary" :disabled="hasErrors">
                <Save :size="16" class="icon-spacing" /> Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { X, Save } from 'lucide-vue-next'
import CustomSelect from '../common/CustomSelect.vue'
import type { Customer, Device } from '../../../shared/types'
import { DeviceService } from '@/services/DeviceService'
import { ServiceOrderService } from '@/services/ServiceOrderService'
import { AppAlert } from '@/utils/alert'
import { ServiceOrderSchema } from '@/utils/validators'
import { z } from 'zod'

const props = defineProps<{
  isOpen: boolean
  title: string
  customers: Customer[]
  isAddMode: boolean
  initialData?: {
    customer_id?: string | number
    device_id?: string | number
    estimated_completion_date?: string
    customer_complaint?: string
    physical_condition?: string
    accessories?: string
  }
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (
    e: 'save',
    data: {
      customer_id: number
      device_id: number
      estimated_completion_date?: string
      customer_complaint: string
      physical_condition: string
      accessories: string
    }
  ): void
}>()

const customerDevices = ref<Device[]>([])

const customerOptions = computed(() => {
  return props.customers.map((c) => ({
    value: c.id,
    label: `${c.name} (${c.phone || '-'})`
  }))
})

const deviceOptions = computed(() => {
  return customerDevices.value.map((d) => ({
    value: d.id,
    label: `${d.brand || ''} ${d.model || ''} - ${d.device_type} (SN: ${d.serial_number || '-'})`
  }))
})

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const form = reactive({
  customer_id: '' as string | number,
  device_id: '' as string | number,
  estimated_completion_date: '',
  customer_complaint: '',
  physical_condition: '',
  accessories: ''
})

const formErrors = reactive<Record<string, string>>({})

const hasErrors = computed(() => {
  return Object.values(formErrors).some((err) => err !== '')
})

const validateField = (field: string, value: unknown) => {
  try {
    const parsedValue = field === 'customer_id' || field === 'device_id' ? Number(value) : value
    const schema = ServiceOrderSchema.pick({ [field]: true } as Record<
      keyof typeof ServiceOrderSchema.shape,
      true
    >)
    schema.parse({ [field]: parsedValue })
    formErrors[field] = ''
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      formErrors[field] = error.issues[0].message
    }
  }
}

const validateAll = () => {
  let isValid = true
  const fields = [
    'customer_id',
    'device_id',
    'estimated_completion_date',
    'customer_complaint',
    'physical_condition',
    'accessories'
  ]
  fields.forEach((field) => {
    validateField(field, form[field as keyof typeof form])
    if (formErrors[field]) isValid = false
  })
  return isValid
}

watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal) {
      form.customer_id = props.initialData?.customer_id || ''
      form.device_id = props.initialData?.device_id || ''
      form.estimated_completion_date = props.initialData?.estimated_completion_date || ''
      form.customer_complaint = props.initialData?.customer_complaint || ''
      form.physical_condition = props.initialData?.physical_condition || ''
      form.accessories = props.initialData?.accessories || ''

      // Reset errors
      Object.keys(formErrors).forEach((key) => (formErrors[key] = ''))

      if (form.customer_id) {
        await loadCustomerDevices(Number(form.customer_id))
      } else {
        customerDevices.value = []
      }
    }
  }
)

const loadCustomerDevices = async (customerId: number) => {
  try {
    customerDevices.value = (await DeviceService.getByCustomer(customerId)) as Device[]
  } catch (error) {
    console.error('Failed to load devices for customer:', error)
  }
}

const onCustomerChange = async () => {
  validateField('customer_id', form.customer_id)
  customerDevices.value = []
  form.device_id = ''
  if (form.customer_id) {
    await loadCustomerDevices(Number(form.customer_id))
  }
}

const onDeviceChange = async () => {
  validateField('device_id', form.device_id)
  if (form.device_id) {
    try {
      const warranty = await ServiceOrderService.checkWarranty(Number(form.device_id))
      if (warranty && warranty.status === 'valid') {
        const dateStr = new Date(warranty.warranty_end_date as string).toLocaleDateString('id-ID')
        AppAlert.fire({
          icon: 'warning',
          title: 'Perhatian!',
          html: `Perangkat ini <b>masih dalam masa garansi</b> dari tiket <b>${warranty.ticket_number}</b> hingga tanggal <b>${dateStr}</b>.`
        })
      }
    } catch (error) {
      console.error('Gagal mengecek garansi', error)
    }
  }
}

const close = () => {
  emit('close')
}

const submitForm = () => {
  if (!validateAll()) return
  emit('save', {
    customer_id: Number(form.customer_id),
    device_id: Number(form.device_id),
    estimated_completion_date: form.estimated_completion_date || undefined,
    customer_complaint: form.customer_complaint,
    physical_condition: form.physical_condition,
    accessories: form.accessories
  })
}
</script>

<style scoped>
.textarea-resize {
  resize: vertical;
}
.action-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid var(--border-color);
}
.action-footer .btn {
  padding: 8px 20px;
}
.icon-spacing {
  margin-right: 5px;
}
.error-text {
  font-size: 0.8rem;
  margin-top: 4px;
  display: block;
}
.border-danger {
  border-color: var(--danger) !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

/* Glass Modal Transition */
.glass-modal-enter-active,
.glass-modal-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.glass-modal-enter-active .modal-content,
.glass-modal-leave-active .modal-content {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.glass-modal-enter-from,
.glass-modal-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}
.glass-modal-enter-from .modal-content,
.glass-modal-leave-to .modal-content {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}
</style>
