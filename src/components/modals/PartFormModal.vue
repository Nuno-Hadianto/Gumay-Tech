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
            <div class="form-row">
              <div class="form-group flex-1">
                <label>Kode Barang (Opsional)</label>
                <input
                  type="text"
                  v-model="form.part_code"
                  @input="validateField('part_code', form.part_code)"
                  :class="['form-control', { 'border-danger': formErrors.part_code }]"
                  placeholder="Contoh: LCD-IP-11"
                />
                <span v-if="formErrors.part_code" class="text-danger error-text">{{
                  formErrors.part_code
                }}</span>
              </div>
              <div class="form-group flex-1">
                <label>Kategori</label>
                <input
                  type="text"
                  v-model="form.category"
                  @input="validateField('category', form.category)"
                  :class="['form-control', { 'border-danger': formErrors.category }]"
                  placeholder="Contoh: LCD, Baterai..."
                />
                <span v-if="formErrors.category" class="text-danger error-text">{{
                  formErrors.category
                }}</span>
              </div>
            </div>
            <div class="form-group">
              <label>Nama Item</label>
              <input
                type="text"
                v-model="form.name"
                @input="validateField('name', form.name)"
                required
                :class="['form-control', { 'border-danger': formErrors.name }]"
                placeholder="Nama barang"
              />
              <span v-if="formErrors.name" class="text-danger error-text">{{
                formErrors.name
              }}</span>
            </div>
            <div class="form-row">
              <div class="form-group flex-1">
                <label>Harga Beli / Modal (Rp)</label>
                <input
                  type="number"
                  v-model.number="form.buy_price"
                  @input="validateField('buy_price', form.buy_price)"
                  required
                  min="0"
                  :class="['form-control', { 'border-danger': formErrors.buy_price }]"
                />
                <span v-if="formErrors.buy_price" class="text-danger error-text">{{
                  formErrors.buy_price
                }}</span>
              </div>
              <div class="form-group flex-1">
                <label>Harga Jual (Rp)</label>
                <input
                  type="number"
                  v-model.number="form.sell_price"
                  @input="validateField('sell_price', form.sell_price)"
                  required
                  min="0"
                  :class="['form-control', { 'border-danger': formErrors.sell_price }]"
                />
                <span v-if="formErrors.sell_price" class="text-danger error-text">{{
                  formErrors.sell_price
                }}</span>
              </div>
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
import { SparepartSchema } from '@/utils/validators'
import { z } from 'zod'

const props = defineProps<{
  isOpen: boolean
  title: string
  initialData?: {
    part_code?: string
    name?: string
    category?: string
    buy_price?: number | ''
    sell_price?: number | ''
  }
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (
    e: 'save',
    data: {
      part_code: string
      name: string
      category: string
      buy_price: number
      sell_price: number
    }
  ): void
}>()

const form = reactive({
  part_code: '',
  name: '',
  category: '',
  buy_price: 0,
  sell_price: '' as number | ''
})

const formErrors = reactive<Record<string, string>>({})

const hasErrors = computed(() => {
  return Object.values(formErrors).some((err) => err !== '')
})

const validateField = (field: string, value: unknown) => {
  try {
    const parsedValue =
      (field === 'buy_price' || field === 'sell_price') && value === '' ? 0 : value
    const schema = SparepartSchema.pick({ [field]: true } as never)
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
  const fields = ['part_code', 'name', 'category', 'buy_price', 'sell_price']
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
      form.part_code = props.initialData?.part_code || ''
      form.name = props.initialData?.name || ''
      form.category = props.initialData?.category || ''
      form.buy_price = props.initialData?.buy_price || 0
      form.sell_price =
        props.initialData?.sell_price !== undefined ? props.initialData.sell_price : ''

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
    buy_price: Number(form.buy_price),
    sell_price: Number(form.sell_price)
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
