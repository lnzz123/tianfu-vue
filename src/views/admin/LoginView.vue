<template>
  <div class="login-page">
    <!-- 左侧品牌面板 -->
    <aside class="brand-panel">
      <div class="brand-top">
        <div class="brand-mark">
          <app-icon name="layers" :size="24" :stroke-width="2.1" />
        </div>
        <span class="brand-name">房产登记</span>
      </div>
      <div class="brand-hero">
        <h2 class="brand-title">后台管理系统</h2>
        <p class="brand-desc">统一管理多应用的用户信息与房产数据，安全、高效、清晰。</p>
        <ul class="brand-points">
          <li><span class="point-icon"><app-icon name="users" :size="16" /></span>用户信息集中管理</li>
          <li><span class="point-icon"><app-icon name="building" :size="16" /></span>房产数据精细维护</li>
          <li><span class="point-icon"><app-icon name="layers" :size="16" /></span>多应用可扩展架构</li>
        </ul>
      </div>
      <div class="brand-foot">© {{ year }} 房产登记 · 政务服务平台</div>
    </aside>

    <!-- 右侧登录表单 -->
    <main class="form-panel">
      <div class="login-card">
        <div class="card-head">
          <h1 class="title">欢迎登录</h1>
          <p class="subtitle">请输入管理员账号以继续</p>
        </div>

        <div class="form-item">
          <label>用户名</label>
          <div class="input-wrap">
            <input v-model="form.account" placeholder="请输入管理员用户名" @keyup.enter="handleLogin" />
          </div>
        </div>

        <div class="form-item">
          <label>密码</label>
          <div class="input-wrap">
            <input v-model="form.password" type="password" placeholder="请输入密码" @keyup.enter="handleLogin" />
          </div>
        </div>

        <div class="error" v-if="error">{{ error }}</div>

        <button class="login-button" :disabled="loading" @click="handleLogin">
          {{ loading ? '登录中...' : '登 录' }}
        </button>

        <p class="hint">如忘记账号或密码，请联系系统管理员。</p>
      </div>
    </main>
  </div>
</template>

<script>
import AppIcon from '../../components/AppIcon.vue'

export default {
  name: 'LoginView',
  components: {
    AppIcon
  },
  data () {
    return {
      form: {
        account: '',
        password: ''
      },
      loading: false,
      error: '',
      year: new Date().getFullYear()
    }
  },
  methods: {
    async handleLogin () {
      if (!this.form.account || !this.form.password) {
        this.error = '账号和密码不能为空'
        return
      }
      this.error = ''
      this.loading = true
      try {
        const body = new URLSearchParams()
        body.append('account', this.form.account)
        body.append('password', this.form.password)

        // 当前管理端入口在房产登记菜单下，对应 appId = 1
        const resp = await fetch('/api/apps/1/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: body.toString()
        })
        const data = await resp.json()
        if (data.code === 1 && data.data && data.data.token) {
          localStorage.setItem('adminToken', data.data.token)
          localStorage.setItem('adminUserName', data.data.user && data.data.user.realName ? data.data.user.realName : '')
          this.$router.push('/admin')
        } else {
          this.error = data.msg || '登录失败'
        }
      } catch (e) {
        this.error = '网络错误：' + (e.message || '未知错误')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  background: var(--bg);
}

/* ===== 左侧品牌面板 ===== */
.brand-panel {
  position: relative;
  width: 44%;
  max-width: 560px;
  padding: 48px 56px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #fff;
  background:
    radial-gradient(1200px 500px at -10% -10%, rgba(47, 107, 255, 0.55), transparent 60%),
    linear-gradient(160deg, #16263d 0%, #0f1b2d 60%, #0b1626 100%);
  overflow: hidden;
}

.brand-panel::after {
  content: '';
  position: absolute;
  right: -120px;
  bottom: -120px;
  width: 360px;
  height: 360px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(47, 107, 255, 0.35), transparent 70%);
}

.brand-top {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--brand);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 6px 18px rgba(47, 107, 255, 0.45);
}

.brand-name {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.brand-hero {
  position: relative;
  z-index: 1;
}

.brand-title {
  font-size: 38px;
  line-height: 1.2;
  margin: 0 0 16px;
  font-weight: 800;
}

.brand-desc {
  font-size: 15px;
  line-height: 1.7;
  color: #c4d0e0;
  max-width: 360px;
  margin: 0 0 28px;
}

.brand-points {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.brand-points li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #d7e0ee;
}

.brand-points .point-icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: #cfe0ff;
  background: rgba(47, 107, 255, 0.18);
}

.brand-foot {
  position: relative;
  z-index: 1;
  font-size: 13px;
  color: #8a9ab0;
}

/* ===== 右侧表单 ===== */
.form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
}

.login-card {
  width: 100%;
  max-width: 380px;
}

.card-head {
  margin-bottom: 28px;
}

.title {
  margin: 0 0 8px;
  font-size: 26px;
  font-weight: 700;
  color: var(--text);
}

.subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--text-muted);
}

.form-item {
  margin-bottom: 18px;
  text-align: left;
}

.form-item label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text);
}

.input-wrap input {
  width: 100%;
  height: 44px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
  padding: 0 14px;
  font-size: 14px;
  color: var(--text);
  background: var(--surface);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.input-wrap input::placeholder {
  color: var(--text-faint);
}

.input-wrap input:focus {
  border-color: var(--brand);
  box-shadow: var(--ring);
}

.error {
  color: var(--danger);
  font-size: 13px;
  margin-bottom: 14px;
  padding: 10px 12px;
  background: var(--danger-soft);
  border: 1px solid #fecaca;
  border-radius: var(--radius-sm);
}

.login-button {
  width: 100%;
  height: 46px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--brand);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 2px;
  cursor: pointer;
  margin-top: 6px;
  transition: background 0.15s ease, transform 0.05s ease, box-shadow 0.15s ease;
  box-shadow: 0 8px 20px rgba(47, 107, 255, 0.28);
}

.login-button:hover:not(:disabled) {
  background: var(--brand-strong);
}

.login-button:active:not(:disabled) {
  transform: translateY(1px);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: default;
  box-shadow: none;
}

.hint {
  margin: 18px 0 0;
  font-size: 12px;
  color: var(--text-faint);
  text-align: center;
}

@media (max-width: 860px) {
  .brand-panel {
    display: none;
  }
}
</style>
