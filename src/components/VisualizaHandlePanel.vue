<template>
  <div class="visualiza-handle-panel">
    <AreaDetailModel v-model="show" />
    <div class="right-panel">
      <RightItem title="场馆">
        <List item-layout="horizontal" :data-source="data" :split="false">
          <template #renderItem="{ item }">
            <ListItem @click="onHandleClick(item?.type, item?.params)">
              <p>{{ item?.title }}</p>
              <template #actions>
                <Badge :status="item?.status === 1 ? 'processing' : 'default'"
                  :color="item?.status === 1 ? 'var(--main-color)' : ''" />
              </template>
            </ListItem>
          </template>
        </List>
      </RightItem>
      <RightItem title="人流量">
        <LineChart :data="params" />
      </RightItem>
      <RightItem title="楼层/区域">
        <Area :floors="params?.area" @item-click="onItemClick" />
      </RightItem>
    </div>
    <slot v-bind="{ isShowArea: show }"></slot>
  </div>
</template>
<script lang='ts' setup>
import { ref } from 'vue'
import { List, ListItem, Badge, message } from 'ant-design-vue'
import RightItem from './RightItem.vue'
import Area from './Area.vue'
import LineChart from './LineChart.vue'
import AreaDetailModel from './AreaDetailModel.vue'
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '@/store'

defineProps({
  params: {
    type: Object,
    default: () => ({})
  }
})

const emits = defineEmits<{ (e: 'handleClick', type: string, params: any): void }>()

const { lighter } = storeToRefs(useGlobalStore())

const show = ref(false)

const data = [{
  title: '篮球场',
  type: 'smoothMove',
  status: 1,
  params: {
    name: '哈工大篮球场'
  }
},
{
  title: '哈工大体育场',
  type: 'smoothMove',
  status: 0,
  params: {
    name: '哈工大体育场'
  }
},
{
  title: '实验楼',
  type: 'smoothMove',
  status: 0,
  params: {
    name: '实验楼'
  }
}]

function onHandleClick(type: string, params: any) {
  if (show.value) {
    message.info('当前有区域详情展示，请先关闭')
    return
  }
  emits('handleClick', type, params)
}

function onItemClick(item: any) {
  if (item?.areaType === 'area-detail') {
    show.value = true
  }
}

</script>
<style lang="scss" scoped>
.visualiza-handle-panel {
  width: 100%;
  height: 100%;

  .right-panel {
    width: 280px;
    height: calc(100vh - 32px);
    position: absolute;
    right: 0;
    top: 0;
    margin: 16px;
    box-sizing: border-box;
    background-color: rgba(255, 255, 255, 0.826);
    border-radius: 14px;
    backdrop-filter: blur(30px);
    overflow: hidden;
  }
}
</style>
