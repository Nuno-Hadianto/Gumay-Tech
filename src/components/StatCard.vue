<template>
  <div
    class="stat-card"
    :class="[variant, { 'center-align': center, 'border-top': borderTop, clickable: clickable }]"
  >
    <div v-if="!center" class="stat-icon-wrapper">
      <slot name="icon"></slot>
    </div>
    <h3 class="stat-title">
      <slot v-if="center" name="icon-small"></slot>
      {{ title }}
    </h3>
    <p class="stat-value" :class="valueClass">
      {{ value }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  valueClass?: string
  center?: boolean
  borderTop?: boolean
  clickable?: boolean
}>()
</script>

<style scoped>
/* Base card style */
.stat-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  background: var(--card-bg, rgba(30, 41, 59, 0.6));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  border-radius: var(--radius-md, 16px);
  box-shadow: var(--glass-shadow, 0 8px 32px 0 rgba(0, 0, 0, 0.2));
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.stat-card:hover :deep(svg) {
  animation: wiggle 0.4s ease-in-out forwards;
}

.center-align {
  text-align: center;
  align-items: center;
}

.border-top.primary {
  border-top: 4px solid var(--primary, #f37624);
}
.border-top.success {
  border-top: 4px solid var(--success, #10b981);
}
.border-top.warning {
  border-top: 4px solid var(--warning, #f59e0b);
}
.border-top.danger {
  border-top: 4px solid var(--danger, #ef4444);
}
.border-top.info {
  border-top: 4px solid var(--info, #3b82f6);
}

.stat-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  align-self: flex-start;
}

.primary .stat-icon-wrapper {
  background: rgba(243, 118, 36, 0.15);
  color: var(--primary, #f37624);
}
.success .stat-icon-wrapper {
  background: rgba(16, 185, 129, 0.15);
  color: var(--success, #10b981);
}
.warning .stat-icon-wrapper {
  background: rgba(245, 158, 11, 0.15);
  color: var(--warning, #f59e0b);
}
.danger .stat-icon-wrapper {
  background: rgba(239, 68, 68, 0.15);
  color: var(--danger, #ef4444);
}
.info .stat-icon-wrapper {
  background: rgba(59, 130, 246, 0.15);
  color: var(--info, #3b82f6);
}

.stat-title {
  font-size: 1.1rem;
  color: var(--text-muted, #64748b);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.center-align .stat-title {
  font-size: 0.9rem;
  text-transform: uppercase;
  justify-content: center;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}
.center-align .stat-value {
  font-size: 1.5rem;
}

/* Base text color based on variant if not overridden by valueClass */
.primary .stat-value:not(.text-success):not(.text-danger) {
  color: var(--primary, #f37624);
}
.success .stat-value:not(.text-success):not(.text-danger) {
  color: var(--success, #10b981);
}
.warning .stat-value:not(.text-success):not(.text-danger) {
  color: var(--warning, #f59e0b);
}
.danger .stat-value:not(.text-success):not(.text-danger) {
  color: var(--danger, #ef4444);
}
.info .stat-value:not(.text-success):not(.text-danger) {
  color: var(--info, #3b82f6);
}
</style>
