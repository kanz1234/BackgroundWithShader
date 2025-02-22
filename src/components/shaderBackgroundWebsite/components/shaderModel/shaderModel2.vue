
<template>
  <TresMesh>
      <TresPlaneGeometry :args="[sizes.width.value / 30, sizes.height.value / 30]" />
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
import skyFragment from '@/components/shaderBackgroundWebsite/shader/sky/skyFragment.glsl'
import skyVertex from '@/components/shaderBackgroundWebsite/shader/sky/skyVertex.glsl'

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
  vertexShader: skyVertex,
  // 双面展示
  side:THREE.DoubleSide,
  fragmentShader: skyFragment
      
}

// 动画渲染
const { onLoop } = useRenderLoop()
onLoop(({ elapsed }) => {
  if (tsMaterialConfig) {
    tsMaterialConfig.uniforms.iTime.value = elapsed
  }
})


</script>
