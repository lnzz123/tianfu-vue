<template>
  <div class="admin-layout">
    <header class="admin-header">
      <div class="logo">房产后台管理系统</div>
      <div class="header-right">
        <button class="logout" @click="handleLogout">退出登录</button>
        <span class="admin-info">当前操作管理员：{{ adminName || '管理员' }}</span>
      </div>
    </header>

    <div class="admin-body">
      <aside class="sidebar">
        <dropdown-menu
          title="天府通办"
          :items="[
            { label: '用户管理', value: 'user' },
            { label: '财产管理', value: 'property' }
          ]"
          :active-value="activeMenu"
          @select="handleSelectMenu"
        />
        <dropdown-menu
          title="待添加"
          :items="[
            { label: '待添加', value: 'todo' }
          ]"
          :active-value="activeMenu"
          @select="handleSelectMenu"
        />
      </aside>

      <main class="content">
        <div class="tab-bar">
          <div
            class="tab-item"
            :class="{ active: activeMenu === 'user' }"
            @click="activeMenu = 'user'"
          >
            用户管理
          </div>
          <div
            class="tab-item"
            :class="{ active: activeMenu === 'property' }"
            @click="activeMenu = 'property'"
          >
            房产管理
          </div>
        </div>

        <section class="content-inner">
          <user-manage v-if="activeMenu === 'user'" />
          <property-manage v-else />
        </section>
      </main>
    </div>
  </div>
</template>

<script>
import UserManage from './UserManage.vue'
import PropertyManage from './PropertyManage.vue'
import DropdownMenu from '../../components/DropdownMenu.vue'

export default {
  name: 'AdminView',
  components: {
    UserManage,
    PropertyManage,
    DropdownMenu
  },
  data () {
    return {
      activeMenu: 'user',
      // 当前应用：天府通办 = 1，将来可以根据不同主菜单切换
      currentAppId: 1,
      adminName: localStorage.getItem('adminUserName') || ''
    }
  },
  created () {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      this.$router.replace('/login')
    }
  },
  methods: {
    handleLogout () {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUserName')
      this.$router.replace('/login')
    },
    handleSelectMenu (value) {
      if (value === 'user' || value === 'property') {
        this.activeMenu = value
      }
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.admin-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  background: linear-gradient(90deg, #a66bff, #f480ff);
  color: #fff;
}

.logo {
  font-size: 22px;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logout {
  padding: 6px 14px;
  border-radius: 14px;
  border: none;
  background: #ff7676;
  color: #fff;
  cursor: pointer;
}

.admin-body {
  flex: 1;
  display: flex;
  background-color: #f5f5fa;
}

.sidebar {
  width: 200px;
  background-color: #f8f0ff;
  padding-top: 16px;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.04);
}

.menu-section {
  padding: 10px 18px;
  font-size: 14px;
  color: #999;
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

.content {
  flex: 1;
  padding: 18px 24px;
}

.tab-bar {
  display: flex;
  background: #ffffff;
  border-radius: 10px 10px 0 0;
  padding: 0 16px;
  border-bottom: 1px solid #eee;
}

.tab-item {
  padding: 12px 18px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

.tab-item.active {
  color: #7b5cff;
  font-weight: 500;
  border-bottom: 2px solid #7b5cff;
}

.content-inner {
  background: #ffffff;
  border-radius: 0 10px 10px 10px;
  padding: 20px 20px 24px;
  margin-top: -1px;
}
</style>

