import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import type { SceneObject } from '../core/types';

export interface ViewportCallbacks {
  select(id: string | null): void;
  transformStart(id: string): void;
  transformEnd(id: string, before: { position: number[]; rotation: number[]; scale: number[] }, after: { position: number[]; rotation: number[]; scale: number[] }): void;
}

export class Viewport {
  readonly scene = new THREE.Scene();
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private perspectiveCamera: THREE.PerspectiveCamera;
  private orthographicCamera: THREE.OrthographicCamera;
  private orbit: OrbitControls;
  private transform: TransformControls;
  private meshById = new Map<string, THREE.Mesh>();
  private lockedIds = new Set<string>();
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private selectedId: string | null = null;
  private callbacks: ViewportCallbacks;
  private resizeObserver: ResizeObserver;
  private frame = 0;
  private grid: THREE.GridHelper;

  constructor(private host: HTMLElement, callbacks: ViewportCallbacks) {
    this.callbacks = callbacks;
    this.scene.background = new THREE.Color('#171a1d');
    this.scene.fog = new THREE.Fog('#171a1d', 28, 90);
    this.perspectiveCamera = new THREE.PerspectiveCamera(55, 1, 0.1, 250);
    this.perspectiveCamera.position.set(9, 8, 11);
    this.orthographicCamera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 250);
    this.orthographicCamera.position.copy(this.perspectiveCamera.position);
    this.camera = this.perspectiveCamera;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.className = 'viewport-canvas';
    host.append(this.renderer.domElement);

    this.scene.add(new THREE.HemisphereLight('#d7e0e8', '#30363a', 2.1));
    const sun = new THREE.DirectionalLight('#fff1d6', 3.1);
    sun.position.set(-7, 11, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    this.scene.add(sun);
    this.grid = new THREE.GridHelper(60, 60, '#59636a', '#30373b');
    this.grid.position.y = 0.002;
    this.scene.add(this.grid);
    const axes = new THREE.AxesHelper(2.5);
    axes.position.set(-0.02, 0.02, -0.02);
    this.scene.add(axes);

    this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbit.enableDamping = true;
    this.orbit.dampingFactor = 0.075;
    this.orbit.target.set(0, 0.7, 0);
    this.orbit.maxPolarAngle = Math.PI * 0.49;
    this.transform = new TransformControls(this.camera, this.renderer.domElement);
    this.transform.setSize(0.8);
    this.transform.addEventListener('dragging-changed', (event) => { this.orbit.enabled = !event.value; });
    this.transform.addEventListener('mouseDown', () => {
      if (this.selectedId) {
        const mesh = this.meshById.get(this.selectedId);
        if (mesh) this.dragBefore = this.capture(mesh);
        this.callbacks.transformStart(this.selectedId);
      }
    });
    this.transform.addEventListener('mouseUp', () => {
      const id = this.selectedId;
      const mesh = id ? this.meshById.get(id) : undefined;
      if (id && mesh) this.callbacks.transformEnd(id, this.dragBefore, this.capture(mesh));
    });
    this.scene.add(this.transform.getHelper());
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
    this.resize();
    this.animate();
  }

  private dragBefore = { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] };
  private capture(mesh: THREE.Mesh) {
    return { position: mesh.position.toArray(), rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z], scale: mesh.scale.toArray() };
  }

  sync(objects: SceneObject[]): void {
    const incoming = new Set(objects.map((object) => object.id));
    this.lockedIds = new Set(objects.filter((object) => object.locked).map((object) => object.id));
    for (const [id, mesh] of this.meshById) {
      if (!incoming.has(id)) {
        if (this.selectedId === id) this.select(null);
        this.scene.remove(mesh);
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        this.meshById.delete(id);
      }
    }
    for (const object of objects) {
      let mesh = this.meshById.get(object.id);
      if (!mesh) {
        const geometry = this.geometry(object.kind);
        mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: object.color, roughness: 0.78, metalness: 0.08 }));
        mesh.userData.objectId = object.id;
        mesh.castShadow = object.kind !== 'plane';
        mesh.receiveShadow = true;
        this.meshById.set(object.id, mesh);
        this.scene.add(mesh);
      }
      mesh.name = object.name;
      mesh.position.fromArray(object.position);
      mesh.rotation.set(...object.rotation);
      mesh.scale.fromArray(object.scale);
      mesh.visible = object.visible;
      (mesh.material as THREE.MeshStandardMaterial).color.set(object.color);
    }
    if (this.selectedId) {
      const selected = this.meshById.get(this.selectedId);
      if (selected && !this.meshLocked(this.selectedId)) this.transform.attach(selected);
      else this.transform.detach();
    }
  }

  setGridVisible(visible: boolean): void { this.grid.visible = visible; }
  setTransformMode(mode: 'translate' | 'rotate' | 'scale'): void { this.transform.setMode(mode); }
  setSpace(space: 'world' | 'local'): void { this.transform.setSpace(space); }
  setSnap(value: number | null): void {
    this.transform.setTranslationSnap(value);
    this.transform.setRotationSnap(value ? THREE.MathUtils.degToRad(15) : null);
    this.transform.setScaleSnap(value ? 0.1 : null);
  }

  toggleCamera(): boolean {
    const old = this.camera;
    const next = old === this.perspectiveCamera ? this.orthographicCamera : this.perspectiveCamera;
    next.position.copy(old.position);
    next.quaternion.copy(old.quaternion);
    this.camera = next;
    this.orbit.object = next;
    this.transform.camera = next;
    this.resize();
    return next === this.orthographicCamera;
  }

  focus(id?: string): void {
    const target = id ? this.meshById.get(id) : undefined;
    if (target) {
      const box = new THREE.Box3().setFromObject(target);
      const center = box.getCenter(new THREE.Vector3());
      this.orbit.target.copy(center);
      const distance = Math.max(box.getSize(new THREE.Vector3()).length() * 1.8, 3);
      const direction = this.camera.position.clone().sub(this.orbit.target).normalize();
      this.camera.position.copy(center.addScaledVector(direction, distance));
    } else {
      this.orbit.target.set(0, 0.7, 0);
      this.camera.position.set(9, 8, 11);
    }
    this.orbit.update();
  }

  private geometry(kind: SceneObject['kind']): THREE.BufferGeometry {
    switch (kind) {
      case 'sphere': return new THREE.SphereGeometry(0.5, 24, 16);
      case 'cylinder': return new THREE.CylinderGeometry(0.5, 0.5, 1, 24);
      case 'plane': return new THREE.PlaneGeometry(1, 1);
      default: return new THREE.BoxGeometry(1, 1, 1);
    }
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 || this.transform.dragging) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects([...this.meshById.values()], false);
    this.select(hits[0]?.object.userData.objectId ?? null);
  };

  private select(id: string | null): void {
    this.selectedId = id;
    const mesh = id ? this.meshById.get(id) : undefined;
    if (mesh && !this.meshLocked(id!)) this.transform.attach(mesh);
    else this.transform.detach();
    this.callbacks.select(id);
  }

  private meshLocked(id: string): boolean { return this.lockedIds.has(id); }

  // The starting transform is captured before the gizmo begins changing the selected mesh.
  private animate = (): void => {
    this.frame = requestAnimationFrame(this.animate);
    this.orbit.update();
    this.renderer.render(this.scene, this.camera);
  };

  private resize(): void {
    const width = Math.max(this.host.clientWidth, 1);
    const height = Math.max(this.host.clientHeight, 1);
    this.renderer.setSize(width, height, false);
    this.perspectiveCamera.aspect = width / height;
    this.perspectiveCamera.updateProjectionMatrix();
    const aspect = width / height;
    this.orthographicCamera.left = -10 * aspect;
    this.orthographicCamera.right = 10 * aspect;
    this.orthographicCamera.top = 10;
    this.orthographicCamera.bottom = -10;
    this.orthographicCamera.updateProjectionMatrix();
  }

  dispose(): void {
    cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
    this.orbit.dispose();
    this.transform.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
