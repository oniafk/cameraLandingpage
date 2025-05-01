import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "dat.gui";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Get app container
const appContainer = document.getElementById("app");

// Create scene with white background
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Use OrthographicCamera instead of PerspectiveCamera
const aspectRatio = window.innerWidth / window.innerHeight;
const cameraWidth = 10;
const cameraHeight = cameraWidth / aspectRatio;
const camera = new THREE.OrthographicCamera(
  -cameraWidth / 2,
  cameraWidth / 2,
  cameraHeight / 2,
  -cameraHeight / 2,
  0.1,
  1000
);
camera.position.z = 25;

// Set up renderer with transparency
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 0); // Transparent background
appContainer?.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Handle window resizing
window.addEventListener("resize", () => {
  const newAspectRatio = window.innerWidth / window.innerHeight;
  const newCameraHeight = cameraWidth / newAspectRatio;

  camera.left = -cameraWidth / 2;
  camera.right = cameraWidth / 2;
  camera.top = newCameraHeight / 2;
  camera.bottom = -newCameraHeight / 2;

  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Orbit controls for camera
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Camera model
let cameraModel: THREE.Group;

// Load camera model
new GLTFLoader().load("models/camera_ver2.glb", (gltf) => {
  cameraModel = gltf.scene;

  // Set the exact position and rotation specified
  cameraModel.position.set(0.7, -2, -1.41);

  // Convert 870.59 degrees to radians (870.59 % 360 = 150.59 degrees = ~2.63 radians)
  // 870.59 degrees is equivalent to 870.59 * (Math.PI / 180) = ~15.19 radians
  // But we need to normalize it to a 0-2π range, so we take modulo 2π
  const yRotationRadians = ((870.59 * Math.PI) / 180) % (Math.PI * 2);
  cameraModel.rotation.set(
    0, // x: 0 degrees
    yRotationRadians, // y: 870.59 degrees normalized
    0 // z: 0 degrees
  );

  cameraModel.scale.set(0.25, 0.25, 0.25);
  scene.add(cameraModel);

  // No need to center the model now that we're using exact coordinates
  // Instead, we position it to favor the right side by shifting its x position
  cameraModel.position.x += 2; // Shift more to the right
});

const stats = new Stats();
appContainer?.appendChild(stats.dom);

// GUI controls
const gui = new GUI();

// Camera view controls
const cameraFolder = gui.addFolder("View Camera");
cameraFolder
  .add(camera.position, "x", -20, 20)
  .step(0.1)
  .onChange(() => camera.lookAt(0, 0, 0));
cameraFolder
  .add(camera.position, "y", -20, 20)
  .step(0.1)
  .onChange(() => camera.lookAt(0, 0, 0));
cameraFolder
  .add(camera.position, "z", 0, 20)
  .step(0.1)
  .onChange(() => camera.lookAt(0, 0, 0));

// Orthographic camera controls
const orthoFolder = gui.addFolder("Orthographic Settings");
const orthoParams = {
  zoom: camera.zoom,
  near: camera.near,
  far: camera.far,
};

orthoFolder
  .add(orthoParams, "zoom", 0.1, 5)
  .step(0.1)
  .onChange((value) => {
    camera.zoom = value;
    camera.updateProjectionMatrix();
  });

orthoFolder
  .add(orthoParams, "near", 0.1, 10)
  .step(0.1)
  .onChange((value) => {
    camera.near = value;
    camera.updateProjectionMatrix();
  });

orthoFolder
  .add(orthoParams, "far", 10, 1000)
  .step(10)
  .onChange((value) => {
    camera.far = value;
    camera.updateProjectionMatrix();
  });

// Controls settings
const controlsFolder = gui.addFolder("Controls Settings");
controlsFolder.add(controls, "enableDamping");
controlsFolder.add(controls, "dampingFactor", 0.01, 0.5).step(0.01);
controlsFolder.add(controls, "autoRotate");
controlsFolder.add(controls, "autoRotateSpeed", 0.1, 10).step(0.1);

cameraFolder.open();

// Debug helpers
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

// Toggle helper visibility
const helperParams = {
  showAxes: true,
  showGrid: true,
};

const helperFolder = gui.addFolder("Helpers");
helperFolder.add(helperParams, "showAxes").onChange((visible) => {
  axesHelper.visible = visible;
});
helperFolder.add(helperParams, "showGrid").onChange((visible) => {
  gridHelper.visible = visible;
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update camera model based on scroll position if needed
  // For now, keep the model at its fixed position and rotation

  controls.update();
  renderer.render(scene, camera);
  stats.update();
}

// Display current camera position and rotation in console
const logCameraPosition = () => {
  console.log("Camera Position:", {
    x: camera.position.x.toFixed(2),
    y: camera.position.y.toFixed(2),
    z: camera.position.z.toFixed(2),
  });

  if (cameraModel) {
    console.log("Model Position:", {
      x: cameraModel.position.x.toFixed(2),
      y: cameraModel.position.y.toFixed(2),
      z: cameraModel.position.z.toFixed(2),
    });
    console.log("Model Rotation:", {
      x: (cameraModel.rotation.x * (180 / Math.PI)).toFixed(2) + "°",
      y: (cameraModel.rotation.y * (180 / Math.PI)).toFixed(2) + "°",
      z: (cameraModel.rotation.z * (180 / Math.PI)).toFixed(2) + "°",
    });
  }
};

// Add a button to log current positions
const positionButton = {
  logPositions: logCameraPosition,
};
gui.add(positionButton, "logPositions").name("Log Positions to Console");

animate();
