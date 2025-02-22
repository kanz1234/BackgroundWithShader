<template>
  <main class="relative min-h-screen font-wallpoet">
    <div class="title" id ='title'>
        <p><b>Buffer Shader</b></p>
    </div>

    <div class="banner" id = 'banner'>
        <div class="about">
            <p>About</p>
        </div>
        <div class="article">
            <p> logs</p>
        </div>
        <div class="demo">
            <p>Demo</p>
        </div>
        
    </div>
  <!-- 插槽，插入mapModel组件 -->
  <div class="layout-container">
    <slot></slot>
  </div>
  </main>
  
</template>

<script setup>
</script>

<style scoped>

/* 引入外部 CSS 文件 */
@import '../../../assets/style.css';
a {
    text-decoration: none;
    color: inherit;
    cursor: pointer;
}
.layout-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: -1; /* 确保布局容器在较低的层级 */
}

.font-wallpoet {
  font-family: "Wallpoet", serif;
}

.neumorphic-button {
  border-radius: 9999px;
  background-color: #c2c2c2;
  color: #000;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 1px 1px 2px #b5b5b5, -4px -4px 8px #ffffff;
  transition: all 0.3s ease;
}

.neumorphic-button:hover {
  box-shadow: 1px 1px 2px #b5b5b5, -4px -4px 8px #ffffff;
  transform: translateY(1px);
}
</style>