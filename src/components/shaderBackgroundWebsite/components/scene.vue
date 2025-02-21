<template>
  <TresCanvas
    window-size
    :camera-controls="true"
    shadows
    alpha
    preset="realistic"
  >
    <TresPerspectiveCamera
      :position="[0, 0, 16]" :fov="45" :near="0.1" :far="10000"
    />
    <OrbitControls
          
          />
      <!-- 基础光照 -->
      <TresAmbientLight :intensity="0.5" />
      <TresDirectionalLight
        :position="[5, 5, 5]"
        :intensity="1"
        cast-shadow
      />
  <Suspense>
    <model />
  </Suspense>
  </TresCanvas>
</template>

<script setup>
import { OrbitControls } from '@tresjs/cientos'
import model from './model.vue';
import * as THREE from 'three'
// 可以添加一些交互和动画逻辑
const tcConfig = {
    clearColor: '#ffffff',
    windowSize: true,
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 0.8,
    shadows: true,
    outputColorSpace: THREE.SRGBColorSpace,
}
</script>
