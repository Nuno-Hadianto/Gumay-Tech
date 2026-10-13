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
              <label>Nama Pelanggan</label>
              <input
                type="text"
                v-model="form.name"
                @input="validateField('name', form.name)"
                required
                placeholder="Contoh: Budi Santoso"
                class="form-control"
                :class="{ 'is-invalid border-danger': formErrors.name }"
              />
              <small v-if="formErrors.name" class="error-text">{{ formErrors.name }}</small>
            </div>
            <div class="form-group">
              <label>No. HP/WhatsApp</label>
              <input
                type="text"
                v-model="form.phone"
                @input="validateField('phone', form.phone)"
                required
                placeholder="Contoh: 08123456789"
                class="form-control"
                :class="{ 'is-invalid border-danger': formErrors.phone }"
              />
              <small v-if="formErrors.phone" class="error-text">{{ formErrors.phone }}</small>
            </div>
            <div class="form-group">
              <label>Alamat (Opsional)</label>
              <textarea
                v-model="form.address"
                @input="validateField('address', form.address)"
                rows="3"
                placeholder="Alamat lengkap"
                class="form-control"
                style="resize: vertical"
                :class="{ 'is-invalid border-danger': formErrors.address }"
              ></textarea>
              <small v-if="formErrors.address" class="error-text">{{ formErrors.address }}</small>
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
import { CustomerSchema } from '@/utils/validators'
import { z } from 'zod'

const props = defineProps<{
  isOpen: boolean
  title: string
  initialData?: {
    name?: string
    phone?: string
    address?: string
    notes?: string
  }
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: { name: string; phone: string; address: string; notes: string }): void
}>()

const form = reactive({
  name: '',
  phone: '',
  address: '',
  notes: ''
})

const formErrors = reactive<Record<string, string>>({})

const hasErrors = computed(() => {
  return Object.values(formErrors).some((err) => err !== '')
})

const validateField = (field: string, value: unknown) => {
  try {
    const schema = CustomerSchema.pick({ [field]: true } as never)
    schema.parse({ [field]: value })
    formErrors[field] = ''
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      formErrors[field] = error.issues[0].message
    }
  }
}

const validateAll = () => {
  let isValid = true
  const fields = ['name', 'phone', 'address', 'notes']
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
      Object.keys(formErrors).forEach((key) => (formErrors[key] = ''))
      form.name = props.initialData?.name || ''
      form.phone = props.initialData?.phone || ''
      form.address = props.initialData?.address || ''
      form.notes = props.initialData?.notes || ''
    }
  }
)

const close = () => {
  emit('close')
}

const submitForm = () => {
  if (!validateAll()) return
  emit('save', { ...form })
}
</script>

<style scoped>
.error-text {
  color: #ef4444;
  margin-top: 4px;
  display: block;
}
.border-danger {
  border-color: var(--danger) !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
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
