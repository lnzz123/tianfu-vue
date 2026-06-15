<template>
  <div class="notfound">
    <div class="notfound__card">
      <div class="notfound__badge">
        <app-icon name="search" :size="30" :stroke-width="1.6" />
      </div>
      <div class="notfound__code">404</div>
      <h1 class="notfound__title">页面未找到</h1>
      <p class="notfound__desc">您访问的页面不存在或已被移动，请检查地址是否正确。</p>
      <div class="notfound__actions">
        <base-button variant="primary" icon="layers" @click="goHome">返回管理首页</base-button>
        <base-button variant="secondary" icon="chevron-right" @click="goBack">返回上一页</base-button>
      </div>
    </div>
  </div>
</template>

<script>
import AppIcon from '../components/AppIcon.vue'
import BaseButton from '../components/BaseButton.vue'

export default {
  name: 'NotFound',
  components: {
    AppIcon,
    BaseButton
  },
  methods: {
    goHome () {
      const token = localStorage.getItem('adminToken')
      this.$router.replace(token ? '/admin' : '/login')
    },
    goBack () {
      if (window.history.length > 1) {
        this.$router.back()
      } else {
        this.goHome()
      }
    }
  }
}
</script>

<style scoped>
.notfound {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(900px 500px at 50% -10%, var(--brand-soft), transparent 60%),
    var(--bg);
}

.notfound__card {
  width: 100%;
  max-width: 440px;
  text-align: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  padding: 40px 32px 34px;
}

.notfound__badge {
  width: 64px;
  height: 64px;
  margin: 0 auto 18px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--brand-soft);
  color: var(--brand-strong);
}

.notfound__code {
  font-size: 56px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--text);
  line-height: 1;
}

.notfound__title {
  margin: 14px 0 8px;
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
}

.notfound__desc {
  margin: 0 0 24px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-muted);
}

.notfound__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
