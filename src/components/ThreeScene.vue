<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Drone } from '@/components/utils/drone.js'
import { Ground } from '@/components/utils/Ground.js'
import { gsap } from 'gsap'

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
const emit = defineEmits(['update-ground-dimensions', 'cv-output', 'update:isCustomPositionMode', 'save-scene', 'load-scene'])

const container = ref(null)
const bottomCameraContainer = ref(null)

let scene, camera, renderer, controls, drone
let ground
// 添加一个 ref 来控制自定义位置模式
const isCustomPositionMode = ref(false)
// 添加一个 ref 来控制提示文本的显示
const showPositionHint = ref(false)
// 添加一个变量来控制代码执行状态
const isCodeRunning = ref(false)

// 更新地面几何体（使用 props 中的 groundWidth、groundDepth）
function updateGroundGeometry() {
  if (ground) {
    ground.updateGeometry(props.groundWidth, props.groundDepth)
  }
}

// 处理图片上传，更新顶面的纹理；同时根据图片比例计算并通知上层更新 groundWidth
function handleImageUpload(file) {
  if (ground) {
    ground.handleImageUpload(file, (aspect) => {
      // 根据当前 groundDepth 计算新的宽度，并通过事件通知父组件
      // 将计算结果精确到小数点后两位
      const newWidth = Math.round(props.groundDepth * aspect * 100) / 100;
      emit('update-ground-dimensions', { groundWidth: newWidth });
      updateGroundGeometry();
    });
  }
}

function setupOpenCVImshow() {
  window.cv.customImshow = function (mat) {
    const canvas = document.createElement('canvas')
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    // 触发事件，将 canvas 传递给父组件
    emit('cv-output', canvas)
    cv.imshow(canvas, mat)
  }
}

function handleResize() {
  camera.aspect = container.value.clientWidth / container.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
}

// 新增：进入自定义位置模式
function enterCustomPositionMode() {
  isCustomPositionMode.value = true;
  emit('update:isCustomPositionMode', true);
  // 显示提示文本
  showPositionHint.value = true;
  // 2秒后自动隐藏
  setTimeout(() => {
    showPositionHint.value = false;
  }, 2000);
}

// 修改：处理地面点击事件
function handleGroundClick(event) {
  if (!isCustomPositionMode.value) return;

  const rect = renderer.domElement.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
  const intersects = raycaster.intersectObject(ground.mesh);

  if (intersects.length > 0) {
    const point = intersects[0].point;
    drone.movement.setPosition(point.x, 0.05, point.z);
    // 退出自定义位置模式并通知父组件
    isCustomPositionMode.value = false;
    emit('update:isCustomPositionMode', false);
  }
}

// 修改 executeUserCode 函数
function executeUserCode(code) {
  try {
    if (code.trim()) {
      // 设置代码开始执行
      isCodeRunning.value = true
      
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
      // 停止代码执行
      isCodeRunning.value = false
      window.processFrame = null
    }
  } catch (error) {
    console.error('代码执行错误:', error);
    isCodeRunning.value = false
    window.processFrame = null
  }
}

// 修改重置视角函数
function resetCamera() {
  if (!camera || !ground) return;

  // 计算包围盒
  const boundingBox = new THREE.Box3();
  boundingBox.setFromObject(ground.mesh);

  // 计算包围球半径
  const boundingSphereRadius = boundingBox.getBoundingSphere(new THREE.Sphere()).radius;

  // 计算相机到包围球中心的距离，基于包围球半径和相机的视野
  const fov = camera.fov * (Math.PI / 180); // 将视角转换为弧度
  let distance = boundingSphereRadius / Math.sin(fov / 2);

  // 限制最小距离，避免相机过于接近地面
  const minDistance = boundingSphereRadius * 0.1; // 可以根据需要调整
  distance = Math.max(distance, minDistance);

    // 调整高度，避免相机过于接近水平面
    const heightFactor = 2; // 可以根据需要调整
    const height = boundingSphereRadius * heightFactor;

  // 相机目标位置（地面中心）
  const targetLookAt = new THREE.Vector3(0, 0, 0);

  // 使用 GSAP 创建平滑动画
  gsap.to(camera.position, {
    x: targetLookAt.x,
    y: targetLookAt.y + height * 0.6,
    z: targetLookAt.z + distance * 0.6,
    duration: 1,
    ease: "power2.inOut",
    onUpdate: () => {
      camera.lookAt(targetLookAt);
    },
    onComplete: () => {
      // 更新控制器
      controls.target.copy(targetLookAt);
      controls.update();
    }
  });
}

// 修改重置无人机位置的方法
function resetDronePosition() {
  if (drone && drone.movement) {
    // 重置到初始位置
    drone.movement.setPosition(0, 0.05, 0)
    // 重置运动状态
    drone.movement.setMovementCommand({ hover: true, angle: 0, speed: 0, altitude: 0.05 })
  }
}

// 新增：加载场景纹理
function loadSceneTexture(url) {
  const loader = new THREE.TextureLoader()
  loader.load(url, (texture) => {
    texture.needsUpdate = true
    if (ground) {
      ground.updateTexture(texture)
    }
  })
}

onMounted(() => {
  // 加载 OpenCV.js 脚本
  const script = document.createElement('script')
  script.src = '/opencv.js'
  script.async = true
  script.onload = () => {
    console.log('OpenCV.js 加载完成')
    setupOpenCVImshow()
  }
  document.head.appendChild(script)

  // 初始化场景
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, container.value.clientWidth / container.value.clientHeight, 0.1, 1000)
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  container.value.appendChild(renderer.domElement)
  renderer.setClearColor(0x000000, 0); // 设置清除颜色为透明

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05

  // 添加灯光
  // 增加环境光强度，使用白色
  scene.add(new THREE.AmbientLight(0xffffff, 1.5))

  // 调整平行光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
  directionalLight.position.set(5, 5, 5)
  scene.add(directionalLight)

  // 添加第二个平行光来填充阴影
  // const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
  // fillLight.position.set(-5, 5, -5)
  // scene.add(fillLight)

  // 设置相机位置
  camera.position.set(0, 3, 0)
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

  // 删除原有的地面创建代码，替换为使用 Ground 类
  ground = new Ground(scene, props.groundWidth, props.groundDepth)

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
    
    // 只在代码运行状态下处理图像和运动指令
    if (window.cv && window.processFrame && isCodeRunning.value && !isCustomPositionMode.value) {
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

  // 添加地面点击事件监听器
  renderer.domElement.addEventListener('click', handleGroundClick);

  window.addEventListener('resize', handleResize)

  // 初始化完成后设置初始视角
  setTimeout(() => {
    resetCamera();
  }, 2000); // 增加1秒的延时
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  container.value.removeChild(renderer.domElement)
  // 移除地面点击事件监听器
  renderer.domElement.removeEventListener('click', handleGroundClick);
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
  executeUserCode,
  enterCustomPositionMode,
  resetCamera,
  resetDronePosition,
  loadSceneTexture,
  // 新增：获取默认纹理 Base64 数据
  getDefaultTextureData() {
    return ground.defaultTextureData;
  }
})
</script>

<template>
  <div 
    ref="container" 
    class="scene-container"
    :class="{ 'custom-position-mode': isCustomPositionMode }"
  >
    <!-- 控制按钮组 -->
    <div class="control-buttons">
      <el-tooltip content="重置视角" placement="bottom">
        <div class="control-btn" @click="resetCamera">
          <GSymbol>center_focus_weak</GSymbol>
        </div>
      </el-tooltip>
      
      <el-tooltip content="保存场景" placement="bottom">
        <div class="control-btn" @click="$emit('save-scene')">
          <GSymbol>save</GSymbol>
        </div>
      </el-tooltip>
      
      <el-tooltip content="我的场景" placement="bottom">
        <div class="control-btn" @click="$emit('load-scene')">
          <GSymbol size="24">sort</GSymbol>
        </div>
      </el-tooltip>
    </div>

    <!-- 修改：使用 showPositionHint 控制提示文本的显示 -->
    <div v-if="showPositionHint" class="position-mode-hint">
      点击地面以放置无人机
    </div>
  </div>
</template>

<style scoped>
.scene-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  /* border: 3px solid #dcdfe6;
  border-radius: 4px; */
}

.control-buttons {
  position: absolute;
  top: 20px;
  right: 50px;
  display: flex;
  flex-direction: row;
  gap:10px;
  z-index: 10;
}

.control-btn {
  width: 40px;
  height: 40px;
  background-color: rgba(150, 150, 150, 0.228);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.control-btn:hover {
  background-color: rgba(101, 101, 101, 0.425);
}

.custom-position-mode {
  cursor: crosshair;
}

.position-mode-hint {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  pointer-events: none;
  animation: fadeInOut 2s ease-in-out forwards;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translate(-50%, -60%);
  }
  10% {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
  70% {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%);
  }
}
</style>