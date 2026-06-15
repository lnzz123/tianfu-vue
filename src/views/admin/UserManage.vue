<template>
  <div class="panel">
    <!-- 查询工具栏 -->
    <div class="toolbar">
      <div class="filters">
        <div class="field">
          <label>姓名</label>
          <input class="ui-input field-input" v-model="filters.realName" placeholder="例：张三" @keyup.enter="loadUsers" />
        </div>
        <div class="field">
          <label>手机号</label>
          <input class="ui-input field-input" v-model="filters.phone" placeholder="例：13900000000" @keyup.enter="loadUsers" />
        </div>
        <div class="field">
          <label>证件号码</label>
          <input class="ui-input field-input" v-model="filters.idNumber" placeholder="证件号码" @keyup.enter="loadUsers" />
        </div>
        <div class="toolbar-actions">
          <base-button variant="primary" icon="search" @click="loadUsers">查询</base-button>
          <base-button
            variant="secondary"
            :icon="showAddForm ? 'chevron-down' : 'plus'"
            @click="toggleAddUser"
          >{{ showAddForm ? '收起添加用户' : '添加用户' }}</base-button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="panel-body">
      <div class="ui-table-wrap">
        <table class="ui-table">
          <thead>
            <tr>
              <th><input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" /></th>
              <th>姓名</th>
              <th>证件类型</th>
              <th>证件号码</th>
              <th>手机号</th>
              <th class="col-action">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="center muted">加载中...</td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="6">
                <empty-state icon="users" text="暂无用户数据" />
              </td>
            </tr>
            <tr v-for="u in users" :key="u.id || u.phone">
              <td><input type="checkbox" :value="u" v-model="selected" /></td>
              <td>
                <div class="cell-name">
                  <span class="cell-avatar">{{ (u.realName || '?').charAt(0) }}</span>
                  <span>{{ u.realName }}</span>
                </div>
              </td>
              <td><span class="tag">{{ u.idType }}</span></td>
              <td class="mono">{{ u.idNumber }}</td>
              <td class="mono">{{ u.phone }}</td>
              <td class="col-action">
                <base-button variant="link" @click="startEdit(u)">编辑</base-button>
                <base-button variant="danger" @click="removeUser(u.phone)">删除</base-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        <div class="left-actions">
          <base-button variant="danger" :disabled="selected.length === 0" @click="removeBatch">批量删除</base-button>
        </div>
        <div class="pagination" v-if="page.total > 0">
          <span>共 {{ page.total }} 条</span>
          <div class="pager">
            <button :disabled="page.pageNo === 1" @click="changePage(page.pageNo - 1)">上一页</button>
            <span>{{ page.pageNo }} / {{ totalPages }}</span>
            <button :disabled="page.pageNo >= totalPages" @click="changePage(page.pageNo + 1)">下一页</button>
            <select v-model.number="page.pageSize" @change="changePage(1)">
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
        </div>
      </div>
      <!-- 仅在非弹窗状态下显示列表相关错误 -->
      <div v-if="!showAddForm && error" class="error">{{ error }}</div>
    </div>

    <!-- 添加/编辑用户弹窗 -->
    <base-modal v-if="showAddForm" :title="editing.id ? '编辑用户' : '添加用户'" @close="cancelAddUser">
      <!-- 弹窗内显示新增用户相关错误 -->
      <div v-if="error" class="error">{{ error }}</div>
      <div class="add-user-form">
        <div class="field-row">
          <div class="field block">
            <label>姓名</label>
            <input class="ui-input" v-model="newUser.realName" placeholder="请输入姓名" />
          </div>
        </div>
        <div class="field-row">
          <div class="field block">
            <label>证件类型</label>
            <select class="ui-select" v-model="newUser.idType">
              <option value="居民身份证">居民身份证</option>
            </select>
          </div>
          <div class="field block">
            <label>证件号码</label>
            <input class="ui-input" v-model="newUser.idNumber" placeholder="请输入证件号码" />
          </div>
        </div>
        <div class="field-row">
          <div class="field block">
            <label>手机号</label>
            <input class="ui-input" v-model="newUser.phone" placeholder="请输入手机号" />
          </div>
        </div>
        <div class="field-row">
          <div class="field block">
            <label>登录密码</label>
            <input class="ui-input" v-model="newUser.password" type="password" placeholder="请设置登录密码" />
          </div>
        </div>
      </div>
      <template #footer>
        <base-button variant="secondary" @click="cancelAddUser">取消</base-button>
        <base-button variant="primary" @click="submitNewUser">保存</base-button>
      </template>
    </base-modal>
  </div>
</template>

<script>
import BaseButton from '../../components/BaseButton.vue'
import BaseModal from '../../components/BaseModal.vue'
import EmptyState from '../../components/EmptyState.vue'

export default {
  name: 'UserManage',
  components: {
    BaseButton,
    BaseModal,
    EmptyState
  },
  props: {
    appId: {
      type: Number,
      default: 1
    }
  },
  data () {
    return {
      filters: {
        realName: '',
        phone: '',
        idNumber: ''
      },
      users: [],
      selected: [],
      page: {
        pageNo: 1,
        pageSize: 10,
        total: 0
      },
      loading: false,
      error: '',
      showAddForm: false,
      newUser: {
        realName: '',
        idType: '居民身份证',
        idNumber: '',
        phone: '',
        password: ''
      },
      editing: {}
    }
  },
  computed: {
    totalPages () {
      return this.page.pageSize > 0 ? Math.ceil(this.page.total / this.page.pageSize) || 1 : 1
    },
    isAllSelected () {
      return this.selected.length === this.users.length && this.users.length > 0
    }
  },
  created () {
    this.loadUsers()
  },
  watch: {
    appId () {
      this.page.pageNo = 1
      this.selected = []
      this.filters = {
        realName: '',
        phone: '',
        idNumber: ''
      }
      this.loadUsers()
    }
  },
  methods: {
    async loadUsers () {
      this.loading = true
      this.error = ''
      try {
        const params = new URLSearchParams()
        params.append('pageNo', this.page.pageNo)
        params.append('pageSize', this.page.pageSize)
        if (this.filters.realName) params.append('realName', this.filters.realName)
        if (this.filters.phone) params.append('phone', this.filters.phone)
        if (this.filters.idNumber) params.append('idNumber', this.filters.idNumber)
        const token = localStorage.getItem('adminToken') || ''
        const resp = await fetch(`/api/apps/${this.appId}/admin/users?` + params.toString(), {
          headers: {
            'user-authentication': token
          }
        })
        const data = await resp.json()
        if (data.code === 1) {
          this.users = (data.data && data.data.records) || []
          this.page.total = data.data ? data.data.total : 0
          this.page.pageNo = data.data ? data.data.pageNo : this.page.pageNo
          this.page.pageSize = data.data ? data.data.pageSize : this.page.pageSize
        } else {
          this.error = data.msg || '查询失败'
        }
      } catch (e) {
        this.error = '网络错误：' + (e.message || '未知错误')
      } finally {
        this.loading = false
      }
    },
    async removeUser (phone) {
      if (!window.confirm('确定要删除该用户吗？')) return
      this.error = ''
      try {
        const token = localStorage.getItem('adminToken') || ''
        const resp = await fetch(`/api/apps/${this.appId}/admin/users/` + encodeURIComponent(phone), {
          method: 'DELETE',
          headers: {
            'user-authentication': token
          }
        })
        const data = await resp.json()
        if (data.code === 1) {
          this.loadUsers()
        } else {
          this.error = data.msg || '删除失败'
        }
      } catch (e) {
        this.error = '网络错误：' + (e.message || '未知错误')
      }
    },
    async removeBatch () {
      if (this.selected.length === 0) return
      if (!window.confirm('确定删除选中的用户吗？')) return
      this.error = ''
      try {
        const token = localStorage.getItem('adminToken') || ''
        const phones = this.selected.map(u => u.phone)
        const resp = await fetch(`/api/apps/${this.appId}/admin/users`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'user-authentication': token
          },
          body: JSON.stringify(phones)
        })
        const data = await resp.json()
        if (data.code === 1) {
          this.selected = []
          this.loadUsers()
        } else {
          this.error = data.msg || '删除失败'
        }
      } catch (e) {
        this.error = '网络错误：' + (e.message || '未知错误')
      }
    },
    startEdit (user) {
      this.editing = Object.assign({}, user)
      this.newUser = Object.assign({}, user, { password: '' })
      this.showAddForm = true
    },
    toggleAddUser () {
      this.showAddForm = !this.showAddForm
      if (this.showAddForm) {
        this.resetNewUser()
      }
    },
    resetNewUser () {
      this.editing = {}
      this.newUser = {
        realName: '',
        idType: '居民身份证',
        idNumber: '',
        phone: '',
        password: ''
      }
    },
    cancelAddUser () {
      this.showAddForm = false
      this.resetNewUser()
    },
    changePage (pageNo) {
      this.page.pageNo = pageNo
      this.loadUsers()
    },
    toggleSelectAll (e) {
      if (e.target.checked) {
        this.selected = [...this.users]
      } else {
        this.selected = []
      }
    },
    async submitNewUser () {
      if (!this.newUser.realName || !this.newUser.idType || !this.newUser.idNumber || !this.newUser.phone || (!this.editing.id && !this.newUser.password)) {
        this.error = '请完整填写用户信息'
        return
      }
      this.error = ''
      try {
        const token = localStorage.getItem('adminToken') || ''
        const isEdit = !!this.editing.id
        const url = isEdit ? `/api/apps/${this.appId}/admin/users/${this.editing.id}` : `/api/apps/${this.appId}/admin/users`
        const method = isEdit ? 'PUT' : 'POST'
        const payload = Object.assign({}, this.newUser)
        if (isEdit && !payload.password) {
          delete payload.password
        }
        const resp = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'user-authentication': token
          },
          body: JSON.stringify(payload)
        })
        const data = await resp.json()
        if (data.code === 1) {
          this.showAddForm = false
          this.resetNewUser()
          this.loadUsers()
        } else {
          this.error = data.msg || '保存失败'
        }
      } catch (e) {
        this.error = '网络错误：' + (e.message || '未知错误')
      }
    }
  }
}
</script>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
}

/* 工具栏 */
.toolbar {
  background: var(--surface-muted);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 18px;
  margin-bottom: 18px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: flex-end;
}

.toolbar-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.field {
  display: flex;
  flex-direction: column;
}

.field label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.field-input {
  width: 190px;
}

.field.block .ui-input,
.field.block .ui-select {
  width: 100%;
}

/* 表格单元格 */
.col-action {
  width: 110px;
  text-align: right;
}

.cell-name {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

.cell-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--brand-soft);
  color: var(--brand-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.mono {
  font-variant-numeric: tabular-nums;
  color: var(--text-muted);
}

.tag {
  display: inline-block;
  padding: 3px 10px;
  font-size: 12px;
  border-radius: 999px;
  background: var(--brand-soft);
  color: var(--brand-strong);
  font-weight: 500;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pager {
  display: flex;
  align-items: center;
  gap: 8px;
}

.center {
  text-align: center;
}

.muted {
  color: var(--text-muted);
  padding: 28px 0;
}

.error {
  margin-top: 14px;
  color: var(--danger);
  font-size: 13px;
  padding: 10px 12px;
  background: var(--danger-soft);
  border: 1px solid #fecaca;
  border-radius: var(--radius-sm);
}

/* 添加用户表单 */
.add-user-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 6px 0 0;
}

.field-row {
  display: flex;
  gap: 14px;
}

.field-row .field {
  flex: 1;
}
</style>
