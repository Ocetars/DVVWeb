<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Drone } from '@/components/utils/drone.js'

const props = defineProps({
  groundWidth: {
    type: Number,
    default: 2
  },
  groundDepth: {
    type: Number,
    default: 2
  }
})
const emit = defineEmits(['update-ground-dimensions'])

const container = ref(null)
const bottomCameraContainer = ref(null)
const cvOutputContainer = ref(null)

let scene, camera, renderer, controls, drone
let groundMesh, groundMaterial

// 获取默认灰色纹理（用于无图片上传时）
function getDefaultTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const context = canvas.getContext('2d')
  context.fillStyle = 'gray'
  context.fillRect(0, 0, canvas.width, canvas.height)
  return new THREE.CanvasTexture(canvas)
}

// 更新地面几何体（使用 props 中的 groundWidth、groundDepth）
function updateGroundGeometry() {
  if (groundMesh) {
    groundMesh.geometry.dispose()
    groundMesh.geometry = new THREE.BoxGeometry(props.groundWidth, 0.1, props.groundDepth)
  }
}

// 处理图片上传，更新顶面的纹理；同时根据图片比例计算并通知上层更新 groundWidth
function handleImageUpload(file) {
  const reader = new FileReader()
  reader.onload = function (e) {
    const imageUrl = e.target.result
    const loader = new THREE.TextureLoader()
    loader.load(imageUrl, function (texture) {
      texture.needsUpdate = true
      groundMaterial.map = texture
      groundMaterial.needsUpdate = true
    })
    const img = new Image()
    img.onload = function () {
      const aspect = img.naturalWidth / img.naturalHeight
      // 根据当前 groundDepth 计算新的宽度，并通过事件通知父组件
      emit('update-ground-dimensions', { groundWidth: props.groundDepth * aspect })
      updateGroundGeometry()
    }
    img.src = imageUrl
  }
  reader.readAsDataURL(file)
}

// 修改后的 executeUserCode 函数
function executeUserCode(code) {
  try {
    if (code.trim()) {
      window.processFrame = new Function('frame', 'cv', 'drone', `
          try {
            const result = (function() {
              ${code}
            })();
            // 用户代码应返回一个数组：[运动命令, 图像]
            if (Array.isArray(result) && result.length === 2) {
              return result;
            } else {
              // 默认返回悬停命令和原始帧
              return [{ hover: true, angle: 0, speed: 0, altitude: (drone && drone.movement && drone.movement.model ? drone.movement.model.position.y : 0) }, frame];
            }
          } catch (error) {
            console.error('代码执行错误:', error);
            return [{ hover: true, angle: 0, speed: 0, altitude: (drone && drone.movement && drone.movement.model ? drone.movement.model.position.y : 0) }, frame];
          }
        `);
    } else {
      console.error('未成功运行');
    }
  } catch (error) {
    console.error('代码执行错误:', error);
  }
}

onMounted(() => {
  // 加载 OpenCV.js 脚本
  const script = document.createElement('script')
  script.src = 'src/assets/opencv.js'
  script.async = true
  script.onload = () => {
    console.log('OpenCV.js 加载完成')
    setupOpenCVImshow()
  }
  document.head.appendChild(script)

  // 初始化场景
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, container.value.clientWidth / container.value.clientHeight, 0.1, 1000)
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  container.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05

  // 创建地面
  const groundGeometry = new THREE.BoxGeometry(props.groundWidth, 0.1, props.groundDepth)
  const materials = [
    new THREE.MeshPhongMaterial({ color: 0x808080 }), // right
    new THREE.MeshPhongMaterial({ color: 0x808080 }), // left
    new THREE.MeshPhongMaterial({ map: getDefaultTexture() }), // top
    new THREE.MeshPhongMaterial({ color: 0x808080 }), // bottom
    new THREE.MeshPhongMaterial({ color: 0x808080 }), // front
    new THREE.MeshPhongMaterial({ color: 0x808080 })  // back
  ]
  groundMesh = new THREE.Mesh(groundGeometry, materials)
  groundMaterial = materials[2]
  scene.add(groundMesh)

  // 添加灯光
  scene.add(new THREE.AmbientLight(0x404040))
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 5, 5)
  scene.add(directionalLight)

  // 设置相机位置
  camera.position.set(0, 1, 2.3)
  camera.lookAt(0, 0, 0)

  // 初始化无人机
  drone = new Drone(scene)
  if (bottomCameraContainer.value) {
    // 等待无人机摄像头加载完成后附加摄像头元素
    const tryAttachBottomCamera = () => {
      const camEl = drone.getBottomCameraElement();
      if (camEl && !bottomCameraContainer.value.contains(camEl)) {
        bottomCameraContainer.value.appendChild(camEl);
      } else {
        setTimeout(tryAttachBottomCamera, 100);
      }
    }
    tryAttachBottomCamera();
  }

  // 初始化 Clock 用于获取 delta 时间
  const clock = new THREE.Clock();

  // 动画循环
  const animate = () => {
    requestAnimationFrame(animate)
    const delta = clock.getDelta();
    controls.update()
    // 更新无人机
    if (drone) {
      drone.update(delta)
      drone.updateCamera()
      drone.renderCamera()
    }
    // 处理图像和运动指令
    if (window.cv && window.processFrame) {
      try {
        const canvas = drone.getBottomCameraImage()
        const frame = cv.imread(canvas)
        const result = window.processFrame(frame, cv, drone)
        let movementCommand, processedFrame;
        if (Array.isArray(result) && result.length === 2) {
          [movementCommand, processedFrame] = result;
        } else {
          movementCommand = { hover: true, angle: 0, speed: 0, altitude: (drone && drone.movement && drone.movement.model ? drone.movement.model.position.y : 0) };
          processedFrame = frame;
        }
        // 将运动命令应用到无人机
        if (drone && drone.movement && drone.movement.setMovementCommand) {
          drone.movement.setMovementCommand(movementCommand);
        }
        cv.customImshow(processedFrame)

        if (processedFrame !== frame) {
          processedFrame.delete()
        }
        frame.delete()
      } catch (error) {
        console.error('图像处理错误:', error)
      }
    }
    renderer.render(scene, camera)
  }
  animate()

  window.addEventListener('resize', handleResize)
})

function setupOpenCVImshow() {
  window.cv.customImshow = function (mat) {
    const canvas = document.createElement('canvas')
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    const containerDom = cvOutputContainer.value
    while (containerDom.firstChild) {
      containerDom.removeChild(containerDom.firstChild)
    }
    containerDom.appendChild(canvas)
    cv.imshow(canvas, mat)
  }
}

function handleResize() {
  camera.aspect = container.value.clientWidth / container.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  container.value.removeChild(renderer.domElement)
})

watch(() => props.groundWidth, () => {
  updateGroundGeometry()
})
watch(() => props.groundDepth, () => {
  updateGroundGeometry()
})

defineExpose({
  updateGroundGeometry,
  handleImageUpload,
  executeUserCode
})
</script>

<template>
  <div class="scene-container-relative">
    <div ref="container" class="scene-container"></div>
    <div ref="bottomCameraContainer" class="bottom-camera-container"></div>
    <div ref="cvOutputContainer" class="cv-output-container"></div>
  </div>
</template>

<style scoped>
.scene-container-relative {
  position: relative;
  width: 100%;
  height: 80vh;
}

.scene-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 5px solid #4eaed0;
  border-radius: 4px;
}

.bottom-camera-container {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 240px;
  height: 240px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  border: 2px solid #4eaed0;
  z-index: 10;
}

.cv-output-container {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 240px;
  height: 240px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  border: 2px solid #4eaed0;
  z-index: 10;
  background-color: #000;
}
</style>