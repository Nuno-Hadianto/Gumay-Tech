<template>
  <aside class="sidebar">
    <div class="sidebar-header sidebar-header-custom">
      <img src="/img/logo.png" alt="Gumay Tech" class="sidebar-logo" />
      <div class="sidebar-brand">Gumay <span class="brand-accent">Tech</span></div>
    </div>
    <nav class="sidebar-nav">
      <ul>
        <li :class="{ active: $route.name === 'Dashboard' }">
          <router-link to="/"> <LayoutDashboard class="menu-icon" /> Dashboard </router-link>
        </li>
        <li class="nav-header">OPERASIONAL</li>

        <li :class="{ active: $route.name === 'Customers' }">
          <router-link to="/customers"><Users class="menu-icon" /> Pelanggan</router-link>
        </li>
        <li :class="{ active: $route.name === 'Devices' }">
          <router-link to="/devices"><Smartphone class="menu-icon" /> Perangkat</router-link>
        </li>
        <li :class="{ active: $route.name === 'Services' || $route.name === 'ServiceDetail' }">
          <router-link to="/services"><Wrench class="menu-icon" /> Servis</router-link>
        </li>
        <li :class="{ active: $route.name === 'Parts' }">
          <router-link to="/parts"><Package class="menu-icon" /> Katalog Harga</router-link>
        </li>

        <li class="nav-header">KEUANGAN</li>
        <li :class="{ active: $route.name === 'Reports' }">
          <router-link to="/reports"><BarChart3 class="menu-icon" /> Laporan</router-link>
        </li>

        <li class="nav-header">SISTEM</li>

        <li :class="{ active: $route.name === 'Settings' }">
          <router-link to="/settings"><Settings class="menu-icon" /> Pengaturan</router-link>
        </li>
        <li :class="{ active: $route.name === 'RecycleBin' }">
          <router-link to="/recycle-bin"><Trash2 class="menu-icon" /> Keranjang Sampah</router-link>
        </li>
      </ul>
      <div class="sidebar-footer">
        <!-- User info and logout hidden for solo mode -->
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import {
  LayoutDashboard,
  Users,
  Smartphone,
  Wrench,
  Package,
  BarChart3,
  Settings,
  Trash2
} from 'lucide-vue-next'
</script>

<style scoped>
.menu-icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  stroke-width: 2.2px;
  opacity: 0.8;
  transition: all 0.3s ease;
}
.sidebar-nav li.active .menu-icon {
  opacity: 1;
  stroke: white;
}
.sidebar-nav a:hover .menu-icon {
  opacity: 1;
  stroke: var(--primary);
  animation: wiggle 0.4s ease-in-out forwards;
}
.sidebar-header-custom {
  justify-content: center;
  flex-direction: column;
  padding: 20px 10px 10px;
  gap: 5px;
}
.sidebar-logo {
  max-height: 80px;
  width: auto;
  object-fit: contain;
  transition: all 0.3s ease;
  cursor: pointer;
}
.sidebar-logo:hover {
  transform: scale(1.05) rotate(-3deg);
  filter: drop-shadow(0 4px 14px rgba(243, 118, 36, 0.6));
}
.sidebar-brand {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--text-primary);
  transition: all 0.3s ease;
  cursor: pointer;
}
.sidebar-brand:hover {
  transform: translateY(-2px);
  text-shadow: 0 4px 12px rgba(243, 118, 36, 0.5);
}
.brand-accent {
  color: var(--primary);
}
.sidebar-footer {
  margin-top: auto;
  padding: 20px;
}
.user-info-row {
  margin-bottom: 15px;
  font-size: 0.85rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.user-name {
  color: var(--text-primary);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>
