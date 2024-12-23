// src/components/ThreeScene.vue

<template>
  <div id="three-js-container" ref="threeJsContainer"></div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

let scene: any
let camera: any
let renderer: any
let container: any
const threeJsContainer = ref()

const init = () => {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(5, 5, 5)

  scene.fog = new THREE.Fog(0xcccccc, 10, 60);  // (颜色, 近距离, 远距离)

  // 加载天空盒纹理
  const skyName = 'skyBox3'
  const sky = new THREE.CubeTextureLoader()
  const texture = sky.load([
    `public/skyBox/${skyName}/negx.jpg`, // 右侧
    `public/skyBox/${skyName}/negy.jpg`, // 左侧
    `public/skyBox/${skyName}/negz.jpg`, // 上侧
    `public/skyBox/${skyName}/posx.jpg`, // 下侧
    `public/skyBox/${skyName}/posy.jpg`, // 前侧
    `public/skyBox/${skyName}/posz.jpg`,  // 后侧
  ])
  scene.background = texture

  // const sky = new THREE.EquirectangularTextureLoader()
  // sky.load('public/skyBox/skyBox3/negx.jpg', (texture: any) => {
  //   // 设置背景为环境贴图
  //   scene.background = texture
  //   // 可选：如果需要，启用反射或折射等环境光照效果
  //   scene.environment = texture
  // })
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
  const light = new THREE.DirectionalLight(0xffffff, 0.5)
  scene.add(light)

  const loader = new GLTFLoader()
  loader.load('public/test2.glb', (glb: any) => {
    // 加材质
    glb.scene.traverse((child: any) => {
      if (child.isMesh) {
        const edges = new THREE.EdgesGeometry(child.geometry)
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 'black' }))
        line.material.depthTest = false
        line.material.opacity = 0.05
        line.material.transparent = true
        child.material = new THREE.MeshMatcapMaterial({
          color: 0xffffff,
          // alphaMap: 0.1
        })
        child.add(line) // 将线框添加到网格上
      }
    })

    scene.add(glb.scene)
  })

  renderer.render(scene, camera)


  container = threeJsContainer.value
  if (container) container.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)

  controls.enableZoom = true
  controls.enablePan = true
  controls.enableDamping = true
  controls.dampingFactor = 1
  controls.screenSpacePanning = true
  controls.minDistance = 2
  controls.maxDistance = 20
  controls.maxPolarAngle = Math.PI / 3

  controls.update()
  animate()
}

const animate = () => {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

onMounted(() => {
  init()
})
</script>

<style scoped>
#three-js-container {
  width: 100%;
  height: 100vh;
}
</style>
