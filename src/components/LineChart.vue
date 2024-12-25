<template>
  <v-chart class="chart" :option="option" autoresize />
</template>
<script lang="ts" setup>
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { ref, computed } from 'vue'
import { mockData } from './request'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})

use([
  CanvasRenderer,
  PieChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent
])

const option = computed(() => ({
  title: {
    text: '一天时间的数量变化',
    left: 'center',
    show: false  // 隐藏标题
  },
  tooltip: {
    trigger: 'axis',
    formatter: '<span style="opacity:0.8">{b}: </span><span style="color:#4608AD;font-weight: bold">{c}</span>',
  },
  grid: {
    left: '10%',
    right: '10%',
    top: '2%',
    bottom: '20%'
  },
  xAxis: {
    type: 'category',
    boundaryGap: false, // 不留白
    data: ['06:00', '08:00', '12:00', '15:00', '18:00', '20:00'], // 假设是一天的时间
    axisLine: {
      show: false  // 隐藏 X 轴线
    },
    splitLine: {
      show: false  // 隐藏 X 轴参考线
    },
    axisTick: {
      show: false  // 隐藏 X 轴刻度线
    },
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '{value}', // 格式化纵坐标标签
      show: false  // 隐藏 X 轴标签
    },
    axisLine: {
      show: false  // 隐藏 X 轴线
    },
    splitLine: {
      show: false  // 隐藏 X 轴参考线
    }
  },
  series: [
    {
      name: '数量',
      type: 'line',
      smooth: true, // 平滑曲线
      symbol: 'none',  // 隐藏节点的小圆点
      lineStyle: {
        width: 2.5,
        type: 'dashed',
        // 使用渐变色
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#4608AD00' }, // 起始颜色
            { offset: 0.5, color: '#4608AD' }, // 结束颜色
            { offset: 1, color: '#4608AD00' }, // 结束颜色
          ],
          global: false, // 不应用到整个图表
        },
      },
      data: mockData[props?.data?.id] || [0, 0, 0, 0, 0, 0], // 示例数据
    },
  ],
}))
</script>

<style scoped>
.chart {
  height: 120px;
}
</style>
