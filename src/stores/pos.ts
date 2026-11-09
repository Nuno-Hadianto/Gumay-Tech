import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Part } from '../../shared/types'
import { Toast } from '@/utils/alert'

export interface CartItem {
  id: number
  name: string
  price: number
  qty: number
  maxStock: number
}

export const usePosStore = defineStore('pos', () => {
  const cart = ref<CartItem[]>([])
  const customerName = ref('')
  const paymentMethod = ref('Tunai')
  const cashGiven = ref<number | ''>('')

  const totalAmount = computed(() => {
    return cart.value.reduce((total, item) => total + item.price * item.qty, 0)
  })

  const changeAmount = computed(() => {
    if (cashGiven.value === '') return 0 - totalAmount.value
    return Number(cashGiven.value) - totalAmount.value
  })

  const addToCart = (part: Part) => {
    const existing = cart.value.find((item) => item.id === part.id)
    if (existing) {
      if (existing.qty < existing.maxStock) {
        existing.qty++
      } else {
        Toast.fire({ icon: 'warning', title: 'Stok tidak mencukupi' })
      }
    } else {
      cart.value.push({
        id: part.id,
        name: part.name,
        price: part.sell_price,
        qty: 1,
        maxStock: 999 // Part does not have stock property yet in Gumay Tech
      })
    }
  }

  const increaseQty = (index: number) => {
    const item = cart.value[index]
    if (item.qty < item.maxStock) {
      item.qty++
    } else {
      Toast.fire({ icon: 'warning', title: 'Stok tidak mencukupi' })
    }
  }

  const decreaseQty = (index: number) => {
    if (cart.value[index].qty > 1) {
      cart.value[index].qty--
    } else {
      removeFromCart(index)
    }
  }

  const removeFromCart = (index: number) => {
    cart.value.splice(index, 1)
  }

  const resetCart = () => {
    cart.value = []
    customerName.value = ''
    cashGiven.value = ''
    paymentMethod.value = 'Tunai'
  }

  return {
    cart,
    customerName,
    paymentMethod,
    cashGiven,
    totalAmount,
    changeAmount,
    addToCart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    resetCart
  }
})
