import * as THREE from 'three';
import { gsap } from 'gsap';

//  setting the scene here
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

// generate particles for formin wave
const particleCount = 50000;
const particles = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = Math.random() < 0.5 ? -15 - Math.random() * 15 : 15 + Math.random() * 15; // x
  positions[i * 3 + 1] = (Math.random() - 0.5) * 15; // y
  positions[i * 3 + 2] = (Math.random() - 0.5) * 15; // z
}

particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({
  color: 0x00ffff,
  size: 0.05,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
});

const particleSystem = new THREE.Points(particles, material);
scene.add(particleSystem);

camera.position.z = 20;
let time = 0;
let isForming = false;

const cubeSize = 5;
const targetPositions = [];

for (let i = 0; i < particleCount; i++) {
  const x = (Math.random() - 0.5) * cubeSize;
  const y = (Math.random() - 0.5) * cubeSize;
  const z = (Math.random() - 0.5) * cubeSize;
  
  const maxDim = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
  const scale = (cubeSize / 2) / maxDim;
  
  targetPositions.push(x * scale, y * scale, z * scale);
}

setTimeout(() => {
  isForming = true;
  gsap.to(particleSystem.geometry.attributes.position.array, {
    duration: 3,
    ease: "power2.inOut",
    ...targetPositions,
    onUpdate: () => {
      particleSystem.geometry.attributes.position.needsUpdate = true;
    },
    onComplete: () => {
      animateCube();
    }
  });
}, 5000);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

function animate() {
  requestAnimationFrame(animate);
  
  time += 0.05;
  
  if (!isForming) {
    const positions = particleSystem.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += Math.sin(time * 0.5 + positions[i+1] * 0.1) * 0.1;
      positions[i+1] += Math.cos(time * 0.5 + positions[i] * 0.1) * 0.1;
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;
  }
  
  renderer.render(scene, camera);
}

// adding motion to the cube
function animateCube() {
  gsap.to(particleSystem.rotation, {
    x: Math.PI * 2,
    y: Math.PI * 2,
    duration: 20,
    repeat: -1,
    ease: "none"
  });
  
  gsap.to(particleSystem.position, {
    y: 1,
    duration: 2,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut"
  });
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});