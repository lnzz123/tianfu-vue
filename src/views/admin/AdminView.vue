<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">
          <app-icon name="layers" :size="22" :stroke-width="2.1" />
        </div>
        <div class="brand-text">
          <span class="brand-name">房产登记</span>
          <span class="brand-sub">后台管理系统</span>
        </div>
      </div>

      <nav class="nav">
        <dropdown-menu
          v-for="app in apps"
          :key="app.id"
          :title="app.appName"
          :group-icon="app.icon || 'app'"
          :items="buildModuleItems(app.id)"
          :active-value="activeMenuKey"
          @select="handleSelectMenu"
        />
        <div v-if="!apps.length" class="empty-app-hint">暂无 App，请先点击「管理 App」添加</div>
      </nav>

      <add-app-entry @manage="openAppManage" />

      <div class="sidebar-foot">
        <span>版本 v1.0</span>
      </div>
    </aside>

    <div class="main">
      <header class="topbar">
        <div class="crumbs">
          <span class="crumb-app">{{ currentApp.appName || '请选择 App' }}</span>
          <span class="crumb-sep">/</span>
          <span class="crumb-current">{{ currentModule.title }}</span>
        </div>
        <div class="topbar-right">
          <div class="admin-chip">
            <span class="avatar">{{ adminInitial }}</span>
            <div class="admin-meta">
              <span class="admin-label">当前管理员</span>
              <span class="admin-name">{{ adminName || '管理员' }}</span>
            </div>
          </div>
          <button class="logout" @click="handleLogout">
            <app-icon name="logout" :size="16" />
            <span>退出登录</span>
          </button>
        </div>
      </header>

      <main class="content">
        <div class="module-header">
          <div class="module-info">
            <div class="module-icon">
              <app-icon :name="currentModule.icon" :size="24" />
            </div>
            <div>
              <h1 class="module-title">{{ currentApp.appName || '管理后台' }} · {{ currentModule.title }}</h1>
              <p class="module-desc">{{ currentModule.desc }}</p>
            </div>
          </div>
          <div class="segmented">
            <button class="seg-item" :class="{ active: activeModule === 'user' }" @click="switchModule('user')">
              <app-icon name="users" :size="16" />
              <span>用户管理</span>
            </button>
            <button class="seg-item" :class="{ active: activeModule === 'property' }" @click="switchModule('property')">
              <app-icon name="building" :size="16" />
              <span>房产管理</span>
            </button>
          </div>
        </div>

        <section class="content-card">
          <div class="app-context-bar">
            <div class="app-context-main">
              <div class="app-context-icon">
                <app-icon :name="currentApp.icon || 'app'" :size="18" />
              </div>
              <div>
                <div class="app-context-title">{{ currentApp.appName || '暂无 App' }}</div>
                <div class="app-context-sub">AppId：{{ currentApp.id || '-' }}</div>
              </div>
            </div>
          </div>

          <user-manage v-if="activeModule === 'user'" :app-id="currentAppId" />
          <property-manage v-else :app-id="currentAppId" />
        </section>
      </main>
    </div>

    <app-manage-modal
      v-if="showAppModal"
      :app-id="currentAppId"
      @close="closeAppManage"
      @saved="handleAppSaved"
    />
  </div>
</template>

<script>
import UserManage from './UserManage.vue'
import PropertyManage from './PropertyManage.vue'
import DropdownMenu from '../../components/DropdownMenu.vue'
import AppIcon from '../../components/AppIcon.vue'
import AddAppEntry from '../../components/AddAppEntry.vue'
import AppManageModal from '../../components/AppManageModal.vue'

const MODULE_ITEMS = [
  { label: '用户管理', value: 'user', icon: 'users' },
  { label: '房产管理', value: 'property', icon: 'building' }
]

const MODULES = {
  user: { title: '用户管理', desc: '查询、新增与维护接入应用的用户信息', icon: 'users' },
  property: { title: '房产管理', desc: '按产权人维护房产信息，支持新增、编辑与删除', icon: 'building' }
}

export default {
  name: 'AdminView',
  components: { UserManage, PropertyManage, DropdownMenu, AppIcon, AddAppEntry, AppManageModal },
  data () {
    return {
      apps: [],
      currentAppId: 1,
      activeModule: 'user',
      adminName: localStorage.getItem('adminUserName') || '',
      showAppModal: false
    }
  },
  computed: {
    currentApp () {
      return this.apps.find(a => a.id === this.currentAppId) || this.apps[0] || { id: null, appName: '', icon: 'app' }
    },
    currentModule () {
      return MODULES[this.activeModule] || MODULES.user
    },
    activeMenuKey () {
      return `${this.currentAppId}:${this.activeModule}`
    },
    adminInitial () {
      return (this.adminName || '管').charAt(0)
    }
  },
  created () {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      this.$router.replace('/login')
      return
    }
    this.loadApps()
  },
  methods: {
    async loadApps () {
      try {
        const token = localStorage.getItem('adminToken') || ''
        const resp = await fetch('/api/apps/1/admin/apps?pageNo=1&pageSize=1000', {
          headers: { 'user-authentication': token }
        })
        const data = await resp.json()
        if (data.code === 1) {
          this.apps = (data.data && data.data.records) || []
          if (!this.currentAppId && this.apps.length) this.currentAppId = this.apps[0].id
          if (!this.currentAppId && !this.apps.length) this.currentAppId = 1
          if (this.apps.length && !this.apps.find(a => a.id === this.currentAppId)) {
            this.currentAppId = this.apps[0].id
          }
        }
      } catch (e) {
        // 保持静默，避免影响主界面加载
      }
    },
    handleLogout () {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUserName')
      this.$router.replace('/login')
    },
    buildModuleItems (appId) {
      return MODULE_ITEMS.map(item => ({
        label: item.label,
        value: `${appId}:${item.value}`,
        icon: item.icon
      }))
    },
    handleSelectMenu (value) {
      const [appIdStr, module] = String(value).split(':')
      const appId = Number(appIdStr)
      if (Number.isFinite(appId)) {
        this.currentAppId = appId
        this.activeModule = module === 'property' ? 'property' : 'user'
      }
    },
    selectApp (appId) {
      this.currentAppId = appId
      this.activeModule = 'user'
    },
    switchModule (moduleName) {
      this.activeModule = moduleName
    },
    openAppManage () {
      this.showAppModal = true
    },
    closeAppManage () {
      this.showAppModal = false
    },
    async handleAppSaved (newApp) {
      await this.loadApps()
      if (newApp && newApp.id) {
        this.currentAppId = newApp.id
      } else if (this.apps.length) {
        this.currentAppId = this.apps[0].id
      }
      this.activeModule = 'user'
    }
  }
}
</script>

<style scoped>
.admin-layout { display: flex; height: 100vh; background: var(--bg); }
.sidebar { width: 248px; flex-shrink: 0; background: var(--sidebar-bg); display: flex; flex-direction: column; color: var(--sidebar-text); }
.brand { display: flex; align-items: center; gap: 12px; padding: 22px 20px; margin-bottom: 6px; }
.brand-mark { width: 40px; height: 40px; border-radius: 8px; background: var(--brand); display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 6px 16px rgba(47, 107, 255, 0.4); }
.brand-text { display: flex; flex-direction: column; line-height: 1.3; }
.brand-name { font-size: 16px; font-weight: 700; color: #fff; }
.brand-sub { font-size: 12px; color: var(--sidebar-text); }
.nav { flex: 1; overflow-y: auto; padding-top: 6px; }
.empty-app-hint { margin: 10px 16px; font-size: 12px; line-height: 1.5; color: var(--sidebar-text); opacity: 0.8; }
.sidebar-foot { padding: 16px 22px; font-size: 12px; color: #5a6b82; border-top: 1px solid rgba(255, 255, 255, 0.06); }
.main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.topbar { height: 64px; flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; padding: 0 28px; background: var(--surface); border-bottom: 1px solid var(--border); }
.crumbs { display: flex; align-items: center; gap: 8px; font-size: 14px; }
.crumb-app { color: var(--text-muted); }
.crumb-sep { color: var(--text-faint); }
.crumb-current { color: var(--text); font-weight: 600; }
.topbar-right { display: flex; align-items: center; gap: 16px; }
.admin-chip { display: flex; align-items: center; gap: 10px; padding: 6px 14px 6px 6px; background: var(--surface-muted); border: 1px solid var(--border); border-radius: 999px; }
.avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--brand); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; }
.admin-meta { display: flex; flex-direction: column; line-height: 1.25; }
.admin-label { font-size: 11px; color: var(--text-faint); }
.admin-name { font-size: 13px; font-weight: 600; color: var(--text); }
.logout { height: 36px; padding: 0 16px; display: inline-flex; align-items: center; gap: 7px; border-radius: var(--radius-sm); border: 1px solid var(--border-strong); background: var(--surface); color: var(--text-muted); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s ease; }
.logout:hover { border-color: var(--danger); color: var(--danger); background: var(--danger-soft); }
.content { flex: 1; overflow-y: auto; padding: 28px 32px 40px; }
.module-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 20px; }
.module-info { display: flex; align-items: center; gap: 14px; }
.module-icon { width: 48px; height: 48px; border-radius: var(--radius); background: var(--brand-soft); color: var(--brand-strong); display: flex; align-items: center; justify-content: center; }
.module-title { margin: 0 0 4px; font-size: 22px; font-weight: 700; color: var(--text); }
.module-desc { margin: 0; font-size: 13px; color: var(--text-muted); }
.segmented { display: inline-flex; padding: 4px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-sm); }
.seg-item { display: inline-flex; align-items: center; gap: 7px; padding: 8px 16px; border: none; background: transparent; color: var(--text-muted); font-size: 14px; font-weight: 500; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.15s ease; }
.seg-item:hover { color: var(--text); }
.seg-item.active { background: var(--brand); color: #fff; box-shadow: 0 4px 12px rgba(47, 107, 255, 0.3); }
.content-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow); padding: 28px 30px 32px; }
.app-context-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; padding: 14px 16px; background: var(--surface-muted); border: 1px solid var(--border); border-radius: var(--radius); }
.app-context-main { display: flex; align-items: center; gap: 12px; }
.app-context-icon { width: 36px; height: 36px; border-radius: 10px; background: var(--brand-soft); color: var(--brand-strong); display: flex; align-items: center; justify-content: center; }
.app-context-title { font-weight: 700; color: var(--text); }
.app-context-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
@media (max-width: 720px) { .sidebar { width: 200px; } .module-header { flex-direction: column; align-items: flex-start; } }
</style>
