<template>
  <div class="ui-modal-mask" @click.self="handleMaskClick">
    <div class="ui-modal" :style="{ width: width }">
      <div class="ui-modal__head">
        <h3 class="ui-modal__title">{{ title }}</h3>
        <button class="ui-modal__close" @click="$emit('close')" aria-label="关闭">
          <app-icon name="close" :size="18" />
        </button>
      </div>
      <div class="ui-modal__body">
        <slot />
      </div>
      <div v-if="$slots.footer" class="ui-modal__footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script>
import AppIcon from './AppIcon.vue'

// 统一弹窗外壳组件，集中管理遮罩、标题栏、关闭按钮与底部操作区，全站复用
export default {
  name: 'BaseModal',
  components: {
    AppIcon
  },
  props: {
    title: { type: String, default: '' },
    width: { type: String, default: '480px' },
    closeOnMask: { type: Boolean, default: true }
  },
  methods: {
    handleMaskClick () {
      if (this.closeOnMask) {
        this.$emit('close')
      }
    }
  }
}
</script>

<style scoped>
.ui-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(15, 27, 45, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.ui-modal {
  max-width: calc(100vw - 32px);
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 22px 24px 20px;
  box-shadow: var(--shadow-lg);
}

.ui-modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.ui-modal__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.ui-modal__close {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--surface-muted);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.ui-modal__close:hover {
  background: var(--danger-soft);
  color: var(--danger);
}

.ui-modal__footer {
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}
</style>
