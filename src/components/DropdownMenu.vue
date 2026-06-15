<template>
  <div class="dropdown-menu">
    <div class="menu-section dropdown-header" @click="toggle">
      <span class="group-label">
        <app-icon v-if="groupIcon" :name="groupIcon" :size="15" class="group-icon" />
        <span class="group-title">{{ title }}</span>
      </span>
      <app-icon
        name="chevron-down"
        :size="16"
        class="arrow"
        :class="{ open: isOpen }"
      />
    </div>
    <div v-if="isOpen" class="menu-list">
      <div
        v-for="item in items"
        :key="item.value || item.label || item"
        class="menu-item"
        :class="{ active: (item.value || item) === activeValue }"
        @click="handleItemClick(item)"
      >
        <app-icon
          v-if="item.icon"
          :name="item.icon"
          :size="17"
          class="item-icon"
        />
        <span v-else class="bullet" aria-hidden="true"></span>
        {{ item.label || item }}
      </div>
    </div>
  </div>
</template>

<script>
import AppIcon from './AppIcon.vue'

export default {
  name: 'DropdownMenu',
  components: {
    AppIcon
  },
  props: {
    title: {
      type: String,
      required: true
    },
    groupIcon: {
      type: String,
      default: ''
    },
    items: {
      type: Array,
      default () {
        return []
      }
    },
    activeValue: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      isOpen: true
    }
  },
  methods: {
    toggle () {
      this.isOpen = !this.isOpen
    },
    handleItemClick (item) {
      const value = item.value || item
      this.$emit('select', value)
    }
  }
}
</script>

<style scoped>
.dropdown-menu {
  margin-bottom: 18px;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
}

/* 分组标题：作为弱化的“分类”标签，与下方菜单项明显区分 */
.menu-section {
  padding: 6px 18px;
  margin: 0 8px 4px;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6b7a90;
  transition: color 0.15s ease;
}

.dropdown-header:hover .group-title {
  color: var(--sidebar-text);
}

.group-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-icon {
  opacity: 0.7;
}

.group-title {
  font-weight: 600;
  transition: color 0.15s ease;
}

.menu-list {
  margin-top: 2px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.item-icon {
  opacity: 0.85;
}

/* 菜单项：作为主操作项，字号更大、对比更高 */
.menu-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 16px;
  margin: 0 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--sidebar-text);
  border-radius: var(--radius);
  transition: background 0.15s ease, color 0.15s ease;
}

.menu-item .bullet {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.5;
}

.menu-item:hover {
  background: var(--sidebar-bg-soft);
  color: var(--sidebar-text-strong);
}

.menu-item.active {
  background: var(--sidebar-active-bg);
  color: var(--sidebar-text-strong);
  font-weight: 600;
  box-shadow: inset 0 0 0 1px rgba(47, 107, 255, 0.3);
}

.menu-item.active::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 22px;
  border-radius: 0 3px 3px 0;
  background: var(--brand);
}

.menu-item.active .bullet {
  background: var(--brand);
  opacity: 1;
}

.menu-item.active .item-icon {
  opacity: 1;
}

.arrow {
  transition: transform 0.2s ease;
  opacity: 0.7;
}

.arrow.open {
  transform: rotate(180deg);
}
</style>
