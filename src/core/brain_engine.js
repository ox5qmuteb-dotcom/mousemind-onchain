// MouseMind 3D Neural Engine (Three.js WebGL)
// Transparent Bioluminescent Xenocortex with Integrated Human Organoid & Synaptic Action Potentials

import * as THREE from 'three';

export class BrainEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.animId = null;

    // Groups
    this.brainGroup = new THREE.Group();
    this.cortexGroup = new THREE.Group();
    this.organoidGroup = new THREE.Group();
    this.axonsGroup = new THREE.Group();
    this.sparksGroup = new THREE.Group();
    this.synapsesGroup = new THREE.Group();

    // Interaction & Orbit state
    this.isDragging = false;
    this.prevMousePos = { x: 0, y: 0 };
    this.targetRotation = { x: 0.25, y: 0.45 };
    this.currentRotation = { x: 0.25, y: 0.45 };
    this.cameraDistance = 4.2;
    this.targetDistance = 4.2;

    // Simulation & Particle arrays
    this.actionPotentials = [];
    this.axonalPaths = [];
    this.organoidNodes = [];
    this.calciumIntensity = 0.0;
    this.calciumHistory = new Array(50).fill(0.25);

    // Layer visibility
    this.layers = {
      cortex: true,
      organoid: true,
      axons: true,
      impulses: true
    };

    this.init();
  }

  init() {
    this.setupRenderer();
    this.setupScene();
    this.setupLights();
    this.buildBrainModel();
    this.buildCalibrationGrid();
    this.setupEventHandlers();
    this.setupGraphCanvas();
    this.animate();
  }

  setupRenderer() {
    const parent = this.canvas.parentElement;
    const width = parent ? parent.clientWidth : window.innerWidth;
    const height = parent ? (parent.clientHeight || 560) : 560;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;

    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    this.updateCameraPosition();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.add(this.brainGroup);
    this.brainGroup.add(this.cortexGroup);
    this.brainGroup.add(this.organoidGroup);
    this.brainGroup.add(this.axonsGroup);
    this.brainGroup.add(this.synapsesGroup);
    this.brainGroup.add(this.sparksGroup);

    this.brainGroup.position.set(0, 0.12, 0);
  }

  setupLights() {
    const ambient = new THREE.AmbientLight(0x18181b, 1.4);
    this.scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(4, 5, 4);
    this.scene.add(keyLight);

    const cyanRim = new THREE.DirectionalLight(0x00e5ff, 2.2);
    cyanRim.position.set(-4, 3, -3);
    this.scene.add(cyanRim);

    const emeraldFocal = new THREE.PointLight(0x00ffb2, 3.2, 7);
    emeraldFocal.position.set(0.5, 0.6, 0.5);
    this.scene.add(emeraldFocal);

    const purpleLight = new THREE.PointLight(0xa855f7, 1.8, 8);
    purpleLight.position.set(0, -2, 0);
    this.scene.add(purpleLight);
  }

  buildBrainModel() {
    // 1. Dual Hemisphere Crystalline Anatomical Cortex
    const cortexMat = new THREE.MeshPhysicalMaterial({
      color: 0xa1a1aa,
      roughness: 0.14,
      metalness: 0.08,
      transmission: 0.86,
      ior: 1.48,
      thickness: 1.4,
      transparent: true,
      opacity: 0.68,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08
    });

    [-1, 1].forEach(side => {
      const hemiGeo = new THREE.SphereGeometry(1.0, 48, 36);
      const pos = hemiGeo.attributes.position;
      const v = new THREE.Vector3();

      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);

        v.x *= 0.82;
        v.y *= 0.68;
        v.z *= 1.15;
        v.x += side * 0.26;

        if (v.z > 0.2) v.y += 0.08;
        if (v.z < -0.3 && v.y < 0) v.y -= 0.1;

        const freq = 6.5;
        const bump = Math.sin(v.x * freq) * Math.cos(v.y * freq) * Math.sin(v.z * freq);
        v.addScaledVector(v.clone().normalize(), bump * 0.045);

        pos.setXYZ(i, v.x, v.y, v.z);
      }

      hemiGeo.computeVertexNormals();
      const hemiMesh = new THREE.Mesh(hemiGeo, cortexMat);
      this.cortexGroup.add(hemiMesh);

      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x52525b,
        wireframe: true,
        transparent: true,
        opacity: 0.09
      });
      const wireMesh = new THREE.Mesh(hemiGeo, wireMat);
      this.cortexGroup.add(wireMesh);
    });

    // Cerebellar Lobes
    [-1, 1].forEach(side => {
      const cereGeo = new THREE.SphereGeometry(0.38, 24, 20);
      cereGeo.scale(0.8, 0.6, 0.7);
      const cereMesh = new THREE.Mesh(cereGeo, cortexMat);
      cereMesh.position.set(side * 0.32, -0.42, -0.75);
      this.cortexGroup.add(cereMesh);
    });

    // 2. Human Cortical Organoid (Subject Alpha Xenograft)
    const graftCenter = new THREE.Vector3(0.48, 0.42, 0.32);
    const organoidCount = 150;
    const organoidGeo = new THREE.BufferGeometry();
    const organoidPositions = [];
    const organoidColors = [];

    const cEmerald = new THREE.Color(0x00ffb2);
    const cCyan = new THREE.Color(0x00e5ff);

    for (let i = 0; i < organoidCount; i++) {
      const r = Math.pow(Math.random(), 0.6) * 0.36;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const p = new THREE.Vector3(
        graftCenter.x + r * Math.sin(phi) * Math.cos(theta),
        graftCenter.y + r * Math.sin(phi) * Math.sin(theta),
        graftCenter.z + r * Math.cos(phi)
      );

      organoidPositions.push(p.x, p.y, p.z);
      this.organoidNodes.push(p);

      const mixed = cEmerald.clone().lerp(cCyan, Math.random());
      organoidColors.push(mixed.r, mixed.g, mixed.b);

      if (i < 28) {
        const sphereGeo = new THREE.SphereGeometry(0.022 + Math.random() * 0.02, 12, 12);
        const sphereMat = new THREE.MeshBasicMaterial({
          color: mixed,
          transparent: true,
          opacity: 0.9
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.position.copy(p);
        this.organoidGroup.add(sphere);
      }
    }

    organoidGeo.setAttribute('position', new THREE.Float32BufferAttribute(organoidPositions, 3));
    organoidGeo.setAttribute('color', new THREE.Float32BufferAttribute(organoidColors, 3));

    const organoidParticleMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    this.organoidGroup.add(new THREE.Points(organoidGeo, organoidParticleMat));

    // 3. Axonal Arborizations into Host Connectome
    const hostTargetAreas = [
      new THREE.Vector3(-0.48, 0.42, 0.32),
      new THREE.Vector3(0.35, 0.1, -0.4),
      new THREE.Vector3(-0.35, 0.1, -0.4),
      new THREE.Vector3(0.2, -0.3, -0.2),
      new THREE.Vector3(0.5, 0.1, -0.1),
      new THREE.Vector3(0.25, 0.6, 0.1)
    ];

    const axonMat = new THREE.LineBasicMaterial({
      color: 0x00ffb2,
      transparent: true,
      opacity: 0.44,
      blending: THREE.AdditiveBlending
    });

    const synapsePositions = [];

    for (let t = 0; t < hostTargetAreas.length; t++) {
      const target = hostTargetAreas[t];
      const branchesPerTarget = 8;

      for (let b = 0; b < branchesPerTarget; b++) {
        const root = this.organoidNodes[Math.floor(Math.random() * this.organoidNodes.length)];
        
        const mid1 = new THREE.Vector3().lerpVectors(root, target, 0.33);
        mid1.x += (Math.random() - 0.5) * 0.25;
        mid1.y += (Math.random() - 0.5) * 0.2;
        mid1.z += (Math.random() - 0.5) * 0.2;

        const mid2 = new THREE.Vector3().lerpVectors(root, target, 0.66);
        mid2.x += (Math.random() - 0.5) * 0.25;
        mid2.y += (Math.random() - 0.5) * 0.2;
        mid2.z += (Math.random() - 0.5) * 0.2;

        const end = target.clone().add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        ));

        const curve = new THREE.CatmullRomCurve3([root, mid1, mid2, end]);
        const points = curve.getPoints(24);
        const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), axonMat);
        this.axonsGroup.add(line);

        this.axonalPaths.push({ curve, length: curve.getLength(), root, end });
        synapsePositions.push(end.x, end.y, end.z);
      }
    }

    const synGeo = new THREE.BufferGeometry();
    synGeo.setAttribute('position', new THREE.Float32BufferAttribute(synapsePositions, 3));
    const synMat = new THREE.PointsMaterial({
      color: 0x00e5ff,
      size: 0.035,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    this.synapsesGroup.add(new THREE.Points(synGeo, synMat));
  }

  buildCalibrationGrid() {
    const gridGroup = new THREE.Group();
    gridGroup.position.y = -0.92;

    for (let r = 0.5; r <= 2.2; r += 0.55) {
      const ringGeo = new THREE.BufferGeometry().setFromPoints(
        new Array(64).fill(0).map((_, i) => {
          const a = (i / 64) * Math.PI * 2;
          return new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r);
        })
      );
      const ringMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.08
      });
      gridGroup.add(new THREE.Line(ringGeo, ringMat));
    }

    this.scene.add(gridGroup);
  }

  setupEventHandlers() {
    const onPointerDown = e => {
      this.isDragging = true;
      this.prevMousePos.x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      this.prevMousePos.y = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    };

    const onPointerMove = e => {
      if (!this.isDragging) return;
      const cx = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const cy = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      const dx = cx - this.prevMousePos.x;
      const dy = cy - this.prevMousePos.y;

      this.targetRotation.y += dx * 0.006;
      this.targetRotation.x += dy * 0.006;
      this.targetRotation.x = Math.max(-1.1, Math.min(1.1, this.targetRotation.x));

      this.prevMousePos.x = cx;
      this.prevMousePos.y = cy;
    };

    const onPointerUp = () => {
      this.isDragging = false;
    };

    this.canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    this.canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    this.canvas.addEventListener('wheel', e => {
      e.preventDefault();
      this.targetDistance += e.deltaY * 0.0025;
      this.targetDistance = Math.max(2.0, Math.min(6.5, this.targetDistance));
    }, { passive: false });

    window.addEventListener('resize', () => {
      if (!this.renderer || !this.camera) return;
      const parent = this.canvas.parentElement;
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? (parent.clientHeight || 560) : 560;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });

    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setCameraPreset(btn.getAttribute('data-view'));
      });
    });

    document.querySelectorAll('.atlas-layer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        const layer = btn.getAttribute('data-layer');
        const active = btn.classList.contains('active');
        this.toggleLayer(layer, active);
      });
    });

    const stimBtn = document.getElementById('btn-microstim');
    if (stimBtn) {
      stimBtn.addEventListener('click', () => {
        this.triggerOrganoidPulse(1.5);
      });
    }
  }

  setCameraPreset(preset) {
    if (preset === 'isometric') {
      this.targetRotation.x = 0.35;
      this.targetRotation.y = 0.65;
      this.targetDistance = 4.2;
    } else if (preset === 'sagittal') {
      this.targetRotation.x = 0.0;
      this.targetRotation.y = Math.PI / 2;
      this.targetDistance = 4.0;
    } else if (preset === 'organoid') {
      this.targetRotation.x = 0.45;
      this.targetRotation.y = 0.35;
      this.targetDistance = 2.4;
    } else if (preset === 'top') {
      this.targetRotation.x = Math.PI / 2.2;
      this.targetRotation.y = 0.0;
      this.targetDistance = 4.4;
    }
  }

  toggleLayer(layer, isVisible) {
    if (layer === 'cortex') this.cortexGroup.visible = isVisible;
    else if (layer === 'organoid') this.organoidGroup.visible = isVisible;
    else if (layer === 'axons') {
      this.axonsGroup.visible = isVisible;
      this.synapsesGroup.visible = isVisible;
    } else if (layer === 'impulses') this.sparksGroup.visible = isVisible;
  }

  triggerOrganoidPulse(intensity = 1.0) {
    this.calciumIntensity = Math.min(1.8, this.calciumIntensity + 0.85 * intensity);

    const sparkCount = Math.floor(18 * intensity);
    for (let i = 0; i < sparkCount; i++) {
      if (this.axonalPaths.length === 0) break;
      const path = this.axonalPaths[Math.floor(Math.random() * this.axonalPaths.length)];
      
      const sparkMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.026, 8, 8),
        new THREE.MeshBasicMaterial({
          color: Math.random() > 0.3 ? 0x00ffb2 : 0x00e5ff,
          transparent: true,
          opacity: 1.0
        })
      );

      this.sparksGroup.add(sparkMesh);
      this.actionPotentials.push({
        mesh: sparkMesh,
        curve: path.curve,
        progress: 0.0,
        speed: 0.015 + Math.random() * 0.025
      });
    }

    const spikeEl = document.getElementById('val-spike-frequency');
    if (spikeEl) {
      const spk = (20 + Math.random() * 16).toFixed(1);
      spikeEl.innerText = spk + ' HZ';
      spikeEl.style.color = '#00ffb2';
      setTimeout(() => {
        spikeEl.style.color = '';
      }, 700);
    }
  }

  triggerOnchainSwap(swapData) {
    const isWhale = swapData.type === 'WHALE SWAP';
    const intensity = isWhale ? 2.2 : 1.2;
    this.calciumIntensity = Math.min(2.0, this.calciumIntensity + 1.0 * intensity);

    const sparkCount = isWhale ? 45 : 22;
    for (let i = 0; i < sparkCount; i++) {
      if (this.axonalPaths.length === 0) break;
      const path = this.axonalPaths[Math.floor(Math.random() * this.axonalPaths.length)];
      
      const sparkMesh = new THREE.Mesh(
        new THREE.SphereGeometry(isWhale ? 0.038 : 0.026, 8, 8),
        new THREE.MeshBasicMaterial({
          color: isWhale ? 0xfbbf24 : 0x00ffb2,
          transparent: true,
          opacity: 1.0
        })
      );

      this.sparksGroup.add(sparkMesh);
      this.actionPotentials.push({
        mesh: sparkMesh,
        curve: path.curve,
        progress: 0.0,
        speed: 0.018 + Math.random() * 0.03
      });
    }
  }

  updateCameraPosition() {
    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.08;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.08;
    this.cameraDistance += (this.targetDistance - this.cameraDistance) * 0.08;

    const x = this.cameraDistance * Math.sin(this.currentRotation.y) * Math.cos(this.currentRotation.x);
    const y = this.cameraDistance * Math.sin(this.currentRotation.x);
    const z = this.cameraDistance * Math.cos(this.currentRotation.y) * Math.cos(this.currentRotation.x);

    this.camera.position.set(x, y + 0.12, z);
    this.camera.lookAt(0, 0.12, 0);
  }

  setupGraphCanvas() {
    this.graphCanvas = document.getElementById('calcium-graph');
    if (this.graphCanvas) {
      this.graphCtx = this.graphCanvas.getContext('2d');
    }
  }

  updateGraph() {
    if (!this.graphCtx || !this.graphCanvas) return;
    const ctx = this.graphCtx;
    const w = this.graphCanvas.width = this.graphCanvas.clientWidth;
    const h = this.graphCanvas.height = this.graphCanvas.clientHeight;

    ctx.clearRect(0, 0, w, h);

    this.calciumHistory.push(this.calciumIntensity);
    if (this.calciumHistory.length > 50) this.calciumHistory.shift();

    ctx.beginPath();
    ctx.strokeStyle = '#00ffb2';
    ctx.lineWidth = 1.5;

    const step = w / (this.calciumHistory.length - 1);
    for (let i = 0; i < this.calciumHistory.length; i++) {
      const val = Math.min(1.8, Math.max(0, this.calciumHistory[i]));
      const x = i * step;
      const y = h - 6 - (val / 1.8) * (h - 12);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 255, 178, 0.08)';
    ctx.fill();

    const dfEl = document.getElementById('val-calcium-df');
    if (dfEl) {
      const df = (0.28 + this.calciumIntensity * 1.4).toFixed(2);
      dfEl.innerText = '+' + df + ' DF/F0';
    }
  }

  animate() {
    this.animId = requestAnimationFrame(() => this.animate());

    if (!this.isDragging) {
      this.targetRotation.y += 0.0015;
    }

    this.updateCameraPosition();
    this.calciumIntensity *= 0.94;
    if (Math.random() < 0.04) {
      this.calciumIntensity += 0.2 + Math.random() * 0.25;
    }

    for (let i = this.actionPotentials.length - 1; i >= 0; i--) {
      const spk = this.actionPotentials[i];
      spk.progress += spk.speed;

      if (spk.progress >= 1.0) {
        this.sparksGroup.remove(spk.mesh);
        spk.mesh.geometry.dispose();
        spk.mesh.material.dispose();
        this.actionPotentials.splice(i, 1);
      } else {
        const pt = spk.curve.getPoint(spk.progress);
        spk.mesh.position.copy(pt);
        spk.mesh.material.opacity = 1.0 - Math.pow(spk.progress, 2);
      }
    }

    const time = performance.now() * 0.002;
    this.organoidGroup.children.forEach((c, idx) => {
      if (c.isMesh) {
        const s = 1.0 + Math.sin(time + idx) * 0.15 + this.calciumIntensity * 0.4;
        c.scale.set(s, s, s);
      }
    });

    this.updateGraph();
    this.renderer.render(this.scene, this.camera);
  }
}
