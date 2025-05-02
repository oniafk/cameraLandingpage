import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// import { GUI } from "dat.gui";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const modelPositions = {
  initialOffScreen: {
    position: { x: 15.0, y: -2.0, z: -1.41 },
    rotation: { x: 0.0, y: 2.63, z: 0.0 },
  },

  section1: {
    position: { x: 2.7, y: -2.0, z: -1.41 },
    rotation: { x: 0.0, y: 2.63, z: 0.0 },
  },

  section2: {
    position: { x: -2.2, y: -1.99, z: -1.4 },
    rotation: { x: 0.0, y: 3.08, z: 0.0 },
  },

  section3: {
    position: { x: 0.0, y: -0.5, z: 0.0 },
    rotation: { x: 0.75, y: 3.15, z: 0.0 },
  },

  section4: {
    position: { x: 0.0, y: -1.4, z: 0.0 },
    rotation: { x: 0.0, y: 0.45, z: 0.0 },
  },
};

const appContainer = document.getElementById("app");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

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

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 0);
appContainer?.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

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

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

let cameraModel: THREE.Group;
let modelLoaded = false;
let elementsReady = false;

function createLoadingIndicator() {
  const loader = document.createElement("div");
  loader.id = "model-loader";
  loader.style.position = "fixed";
  loader.style.top = "50%";
  loader.style.left = "50%";
  loader.style.transform = "translate(-50%, -50%)";
  loader.style.background = "rgba(255, 255, 255, 0.8)";
  loader.style.padding = "20px";
  loader.style.borderRadius = "10px";
  loader.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
  loader.style.zIndex = "1000";
  loader.style.fontFamily = "Arial, sans-serif";
  loader.style.fontSize = "16px";
  loader.style.color = "#333";
  loader.style.textAlign = "center";
  loader.innerHTML = "Loading 3D model...";

  document.body.appendChild(loader);

  return loader;
}

function removeLoadingIndicator(loader: HTMLElement) {
  if (loader && document.body.contains(loader)) {
    document.body.removeChild(loader);
  }
}

const loadingIndicator = createLoadingIndicator();

document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector("nav");
  const heading = document.querySelector("#section-1 h2");
  const paragraph = document.querySelector("#section-1 p");
  const button = document.querySelector("#section-1 button");

  if (navbar && heading && paragraph && button) {
    gsap.set([heading, paragraph, button], {
      x: -200,
      opacity: 0,
    });

    gsap.set(navbar, {
      y: -100,
      opacity: 0,
    });

    elementsReady = true;
    tryStartAnimations();
  }
});

function tryStartAnimations() {
  if (modelLoaded && elementsReady) {
    removeLoadingIndicator(loadingIndicator);
    runEntranceAnimations();
  }
}

function runEntranceAnimations() {
  const navbar = document.querySelector("nav");
  const heading = document.querySelector("#section-1 h2");
  const paragraph = document.querySelector("#section-1 p");
  const button = document.querySelector("#section-1 button");

  if (!navbar || !heading || !paragraph || !button) {
    console.warn("Elements for entrance animations not found");
    return;
  }

  const tl = gsap.timeline({
    defaults: { ease: "power2.out" },
    onComplete: () => {
      if (cameraModel) {
        cameraModel.position.set(
          modelPositions.section1.position.x,
          modelPositions.section1.position.y,
          modelPositions.section1.position.z
        );
        cameraModel.rotation.set(
          modelPositions.section1.rotation.x,
          modelPositions.section1.rotation.y,
          modelPositions.section1.rotation.z
        );

        // // Update GUI controls to match the final position
        // modelControls.positionX = modelPositions.section1.position.x;
        // modelControls.positionY = modelPositions.section1.position.y;
        // modelControls.positionZ = modelPositions.section1.position.z;
        // modelControls.rotationX = modelPositions.section1.rotation.x;
        // modelControls.rotationY = modelPositions.section1.rotation.y;
        // modelControls.rotationZ = modelPositions.section1.rotation.z;

        // // Force GUI to update
        // for (const controller of Object.values(modelFolder.__controllers)) {
        //   controller.updateDisplay();
        // }

        setupScrollAnimations();
      }
    },
  });

  tl.to(navbar, {
    y: 0,
    opacity: 1,
    duration: 1,
    ease: "power1.out",
  });

  tl.to(
    heading,
    {
      x: 0,
      opacity: 1,
      duration: 1,
    },
    0.5
  );

  tl.to(
    paragraph,
    {
      x: 0,
      opacity: 1,
      duration: 0.8,
    },
    0.7
  );

  tl.to(
    button,
    {
      x: 0,
      opacity: 1,
      duration: 0.5,
    },
    0.9
  );

  tl.to(
    cameraModel.position,
    {
      x: modelPositions.section1.position.x,
      duration: 1.3,
      ease: "back.out(1.2)",
    },
    1.6
  );

  tl.to(
    cameraModel.rotation,
    {
      y: cameraModel.rotation.y + 0.2,
      duration: 0.8,
      yoyo: true,
      repeat: 1,
      ease: "power1.inOut",
    },
    2.5
  );
}

// Load camera model
new GLTFLoader().load(
  "models/camera_ver2.glb",

  (gltf) => {
    cameraModel = gltf.scene;

    cameraModel.position.set(
      modelPositions.initialOffScreen.position.x,
      modelPositions.initialOffScreen.position.y,
      modelPositions.initialOffScreen.position.z
    );

    cameraModel.rotation.set(
      modelPositions.initialOffScreen.rotation.x,
      modelPositions.initialOffScreen.rotation.y,
      modelPositions.initialOffScreen.rotation.z
    );
    cameraModel.scale.set(0.25, 0.25, 0.25);
    scene.add(cameraModel);

    modelLoaded = true;
    tryStartAnimations();
  },

  (xhr) => {
    const percentComplete = (xhr.loaded / xhr.total) * 100;
    if (loadingIndicator) {
      loadingIndicator.innerHTML = `Loading 3D model: ${Math.round(
        percentComplete
      )}%`;
    }
  },

  (error) => {
    console.error("An error happened loading the model:", error);
    if (loadingIndicator) {
      loadingIndicator.innerHTML =
        "Error loading 3D model. Please refresh the page.";
    }
  }
);

// GUI controls
// const gui = new GUI();

// Model position and rotation controls
// const modelFolder = gui.addFolder("Model Controls");
// const modelControls = {
//   positionX: 2.7,
//   positionY: -2.0,
//   positionZ: -1.41,
//   rotationX: 0,
//   rotationY: 2.63, // 150.59 degrees in radians
//   rotationZ: 0,
// };

// Model position controls
// modelFolder
//   .add(modelControls, "positionX", -20, 20)
//   .step(0.1)
//   .onChange(() => {
//     if (cameraModel) cameraModel.position.x = modelControls.positionX;
//   });
// modelFolder
//   .add(modelControls, "positionY", -20, 20)
//   .step(0.1)
//   .onChange(() => {
//     if (cameraModel) cameraModel.position.y = modelControls.positionY;
//   });
// modelFolder
//   .add(modelControls, "positionZ", -20, 20)
//   .step(0.1)
//   .onChange(() => {
//     if (cameraModel) cameraModel.position.z = modelControls.positionZ;
//   });

// // Model rotation controls (in radians)
// modelFolder
//   .add(modelControls, "rotationX", 0, Math.PI * 2)
//   .step(0.01)
//   .onChange(() => {
//     if (cameraModel) cameraModel.rotation.x = modelControls.rotationX;
//   });
// modelFolder
//   .add(modelControls, "rotationY", 0, Math.PI * 2)
//   .step(0.01)
//   .onChange(() => {
//     if (cameraModel) cameraModel.rotation.y = modelControls.rotationY;
//   });
// modelFolder
//   .add(modelControls, "rotationZ", 0, Math.PI * 2)
//   .step(0.01)
//   .onChange(() => {
//     if (cameraModel) cameraModel.rotation.z = modelControls.rotationZ;
//   });

// Log model position and rotation
// const modelLogButton = {
//   logModelPosition: () => {
//     if (cameraModel) {
//       console.log("Model Position:", {
//         x: cameraModel.position.x.toFixed(2),
//         y: cameraModel.position.y.toFixed(2),
//         z: cameraModel.position.z.toFixed(2),
//       });
//       console.log("Model Rotation (radians):", {
//         x: cameraModel.rotation.x.toFixed(2),
//         y: cameraModel.rotation.y.toFixed(2),
//         z: cameraModel.rotation.z.toFixed(2),
//       });
//       console.log("Model Rotation (degrees):", {
//         x: (cameraModel.rotation.x * (180 / Math.PI)).toFixed(2) + "°",
//         y: (cameraModel.rotation.y * (180 / Math.PI)).toFixed(2) + "°",
//         z: (cameraModel.rotation.z * (180 / Math.PI)).toFixed(2) + "°",
//       });
//     }
//   },
// };
// modelFolder.add(modelLogButton, "logModelPosition").name("Log Model Position");
// modelFolder.open();

// Camera view controls
// const cameraFolder = gui.addFolder("View Camera");
// cameraFolder
//   .add(camera.position, "x", -20, 20)
//   .step(0.1)
//   .onChange(() => camera.lookAt(0, 0, 0));
// cameraFolder
//   .add(camera.position, "y", -20, 20)
//   .step(0.1)
//   .onChange(() => camera.lookAt(0, 0, 0));
// cameraFolder
//   .add(camera.position, "z", 0, 20)
//   .step(0.1)
//   .onChange(() => camera.lookAt(0, 0, 0));

// Orthographic camera controls
// const orthoFolder = gui.addFolder("Orthographic Settings");
// const orthoParams = {
//   zoom: camera.zoom,
//   near: camera.near,
//   far: camera.far,
// };

// orthoFolder
//   .add(orthoParams, "zoom", 0.1, 5)
//   .step(0.1)
//   .onChange((value) => {
//     camera.zoom = value;
//     camera.updateProjectionMatrix();
//   });

// orthoFolder
//   .add(orthoParams, "near", 0.1, 10)
//   .step(0.1)
//   .onChange((value) => {
//     camera.near = value;
//     camera.updateProjectionMatrix();
//   });

// orthoFolder
//   .add(orthoParams, "far", 10, 1000)
//   .step(10)
//   .onChange((value) => {
//     camera.far = value;
//     camera.updateProjectionMatrix();
//   });

// // Controls settings
// const controlsFolder = gui.addFolder("Controls Settings");
// controlsFolder.add(controls, "enableDamping");
// controlsFolder.add(controls, "dampingFactor", 0.01, 0.5).step(0.01);
// controlsFolder.add(controls, "autoRotate");
// controlsFolder.add(controls, "autoRotateSpeed", 0.1, 10).step(0.1);

// cameraFolder.open();

// Debug helpers
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// const gridHelper = new THREE.GridHelper(10, 10);
// scene.add(gridHelper);

// Toggle helper visibility
// const helperParams = {
//   showAxes: true,
//   showGrid: true,
// };

// const helperFolder = gui.addFolder("Helpers");
// helperFolder.add(helperParams, "showAxes").onChange((visible) => {
//   axesHelper.visible = visible;
// });
// helperFolder.add(helperParams, "showGrid").onChange((visible) => {
//   gridHelper.visible = visible;
// });

function setupScrollAnimations() {
  if (!cameraModel) return;

  const section1 = document.getElementById("section-1");
  const section2 = document.getElementById("section-2");
  const section2Paragraph = document.querySelector("#section-2 p");
  const section3 = document.getElementById("section-3");
  const section3Table = document.querySelector("#section-3 table");
  const section4 = document.getElementById("section-4");

  if (
    !section1 ||
    !section2 ||
    !section2Paragraph ||
    !section3 ||
    !section3Table ||
    !section4
  ) {
    console.warn("Required elements for scroll animations not found");
    return;
  }

  // ===== Section 1 to Section 2 Animation =====
  // Create a ScrollTrigger that directly controls the model position based on scroll
  ScrollTrigger.create({
    trigger: section1,
    start: "top top",
    endTrigger: section2Paragraph,
    end: "center center",
    scrub: 0.5,
    markers: false, // Set to true for debugging
    id: "section1-2",
    onUpdate: (self) => {
      const progress = self.progress;

      cameraModel.position.x = gsap.utils.interpolate(
        modelPositions.section1.position.x,
        modelPositions.section2.position.x,
        progress
      );

      cameraModel.position.y = gsap.utils.interpolate(
        modelPositions.section1.position.y,
        modelPositions.section2.position.y,
        progress
      );

      cameraModel.position.z = gsap.utils.interpolate(
        modelPositions.section1.position.z,
        modelPositions.section2.position.z,
        progress
      );

      let startRotY = modelPositions.section1.rotation.y;
      let targetRotY = modelPositions.section2.rotation.y;

      if (Math.abs(targetRotY - startRotY) > Math.PI) {
        if (targetRotY > startRotY) {
          startRotY += Math.PI * 2;
        } else {
          targetRotY += Math.PI * 2;
        }
      }

      cameraModel.rotation.x = gsap.utils.interpolate(
        modelPositions.section1.rotation.x,
        modelPositions.section2.rotation.x,
        progress
      );

      cameraModel.rotation.y = gsap.utils.interpolate(
        startRotY,
        targetRotY,
        progress
      );

      cameraModel.rotation.z = gsap.utils.interpolate(
        modelPositions.section1.rotation.z,
        modelPositions.section2.rotation.z,
        progress
      );

      // Update GUI controls
      // updateModelControls();
    },
  });

  // ===== Section 2 to Section 3 Animation =====
  // Create a ScrollTrigger that directly controls the model position based on scroll
  ScrollTrigger.create({
    trigger: section2,
    start: "center center",
    endTrigger: section3Table,
    end: "center center",
    scrub: 0.5,
    markers: false, // Set to true for debugging
    id: "section2-3",
    onUpdate: (self) => {
      const progress = self.progress;

      cameraModel.position.x = gsap.utils.interpolate(
        modelPositions.section2.position.x,
        modelPositions.section3.position.x,
        progress
      );

      cameraModel.position.y = gsap.utils.interpolate(
        modelPositions.section2.position.y,
        modelPositions.section3.position.y,
        progress
      );

      cameraModel.position.z = gsap.utils.interpolate(
        modelPositions.section2.position.z,
        modelPositions.section3.position.z,
        progress
      );

      let startRotX = modelPositions.section2.rotation.x;
      let targetRotX = modelPositions.section3.rotation.x;
      let startRotY = modelPositions.section2.rotation.y;
      let targetRotY = modelPositions.section3.rotation.y;

      if (Math.abs(targetRotY - startRotY) > Math.PI) {
        if (targetRotY > startRotY) {
          startRotY += Math.PI * 2;
        } else {
          targetRotY += Math.PI * 2;
        }
      }

      cameraModel.rotation.x = gsap.utils.interpolate(
        startRotX,
        targetRotX,
        progress
      );

      cameraModel.rotation.y = gsap.utils.interpolate(
        startRotY,
        targetRotY,
        progress
      );

      cameraModel.rotation.z = gsap.utils.interpolate(
        modelPositions.section2.rotation.z,
        modelPositions.section3.rotation.z,
        progress
      );

      // Update GUI controls
      // updateModelControls();
    },
  });

  // ===== Section 3 to Section 4 Animation =====

  ScrollTrigger.create({
    trigger: section3,
    start: "center center",
    endTrigger: section4,
    end: "center center",
    scrub: 0.5,
    markers: false, // Set to true for debugging
    id: "section3-4",
    onUpdate: (self) => {
      const progress = self.progress;

      cameraModel.position.x = gsap.utils.interpolate(
        modelPositions.section3.position.x,
        modelPositions.section4.position.x,
        progress
      );

      cameraModel.position.y = gsap.utils.interpolate(
        modelPositions.section3.position.y,
        modelPositions.section4.position.y,
        progress
      );

      cameraModel.position.z = gsap.utils.interpolate(
        modelPositions.section3.position.z,
        modelPositions.section4.position.z,
        progress
      );

      let startRotX = modelPositions.section3.rotation.x;
      let targetRotX = modelPositions.section4.rotation.x;

      let startRotY = modelPositions.section3.rotation.y;
      let targetRotY = modelPositions.section4.rotation.y;

      if (Math.abs(targetRotY - startRotY) > Math.PI) {
        if (targetRotY > startRotY) {
          startRotY += Math.PI * 2;
        } else {
          targetRotY += Math.PI * 2;
        }
      }

      cameraModel.rotation.x = gsap.utils.interpolate(
        startRotX,
        targetRotX,
        progress
      );

      cameraModel.rotation.y = gsap.utils.interpolate(
        startRotY,
        targetRotY,
        progress
      );

      cameraModel.rotation.z = gsap.utils.interpolate(
        modelPositions.section3.rotation.z,
        modelPositions.section4.rotation.z,
        progress
      );

      // Update GUI controls
      // updateModelControls();
    },
  });
}

// Helper function to update GUI controls based on model position/rotation
// function updateModelControls() {
//   if (!cameraModel || !modelControls) return;

//   // Update position controls
//   modelControls.positionX = cameraModel.position.x;
//   modelControls.positionY = cameraModel.position.y;
//   modelControls.positionZ = cameraModel.position.z;

//   // Update rotation controls
//   modelControls.rotationX = cameraModel.rotation.x;
//   modelControls.rotationY = cameraModel.rotation.y % (Math.PI * 2);
//   modelControls.rotationZ = cameraModel.rotation.z;

//   if (modelControls.rotationY < 0) {
//     modelControls.rotationY += Math.PI * 2;
//   }

//   // Force GUI to update
//   for (const controller of Object.values(modelFolder.__controllers)) {
//     controller.updateDisplay();
//   }
// }

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// Display current camera position and rotation in console
// const logCameraPosition = () => {
//   console.log("Camera Position:", {
//     x: camera.position.x.toFixed(2),
//     y: camera.position.y.toFixed(2),
//     z: camera.position.z.toFixed(2),
//   });

//   if (cameraModel) {
//     console.log("Model Position:", {
//       x: cameraModel.position.x.toFixed(2),
//       y: cameraModel.position.y.toFixed(2),
//       z: cameraModel.position.z.toFixed(2),
//     });
//     console.log("Model Rotation:", {
//       x: (cameraModel.rotation.x * (180 / Math.PI)).toFixed(2) + "°",
//       y: (cameraModel.rotation.y * (180 / Math.PI)).toFixed(2) + "°",
//       z: (cameraModel.rotation.z * (180 / Math.PI)).toFixed(2) + "°",
//     });
//   }
// };

// Add a button to log current positions
// const positionButton = {
//   logPositions: logCameraPosition,
// };
// gui.add(positionButton, "logPositions").name("Log Positions to Console");

animate();
