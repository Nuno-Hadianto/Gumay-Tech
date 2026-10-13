<template>
  <div
    class="custom-select"
    ref="selectRef"
    :class="{ 'is-open': isOpen, 'is-disabled': disabled }"
  >
    <div class="select-trigger form-control" @click="toggleOpen">
      <span class="selected-text" :class="{ placeholder: !selectedOption }">
        {{ selectedOption ? selectedOption.label : placeholder }}
      </span>
      <ChevronDown class="dropdown-icon" :size="16" />
    </div>

    <transition name="dropdown">
      <div v-if="isOpen" class="options-container glass-panel">
        <div class="search-box" v-if="searchable">
          <Search class="search-icon" :size="14" />
          <input
            ref="searchInputRef"
            type="text"
            v-model="searchQuery"
            placeholder="Cari..."
            @click.stop
          />
        </div>

        <ul class="options-list">
          <li v-if="filteredOptions.length === 0" class="no-options">Data tidak ditemukan</li>
          <li
            v-for="option in filteredOptions"
            :key="option.value"
            class="option-item"
            :class="{ 'is-selected': option.value === modelValue }"
            @click="selectOption(option)"
          >
            {{ option.label }}
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ChevronDown, Search } from 'lucide-vue-next'

interface Option {
  value: string | number
  label: string
}

const props = withDefaults(
  defineProps<{
    modelValue: string | number
    options: Option[]
    placeholder?: string
    searchable?: boolean
    disabled?: boolean
  }>(),
  {
    placeholder: 'Pilih salah satu',
    searchable: true,
    disabled: false
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'change', value: string | number): void
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const selectRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

const selectedOption = computed(() => {
  return props.options.find((opt) => opt.value === props.modelValue)
})

const filteredOptions = computed(() => {
  if (!searchQuery.value || !props.searchable) {
    return props.options
  }
  const query = searchQuery.value.toLowerCase()
  return props.options.filter((opt) => opt.label.toLowerCase().includes(query))
})

const toggleOpen = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value && props.searchable) {
    searchQuery.value = ''
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  }
}

const selectOption = (option: Option) => {
  emit('update:modelValue', option.value)
  emit('change', option.value)
  isOpen.value = false
}

const closeDropdown = (e: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.custom-select {
  position: relative;
  width: 100%;
}

.select-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  background-color: rgba(255, 255, 255, 0.7);
}

.custom-select.is-disabled .select-trigger {
  background-color: rgba(243, 244, 246, 0.5);
  cursor: not-allowed;
  opacity: 0.7;
}

.select-trigger:hover:not(.is-disabled) {
  background-color: rgba(255, 255, 255, 0.9);
}

.custom-select.is-open .select-trigger {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.selected-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-text.placeholder {
  color: #6b7280;
}

.dropdown-icon {
  color: #6b7280;
  transition: transform 0.2s ease;
}

.custom-select.is-open .dropdown-icon {
  transform: rotate(180deg);
}

.options-container {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  max-height: 250px;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(16px);
}

.search-box {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(255, 255, 255, 0.5);
}

.search-icon {
  color: #6b7280;
  margin-right: 8px;
}

.search-box input {
  border: none;
  background: transparent;
  width: 100%;
  outline: none;
  font-size: 0.9em;
  color: var(--text-color);
}

.options-list {
  list-style: none;
  margin: 0;
  padding: 4px 0;
  overflow-y: auto;
  max-height: 200px;
}

.option-item {
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.95em;
}

.option-item:hover {
  background-color: rgba(99, 102, 241, 0.1);
}

.option-item.is-selected {
  background-color: rgba(99, 102, 241, 0.15);
  color: var(--primary-color);
  font-weight: 500;
}

.no-options {
  padding: 12px 16px;
  text-align: center;
  color: #6b7280;
  font-size: 0.9em;
}

/* Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
