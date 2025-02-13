
<template>
  <TresMesh>
      <TresPlaneGeometry :args="[sizes.width.value / 10, sizes.height.value / 10]" />
      <TresShaderMaterial v-bind="tsMaterialConfig" />
  </TresMesh>
  <!-- <primitive :object="showMesh" /> -->
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { useTexture,useTresContext, useRenderLoop } from '@tresjs/core'
import { gsap } from 'gsap'

import { onMounted } from 'vue';
import { useGLTF } from "@tresjs/cientos"
import Descent3DFragment from '../shader/shaderToy/Descent3DFragment.glsl'
import Descent3DVertex from '../shader/shaderToy/Descent3DVertex.glsl'

const { sizes } = useTresContext()

// 在平面上使用shadertoy上的shader
const geometry = new THREE.PlaneGeometry();
const renderer = new THREE.WebGLRenderer();
const { width, height } = renderer.getDrawingBufferSize(new THREE.Vector2());

const tsMaterialConfig = {
  
  uniforms: {
          iResolution: { value: new THREE.Vector2(width, height) },
          iTime: { value: 0 },
          // 控制方向
          flowDirection:{value: new THREE.Vector2(0, 1) },
      },
  vertexShader: Descent3DVertex,
  // 双面展示
  side:THREE.DoubleSide,
  fragmentShader: Descent3DFragment
      
}

// 动画渲染
const { onLoop } = useRenderLoop()
onLoop(({ elapsed }) => {
  if (tsMaterialConfig) {
    tsMaterialConfig.uniforms.iTime.value = elapsed
  }
})


</script>
