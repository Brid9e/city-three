<script setup lang="ts">
import { ref, computed } from 'vue'
import VisualizaHandlePanel from './components/VisualizaHandlePanel.vue'
import ThreeJsContainer from './components/ThreeJsContainer.vue'
import threeJson from '@/components/data.json'

const threeContainerRef = ref()

const params = ref()

function onHandleClick(type: any, params: any) {
  try {
    threeContainerRef.value[type](params)
  } catch (error) {
    console.error('未找到')
  }
}

function onModelChange(data: any) {
  params.value = data
}
</script>

<template>
  <VisualizaHandlePanel @handle-click="onHandleClick" :params="params">
    <template #default="{ isShowArea }">
      <ThreeJsContainer ref="threeContainerRef" @change="onModelChange" :data="threeJson"
        :options="{ stop: isShowArea }" />
    </template>
  </VisualizaHandlePanel>
</template>
