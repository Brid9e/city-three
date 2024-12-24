<template>
  <div class="visualiza-handle-panel">
    <div class="right-panel">
      <Button type="primary" @click="onHandleClick('smoothMove', { name: '篮球场' })" block>去篮球场</Button>
    </div>
    <slot></slot>
  </div>
</template>
<script lang='ts' setup>
import { Button } from 'ant-design-vue'
const emits = defineEmits<{ (e: 'handleClick', type: string, params: any): void }>()

function onHandleClick(type: string, params: any) {
  emits('handleClick', type, params)
}

</script>
<style lang="scss" scoped>
.visualiza-handle-panel {
  width: 100%;
  height: 100%;

  .right-panel {
    width: 300px;
    height: calc(100vh - 32px);
    position: absolute;
    right: 0;
    top: 0;
    background-color: rgba(255, 255, 255, 0.481);
    margin: 16px;
    border-radius: 14px;
    backdrop-filter: blur(50px);
    padding: 12px;
    box-sizing: border-box;
  }
}
</style>
