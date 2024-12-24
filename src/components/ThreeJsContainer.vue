<template>
  <div id="three-js-container" ref="threeJsContainer"></div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Tween, Easing, Group } from '@tweenjs/tween.js'
import { filter, isEmpty } from 'lodash-unified'
import threeJson from './data.json'

let scene: any
let camera: any
let renderer: any
let container: any
let controls: any
const threeJsContainer = ref()
const modelList = ref<Array<any>>([])
const group = new Group()

const init = () => {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(5, 5, 5)

  scene.fog = new THREE.Fog(0xcccccc, 10, 60);  // (颜色, 近距离, 远距离)

  // 加载天空盒纹理
  // const skyName = 'skyBox3'
  // const sky = new THREE.CubeTextureLoader()
  // const texture = sky.load([
  //   `public/skyBox/${skyName}/negx.jpg`, // 右侧
  //   `public/skyBox/${skyName}/negy.jpg`, // 左侧
  //   `public/skyBox/${skyName}/negz.jpg`, // 上侧
  //   `public/skyBox/${skyName}/posx.jpg`, // 下侧
  //   `public/skyBox/${skyName}/posy.jpg`, // 前侧
  //   `public/skyBox/${skyName}/posz.jpg`,  // 后侧
  // ])
  scene.background = new THREE.Color(0xcccccc)

  renderer = new THREE.WebGLRenderer({
    antialias: true
  })

  renderer.setSize(window.innerWidth, window.innerHeight)

  // 画一个平面
  const geometry = new THREE.PlaneGeometry(1000, 1000) // 创建一个 10x10 的平面
  const material = new THREE.MeshMatcapMaterial({ color: 0xcccccc, side: THREE.DoubleSide })
  const plane = new THREE.Mesh(geometry, material)
  plane.rotation.x = - Math.PI / 2 // 将平面旋转 90 度，使其水平
  plane.position.y = -0.2
  scene.add(plane)

  // 环境光
  const light = new THREE.DirectionalLight(0x000000, 1)
  scene.add(light)

  const loader = new GLTFLoader()
  threeJson.forEach((item: any) => {
    if (item?.path) {
      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath(item?.path)
      loader.setDRACOLoader(dracoLoader)
    }
    meshLoadModel(loader, item)
  })

  renderer.render(scene, camera)

  container = threeJsContainer.value
  if (container) container.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.autoRotate = false
  controls.dampingFactor = 0.1
  controls.enableZoom = true
  controls.enablePan = true
  controls.enableDamping = true
  controls.screenSpacePanning = true
  controls.minDistance = 2
  controls.maxDistance = 20
  controls.maxPolarAngle = Math.PI / 3
  animate()
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
        child.material = new THREE[item?.params?.material](item?.params?.materialParams)

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
  new Tween(animation, group)
    .to({ t: 1 }, duration)
    .easing(Easing.Quadratic.InOut) // 使用缓动效果
    .onStart(() => {
      // emits()
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
    })
    .start()
}

const animate = () => {
  requestAnimationFrame(animate)
  controls.update()
  group.update()
  renderer.render(scene, camera)
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
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
    raycaster.setFromCamera(pointer, camera)
    //geometrys为需要监听的Mesh合集，可以通过这个集合来过滤掉不需要监听的元素例如地面天空
    intersects = raycaster.intersectObjects(modelList.value, true)
    //被射线穿过的几何体为一个集合，越排在前面说明其位置离端点越近，所以直接取[0]
    if (intersects.length > 0) {
      const clickEle = filter(intersects, (item: any) => (item?.object?.isMesh))?.[0]?.object
      if (clickEle) {
        moveCameraTo(clickEle)
      }
    } else {
      //若没有几何体被监听到，可以做一些取消操作
    }
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
#three-js-container {
  width: 100%;
  height: 100vh;
}
</style>
