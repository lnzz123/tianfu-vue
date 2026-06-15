<template>
  <button class="add-app-entry" type="button" @click="handleClick">
    <span class="add-app-icon">
      <app-icon name="app" :size="18" :stroke-width="2.2" />
    </span>
    <span class="add-app-text">
      <span class="add-app-title">{{ title }}</span>
      <span class="add-app-sub">{{ subtitle }}</span>
    </span>
  </button>
</template>

<script>
import AppIcon from './AppIcon.vue'

export default {
  name: 'AddAppEntry',
  components: {
    AppIcon
  },
  props: {
    title: {
      type: String,
      default: '管理 App'
    },
    subtitle: {
      type: String,
      default: '查看、添加、修改和删除应用'
    }
  },
  methods: {
    handleClick () {
      this.$emit('manage')
    }
  }
}
</script>

<style scoped>
.add-app-entry {
  display: flex;
  align-items: center;
  gap: 12px;
  width: calc(100% - 20px);
  margin: 4px 10px 8px;
  padding: 12px 14px;
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.18);
  border-radius: var(--radius-sm);
  color: var(--sidebar-text);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
}
.add-app-entry:hover { border-color: var(--brand); background: var(--sidebar-bg-soft); color: var(--sidebar-text-strong); }
.add-app-icon {
  width: 30px; height: 30px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 6px; background: rgba(47, 107, 255, 0.18); color: #cfe0ff;
}
.add-app-entry:hover .add-app-icon { background: var(--brand); color: #fff; }
.add-app-text { display: flex; flex-direction: column; line-height: 1.3; min-width: 0; }
.add-app-title { font-size: 13px; font-weight: 600; }
.add-app-sub { font-size: 11px; color: #5a6b82; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
