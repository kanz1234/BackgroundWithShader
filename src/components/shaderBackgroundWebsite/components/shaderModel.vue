<!-- 通过构造类来管理shader -->
<template>
  <TresMesh>
      <TresPlaneGeometry :args="[sizes.width.value / 10, sizes.height.value / 10]" />
      <TresShaderMaterial v-bind="tsMaterialConfig" />
  </TresMesh>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { useTexture, useTresContext, useRenderLoop } from '@tresjs/core';
import { gsap } from 'gsap';
import { useGLTF } from "@tresjs/cientos";

import Descent3DFragment from '../shader/shaderToy/Descent3DFragment.glsl';
import Descent3DVertex from '../shader/shaderToy/Descent3DVertex.glsl';

const { sizes } = useTresContext();

class BufferShader {
  scene = new THREE.Scene();
  readBuffer: THREE.WebGLRenderTarget;
  writeBuffer: THREE.WebGLRenderTarget;
	// 自动执行
	// 初始化类的实例属性
  constructor(
    public renderer: THREE.WebGLRenderer,
    public camera: THREE.Camera,
		// 指定了 uniforms 属性的类型。
		// 这个类型声明确保 uniforms 属性的结构与 THREE.ShaderMaterial 中的 uniforms 属性一致。
		public uniforms: THREE.ShaderMaterial["uniforms"],
    public fragment: string,
    public vertex: string,
    public width: number,
    public height: number
  ) {
    this.readBuffer = new THREE.WebGLRenderTarget(width, height, {
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    });
    this.writeBuffer = this.readBuffer.clone();

    // this.uniforms = {
    //   iResolution: { value: new THREE.Vector2(width, height) },
    //   iTime: { value: 0 },
    //   flowDirection: { value: new THREE.Vector2(0, 1) },
    // };

    // this.createMesh();
  }

  swapBuffers() {
    const tmp = this.readBuffer;
    this.readBuffer = this.writeBuffer;
    this.writeBuffer = tmp;
  }

  render(delta: number) {
    this.renderer.setRenderTarget(this.writeBuffer);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
    this.swapBuffers();

    this.uniforms.iTime.value = delta;
  }

  createMesh() {
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      fragmentShader: this.fragment,
      vertexShader: this.vertex,
      uniforms: this.uniforms,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
  }
}

const renderer = new THREE.WebGLRenderer();
const camera = new THREE.PerspectiveCamera(45, sizes.width.value / sizes.height.value, 0.1, 1000);
const bufferShader = new BufferShader(
  renderer,
  camera,
	// 这就是uniforms
	{
      iResolution: { value: new THREE.Vector2(sizes.width.value, sizes.height.value) },
      iTime: { value: 0 },
      flowDirection: { value: new THREE.Vector2(0, 1) },
    },
  Descent3DFragment,
  Descent3DVertex,
  sizes.width.value,
  sizes.height.value,
);

const tsMaterialConfig = {
  uniforms: bufferShader.uniforms,
  vertexShader: Descent3DVertex,
  fragmentShader: Descent3DFragment,
  side: THREE.DoubleSide,
};

const { onLoop } = useRenderLoop();
onLoop(({ elapsed }) => {
  bufferShader.render(elapsed);
});

onMounted(() => {
  renderer.setSize(sizes.width.value, sizes.height.value);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  camera.position.set(0, 0, 5);
  renderer.render(bufferShader.scene, camera);
});

onUnmounted(() => {
  renderer.dispose();
  document.body.removeChild(renderer.domElement);
});
</script>

<style scoped>
div {
  width: 100vw;
  height: 100vh;
}
</style>