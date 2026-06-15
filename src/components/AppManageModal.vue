<template>
  <base-modal :title="formVisible ? (editing.id ? '编辑 App' : '新增 App') : '管理 App'" width="760px" @close="handleClose">
    <template v-if="!formVisible">
      <div class="toolbar">
        <input
          v-model="keyword"
          class="ui-input search-input"
          placeholder="按名称或 AppId 搜索"
          @keyup.enter="loadApps"
        />
        <div class="actions">
          <base-button variant="secondary" @click="loadApps">查询</base-button>
          <base-button variant="primary" icon="plus" @click="openCreate">新增 App</base-button>
        </div>
      </div>

      <div v-if="error" class="error">{{ error }}</div>
      <div class="list-wrap">
        <div v-if="loading" class="center muted">加载中...</div>
        <empty-state v-else-if="apps.length === 0" icon="layers" text="暂无 App 数据" />
        <div v-else class="app-list">
          <div v-for="item in apps" :key="item.id" class="app-item">
            <div class="app-main">
              <div class="app-icon">
                <app-icon :name="resolveIcon(item.icon)" :size="18" />
              </div>
              <div class="app-meta">
                <div class="app-name">{{ item.appName }}</div>
                <div class="app-id">AppId: {{ item.id }}</div>
                <div v-if="item.icon" class="app-icon-text">图标：{{ item.icon }}</div>
              </div>
            </div>
            <div class="app-actions">
              <base-button variant="link" @click="openEdit(item)">编辑</base-button>
              <base-button variant="danger" @click="removeApp(item.id)">删除</base-button>
            </div>
          </div>
        </div>
      </div>

      <div class="footer">
        <div class="pagination" v-if="page.total > 0">
          <span>共 {{ page.total }} 条</span>
          <div class="pager">
            <button :disabled="page.pageNo === 1" @click="changePage(page.pageNo - 1)">上一页</button>
            <span>{{ page.pageNo }} / {{ totalPages }}</span>
            <button :disabled="page.pageNo >= totalPages" @click="changePage(page.pageNo + 1)">下一页</button>
          </div>
        </div>
        <base-button variant="secondary" @click="handleClose">关闭</base-button>
      </div>
    </template>

    <template v-else>
      <div class="form">
        <div class="field">
          <label>App 名称</label>
          <input v-model="form.appName" class="ui-input" placeholder="请输入 App 名称" />
        </div>
        <div class="field">
          <label>图标</label>
          <input v-model="form.icon" class="ui-input" placeholder="请输入图标名，如 layers / users" />
        </div>
        <div class="field hint">说明：图标当前先使用内置图标名，后续可再扩展上传。</div>
        <div v-if="error" class="error">{{ error }}</div>
        <div class="footer">
          <base-button variant="secondary" @click="cancelForm">取消</base-button>
          <base-button variant="primary" @click="saveApp">保存</base-button>
        </div>
      </div>
    </template>
  </base-modal>
</template>

<script>
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'
import EmptyState from './EmptyState.vue'
import AppIcon from './AppIcon.vue'

export default {
  name: 'AppManageModal',
  components: { BaseModal, BaseButton, EmptyState, AppIcon },
  props: { appId: { type: Number, default: 1 } },
  data () {
    return {
      keyword: '',
      loading: false,
      error: '',
      apps: [],
      page: { pageNo: 1, pageSize: 10, total: 0 },
      formVisible: false,
      editing: {},
      form: { appName: '', icon: '' }
    }
  },
  computed: {
    totalPages () {
      return this.page.pageSize > 0 ? Math.ceil(this.page.total / this.page.pageSize) || 1 : 1
    }
  },
  created () {
    this.loadApps()
  },
  methods: {
    resolveIcon (icon) {
      return icon || 'app'
    },
    handleClose () {
      this.formVisible = false
      this.$emit('close')
    },
    async loadApps () {
      this.loading = true
      this.error = ''
      try {
        const qs = new URLSearchParams({
          pageNo: String(this.page.pageNo),
          pageSize: String(this.page.pageSize)
        })
        if (this.keyword) qs.append('keyword', this.keyword)
        const token = localStorage.getItem('adminToken') || ''
        const resp = await fetch(`/api/apps/${this.appId}/admin/apps?` + qs.toString(), {
          headers: { 'user-authentication': token }
        })
        const data = await resp.json()
        if (data.code === 1) {
          this.apps = (data.data && data.data.records) || []
          this.page.pageNo = data.data ? data.data.pageNo : this.page.pageNo
          this.page.pageSize = data.data ? data.data.pageSize : this.page.pageSize
          this.page.total = data.data ? data.data.total : 0
        } else {
          this.error = data.msg || '查询失败'
        }
      } catch (e) {
        this.error = '网络错误：' + (e.message || '未知错误')
      } finally {
        this.loading = false
      }
    },
    changePage (pageNo) {
      this.page.pageNo = pageNo
      this.loadApps()
    },
    openCreate () {
      this.editing = {}
      this.form = { appName: '', icon: '' }
      this.formVisible = true
      this.error = ''
    },
    openEdit (item) {
      this.editing = Object.assign({}, item)
      this.form = {
        appName: item.appName || '',
        icon: item.icon || ''
      }
      this.formVisible = true
      this.error = ''
    },
    cancelForm () {
      this.formVisible = false
      this.error = ''
    },
    async saveApp () {
      if (!this.form.appName) {
        this.error = 'App 名称不能为空'
        return
      }
      try {
        const token = localStorage.getItem('adminToken') || ''
        const isEdit = !!this.editing.id
        const url = isEdit
          ? `/api/apps/${this.appId}/admin/apps/${this.editing.id}`
          : `/api/apps/${this.appId}/admin/apps`
        const payload = {
          appName: this.form.appName,
          icon: this.form.icon
        }
        const resp = await fetch(url, {
          method: isEdit ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'user-authentication': token
          },
          body: JSON.stringify(payload)
        })
        const data = await resp.json()
        if (data.code === 1) {
          this.formVisible = false
          this.loadApps()
          this.$emit('saved', data.data || this.form)
        } else {
          this.error = data.msg || '保存失败'
        }
      } catch (e) {
        this.error = '网络错误：' + (e.message || '未知错误')
      }
    },
    async removeApp (id) {
      if (!window.confirm('确定删除该 App 吗？')) return
      try {
        const token = localStorage.getItem('adminToken') || ''
        const resp = await fetch(`/api/apps/${this.appId}/admin/apps/${id}`, {
          method: 'DELETE',
          headers: { 'user-authentication': token }
        })
        const data = await resp.json()
        if (data.code === 1) {
          this.loadApps()
          this.$emit('saved', { id: this.appId })
        } else {
          this.error = data.msg || '删除失败'
        }
      } catch (e) {
        this.error = '网络错误：' + (e.message || '未知错误')
      }
    }
  }
}
</script>

<style scoped>
.toolbar,
.footer,
.app-item,
.app-main,
.app-actions,
.pagination,
.pager {
  display: flex;
  align-items: center;
}

.toolbar {
  gap: 12px;
  margin-bottom: 14px;
}

.search-input {
  flex: 1;
}

.actions {
  display: flex;
  gap: 10px;
}

.list-wrap {
  min-height: 220px;
}

.app-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.app-item {
  justify-content: space-between;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface-muted);
}

.app-main {
  gap: 12px;
}

.app-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--brand-soft);
  color: var(--brand-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.app-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.app-name {
  font-weight: 600;
  color: var(--text);
}

.app-id,
.app-icon-text {
  font-size: 12px;
  color: var(--text-muted);
}

.app-actions {
  gap: 8px;
}

.footer {
  justify-content: space-between;
  margin-top: 16px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hint {
  font-size: 12px;
  color: var(--text-muted);
}

.error {
  color: var(--danger);
  font-size: 13px;
  padding: 10px 12px;
  background: var(--danger-soft);
  border: 1px solid #fecaca;
  border-radius: var(--radius-sm);
}

.center,
.muted {
  text-align: center;
  color: var(--text-muted);
  padding: 28px 0;
}
</style>