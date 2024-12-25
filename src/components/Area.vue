<template>
  <List item-layout="horizontal" :data-source="floors" :split="false">
    <template #renderItem="{ item }">
      <ListItem @click="onHandleClick('area-item', item)">
        <p>{{ item?.name }}</p>
        <template #actions>
          <!-- <Badge :status="item?.status === 1 ? 'success' : 'default'" /> -->
          <Progress type="circle" :percent="Math.round((item?.nop / item?.capacity) * 100)" :size="14"
            :strokeColor="strokeColor(item)" :format="() => formatValue(item)" />
          <LoginOutlined class="a-icon hover" @click.stop="onHandleClick('area-detail', item)" />
        </template>
      </ListItem>
    </template>
  </List>
</template>
<script lang='ts' setup>
import { List, ListItem, Progress } from 'ant-design-vue'
import { LoginOutlined } from '@ant-design/icons-vue'

const emits = defineEmits<{ (e: 'item-click', item: any): void }>()

defineProps({
  floors: {
    type: Array,
    default: []
  }
})

function onHandleClick(areaType: string, item: any) {
  emits('item-click', { areaType, ...item })
}

function formatValue(item: any) {
  const pvalue = Math.round((item?.nop / item?.capacity) * 100)
  const nop = item.nop
  const capacity = item.capacity
  return `当前：${nop}(人)\n容量：${capacity}(人)\n百分比：${pvalue}%\n${pvalue >= 80 ? '爆满' : pvalue >= 50 ? '拥挤' : '空闲'}`
}

function strokeColor(item: any) {
  const pvalue = Math.round((item?.nop / item?.capacity) * 100)
  if (pvalue >= 80) {
    return '#ff4d4f'
  }
  if (pvalue >= 50) {
    return '#faad14'
  }
  return '#52c41a'

}

// var(--main-color)
</script>
<style scoped>
</style>
