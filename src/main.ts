import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import Swal from 'sweetalert2'

import { createPinia } from 'pinia'

window.Swal = Swal

const app = createApp(App)
const pinia = createPinia()

app.config.globalProperties.$api = window.api

app.config.errorHandler = (err, instance, info) => {
  console.error('Vue Global Error:', err, info)
  Swal.fire({
    toast: true,
    position: 'bottom-end',
    icon: 'error',
    title: 'Error Tampilan',
    text: err instanceof Error ? err.message : String(err),
    showConfirmButton: false,
    timer: 5000,
    timerProgressBar: true
  })
}

app.use(pinia)
app.use(router)

// Global Error Handler for Unhandled Promises (e.g., IPC errors)
window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.message || 'Terjadi kesalahan sistem'
  // Check if it's an IPC error or similar to avoid spamming network errors, but generally good to show
  Swal.fire({
    toast: true,
    position: 'bottom-end',
    icon: 'error',
    title: 'Error Backend',
    text: message,
    showConfirmButton: false,
    timer: 5000,
    timerProgressBar: true
  })
})

app.mount('#app')
