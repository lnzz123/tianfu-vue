<template>
  <div class="panel">
    <div class="panel-header">
      <div class="filter-row">
        <div class="field">
          <label>产权人姓名</label>
          <input v-model="filters.ownerName" placeholder="例：张三" />
        </div>
        <div class="field">
          <label>证件号码</label>
          <input v-model="filters.idNumber" placeholder="证件号码" />
        </div>
        <div class="field">
          <label>城市</label>
          <input v-model="filters.city" placeholder="例：成都市" />
        </div>
        <button class="primary" @click="loadProperties">查询</button>
        <button class="secondary" @click="openCreate">新增房产</button>
      </div>
    </div>

    <div class="panel-body">
      <table class="data-table">
        <thead>
          <tr>
            <th>产权人</th>
            <th>证件号</th>
            <th>手机号</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="4" class="center">加载中...</td>
          </tr>
          <tr v-else-if="ownerGroups.length === 0">
            <td colspan="4" class="center">暂无数据</td>
          </tr>
          <tr
            v-for="group in ownerGroups"
            :key="group.idNumber + '-' + group.ownerName + '-' + (group.phone || '')"
          >
            <td>{{ group.ownerName }}</td>
            <td>{{ group.idNumber }}</td>
            <td>{{ group.phone || '-' }}</td>
            <td>
              <button class="link" @click="openDetail(group)">查看房产信息</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="error" class="error">{{ error }}</div>
    </div>

    <!-- 新增/编辑房产信息对话框 -->
    <div v-if="showDialog" class="dialog-mask">
      <div class="dialog">
        <h3>{{ editing.id ? '编辑房产信息' : '新增房产信息' }}</h3>
        <div class="dialog-body">
          <div v-if="!editing.id" class="field-row owner-select-row">
            <label>产权人姓名</label>
            <div class="owner-select-wrapper">
              <input
                v-model="ownerNameInput"
                @input="debouncedSearchUsers"
                @focus="showUserDropdown = true; debouncedSearchUsers()"
                placeholder="请输入姓名或证件号搜索"
              />
              <button class="dropdown-toggle" type="button" @click="toggleUserDropdown">
                ▼
              </button>
              <ul v-if="showUserDropdown && filteredUsers.length" class="user-dropdown">
                <li
                  v-for="u in filteredUsers"
                  :key="u.id + '-' + u.idNumber"
                  @click="selectUser(u)"
                >
                  {{ u.realName }}（ID: {{ u.id }}，证件号: {{ u.idNumber }}）
                </li>
              </ul>
            </div>
          </div>
          <div v-if="!editing.id" class="field-row">
            <label>证件号码</label>
            <input v-model="editing.idNumber" @blur="handleIdNumberBlur" />
          </div>
          <div class="field-row field-row-2col">
            <div class="field-half">
              <label>城市</label>
              <input v-model="editing.city" />
            </div>
            <div class="field-half">
              <label>行政区</label>
              <input v-model="editing.district" />
            </div>
          </div>
          <div class="field-row field-row-2col">
            <div class="field-half">
              <label>街道</label>
              <input v-model="editing.street" />
            </div>
            <div class="field-half">
              <label>门牌号</label>
              <input v-model="editing.doorNo" />
            </div>
          </div>
          <div class="field-row field-row-2col">
            <div class="field-half">
              <label>栋号</label>
              <input v-model.number="editing.buildingNo" type="number" />
            </div>
            <div class="field-half">
              <label>单元</label>
              <input v-model.number="editing.unitNo" type="number" />
            </div>
          </div>
          <div class="field-row field-row-2col">
            <div class="field-half">
              <label>楼层</label>
              <input v-model="editing.floor" />
            </div>
            <div class="field-half">
              <label>房号</label>
              <input v-model.number="editing.roomNo" type="number" />
            </div>
          </div>
          <div class="field-row field-row-2col">
            <div class="field-half">
              <label>套内面积 (㎡)</label>
              <input v-model.number="editing.areaInCasing" type="number" step="0.01" />
            </div>
            <div class="field-half">
              <label>公摊面积 (㎡)</label>
              <input v-model.number="editing.sharedArea" type="number" step="0.01" />
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="secondary" @click="closeDialog">取消</button>
          <button class="primary" @click="saveProperty">保存</button>
        </div>
      </div>
    </div>

    <!-- 房产信息详情对话框 -->
    <div v-if="showDetailDialog" class="dialog-mask">
      <div class="dialog dialog-detail">
        <h3>房产信息详情</h3>
        <div class="dialog-body">
          <table class="data-table" style="margin-top: 0;">
            <thead>
              <tr>
                <th>城市</th>
                <th>行政区</th>
                <th>街道</th>
                <th>门牌号</th>
                <th>栋号</th>
                <th>单元</th>
                <th>楼层</th>
                <th>房号</th>
                <th>套内面积 (㎡)</th>
                <th>公摊面积 (㎡)</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in detailProperties"
                :key="item.id"
              >
                <td>{{ item.city }}</td>
                <td>{{ item.district }}</td>
                <td>{{ item.street }}</td>
                <td>{{ item.doorNo }}</td>
                <td>{{ item.buildingNo }}</td>
                <td>{{ item.unitNo }}</td>
                <td>{{ item.floor }}</td>
                <td>{{ item.roomNo }}</td>
                <td>{{ item.areaInCasing }}</td>
                <td>{{ item.sharedArea }}</td>
                <td>
                  <button class="link" @click="startEditFromDetail(item)">编辑</button>
                  <button class="danger" @click="removeFromDetail(item.id)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="dialog-footer">
          <button class="secondary" @click="closeDetailDialog">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
function cloneEmptyProperty () {
  return {
    id: null,
    ownerName: '',
    idNumber: '',
    city: '成都市',
    district: '',
    street: '',
    doorNo: '',
    buildingNo: null,
    unitNo: null,
    floor: '',
    roomNo: null,
    areaInCasing: null,
    sharedArea: null
  }
}

export default {
  name: 'PropertyManage',
  data () {
    return {
      filters: {
        ownerName: '',
        idNumber: '',
        city: '成都市'
      },
      properties: [],
      loading: false,
      error: '',
      showDialog: false,
      showDetailDialog: false,
      detailItem: {},
      detailProperties: [],
      editingFromDetail: false,
      editing: cloneEmptyProperty(),
      ownerNameInput: '',
      userSearchLoading: false,
      userSearchError: '',
      userCandidates: [],
      showUserDropdown: false,
      userSearchTimer: null
    }
  },
  computed: {
    filteredUsers () {
      return this.userCandidates
    },
    ownerGroups () {
      const map = new Map()
      if (!Array.isArray(this.properties)) {
        return []
      }
      this.properties.forEach((p) => {
        if (!p) return
        const ownerName = p.ownerName || ''
        const idNumber = p.idNumber || ''
        const phone = p.phone || ''
        const key = idNumber + '__' + ownerName + '__' + phone
        if (!map.has(key)) {
          map.set(key, {
            ownerName,
            idNumber,
            phone,
            properties: []
          })
        }
        map.get(key).properties.push(p)
      })
      return Array.from(map.values())
    }
  },
  created () {
    this.loadProperties()
  },
  methods: {
    openDetail (group) {
      this.detailItem = {
        ownerName: group.ownerName,
        idNumber: group.idNumber,
        phone: group.phone || ''
      }
      if (Array.isArray(group.properties)) {
        this.detailProperties = group.properties.map(p => Object.assign({}, p))
      } else {
        this.detailProperties = []
      }
      this.showDetailDialog = true
    },
    closeDetailDialog () {
      this.showDetailDialog = false
    },
    startEditFromDetail (item) {
      if (!item || !item.id) return
      // 从详情进入编辑：不允许修改产权人和证件号
      const copy = Object.assign(cloneEmptyProperty(), item)
      this.editing = copy
      this.ownerNameInput = item.ownerName || ''
      this.editingFromDetail = true
      this.showDetailDialog = false
      this.showDialog = true
    },
    async removeFromDetail (id) {
      await this.removeProperty(id)
      // 删除成功时 this.error 为空
      if (!this.error) {
        this.detailProperties = this.detailProperties.filter(p => p.id !== id)
        if (!this.detailProperties.length) {
          this.showDetailDialog = false
        }
      }
    },
    async loadProperties () {
      this.loading = true
      this.error = ''
      try {
        const params = new URLSearchParams()
        if (this.filters.ownerName) params.append('ownerName', this.filters.ownerName)
        if (this.filters.idNumber) params.append('idNumber', this.filters.idNumber)
        if (this.filters.city) params.append('city', this.filters.city)
        const token = localStorage.getItem('adminToken') || ''
        // 当前管理端入口在天府通办菜单下，对应 appId = 1
        const resp = await fetch('/api/apps/1/admin/properties?' + params.toString(), {
          headers: {
            'user-authentication': token
          }
        })
        const data = await resp.json()
        if (data.code === 1) {
          this.properties = data.data || []
        } else {
          this.error = data.msg || '查询失败'
        }
      } catch (e) {
        this.error = '网络错误：' + (e.message || '未知错误')
      } finally {
        this.loading = false
      }
    },
    openCreate () {
      this.editing = cloneEmptyProperty()
      this.ownerNameInput = ''
      this.userCandidates = []
      this.showUserDropdown = false
      this.editingFromDetail = false
      this.showDialog = true
    },
    editProperty (p) {
      this.editing = Object.assign(cloneEmptyProperty(), p)
      this.ownerNameInput = p.ownerName || ''
      this.userCandidates = []
      this.showUserDropdown = false
      this.showDialog = true
    },
    closeDialog () {
      this.showDialog = false
      if (this.editingFromDetail) {
        // 从详情编辑返回：仅重新展示详情弹窗
        this.showDetailDialog = true
        this.editingFromDetail = false
      }
    },
    toggleUserDropdown () {
      this.showUserDropdown = !this.showUserDropdown
      if (this.showUserDropdown) {
        this.searchUsers()
      }
    },
    debouncedSearchUsers () {
      if (this.userSearchTimer) {
        clearTimeout(this.userSearchTimer)
      }
      this.userSearchTimer = setTimeout(() => {
        this.searchUsers()
      }, 300)
    },
    async searchUsers () {
      const keyword = (this.ownerNameInput || '').trim()
      const idNumber = (this.editing.idNumber || '').trim()
      if (!keyword && !idNumber) {
        this.userCandidates = []
        return
      }
      this.userSearchLoading = true
      this.userSearchError = ''
      try {
        const params = new URLSearchParams()
        if (keyword && !idNumber) {
          params.append('realName', keyword)
        }
        if (idNumber) {
          params.append('idNumber', idNumber)
        }
        const token = localStorage.getItem('adminToken') || ''
        // 当前管理端入口在天府通办菜单下，对应 appId = 1
        const resp = await fetch('/api/apps/1/admin/users?' + params.toString(), {
          headers: {
            'user-authentication': token
          }
        })
        const data = await resp.json()
        if (data.code === 1) {
          const list = data.data || []
          this.userCandidates = Array.isArray(list) ? list : []
        } else {
          this.userSearchError = data.msg || '用户查询失败'
          this.userCandidates = []
        }
      } catch (e) {
        this.userSearchError = '网络错误：' + (e.message || '未知错误')
        this.userCandidates = []
      } finally {
        this.userSearchLoading = false
      }
    },
    selectUser (user) {
      this.editing.ownerName = user.realName
      this.editing.idNumber = user.idNumber
      this.ownerNameInput = user.realName
      this.showUserDropdown = false
    },
    async handleIdNumberBlur () {
      const idNumber = (this.editing.idNumber || '').trim()
      if (!idNumber) return
      // 根据证件号唯一匹配用户
      this.ownerNameInput = this.ownerNameInput || ''
      await this.searchUsers()
      if (this.userCandidates && this.userCandidates.length === 1) {
        const user = this.userCandidates[0]
        this.editing.ownerName = user.realName
        this.ownerNameInput = user.realName
      }
      this.showUserDropdown = !!(this.userCandidates && this.userCandidates.length)
    },
    async saveProperty () {
      const token = localStorage.getItem('adminToken') || ''
      const payload = Object.assign({}, this.editing)
      // 当前管理端入口在天府通办菜单下，对应 appId = 1
      const url = this.editing.id ? '/api/apps/1/admin/properties/' + this.editing.id : '/api/apps/1/admin/properties'
      const method = this.editing.id ? 'PUT' : 'POST'
      this.error = ''
      try {
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
          this.showDialog = false
          this.loadProperties()
          if (this.editingFromDetail) {
            const idx = this.detailProperties.findIndex(p => p.id === this.editing.id)
            if (idx !== -1) {
              const updated = Object.assign({}, this.editing)
              this.detailProperties.splice(idx, 1, updated)
            }
            this.showDetailDialog = true
            this.editingFromDetail = false
          }
        } else {
          this.error = data.msg || '保存失败'
        }
      } catch (e) {
        this.error = '网络错误：' + (e.message || '未知错误')
      }
    },
    async removeProperty (id) {
      if (!window.confirm('确定要删除该房产信息吗？')) return
      const token = localStorage.getItem('adminToken') || ''
      this.error = ''
      try {
        // 当前管理端入口在天府通办菜单下，对应 appId = 1
        const resp = await fetch('/api/apps/1/admin/properties/' + id, {
          method: 'DELETE',
          headers: {
            'user-authentication': token
          }
        })
        const data = await resp.json()
        if (data.code === 1) {
          this.loadProperties()
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

.field {
  display: flex;
  flex-direction: column;
}

.field label {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.field input {
  width: 170px;
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

button.secondary {
  height: 32px;
  padding: 0 18px;
  border-radius: 6px;
  border: 1px solid #7b5cff;
  background-color: #fff;
  color: #7b5cff;
  cursor: pointer;
}

button.danger {
  height: 26px;
  padding: 0 10px;
  border-radius: 4px;
  border: none;
  background-color: #ff7875;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
}

button.link {
  background: none;
  border: none;
  color: #7b5cff;
  cursor: pointer;
  margin-right: 6px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
}

.data-table th,
.data-table td {
  border-bottom: 1px solid #f0f0f0;
  padding: 6px 8px;
  font-size: 12px;
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

.dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog {
  width: 520px;
  background: #ffffff;
  border-radius: 10px;
  padding: 18px 20px 16px;
}

.dialog-detail {
  width: 880px;
}

.dialog h3 {
  margin: 0 0 12px;
  font-size: 16px;
}

.dialog-body {
  max-height: 360px;
  overflow-y: auto;
  overflow-x: hidden;
}

.field-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.field-row label {
  width: 90px;
  font-size: 13px;
  color: #555;
}

.field-row input {
  flex: 1;
  height: 30px;
  border-radius: 6px;
  border: 1px solid #ddd;
  padding: 0 8px;
  box-sizing: border-box;
}


.field-row-2col {
  align-items: center;
  column-gap: 16px;
}

.field-row-2col .field-half {
  flex: 0 0 calc(50% - 10px);
  max-width: calc(50% - 10px);
  display: flex;
  align-items: center;
}

.field-row-2col .field-half label {
  width: 90px;
  margin-right: 6px;
  margin-bottom: 0;
}

.field-row-2col .field-half input {
  flex: 1;
}

.owner-select-row .owner-select-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;
}

.owner-select-row .owner-select-wrapper input {
  flex: 1;
}

.dropdown-toggle {
  margin-left: 6px;
  width: 28px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background-color: #fafafa;
  cursor: pointer;
  font-size: 12px;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin: 4px 0 0;
  padding: 4px 0;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  max-height: 180px;
  overflow-y: auto;
  list-style: none;
  font-size: 12px;
  z-index: 10;
}

.user-dropdown li {
  padding: 4px 10px;
  cursor: pointer;
}

.user-dropdown li:hover {
  background-color: #f5f5f5;
}

.dialog-footer {
  margin-top: 14px;
  text-align: right;
}
</style>
