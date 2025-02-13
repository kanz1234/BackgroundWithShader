<template>
  <!-- <loading useResourceManager /> -->
<TresCanvas v-bind="state"  window-size>
      <TresPerspectiveCamera  :position="[20, 60, 80]" :fov="45" :near="1" :far="1000" :look-at="[10, 10, 0]" />
      <OrbitControls v-bind="controlsState"/>
      <TresAmbientLight :intensity="2" />
      <TresDirectionalLight  :intensity="1"  />
      <TresGridHelper :scale="50" :position="[0, 0, 0]"/>

        <Suspense>
      <bufferShader :position="[0,-3,0]"></bufferShader>
    </Suspense>

      <StatsGl />
  </TresCanvas>

  
</template>


<script setup lang="ts">
import { reactive,watch,onUnmounted } from 'vue'
import { Pane } from 'tweakpane'
import * as THREE from 'three'
import { OrbitControls } from '@tresjs/cientos'
import { SRGBColorSpace, BasicShadowMap, NoToneMapping } from 'three'
import { StatsGl } from '@tresjs/cientos'
// 着色器
import shaderModel from './components/shaderModel.vue'
import bufferShader from './components/bufferShader.vue'
import vertex from './shader/vertex.glsl'
import fragment from './shader/fragment.glsl'


const state = reactive({
  clearColor: '#999',
  shadows: true,
  alpha: false,
  useLegacyLights: true,
  shadowMapType: BasicShadowMap,
  outputColorSpace: SRGBColorSpace,
  toneMapping: NoToneMapping,
  
})
// 控制相机的
const controlsState = reactive({
// 使动画循环使用时阻尼或自转 意思是否有惯性
enableDamping: false,
  // 动态阻尼系数 就是鼠标拖拽旋转灵敏度
dampingFactor: 0.001,
// 是否开启右键拖拽
enablePan: true,
// maxDistance: 600,
minDistance: -1000,
// 缩放速度
zoomSpeed: 2.5,
// 垂直旋转上限，Math.PI是180度
maxPolarAngle: Math.PI/2.4,

// 光标为缩放中心
zoomToCursor:true
})




</script>
