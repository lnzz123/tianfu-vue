<template>
  <div class="panel">
    <div class="panel-header">
      <div class="filter-row">
        <div class="field">
          <label>姓名</label>
          <input v-model="filters.realName" placeholder="例：张三" />
        </div>
        <div class="field">
          <label>手机号</label>
          <input v-model="filters.phone" placeholder="例：13900000000" />
        </div>
        <div class="field">
          <label>证件号码</label>
          <input v-model="filters.idNumber" placeholder="证件号码" />
        </div>
        <button class="primary" @click="loadUsers">查询</button>
        <button class="primary add-user-btn" @click="toggleAddUser">
          {{ showAddForm ? '收起添加用户' : '添加用户' }}
        </button>
      </div>
    </div>

    <div class="panel-body">
      <table class="data-table">
        <thead>
          <tr>
            <th>姓名</th>
            <th>证件类型</th>
            <th>证件号码</th>
            <th>手机号</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="center">加载中...</td>
          </tr>
          <tr v-else-if="users.length === 0">
            <td colspan="5" class="center">暂无数据</td>
          </tr>
          <tr v-for="u in users" :key="u.phone">
            <td>{{ u.realName }}</td>
            <td>{{ u.idType }}</td>
            <td>{{ u.idNumber }}</td>
            <td>{{ u.phone }}</td>
            <td>
              <button class="danger" @click="removeUser(u.phone)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- 仅在非弹窗状态下显示列表相关错误 -->
      <div v-if="!showAddForm && error" class="error">{{ error }}</div>
    </div>

    <div v-if="showAddForm" class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <h3 class="modal-title">添加用户</h3>
          <!-- 弹窗内显示新增用户相关错误 -->
          <div v-if="error" class="error">{{ error }}</div>
          <div class="add-user-form">
            <div class="field-row">
              <div class="field">
                <label>姓名</label>
                <input v-model="newUser.realName" placeholder="请输入姓名" />
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <label>证件类型</label>
                <select v-model="newUser.idType">
                  <option value="居民身份证">居民身份证</option>
                </select>
              </div>
              <div class="field">
                <label>证件号码</label>
                <input v-model="newUser.idNumber" placeholder="请输入证件号码" />
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <label>手机号</label>
                <input v-model="newUser.phone" placeholder="请输入手机号" />
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <label>登录密码</label>
                <input v-model="newUser.password" type="password" placeholder="请设置登录密码" />
              </div>
            </div>
          </div>
          <div class="add-user-actions">
            <button class="primary" @click="submitNewUser">保存</button>
            <button class="danger" type="button" @click="cancelAddUser">取消</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserManage',
  data () {
    return {
      filters: {
        realName: '',
        phone: '',
        idNumber: ''
      },
      users: [],
      loading: false,
      error: '',
      showAddForm: false,
      newUser: {
        realName: '',
        idType: '居民身份证',
        idNumber: '',
        phone: '',
        password: ''
      }
    }
  },
  created () {
    this.loadUsers()
  },
  methods: {
    async loadUsers () {
      this.loading = true
      this.error = ''
      try {
        const params = new URLSearchParams()
        if (this.filters.realName) params.append('realName', this.filters.realName)
        if (this.filters.phone) params.append('phone', this.filters.phone)
        if (this.filters.idNumber) params.append('idNumber', this.filters.idNumber)
        const token = localStorage.getItem('adminToken') || ''
        // 当前管理端入口在天府通办菜单下，对应 appId = 1
        const resp = await fetch('/api/apps/1/admin/users?' + params.toString(), {
          headers: {
            'user-authentication': token
          }
        })
        const data = await resp.json()
        if (data.code === 1) {
          this.users = data.data || []
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
        // 当前管理端入口在天府通办菜单下，对应 appId = 1
        const resp = await fetch('/api/apps/1/admin/users/' + encodeURIComponent(phone), {
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
    toggleAddUser () {
      this.showAddForm = !this.showAddForm
      if (this.showAddForm) {
        this.resetNewUser()
      }
    },
    resetNewUser () {
      this.newUser = {
        realName: '',
        idType: '',
        idNumber: '',
        phone: '',
        password: ''
      }
    },
    cancelAddUser () {
      this.showAddForm = false
      this.resetNewUser()
    },
    async submitNewUser () {
      if (!this.newUser.realName || !this.newUser.idType || !this.newUser.idNumber || !this.newUser.phone || !this.newUser.password) {
        this.error = '请完整填写新增用户的所有信息'
        return
      }
      this.error = ''
      try {
        const token = localStorage.getItem('adminToken') || ''
        // 当前管理端入口在天府通办菜单下，对应 appId = 1
        const resp = await fetch('/api/apps/1/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'user-authentication': token
          },
          body: JSON.stringify(this.newUser)
        })
        const data = await resp.json()
        if (data.code === 1) {
          this.showAddForm = false
          this.resetNewUser()
          this.loadUsers()
        } else {
          this.error = data.msg || '添加用户失败'
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

.panel-header {
  padding-bottom: 12px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
}

.modal-mask {
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-wrapper {
  width: 100%;
  max-width: 480px;
  padding: 0 16px;
}

.modal-container {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px 24px 18px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.modal-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
}

.add-user-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.add-user-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.field-row {
  display: flex;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
}

.field label {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.field input,
.field select {
  width: 180px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid #ddd;
  padding: 0 8px;
  box-sizing: border-box;
}

button.primary {
  height: 32px;
  padding: 0 18px;
  border-radius: 6px;
  border: none;
  background-color: #7b5cff;
  color: #fff;
  cursor: pointer;
}

button.danger {
  height: 26px;
  padding: 0 12px;
  border-radius: 4px;
  border: none;
  background-color: #ff7875;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
}

.data-table th,
.data-table td {
  border-bottom: 1px solid #f0f0f0;
  padding: 8px 10px;
  font-size: 13px;
  text-align: left;
}

.data-table thead {
  background-color: #fafafa;
}

.center {
  text-align: center;
}

.error {
  margin-top: 10px;
  color: #ff4d4f;
  font-size: 13px;
}
</style>
