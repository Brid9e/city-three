<template>
  <div v-if="showModel" class="area-detail-model">
    <div ref="contentRef" class="area-detail-model__content">
      <div @click="onClose" class="area-detail__close">
        <CloseOutlined class="hover" />
      </div>
      <ThreeJsContainer v-if="contentRef?.offsetWidth" :options="options" :data="areaData" />
    </div>
  </div>
</template>
<script lang='ts' setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import ThreeJsContainer from '@/components/ThreeJsContainer.vue'
import { CloseOutlined } from '@ant-design/icons-vue'
import areaData from './area.json'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const opacity = ref(0)

const emits = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

const contentRef = ref()
const showModel = ref(false)

const options = computed(() => ({
  useFog: false,
  useSkyBox: false,
  useGround: false,
  width: contentRef.value?.offsetWidth,
  camera: {
    position: [100, 100, 100]
  },
  bgTransparent: true,
  controls: {
    maxDistance: 40
  }
}))

function onClose() {
  emits('update:modelValue', false)
}

watch(() => props.modelValue, async (val: boolean) => {
  if (!val) {
    opacity.value = 0
    setTimeout(() => {
      showModel.value = false
    }, 300)
  } else {
    showModel.value = true
    await nextTick()
    opacity.value = 1
  }
}, {
  immediate: true
})

onMounted(() => {
  // console.log(contentRef.value?.offsetWidth)
})

</script>
<style lang="scss" scoped>
.area-detail-model {
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  opacity: v-bind(opacity);
  transition: all .3s ease;

  .area-detail-model__content {
    width: calc(100% - 280px - 16px);
    height: 100%;
    position: relative;
  }

  .area-detail__close {
    position: absolute;
    top: 16px;
    right: 32px;
    font-size: 30px;
    cursor: pointer;
    position: absolute;
  }
}
</style>
