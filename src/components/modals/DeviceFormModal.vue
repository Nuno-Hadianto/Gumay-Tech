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
                @change="validateField('customer_id', form.customer_id)"
              />
              <span v-if="formErrors.customer_id" class="text-danger error-text">{{
                formErrors.customer_id
              }}</span>
            </div>
            <div class="form-row">
              <div class="form-group flex-1">
                <label>Merek (Brand)</label>
                <input
                  type="text"
                  v-model="form.brand"
                  @input="validateField('brand', form.brand)"
                  :class="['form-control', { 'border-danger': formErrors.brand }]"
                  placeholder="Misal: Samsung, Asus"
                />
                <span v-if="formErrors.brand" class="text-danger error-text">{{
                  formErrors.brand
                }}</span>
              </div>
              <div class="form-group flex-1">
                <label>Model</label>
                <input
                  type="text"
                  v-model="form.model"
                  @input="validateField('model', form.model)"
                  :class="['form-control', { 'border-danger': formErrors.model }]"
                  placeholder="Misal: Galaxy S21"
                />
                <span v-if="formErrors.model" class="text-danger error-text">{{
                  formErrors.model
                }}</span>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group flex-1">
                <label>Tipe Perangkat</label>
                <input
                  type="text"
                  v-model="form.device_type"
                  @input="validateField('device_type', form.device_type)"
                  required
                  :class="['form-control', { 'border-danger': formErrors.device_type }]"
                  placeholder="Misal: Smartphone, Laptop"
                />
                <span v-if="formErrors.device_type" class="text-danger error-text">{{
                  formErrors.device_type
                }}</span>
              </div>
              <div class="form-group flex-1">
                <label>Serial Number (SN)</label>
                <input
                  type="text"
                  v-model="form.serial_number"
                  @input="validateField('serial_number', form.serial_number)"
                  :class="['form-control', { 'border-danger': formErrors.serial_number }]"
                  placeholder="Opsional"
                />
                <span v-if="formErrors.serial_number" class="text-danger error-text">{{
                  formErrors.serial_number
                }}</span>
              </div>
            </div>

            <div class="form-group">
              <label>Warna</label>
              <input
                type="text"
                v-model="form.color"
                @input="validateField('color', form.color)"
                :class="['form-control', { 'border-danger': formErrors.color }]"
                placeholder="Misal: Hitam, Putih"
              />
              <span v-if="formErrors.color" class="text-danger error-text">{{
                formErrors.color
              }}</span>
            </div>

            <div class="form-group">
              <label>Catatan</label>
              <textarea
                v-model="form.notes"
                @input="validateField('notes', form.notes)"
                :class="['form-control textarea-resize', { 'border-danger': formErrors.notes }]"
                placeholder="Catatan tambahan (opsional)"
              ></textarea>
              <span v-if="formErrors.notes" class="text-danger error-text">{{
                formErrors.notes
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
import { reactive, watch, computed } from 'vue'
import { X, Save } from 'lucide-vue-next'
import CustomSelect from '../common/CustomSelect.vue'
import type { Customer } from '../../../shared/types'
import { DeviceSchema } from '@/utils/validators'
import { z } from 'zod'

const props = defineProps<{
  isOpen: boolean
  title: string
  customers: Customer[]
  initialData?: {
    customer_id?: string | number
    device_type?: string
    brand?: string
    model?: string
    serial_number?: string
    color?: string
    notes?: string
  }
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (
    e: 'save',
    data: {
      customer_id: number
      device_type: string
      brand: string
      model: string
      serial_number: string
      color: string
      notes: string
    }
  ): void
}>()

const customerOptions = computed(() => {
  return props.customers.map((c) => ({
    value: c.id,
    label: `${c.name} (${c.phone || '-'})`
  }))
})

const form = reactive({
  customer_id: '' as string | number,
  device_type: 'Laptop',
  brand: '',
  model: '',
  serial_number: '',
  color: '',
  notes: ''
})

const formErrors = reactive<Record<string, string>>({})

const hasErrors = computed(() => {
  return Object.values(formErrors).some((err) => err !== '')
})

const validateField = (field: string, value: unknown) => {
  try {
    const parsedValue = field === 'customer_id' ? Number(value) : value
    // Validasi satu field saja berdasarkan schema Zod
    const schema = DeviceSchema.pick({ [field]: true } as never)
    schema.parse({ [field]: parsedValue })
    formErrors[field] = ''
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      formErrors[field] = error.issues[0].message
    }
  }
}

// Validasi seluruh form sebelum submit
const validateAll = () => {
  let isValid = true
  const fields = ['customer_id', 'device_type', 'brand', 'model', 'serial_number', 'color', 'notes']
  fields.forEach((field) => {
    validateField(field, form[field as keyof typeof form])
    if (formErrors[field]) isValid = false
  })
  return isValid
}

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      form.customer_id = props.initialData?.customer_id || ''
      form.device_type = props.initialData?.device_type || 'Laptop'
      form.brand = props.initialData?.brand || ''
      form.model = props.initialData?.model || ''
      form.serial_number = props.initialData?.serial_number || ''
      form.color = props.initialData?.color || ''
      form.notes = props.initialData?.notes || ''

      // Reset errors
      Object.keys(formErrors).forEach((key) => (formErrors[key] = ''))
    }
  }
)

const close = () => {
  emit('close')
}

const submitForm = () => {
  if (!validateAll()) return

  emit('save', {
    ...form,
    customer_id: Number(form.customer_id)
  })
}
</script>

<style scoped>
.form-row {
  display: flex;
  gap: 15px;
}
.flex-1 {
  flex: 1;
}
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
