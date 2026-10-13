<template>
  <div class="card hover-container" style="margin-bottom: 20px; padding: 25px">
    <h2
      style="
        font-size: 1.2rem;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--primary-color);
      "
    >
      <Receipt :size="22" /> Rincian Biaya & Sparepart
    </h2>

    <div
      style="
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
        background: var(--bg-color);
        padding: 10px;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-color);
      "
    >
      <select
        v-model="form.type"
        @change="onItemTypeChange"
        class="form-control"
        style="width: auto; padding: 8px 12px; border-radius: var(--radius-sm)"
      >
        <option value="Jasa">Jasa</option>
        <option value="Sparepart">Sparepart</option>
      </select>

      <div v-if="form.type === 'Sparepart'" style="width: 220px">
        <CustomSelect
          v-model="form.selectedPartId"
          :options="partOptions"
          placeholder="Pilih dari Katalog..."
          @change="onPartSelected"
        />
      </div>

      <input
        type="text"
        v-model="form.desc"
        class="form-control"
        placeholder="Keterangan"
        style="flex: 1; min-width: 120px; padding: 8px 12px; border-radius: var(--radius-sm)"
      />

      <input
        type="number"
        v-model.number="form.qty"
        class="form-control"
        placeholder="Qty"
        min="1"
        style="width: 70px; padding: 8px 12px; border-radius: var(--radius-sm)"
      />
      <input
        v-if="form.type === 'Sparepart'"
        type="number"
        v-model.number="form.costPrice"
        class="form-control"
        placeholder="Harga Beli (Modal)"
        style="flex: 1; min-width: 130px; padding: 8px 12px; border-radius: var(--radius-sm)"
      />
      <input
        type="number"
        v-model.number="form.price"
        class="form-control"
        :placeholder="form.type === 'Sparepart' ? 'Harga Jual' : 'Harga'"
        style="flex: 1; min-width: 110px; padding: 8px 12px; border-radius: var(--radius-sm)"
      />
      <button
        @click="addItem"
        class="btn-icon-primary"
        title="Tambah Item"
        style="width: 36px; height: 36px; margin-left: 5px"
      >
        <Plus :size="20" />
      </button>
    </div>

    <div
      style="
        background: white;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        overflow: hidden;
      "
    >
      <ul style="list-style: none; padding: 0; margin: 0">
        <li
          v-for="item in items"
          :key="item.id"
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 15px;
            border-bottom: 1px solid var(--border-color);
          "
        >
          <div>
            <div style="font-weight: 600; color: var(--text-color)">
              {{ item.item_type }}
              <span style="font-weight: normal; color: var(--text-muted)">
                - {{ item.description }}</span
              >
            </div>
            <div style="font-size: 0.85rem; color: #64748b; margin-top: 4px">
              {{ item.quantity }} x {{ formatCurrency(item.price) }}
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 15px">
            <span style="font-weight: 700; color: var(--primary-color)">{{
              formatCurrency(item.total)
            }}</span>
            <button @click="$emit('delete', item.id)" class="btn-icon-danger" title="Hapus">
              <Trash2 :size="16" />
            </button>
          </div>
        </li>
      </ul>
    </div>
    <div
      style="
        display: flex;
        justify-content: space-between;
        font-size: 1.2rem;
        font-weight: 800;
        padding: 15px 20px;
        background: rgba(99, 102, 241, 0.05);
        border-radius: var(--radius-md);
        margin-top: 15px;
        color: var(--primary-color);
      "
    >
      <span>Total Biaya:</span>
      <span>{{ formatCurrency(totalCost) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { Trash2, Plus, Receipt } from 'lucide-vue-next'
import type { ServiceItem, Part } from '../../../shared/types'
import CustomSelect from '../common/CustomSelect.vue'

const props = defineProps<{
  items: ServiceItem[]
  parts: Part[]
  totalCost: number
}>()

const emit = defineEmits(['add', 'delete'])

const form = reactive({
  type: 'Jasa',
  desc: '',
  qty: 1,
  costPrice: '' as number | '',
  price: '' as number | '',
  selectedPartId: '' as number | string
})

const partOptions = computed(() => {
  return props.parts.map((p) => ({
    value: p.id!,
    label: `${p.name} - ${formatCurrency(p.sell_price)}`
  }))
})

const onPartSelected = (id: number | string) => {
  const part = props.parts.find((p) => p.id === id)
  if (part) {
    form.desc = part.name
    form.costPrice = part.buy_price
    form.price = part.sell_price
  }
}

const formatCurrency = (amount: number | string | undefined | null) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(amount || 0))
}

const onItemTypeChange = () => {
  form.desc = ''
  form.costPrice = ''
  form.price = ''
  form.selectedPartId = ''
}

const addItem = async () => {
  emit('add', { ...form, price: form.price || 0, costPrice: form.costPrice || 0 })

  // reset form after emit
  form.desc = ''
  form.costPrice = ''
  form.price = ''
  form.qty = 1
  form.selectedPartId = ''
}
</script>
