<template>
  <div class="ui-empty">
    <div class="ui-empty__icon">
      <app-icon :name="icon" :size="34" :stroke-width="1.5" />
    </div>
    <div class="ui-empty__text">{{ text }}</div>
  </div>
</template>

<script>
import AppIcon from './AppIcon.vue'

// 统一空状态组件，全站表格/列表无数据时复用
export default {
  name: 'EmptyState',
  components: {
    AppIcon
  },
  props: {
    icon: { type: String, default: 'inbox' },
    text: { type: String, default: '暂无数据' }
  }
}
</script>

<style scoped>
.ui-empty {
  padding: 40px 0;
  text-align: center;
  color: var(--text-faint);
}

.ui-empty__icon {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  color: var(--border-strong);
}

.ui-empty__text {
  font-size: 14px;
}
</style>
