<script setup lang="ts">
import { ref } from 'vue'
import VisualizaHandlePanel from './components/VisualizaHandlePanel.vue'
import ThreeJsContainer from './components/ThreeJsContainer.vue'

const threeContainerRef = ref()

function onHandleClick(type: any, params: any) {
  try {
    threeContainerRef.value[type](params)
  } catch (error) {
    console.error('未找到')
  }
}
</script>

<template>
  <VisualizaHandlePanel @handle-click="onHandleClick">
    <ThreeJsContainer ref="threeContainerRef" />
  </VisualizaHandlePanel>
</template>
