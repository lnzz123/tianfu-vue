<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="title">房产后台管理系统</h1>
      <div class="form-item">
        <label>用户名</label>
        <input v-model="form.account" placeholder="请输入管理员用户名" />
      </div>
      <div class="form-item">
        <label>密码</label>
        <input v-model="form.password" type="password" placeholder="请输入密码" />
      </div>
      <div class="error" v-if="error">{{ error }}</div>
      <button class="login-button" :disabled="loading" @click="handleLogin">
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data () {
    return {
      form: {
        account: '',
        password: ''
      },
      loading: false,
      error: ''
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

        // 当前管理端入口在天府通办菜单下，对应 appId = 1
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
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #a66bff, #f480ff);
}

.login-card {
  width: 380px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  padding: 32px 28px 28px;
}

.title {
  margin: 0 0 24px;
  font-size: 22px;
  color: #4a2a8a;
  text-align: center;
}

.form-item {
  margin-bottom: 16px;
  text-align: left;
}

.form-item label {
  display: block;
  font-size: 14px;
  margin-bottom: 6px;
  color: #555;
}

.form-item input {
  width: 100%;
  height: 36px;
  border-radius: 6px;
  border: 1px solid #ddd;
  padding: 0 10px;
  box-sizing: border-box;
  outline: none;
}

.form-item input:focus {
  border-color: #a66bff;
}

.error {
  color: #ff4d4f;
  font-size: 13px;
  margin-bottom: 10px;
}

.login-button {
  width: 100%;
  height: 38px;
  border: none;
  border-radius: 6px;
  background-color: #7b5cff;
  color: #fff;
  font-size: 15px;
  cursor: pointer;
}

.login-button:disabled {
  opacity: 0.7;
  cursor: default;
}
</style>

