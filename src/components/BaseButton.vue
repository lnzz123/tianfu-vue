<template>
  <button
    :class="['ui-btn', 'ui-btn--' + variant, { 'ui-btn--block': block }]"
    :type="type"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <app-icon v-if="icon" :name="icon" :size="iconSize" />
    <span v-if="$slots.default" class="ui-btn__label"><slot /></span>
  </button>
</template>

<script>
import AppIcon from './AppIcon.vue'

// 统一按钮组件，支持 primary / secondary / danger / link 四种风格，全站复用
export default {
  name: 'BaseButton',
  components: {
    AppIcon
  },
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: (v) => ['primary', 'secondary', 'danger', 'link', 'ghost', 'ghost-danger'].includes(v)
    },
    icon: { type: String, default: '' },
    iconSize: { type: [Number, String], default: 16 },
    type: { type: String, default: 'button' },
    block: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  }
}
</script>

<style scoped>
.ui-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  height: 38px;
  padding: 0 18px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.ui-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ui-btn--block {
  width: 100%;
}

/* primary */
.ui-btn--primary {
  background: var(--brand);
  color: #fff;
}
.ui-btn--primary:not(:disabled):hover {
  background: var(--brand-strong);
}

/* secondary */
.ui-btn--secondary {
  background: var(--surface);
  color: var(--brand);
  border-color: var(--brand);
}
.ui-btn--secondary:not(:disabled):hover {
  background: var(--brand-soft);
}

/* danger */
.ui-btn--danger {
  height: 30px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 500;
  background: var(--danger-soft);
  color: var(--danger);
  border-color: #fecaca;
}
.ui-btn--danger:not(:disabled):hover {
  background: var(--danger);
  color: #fff;
  border-color: var(--danger);
}

/* ghost —— 表格内中性操作（编辑等），与 ghost-danger 尺寸一致 */
.ui-btn--ghost,
.ui-btn--ghost-danger {
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 500;
  gap: 5px;
}
.ui-btn--ghost {
  background: var(--surface);
  color: var(--text-muted);
  border-color: var(--border-strong);
}
.ui-btn--ghost:not(:disabled):hover {
  background: var(--brand-soft);
  color: var(--brand-strong);
  border-color: var(--brand);
}

/* ghost-danger —— 表格内删除操作，与 ghost 完全等高同形 */
.ui-btn--ghost-danger {
  background: var(--surface);
  color: var(--danger);
  border-color: #fecaca;
}
.ui-btn--ghost-danger:not(:disabled):hover {
  background: var(--danger);
  color: #fff;
  border-color: var(--danger);
}

/* link */
.ui-btn--link {
  height: auto;
  padding: 0;
  background: none;
  border: none;
  color: var(--brand);
  font-weight: 500;
}
.ui-btn--link:not(:disabled):hover {
  color: var(--brand-strong);
  text-decoration: underline;
}
</style>
