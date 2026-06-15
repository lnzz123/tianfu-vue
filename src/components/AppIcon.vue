<template>
  <svg
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <g v-for="(d, i) in paths" :key="'p' + i">
      <path :d="d" />
    </g>
    <g v-for="(c, i) in circles" :key="'c' + i">
      <circle :cx="c.cx" :cy="c.cy" :r="c.r" />
    </g>
    <g v-for="(r, i) in rects" :key="'r' + i">
      <rect
        :x="r.x"
        :y="r.y"
        :width="r.w"
        :height="r.h"
        :rx="r.rx"
      />
    </g>
    <g v-for="(l, i) in lines" :key="'l' + i">
      <line :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" />
    </g>
  </svg>
</template>

<script>
const ICONS = {
  users: {
    paths: [
      'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
      'M22 21v-2a4 4 0 0 0-3-3.87',
      'M16 3.13a4 4 0 0 1 0 7.75'
    ],
    circles: [{ cx: 9, cy: 7, r: 4 }]
  },
  building: {
    paths: [
      'M3 21h18',
      'M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16',
      'M9 7h1', 'M14 7h1', 'M9 11h1', 'M14 11h1', 'M9 15h1', 'M14 15h1'
    ]
  },
  search: {
    paths: ['M21 21l-4.35-4.35'],
    circles: [{ cx: 11, cy: 11, r: 8 }]
  },
  plus: { paths: ['M12 5v14', 'M5 12h14'] },
  close: { paths: ['M18 6 6 18', 'M6 6l12 12'] },
  'chevron-down': { paths: ['M6 9l6 6 6-6'] },
  'chevron-right': { paths: ['M9 6l6 6-6 6'] },
  inbox: {
    paths: [
      'M22 12h-6l-2 3h-4l-2-3H2',
      'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z'
    ]
  },
  layers: {
    paths: ['M12 2 2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5']
  },
  logout: {
    paths: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9']
  },
  shield: { paths: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'] },
  database: {
    paths: ['M21 5c0 1.66-4.03 3-9 3S3 6.66 3 5s4.03-3 9-3 9 1.34 9 3z', 'M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5', 'M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3']
  },
  app: {
    paths: [
      'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z',
      'M8 8h8',
      'M8 12h8',
      'M8 16h5'
    ]
  },
  edit: {
    paths: [
      'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7',
      'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'
    ]
  },
  trash: {
    paths: [
      'M3 6h18',
      'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
      'M10 11v6',
      'M14 11v6'
    ]
  }
}

export default {
  name: 'AppIcon',
  props: {
    name: { type: String, required: true },
    size: { type: [Number, String], default: 20 },
    strokeWidth: { type: [Number, String], default: 1.9 }
  },
  computed: {
    def () { return ICONS[this.name] || {} },
    paths () { return this.def.paths || [] },
    circles () { return this.def.circles || [] },
    rects () { return this.def.rects || [] },
    lines () { return this.def.lines || [] }
  }
}
</script>

<style scoped>
.app-icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
}
</style>
