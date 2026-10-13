import { createRouter, createWebHashHistory } from 'vue-router'

import type { RouteRecordRaw } from 'vue-router'
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: 'Dashboard' }
  },
  {
    path: '/customers',
    name: 'Customers',
    component: () => import('@/views/Customer.vue'),
    meta: { title: 'Daftar Pelanggan' }
  },
  {
    path: '/devices',
    name: 'Devices',
    component: () => import('@/views/Device.vue'),
    meta: { title: 'Daftar Perangkat' }
  },
  {
    path: '/services',
    name: 'Services',
    component: () => import('@/views/Service.vue'),
    meta: { title: 'Daftar Servis' }
  },
  {
    path: '/services/:id',
    name: 'ServiceDetail',
    component: () => import('@/views/ServiceDetail.vue'),
    meta: { title: 'Detail Servis' }
  },
  {
    path: '/parts',
    name: 'Parts',
    component: () => import('@/views/Part.vue'),
    meta: { title: 'Katalog Harga Sparepart' }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('@/views/Report.vue'),
    meta: { title: 'Laporan Keuangan' }
  },

  {
    path: '/recycle-bin',
    name: 'RecycleBin',
    component: () => import('@/views/RecycleBin.vue'),
    meta: { title: 'Keranjang Sampah' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: { title: 'Pengaturan' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
