<template>
  <div class="dropdown-menu">
    <div class="menu-section dropdown-header" @click="toggle">
      <span>{{ title }}</span>
      <span class="arrow" :class="{ open: isOpen }">
        ▼
      </span>
    </div>
    <div v-if="isOpen">
      <div
        v-for="item in items"
        :key="item.value || item.label || item"
        class="menu-item"
        :class="{ active: (item.value || item) === activeValue }"
        @click="handleItemClick(item)"
      >
        {{ item.label || item }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DropdownMenu',
  props: {
    title: {
      type: String,
      required: true
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
  margin-bottom: 4px;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.menu-section {
  padding: 10px 18px;
  font-size: 14px;
  color: #7b5cff;
  font-weight: 600;
  background-color: #efe7ff;
}

.menu-item {
  padding: 10px 24px;
  cursor: pointer;
  font-size: 14px;
  color: #555;
}

.menu-item.active {
  background-color: #fff;
  color: #7b5cff;
  font-weight: 500;
}

.arrow {
  font-size: 12px;
  transition: transform 0.2s ease;
}

.arrow.open {
  transform: rotate(180deg);
}
</style>
