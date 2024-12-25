<template>
  <div class="right-panel-item">
    <div class="right-panel-item__title">
      {{ title }}
    </div>
    <div class="right-panel-item__content">
      <slot />
    </div>
  </div>
</template>
<script lang='ts' setup>

defineProps({
  title: {
    type: String,
    default: ''
  }
})

</script>
<style lang="scss" scoped>
.right-panel-item {
  padding: 16px 0 0 0;

  .right-panel-item__title {
    font-size: 12px;
    color: #000000;
    padding: 0 12px 0 12px;
  }

  .right-panel-item__content {
    padding-top: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #0000000f;
  }


}
</style>
