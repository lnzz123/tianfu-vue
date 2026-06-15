<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
/* ===== Design Tokens ===== */
:root {
  /* Brand */
  --brand: #2f6bff;
  --brand-strong: #1d4ed8;
  --brand-soft: #eaf1ff;
  --brand-softer: #f3f7ff;

  /* Sidebar (deep navy) */
  --sidebar-bg: #0f1b2d;
  --sidebar-bg-soft: #16263d;
  --sidebar-text: #aeb9c9;
  --sidebar-text-strong: #ffffff;
  --sidebar-active-bg: rgba(47, 107, 255, 0.16);

  /* Surfaces & neutrals */
  --bg: #eef1f6;
  --surface: #ffffff;
  --surface-muted: #f7f9fc;

  /* Text */
  --text: #16202e;
  --text-muted: #64748b;
  --text-faint: #94a3b8;

  /* Lines */
  --border: #e6eaf1;
  --border-strong: #d6dce6;

  /* States */
  --danger: #ef4444;
  --danger-soft: #fef2f2;
  --success: #10b981;
  --warning: #f59e0b;

  /* Effects */
  --radius-sm: 5px;
  --radius: 7px;
  --radius-lg: 10px;
  --shadow-sm: 0 1px 2px rgba(16, 24, 40, 0.05);
  --shadow: 0 4px 16px rgba(16, 24, 40, 0.08);
  --shadow-lg: 0 18px 48px rgba(16, 24, 40, 0.18);
  --ring: 0 0 0 3px rgba(47, 107, 255, 0.18);
}

* {
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'Noto Sans SC', sans-serif;
  background-color: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100%;
}

/* Scrollbar polish */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
  border: 2px solid transparent;
  background-clip: content-box;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
  background-clip: content-box;
}

/* ===== Shared Form Controls (reusable across modules) ===== */
.ui-input,
.ui-select {
  height: 38px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
  padding: 0 12px;
  font-size: 14px;
  font-family: inherit;
  color: var(--text);
  background: var(--surface);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.ui-input:focus,
.ui-select:focus {
  border-color: var(--brand);
  box-shadow: var(--ring);
}

/* ===== Shared Data Table (reusable across modules) ===== */
.ui-table-wrap {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: auto;
}

.ui-table {
  width: 100%;
  border-collapse: collapse;
}

.ui-table thead {
  background: var(--surface-muted);
}

.ui-table th {
  padding: 14px 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--text-muted);
  text-align: left;
  white-space: nowrap;
  border-bottom: 1px solid var(--border);
}

.ui-table td {
  padding: 16px 20px;
  font-size: 14px;
  color: var(--text);
  border-bottom: 1px solid var(--border);
}

.ui-table tbody tr:last-child td {
  border-bottom: none;
}

.ui-table tbody tr:hover {
  background: var(--brand-softer);
}
</style>
