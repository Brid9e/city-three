<template>
  <div class="three-js-container" ref="threeJsContainer"></div>
</template>
<script lang="ts" setup>
import { ref, onMounted, computed, useId } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Tween, Easing, Group } from '@tweenjs/tween.js'
import { filter, isEmpty, mergeWith } from 'lodash-unified'
// import GUI from 'lil-gui'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  options: {
    type: Object,
    default: () => ({})
  }
})

const defaultOptions = {
  stop: false,
  useFog: true,
  useSkyBox: true,
  bgTransparent: false,
  useGround: true,
  width: window.innerWidth,
  height: window.innerHeight,
  camera: {
    position: [5, 5, 10]
  },
  controls: {
    autoRotate: false,
    dampingFactor: 0.1,
    enableZoom: true,
    enablePan: true,
    enableDamping: true,
    screenSpacePanning: true,
    minDistance: 1,
    maxDistance: 20,
    maxPolarAngle: Math.PI / 3,
  }
}

const opt = computed(() => mergeWith({}, defaultOptions, props.options))

const emits = defineEmits<{ (e: 'change', v: any): void }>()

let scene: any
let camera: any
let renderer: any
let container: any
let controls: any
let skyTexture: any
const threeJsContainer = ref()
const modelList = ref<Array<any>>([])
const groupMove = new Group()

const init = () => {
  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(50, opt.value.width / opt.value.height, 0.1, 1000)
  camera.position.set(...opt.value?.camera?.position)

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: opt.value?.bgTransparent
  })

  // 背景透明
  if (opt.value?.bgTransparent) {
    renderer.setClearAlpha(0)
    scene.background = null
  }

  renderer.setSize(opt.value.width, opt.value.height)

  if (opt.value?.useFog) {
    scene.fog = new THREE.Fog(0xcccccc, 10, 60);  // (颜色, 近距离, 远距离)
  }

  if (opt.value?.useSkyBox && !opt.value?.bgTransparent) {
    // 加载天空盒纹理
    const skyName = 'skyBox2'
    const sky = new THREE.CubeTextureLoader()
    skyTexture = sky.load([
      `skyBox/${skyName}/negx.jpg`, // 右侧
      `skyBox/${skyName}/negy.jpg`, // 左侧
      `skyBox/${skyName}/negz.jpg`, // 上侧
      `skyBox/${skyName}/posx.jpg`, // 下侧
      `skyBox/${skyName}/posy.jpg`, // 前侧
      `skyBox/${skyName}/posz.jpg`,  // 后侧
    ])
    scene.background = new THREE.Color(0xcccccc)
  }

  // 画一个平面作为地面
  if (opt.value?.useGround) {
    const geometry = new THREE.PlaneGeometry(1000, 1000) // 创建一个 10x10 的平面
    const material = new THREE.MeshMatcapMaterial({ color: 0xcccccc, side: THREE.DoubleSide })
    const plane = new THREE.Mesh(geometry, material)
    plane.rotation.x = -Math.PI / 2 // 将平面旋转 90 度，使其水平
    plane.position.y = -0.2
    scene.add(plane)
  }


  // 环境光
  const light = new THREE.DirectionalLight(0x000000, 1)
  scene.add(light)

  const loader = new GLTFLoader()
  props.data.forEach((item: any) => {
    if (item?.hdr) {
      new RGBELoader().load(item?.hdr, (texture: any) => {
        texture.mapping = THREE.EquirectangularReflectionMapping
        if (!opt.value?.bgTransparent) {
          scene.background = texture
        }
        scene.environment = texture
      })
    }
    if (item?.decoderPath) {
      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath(item?.decoderPath)
      loader.setDRACOLoader(dracoLoader)
    }
    meshLoadModel(loader, item)
  })

  renderer.render(scene, camera)

  container = threeJsContainer.value
  if (container) container.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)

  for (const k in opt.value.controls) {
    controls[k] = opt.value.controls[k]
  }
  animate()

  window.addEventListener("resize", () => {
    camera.aspect = opt.value.width / opt.value.height
    camera.updateProjectionMatrix()
    renderer.setSize(opt.value.width, opt.value.height)
  })

  // const gui = new GUI();
  // const cubeFolder = gui.addFolder('Params Panel')
  // const guiContainer = gui.domElement
  // guiContainer.style.position = 'absolute'
  // guiContainer.style.top = '0'
  // guiContainer.style.left = '0'
  // cubeFolder.add(camera.rotation, 'x', 0, Math.PI * 2).name('Rotate X')
  // cubeFolder.open()
}

/**
 * 加载模型
 * @param loader
 * @param data
 */
function meshLoadModel(loader: any, item: any) {
  loader.load(item?.file, (glb: any) => {
    glb.scene.traverse((child: any) => {
      if (child.isMesh) {
        if (item?.params?.material) {
          child.material = new THREE[item?.params?.material](item?.params?.materialParams)
        }

        if (!isEmpty(item?.params?.position)) {
          if (child?.position?.x) {
            child.position.x = item?.params?.position?.x
          }
          if (child?.position?.y) {
            child.position.y = item?.params?.position?.y
          }
          if (child?.position?.z) {
            child.position.z = item?.params?.position?.z
          }
        }

        if (item?.params?.showLine) {
          loadLine(child, item?.params)
        }

        if (item?.type === 'mesh') {

          if (item?.params?.selfLuminous && item?.params?.material) {
            throw new Error('selfLuminous 和 material 不能同时存在')
          }

          if (item?.params?.selfLuminous === true && !item?.params?.material) {
            child.material.emissive = child.material.color
            child.material.emissiveMap = child.material.map
          }
          if (item?.params?.isGlass) {
            child.material.envMap = skyTexture
          }
          child.name = item.name
          child.userData = item.data
          modelList.value.push(child)
        }
      }
    })
    scene.add(glb.scene)
  })
}

/**
 * 显示轮廓线
 * @param model
 * @param params
 */
function loadLine(model: any, params: any) {
  const edges = new THREE.EdgesGeometry(model.geometry)
  const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: params?.lineColor }))
  for (const k in params?.lineParams) {
    line.material[k] = params.lineParams[k]
  }
  model.add(line) // 将线框添加到网格上
}

function moveCameraTo(model: any, duration = 2000, ah = 5) {

  // 判断当前的位置是否没变，没变则不执行
  const startPosition = camera.position.clone()
  const targetPosition = model.getWorldPosition(new THREE.Vector3()).clone()

  const startLookAt = controls.target.clone()
  const targetLookAt = targetPosition.clone()

  const animation = { t: 0 }
  const endPosition = {
    x: targetPosition.x,
    y: targetPosition.y + 2,
    z: targetPosition.z + 2
  }

  // 弧线控制点
  const arcHeight = ah // 弧线高度
  const controlPoint = new THREE.Vector3(
    (startPosition.x + targetPosition.x) / 2,
    Math.max(startPosition.y, targetPosition.y) + arcHeight,
    (startPosition.z + targetPosition.z) / 2
  )

  // 创建一个 TWEEN 动画
  new Tween(animation, groupMove)
    .to({ t: 1 }, duration)
    .easing(Easing.Quadratic.InOut) // 使用缓动效果
    .onStart(() => {
      // emits('change', model.userData)
    })
    .onUpdate(() => {
      const t = animation.t
      // 使用二次贝塞尔曲线计算摄像机位置
      const p1 = startPosition.clone().lerp(controlPoint, t) // 从起点到控制点
      const p2 = controlPoint.clone().lerp(new THREE.Vector3(endPosition.x, endPosition.y, endPosition.z), t) // 从控制点到目标点
      const position = p1.clone().lerp(p2, t) // 二次贝塞尔插值
      camera.position.copy(position)
      const lookAtPoint = startLookAt.clone().lerp(targetLookAt, t)
      camera.lookAt(lookAtPoint)// 保持摄像机始终朝向模型
    }).onComplete(() => {
      controls.target.copy(targetPosition)
      controls.update()
      camera.lookAt(targetPosition)// 保持摄像机始终朝向模型
      emits('change', model.userData)
    })
    .start()
}

const animate = () => {
  requestAnimationFrame(animate)
  if (!opt.value?.stop) {
    controls.update()
    groupMove.update()
    renderer.render(scene, camera)
  }
}

/**
 * 通过模型名称，并移动到该模型位置
 *
 */
function moveToModelPositionByName(params: any) {
  const model = scene.getObjectByName(params.name)
  moveCameraTo(model, params?.duration, params?.ah)
}

function threeClick() {
  let intersects = []
  document.addEventListener('click', meshOnClick)
  let raycaster = new THREE.Raycaster()
  function meshOnClick(event: MouseEvent) {
    const pointer = new THREE.Vector2()
    pointer.x = (event.clientX / opt.value.width) * 2 - 1
    pointer.y = -(event.clientY / opt.value.height) * 2 + 1
    raycaster.setFromCamera(pointer, camera)
    // //geometrys为需要监听的Mesh合集，可以通过这个集合来过滤掉不需要监听的元素例如地面天空
    // intersects = raycaster.intersectObjects(modelList.value, true)
    // //被射线穿过的几何体为一个集合，越排在前面说明其位置离端点越近，所以直接取[0]
    // if (intersects.length > 0) {
    //   const clickEle = filter(intersects, (item: any) => (item?.object?.isMesh))?.[0]?.object
    //   if (clickEle) {
    //     moveCameraTo(clickEle)
    //   }
    // } else {
    //   //若没有几何体被监听到，可以做一些取消操作
    // }
  }
}

onMounted(() => {
  init()
  threeClick()
})

defineExpose({
  smoothMove: moveToModelPositionByName
})
</script>

<style scoped>
.three-js-container {
  width: 100%;
  height: 100vh;
}
</style>
