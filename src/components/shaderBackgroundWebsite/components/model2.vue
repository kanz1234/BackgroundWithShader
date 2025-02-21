<!-- 通过构造类来管理shader -->
<template>
  <TresMesh>
    <TresPlaneGeometry :args="[aspect * 2, 2]" />
    <TresMeshBasicMaterial :map="bufferMain.readBuffer.texture" :side="DoubleSide"/>
  </TresMesh>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { useTresContext, useRenderLoop } from '@tresjs/core';
import { DoubleSide } from 'three'
const {  sizes, camera, renderer,raycaster } = useTresContext();
const aspect = sizes.width.value / sizes.height.value
// 初始化鼠标和分辨率
const iMouse = new THREE.Vector4();
const iResolution = new THREE.Vector3(
  sizes.width.value,
  sizes.height.value,
  renderer.value.pixelRatio
);
// 鼠标交互逻辑
const handleMove = (e: MouseEvent) => {
        iMouse.x = e.pageX;
        iMouse.y = innerHeight - e.pageY;
    };
    document.addEventListener("mousemove", (e) => {
        iMouse.z = 2;
        iMouse.w = 2;

        document.addEventListener("mousemove", handleMove);

        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", handleMove);
            iMouse.z = 0;
            iMouse.w = 0;
        });
    });

onMounted(() => {
  handleMove
});

onUnmounted(() => {
  handleMove
});
const common = `
            
    #define dt 0.15
    #define USE_VORTICITY_CONFINEMENT
    //#define MOUSE_ONLY

    //Recommended values between 0.03 and 0.2
    //higher values simulate lower viscosity fluids (think billowing smoke)
    #define VORTICITY_AMOUNT 0.11

    float mag2(vec2 p){return dot(p,p);}
    vec2 point1(float t) {
        t *= 0.62;
        return vec2(0.12,0.5 + sin(t)*0.2);
    }
    vec2 point2(float t) {
        t *= 0.62;
        return vec2(0.88,0.5 + cos(t + 1.5708)*0.2);
    }

    vec4 solveFluid(sampler2D smp, vec2 uv, vec2 w, float time, vec3 mouse, vec3 lastMouse)
    {
        const float K = 0.2;
        const float v = 0.55;
        
        vec4 data = texture2D(smp, uv, 0.0);
        vec4 tr = texture2D(smp, uv + vec2(w.x , 0), 0.0);
        vec4 tl = texture2D(smp, uv - vec2(w.x , 0), 0.0);
        vec4 tu = texture2D(smp, uv + vec2(0 , w.y), 0.0);
        vec4 td = texture2D(smp, uv - vec2(0 , w.y), 0.0);
        
        vec3 dx = (tr.xyz - tl.xyz)*0.5;
        vec3 dy = (tu.xyz - td.xyz)*0.5;
        vec2 densDif = vec2(dx.z ,dy.z);
        
        data.z -= dt*dot(vec3(densDif, dx.x + dy.y) ,data.xyz); //density
        vec2 laplacian = tu.xy + td.xy + tr.xy + tl.xy - 4.0*data.xy;
        vec2 viscForce = vec2(v)*laplacian;
        data.xyw = texture2D(smp, uv - dt*data.xy*w, 0.).xyw; //advection
        
        vec2 newForce = vec2(0);
        #ifndef MOUSE_ONLY
        #if 1
        newForce.xy += 0.75*vec2(.0003, 0.00015)/(mag2(uv-point1(time))+0.0001);
        newForce.xy -= 0.75*vec2(.0003, 0.00015)/(mag2(uv-point2(time))+0.0001);
        #else
        newForce.xy += 0.9*vec2(.0003, 0.00015)/(mag2(uv-point1(time))+0.0002);
        newForce.xy -= 0.9*vec2(.0003, 0.00015)/(mag2(uv-point2(time))+0.0002);
        #endif
        #endif
        
        if (mouse.z > 1. && lastMouse.z > 1.)
        {
            vec2 vv = clamp(vec2(mouse.xy*w - lastMouse.xy*w)*400., -6., 6.);
            newForce.xy += .001/(mag2(uv - mouse.xy*w)+0.001)*vv;
        }
        
        data.xy += dt*(viscForce.xy - K/dt*densDif + newForce); //update velocity
        data.xy = max(vec2(0), abs(data.xy)-1e-4)*sign(data.xy); //linear velocity decay
        
        #ifdef USE_VORTICITY_CONFINEMENT
        data.w = (tr.y - tl.y - tu.x + td.x);
        vec2 vort = vec2(abs(tu.w) - abs(td.w), abs(tl.w) - abs(tr.w));
        vort *= VORTICITY_AMOUNT/length(vort + 1e-9)*data.w;
        data.xy += vort;
        #endif
        
        data.y *= smoothstep(.5,.48,abs(uv.y-0.5)); //Boundaries
        
        data = clamp(data, vec4(vec2(-10), 0.5 , -10.), vec4(vec2(10), 3.0 , 10.));
        
        return data;
    }
    `;
const bufferAFragment = `
uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;
uniform float iFrame;
uniform sampler2D iChannel0;

${common}
//Chimera's Breath
//by nimitz 2018 (twitter: @stormoid)

//see "Common" tab for fluid simulation code

float length2(vec2 p){return dot(p,p);}
mat2 mm2(in float a){float c = cos(a), s = sin(a);return mat2(c,s,-s,c);}

void main()
{
    vec2 uv = gl_FragCoord.xy/iResolution.xy;
    vec2 w = 1.0/iResolution.xy;
    
    vec4 lastMouse = texture2D(iChannel0, vec2(0,0));
    vec4 data = solveFluid(iChannel0, uv, w, iTime, iMouse.xyz, lastMouse.xyz);
    
    if (iFrame < 20.)
    {
        data = vec4(0.5,0,0,0);
    }
    
    if (gl_FragCoord.y < 1.)
        data = iMouse;
    
    gl_FragColor = data;
    
}
`;
const bufferDFragment = `
    uniform float iTime;
    uniform vec3 iResolution;
    uniform vec4 iMouse;
    uniform float iFrame;
    uniform sampler2D iChannel0;
    uniform sampler2D iChannel1;

    ${common}
    mat2 mm2(in float a){float c = cos(a), s = sin(a);return mat2(c,s,-s,c);}

    //shader incoming relating to this palette
    vec3 getPalette(float x, vec3 c1, vec3 c2, vec3 p1, vec3 p2)
    {
        float x2 = fract(x/2.0);
        x = fract(x);   
        mat3 m = mat3(c1, p1, c2);
        mat3 m2 = mat3(c2, p2, c1);
        float omx = 1.0-x;
        vec3 pws = vec3(omx*omx, 2.0*omx*x, x*x);
        return clamp(mix(m*pws, m2*pws, step(x2,0.5)),0.,1.);
    }

    vec4 pal(float x)
    {
        vec3 pal = getPalette(-x, vec3(0.2, 0.5, .7), vec3(.9, 0.4, 0.1), vec3(1., 1.2, .5), vec3(1., -0.4, -.0));
        return vec4(pal, 1.);
    }

    vec4 pal2(float x)
    {
        vec3 pal = getPalette(-x, vec3(0.4, 0.3, .5), vec3(.9, 0.75, 0.4), vec3(.1, .8, 1.3), vec3(1.25, -0.1, .1));
        return vec4(pal, 1.);
    }

    void main()
    {
        vec2 uv = gl_FragCoord.xy / iResolution.xy;
        vec2 mo = iMouse.xy / iResolution.xy;
        vec2 w = 1.0/iResolution.xy;
        
        vec2 velo = texture2D(iChannel0, uv, 0.).xy;
        vec4 col = texture2D(iChannel1, uv - dt*velo*w*3., 0.); //advection
        if (gl_FragCoord.y < 1. && gl_FragCoord.x < 1.)
            col = vec4(0);
        vec4 lastMouse = texture2D(iChannel1, vec2(0,0)).xyzw;
        
        if (iMouse.z > 1. && lastMouse.z > 1.)
        {
            float str = smoothstep(-.5,1.,length(mo - lastMouse.xy/iResolution.xy));   
            col += str*0.0009/(pow(length(uv - mo),1.7)+0.002)*pal2(-iTime*0.7);
        }
        
        #ifndef MOUSE_ONLY
        col += .0025/(0.0005+pow(length(uv - point1(iTime)),1.75))*dt*0.12*pal(iTime*0.05 - .0);
        col += .0025/(0.0005+pow(length(uv - point2(iTime)),1.75))*dt*0.12*pal2(iTime*0.05 + 0.675);
        #endif
        
        
        if (iFrame < 20.)
        {
            col = vec4(0.);
        }
        
        col = clamp(col, 0.,5.);
        col = max(col - (0.0001 + col*0.004)*.5, 0.); //decay
        
        if (gl_FragCoord.y < 1. && gl_FragCoord.x < 1.)
            col = iMouse;

        gl_FragColor = col;
        
    }

    `;
const bufferVertex = `
  void main() {
  gl_Position = vec4(position, 1.0);
  }
`;

class BufferShader {
    scene: THREE.Scene;
    readBuffer: THREE.WebGLRenderTarget;
    writeBuffer: THREE.WebGLRenderTarget;
    mesh: THREE.Mesh;

    constructor(
        public renderer: THREE.WebGLRenderer,
        public camera: THREE.Camera,
        public fragmentShader: string,
        public uniforms: THREE.ShaderMaterial['uniforms'],
        public width: number,
        public height: number
    ) {
        this.scene = new THREE.Scene();
        this.readBuffer = new THREE.WebGLRenderTarget(width, height, {
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
        });
        this.writeBuffer = new THREE.WebGLRenderTarget(width, height, {
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
        });

        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            new THREE.ShaderMaterial({
                fragmentShader: this.fragmentShader,
                vertexShader: `
                    void main() {
                        gl_Position = vec4(position, 1.0);
                    }
                `,
                uniforms: this.uniforms
            })
        );
        this.scene.add(this.mesh);
    }

    render() {
        this.renderer.setRenderTarget(this.writeBuffer);
        this.renderer.render(this.scene, this.camera);
        this.renderer.setRenderTarget(null);
        this.swapBuffers();
    }

    swapBuffers() {
        const temp = this.readBuffer;
        this.readBuffer = this.writeBuffer;
        this.writeBuffer = temp;
    }
}
const bufferA = new BufferShader(
    renderer.value,
    camera.value,
    bufferAFragment,
    {
        iTime: { value: 0 },
        iResolution: { value: iResolution },
        iMouse: { value: iMouse },
        iFrame: { value: 0 },
        iChannel0: { value: null }
    },
    sizes.width.value,
    sizes.height.value
);

const bufferB = new BufferShader(
    renderer.value,
    camera.value,
    bufferAFragment,
    {
        iTime: { value: 0 },
        iResolution: { value: iResolution },
        iMouse: { value: iMouse },
        iFrame: { value: 0 },
        iChannel0: { value: null }
    },
    sizes.width.value,
    sizes.height.value
);

const bufferC = new BufferShader(
    renderer.value,
    camera.value,
    bufferAFragment,
    {
        iTime: { value: 0 },
        iResolution: { value: iResolution },
        iMouse: { value: iMouse },
        iFrame: { value: 0 },
        iChannel0: { value: null }
    },
    sizes.width.value,
    sizes.height.value
);

const bufferD = new BufferShader(
    renderer.value,
    camera.value,
    bufferDFragment,
    {
        iTime: { value: 0 },
        iResolution: { value: iResolution },
        iMouse: { value: iMouse },
        iFrame: { value: 0 },
        iChannel0: { value: null },
        iChannel1: { value: null }
    },
    sizes.width.value,
    sizes.height.value
);

const bufferMain = new BufferShader(
    renderer.value,
    camera.value,
    `
        uniform vec3 iResolution;
        uniform sampler2D iChannel0;
        uniform sampler2D iChannel1;

        void main() {
            vec4 col = texture2D(iChannel0, gl_FragCoord.xy / iResolution.xy, 0.);
            if (gl_FragCoord.y < 1. || gl_FragCoord.y >= (iResolution.y - 1.))
                col = vec4(0);
            gl_FragColor = col;
        }
    `,
    {
        iResolution: { value: iResolution },
        iChannel0: { value: null }
    },
    sizes.width.value,
    sizes.height.value
);


// 渲染循环
const { onLoop } = useRenderLoop();

onLoop(({ elapsed, delta }) => {
    bufferA.uniforms.iTime.value += delta;
    bufferA.uniforms.iFrame.value++;
    bufferB.uniforms.iTime.value += delta;
    bufferB.uniforms.iFrame.value++;
    bufferC.uniforms.iTime.value += delta;
    bufferC.uniforms.iFrame.value++;
    bufferD.uniforms.iTime.value += delta;
    bufferD.uniforms.iFrame.value++;

    bufferA.uniforms.iChannel0.value = bufferC.readBuffer.texture;
    bufferA.render();

    bufferB.uniforms.iChannel0.value = bufferA.readBuffer.texture;
    bufferB.render();

    bufferC.uniforms.iChannel0.value = bufferB.readBuffer.texture;
    bufferC.render();

    bufferD.uniforms.iChannel0.value = bufferA.readBuffer.texture;
    bufferD.uniforms.iChannel1.value = bufferD.readBuffer.texture;
    bufferD.render();

    bufferMain.uniforms.iChannel0.value = bufferD.readBuffer.texture;
    bufferMain.render();
});

</script>

<style scoped>
div {
    width: 100vw;
    height: 100vh;
}
</style>