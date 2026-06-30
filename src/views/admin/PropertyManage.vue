<template>
  <div class="panel">
    <!-- 查询工具栏 -->
    <div class="toolbar">
      <div class="filters">
        <div class="field">
          <label>产权人姓名</label>
          <input class="ui-input field-input" v-model="filters.ownerName" placeholder="例：张三" @keyup.enter="loadProperties" />
        </div>
        <div class="field">
          <label>证件号码</label>
          <input class="ui-input field-input" v-model="filters.idNumber" placeholder="证件号码" @keyup.enter="loadProperties" />
        </div>
        <div class="field">
          <label>城市</label>
          <input class="ui-input field-input" v-model="filters.city" placeholder="例：成都市" @keyup.enter="loadProperties" />
        </div>
        <div class="toolbar-actions">
          <base-button variant="primary" icon="search" @click="loadProperties">查询</base-button>
          <base-button variant="secondary" icon="plus" @click="openCreate">新增房产</base-button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="panel-body">
      <div class="ui-table-wrap">
        <table class="ui-table">
          <thead>
            <tr>
              <th>产权人</th>
              <th>证件号</th>
              <th>手机号</th>
              <th class="col-action">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="4" class="center muted">加载中...</td>
            </tr>
            <tr v-else-if="ownerGroups.length === 0">
              <td colspan="4">
                <empty-state icon="building" text="暂无房产数据" />
              </td>
            </tr>
            <tr
              v-for="group in ownerGroups"
              :key="group.idNumber + '-' + group.ownerName + '-' + (group.phone || '')"
            >
              <td>
                <div class="cell-name">
                  <span class="cell-avatar">{{ (group.ownerName || '?').charAt(0) }}</span>
                  <span>{{ group.ownerName }}</span>
                  <span class="count-badge">{{ group.properties.length }} 套</span>
                </div>
              </td>
              <td class="mono">{{ group.idNumber }}</td>
              <td class="mono">{{ group.phone || '-' }}</td>
              <td class="col-action">
                <base-button variant="link" @click="openDetail(group)">查看房产信息</base-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        <div class="left-actions"></div>
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
      <div v-if="error" class="error">{{ error }}</div>
    </div>

    <!-- 新增/编辑房产信息对话框 -->
    <base-modal
      v-if="showDialog"
      :title="editing.id ? '编辑房产信息' : '新增房产信息'"
      width="560px"
      @close="closeDialog"
    >
      <div class="dialog-body">
        <div v-if="!editing.id" class="field-row owner-select-row">
          <label>产权人姓名</label>
          <div class="owner-select-wrapper">
            <input
              class="ui-input"
              v-model="ownerNameInput"
              @input="onOwnerNameInput"
              @focus="onOwnerNameFocus"
              @blur="onOwnerNameBlur"
              placeholder="请输入姓名搜索"
            />
            <button class="dropdown-toggle" type="button" @click="toggleUserDropdown" aria-label="展开用户列表">
              <app-icon name="chevron-down" :size="16" />
            </button>
            <ul v-if="showUserDropdown" class="user-dropdown">
              <li v-if="userSearchLoading" class="dropdown-hint">搜索中...</li>
              <li v-else-if="filteredUsers.length === 0" class="dropdown-hint">暂无匹配用户</li>
              <li
                v-for="u in filteredUsers"
                :key="u.id + '-' + u.idNumber"
                @mousedown.prevent="selectUser(u)"
              >
                {{ u.realName }}（证件号: {{ u.idNumber }}）
              </li>
            </ul>
          </div>
        </div>
        <div v-if="!editing.id" class="field-row">
          <label>证件号码</label>
          <input class="ui-input" v-model="editing.idNumber" @blur="handleIdNumberBlur" />
        </div>
        <div class="field-row field-row-2col">
          <div class="field-half">
            <label>城市</label>
            <input class="ui-input" v-model="editing.city" />
          </div>
          <div class="field-half">
            <label>行政区</label>
            <input class="ui-input" v-model="editing.district" />
          </div>
        </div>
        <div class="field-row field-row-2col">
          <div class="field-half">
            <label>街道</label>
            <input class="ui-input" v-model="editing.street" />
          </div>
          <div class="field-half">
            <label>门牌号</label>
            <input class="ui-input" v-model="editing.doorNo" />
          </div>
        </div>
        <div class="field-row field-row-2col">
          <div class="field-half">
            <label>栋号</label>
            <input class="ui-input" v-model="editing.buildingNo" placeholder="例：1栋、A栋" />
          </div>
          <div class="field-half">
            <label>单元</label>
            <input class="ui-input" v-model="editing.unitNo" placeholder="例：1单元" />
          </div>
        </div>
        <div class="field-row field-row-2col">
          <div class="field-half">
            <label>楼层</label>
            <input class="ui-input" v-model="editing.floor" />
          </div>
          <div class="field-half">
            <label>房号</label>
            <input class="ui-input" v-model="editing.roomNo" placeholder="例：101、1-3-19" />
          </div>
        </div>
        <div class="field-row field-row-2col">
          <div class="field-half">
            <label>规划用途</label>
            <input class="ui-input" v-model="editing.plannedUse" placeholder="例：住宅、商业" />
          </div>
          <div class="field-half">
            <label>套内面积 (㎡)</label>
            <input class="ui-input" v-model.number="editing.areaInCasing" type="number" step="0.01" />
          </div>
        </div>
        <div class="field-row field-row-2col">
          <div class="field-half">
            <label>公摊面积 (㎡)</label>
            <input class="ui-input" v-model.number="editing.sharedArea" type="number" step="0.01" />
          </div>
          <div class="field-half"></div>
        </div>
      </div>
      <template #footer>
        <base-button variant="secondary" @click="closeDialog">取消</base-button>
        <base-button variant="primary" @click="saveProperty">保存</base-button>
      </template>
    </base-modal>

    <!-- 房产信息详情对话框 -->
    <base-modal
      v-if="showDetailDialog"
      title="房产信息详情"
      width="920px"
      @close="closeDetailDialog"
    >
      <div class="detail-owner" v-if="detailItem.ownerName">
        <span class="cell-avatar">{{ (detailItem.ownerName || '?').charAt(0) }}</span>
        <div>
          <div class="detail-owner-name">{{ detailItem.ownerName }}</div>
          <div class="detail-owner-sub">证件号：{{ detailItem.idNumber }}<template v-if="detailItem.phone"> · 手机号：{{ detailItem.phone }}</template></div>
        </div>
      </div>
      <div class="dialog-body">
        <div class="ui-table-wrap">
          <table class="ui-table">
            <thead>
              <tr>
                <th>选择</th>
                <th>城市</th>
                <th>行政区</th>
                <th>街道</th>
                <th>门牌号</th>
                <th>栋号</th>
                <th>单元</th>
                <th>楼层</th>
                <th>房号</th>
                <th>规划用途</th>
                <th>套内面积 (㎡)</th>
                <th>公摊面积 (㎡)</th>
                <th class="col-action">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in detailProperties"
                :key="item.id"
              >
                <td><input type="checkbox" :value="item.id" v-model="selectedDetailIds" /></td>
                <td>{{ item.city }}</td>
                <td>{{ item.district }}</td>
                <td>{{ item.street }}</td>
                <td>{{ item.doorNo }}</td>
                <td>{{ item.buildingNo }}</td>
                <td>{{ item.unitNo }}</td>
                <td>{{ item.floor }}</td>
                <td>{{ item.roomNo }}</td>
                <td>{{ item.plannedUse }}</td>
                <td>{{ item.areaInCasing }}</td>
                <td>{{ item.sharedArea }}</td>
                <td class="col-action detail-actions">
                  <div class="row-actions">
                    <base-button variant="ghost" icon="edit" :icon-size="14" @click="startEditFromDetail(item)">编辑</base-button>
                    <base-button variant="ghost-danger" icon="trash" :icon-size="14" @click="removeFromDetail(item.id)">删除</base-button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <template #footer>
        <div class="detail-footer">
          <base-button variant="danger" :disabled="selectedDetailIds.length === 0" @click="removeBatchDetail">批量删除</base-button>
          <div class="spacer"></div>
          <base-button variant="secondary" @click="closeDetailDialog">关闭</base-button>
        </div>
      </template>
    </base-modal>
  </div>
</template>

<script>
import AppIcon from '../../components/AppIcon.vue'
import BaseButton from '../../components/BaseButton.vue'
import BaseModal from '../../components/BaseModal.vue'
import EmptyState from '../../components/EmptyState.vue'

function cloneEmptyProperty () {
  return {
    id: null,
    ownerName: '',
    idNumber: '',
    city: '成都市',
    district: '',
    street: '',
    doorNo: '',
    buildingNo: '',
    unitNo: '',
    floor: '',
    roomNo: '',
    plannedUse: '',
    areaInCasing: null,
    sharedArea: null
  }
}

export default {
  name: 'PropertyManage',
  components: {
    AppIcon,
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
        ownerName: '',
        idNumber: '',
        city: '成都市'
      },
      properties: [],
      page: {
        pageNo: 1,
        pageSize: 10,
        total: 0
      },
      loading: false,
      error: '',
      showDialog: false,
      showDetailDialog: false,
      detailItem: {},
      detailProperties: [],
      selectedDetailIds: [],
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
    totalPages () {
      return this.page.pageSize > 0 ? Math.ceil(this.page.total / this.page.pageSize) || 1 : 1
    },
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
  watch: {
    appId () {
      this.page.pageNo = 1
      this.filters = {
        ownerName: '',
        idNumber: '',
        city: '成都市'
      }
      this.selectedDetailIds = []
      this.showDialog = false
      this.showDetailDialog = false
      this.editingFromDetail = false
      this.loadProperties()
    }
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
      this.selectedDetailIds = []
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
        this.selectedDetailIds = this.selectedDetailIds.filter(pid => pid !== id)
        if (!this.detailProperties.length) {
          this.showDetailDialog = false
        }
      }
    },
    async removeBatchDetail () {
      if (!this.selectedDetailIds.length) return
      if (!window.confirm('确定删除选中的房产吗？')) return
      const token = localStorage.getItem('adminToken') || ''
      this.error = ''
      try {
        const resp = await fetch(`/api/apps/${this.appId}/admin/properties`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'user-authentication': token
          },
          body: JSON.stringify(this.selectedDetailIds)
        })
        const data = await resp.json()
        if (data.code === 1) {
          this.detailProperties = this.detailProperties.filter(p => !this.selectedDetailIds.includes(p.id))
          this.selectedDetailIds = []
          if (!this.detailProperties.length) {
            this.showDetailDialog = false
          }
          this.loadProperties()
        } else {
          this.error = data.msg || '删除失败'
        }
      } catch (e) {
        this.error = '网络错误：' + (e.message || '未知错误')
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
        params.append('pageNo', this.page.pageNo)
        params.append('pageSize', this.page.pageSize)
        const token = localStorage.getItem('adminToken') || ''
        // 当前管理端入口在天府通办菜单下，对应 appId = 1
        const resp = await fetch(`/api/apps/${this.appId}/admin/properties?` + params.toString(), {
          headers: {
            'user-authentication': token
          }
        })
        const data = await resp.json()
        if (data.code === 1) {
          this.properties = (data.data && data.data.records) || []
          this.page.total = data.data ? data.data.total : 0
          this.page.pageNo = data.data ? data.data.pageNo : this.page.pageNo
          this.page.pageSize = data.data ? data.data.pageSize : this.page.pageSize
        } else {
          this.error = data.msg || '查询失败'
        }
      } catch (e) {
        this.error = '网络错误：' + (e.message || '未知��误')
      } finally {
        this.loading = false
      }
    },
    changePage (pageNo) {
      this.page.pageNo = pageNo
      this.loadProperties()
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
      if (this.showUserDropdown && this.ownerNameInput.trim()) {
        this.searchUsers()
      }
    },
    onOwnerNameInput () {
      // 每次输入都 debounce 搜索，并保持下拉展开
      this.showUserDropdown = true
      this.debouncedSearchUsers()
    },
    onOwnerNameFocus () {
      // 聚焦时若已有输入则触发搜索并展开，否则仅展开（等待输入）
      if (this.ownerNameInput.trim()) {
        this.showUserDropdown = true
        this.debouncedSearchUsers()
      } else {
        this.showUserDropdown = false
      }
    },
    onOwnerNameBlur () {
      // 延迟收起，让 mousedown 的 selectUser 能先执行
      setTimeout(() => {
        this.showUserDropdown = false
      }, 180)
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
        this.showUserDropdown = false
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
        const resp = await fetch(`/api/apps/${this.appId}/admin/users?` + params.toString(), {
          headers: {
            'user-authentication': token
          }
        })
        const data = await resp.json()
        if (data.code === 1) {
          const list = data.data && data.data.records ? data.data.records : []
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
      if (!this.showUserDropdown) {
        this.userCandidates = []
      }
    },
    async saveProperty () {
      const token = localStorage.getItem('adminToken') || ''
      const payload = Object.assign({}, this.editing)
      // 当前管理端入口在天府通办菜单下，对应 appId = 1
      const url = this.editing.id ? `/api/apps/${this.appId}/admin/properties/` + this.editing.id : `/api/apps/${this.appId}/admin/properties`
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
            this.selectedDetailIds = this.selectedDetailIds.filter(id => id !== this.editing.id)
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
        const resp = await fetch(`/api/apps/${this.appId}/admin/properties/` + id, {
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

/* 工具栏 */
.toolbar {
  background: var(--surface-muted);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px 22px;
  margin-bottom: 24px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
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
  width: 180px;
}

/* 表格单元格 */
.col-action {
  text-align: right;
  white-space: nowrap;
}

.detail-actions {
  white-space: nowrap;
}

.row-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
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
  flex-shrink: 0;
}

.count-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 999px;
  background: var(--brand-soft);
  color: var(--brand-strong);
  font-weight: 500;
}

.mono {
  font-variant-numeric: tabular-nums;
  color: var(--text-muted);
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

/* 详情产权人卡片 */
.detail-owner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--surface-muted);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 16px;
}

.detail-owner-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.detail-owner-sub {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 2px;
}

/* 对话框内表单 */
.dialog-body {
  max-height: 60vh;
  overflow-y: auto;
  overflow-x: auto;
}

.field-row {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
}

.field-row > label {
  width: 96px;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
}

.field-row > .ui-input {
  flex: 1;
}

.field-row-2col {
  /* 覆盖父级的 align-items:center，让两个 field-half 并排 */
  align-items: flex-start;
  gap: 14px;
}

.field-row-2col .field-half {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-row-2col .field-half label {
  width: auto;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
}

.field-row-2col .field-half .ui-input {
  width: 100%;
}

.owner-select-row .owner-select-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;
}

.owner-select-row .owner-select-wrapper .ui-input {
  flex: 1;
}

.dropdown-toggle {
  margin-left: 8px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
  background: var(--surface-muted);
  cursor: pointer;
  color: var(--text-muted);
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.dropdown-toggle:hover {
  border-color: var(--brand);
  color: var(--brand);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 46px;
  margin: 6px 0 0;
  padding: 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  max-height: 200px;
  overflow-y: auto;
  list-style: none;
  font-size: 13px;
  z-index: 10;
}

.user-dropdown li {
  padding: 8px 10px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  color: var(--text);
}

.user-dropdown li:hover {
  background: var(--brand-soft);
  color: var(--brand-strong);
}

.user-dropdown .dropdown-hint {
  color: var(--text-faint);
  font-size: 12px;
  cursor: default;
  pointer-events: none;
}

.user-dropdown .dropdown-hint:hover {
  background: none;
}

.detail-footer {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 12px;
}

.detail-footer .spacer {
  flex: 1;
}
</style>
