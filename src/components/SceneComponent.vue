<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Drone } from '../utils/drone.js'

const container = ref(null)
const codeEditor = ref(null)
const bottomCameraContainer = ref(null)
const cvOutputContainer = ref(null)
const userCode = ref('')

let scene, camera, renderer, controls, drone

// 创建自定义的imshow函数
const setupOpenCVImshow = () => {
    window.cv.customImshow = function(mat) {
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      
      const container = cvOutputContainer.value;
      // 清除之前的内容
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.appendChild(canvas);
      cv.imshow(canvas, mat);
    };
};

// 执行用户代码
const executeUserCode = () => {
  try {
    if (window.cv) {
      const code = userCode.value;
      if (code.trim()) {
        // 编译用户代码
        window.processFrame = new Function('frame', 'cv', 'drone', `
          try {
            ${code}
            return frame;
          } catch (error) {
            console.error('代码执行错误:', error);
            return frame;
          }
        `);
      }
    } else {
      console.error('OpenCV.js 尚未加载完成');
    }
  } catch (error) {
    console.error('代码执行错误:', error);
  }
}

onMounted(() => {
  // 加载OpenCV.js
  const script = document.createElement('script')
  script.src = 'src/assets/opencv.js'
  script.async = true
  script.onload = () => {
    console.log('OpenCV.js 加载完成')
    setupOpenCVImshow() // OpenCV加载完成后设置imshow函数
  }
  document.head.appendChild(script)

  // 初始化场景
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, container.value.clientWidth / container.value.clientHeight, 0.1, 1000)
  renderer = new THREE.WebGLRenderer({ antialias: true })
  
  // 设置渲染器尺寸
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  container.value.appendChild(renderer.domElement)

  // 初始化控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05

  // 创建地面
  const groundGeometry = new THREE.BoxGeometry(2, 0.1, 2)
  
  // 创建画布作为纹理
  const canvas = document.createElement('canvas')
  canvas.width = 512  // 设置合适的分辨率
  canvas.height = 512
  const context = canvas.getContext('2d')
  
  // 绘制灰色背景
  context.fillStyle = '#808080'
  context.fillRect(0, 0, canvas.width, canvas.height)
  
  // 在中央绘制红色圆圈
  context.beginPath()
  context.arc(canvas.width/2, canvas.height/2, 50, 0, Math.PI * 2)
  context.fillStyle = '#FF0000'
  context.fill()
  
  // 创建纹理
  const texture = new THREE.CanvasTexture(canvas)
  const groundMaterial = new THREE.MeshPhongMaterial({ 
    map: texture,
    side: THREE.DoubleSide 
  })
  
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  scene.add(ground)

  // 添加灯光
  scene.add(new THREE.AmbientLight(0x404040))
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 5, 5)
  scene.add(directionalLight)

  // 设置相机位置
  camera.position.set(-0, 1, 2.3)
  camera.lookAt(0, 0, 0)

  // 初始化无人机
  drone = new Drone(scene)
  
  // 添加底部摄像头视图到容器中
  if (bottomCameraContainer.value) {
    bottomCameraContainer.value.appendChild(drone.getBottomCameraElement())
  }

  // 修改动画循环
  const animate = () => {
    requestAnimationFrame(animate)
    controls.update()
    if (drone) {
      drone.update()
      drone.renderBottomCamera() // 渲染底部摄像头视角
      
      // 实时处理底部摄像头图像
      if (window.cv && window.processFrame) {
        try {
          const canvas = drone.getBottomCameraImage();
          const frame = cv.imread(canvas);
          
          // 执行用户的图像处理代码，同时传入drone对象用于控制
          const processedFrame = window.processFrame(frame, cv, drone);
          
          // 显示处理后的图像
          cv.customImshow(processedFrame);
          
          // 如果处理后的帧与原始帧不同，则需要清理
          if (processedFrame !== frame) {
            processedFrame.delete();
          }
          frame.delete();
        } catch (error) {
          console.error('图像处理错误:', error);
        }
      }
    }
    renderer.render(scene, camera)
  }

  animate()
})

// 窗口resize处理
const handleResize = () => {
  camera.aspect = container.value.clientWidth / container.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  container.value.removeChild(renderer.domElement)
})

window.addEventListener('resize', handleResize)
</script>

<template>
  <div class="scene-container-wrapper">
    <div class="main-content">
      <div class="scene-container-relative">
        <div ref="container" class="scene-container"></div>
        <div ref="bottomCameraContainer" class="bottom-camera-container"></div>
        <div ref="cvOutputContainer" class="cv-output-container"></div>
      </div>
    </div>
    <div class="code-editor-container">
      <textarea
        ref="codeEditor"
        v-model="userCode"
        class="code-editor"
        placeholder="在此输入控制代码..."
      ></textarea>
      <button @click="executeUserCode" class="execute-button">执行代码</button>
    </div>
  </div>
</template>

<style scoped>
.scene-container-wrapper {
  display: flex;
  gap: 20px;
  padding: 20px;
}

.main-content {
  width: 70vw;
}

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

.code-editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.code-editor {
  width: 100%;
  height: calc(30vh - 50px);
  padding: 10px;
  font-family: monospace;
  font-size: 14px;
  border: 2px solid #4eaed0;
  border-radius: 4px;
  resize: none;
}

.execute-button {
  padding: 10px 20px;
  background-color: #4eaed0;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.execute-button:hover {
  background-color: #3d8ca6;
}
</style> 