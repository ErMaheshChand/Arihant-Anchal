'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const TOWERS = [
  { name: 'A', x: -28, z: -18, floors: 12, flats: 48 },
  { name: 'B', x: -14, z: -18, floors: 12, flats: 48 },
  { name: 'C', x: 0, z: -18, floors: 10, flats: 40 },
  { name: 'D', x: 14, z: -18, floors: 10, flats: 40 },
  { name: 'E', x: 28, z: -18, floors: 8, flats: 32 },
  { name: 'F', x: -28, z: -6, floors: 12, flats: 48 },
  { name: 'G', x: -14, z: -6, floors: 10, flats: 40 },
  { name: 'H', x: 0, z: -6, floors: 10, flats: 40 },
  { name: 'I', x: 14, z: -6, floors: 8, flats: 32 },
  { name: 'J', x: 28, z: -6, floors: 8, flats: 32 },
  { name: 'K', x: -28, z: 6, floors: 10, flats: 40 },
  { name: 'L', x: -14, z: 6, floors: 10, flats: 40 },
  { name: 'M', x: 0, z: 6, floors: 8, flats: 32 },
  { name: 'N', x: 14, z: 6, floors: 8, flats: 32 },
  { name: 'O', x: 28, z: 6, floors: 6, flats: 24 },
  { name: 'P', x: -21, z: 18, floors: 6, flats: 24 },
  { name: 'Q', x: -7, z: 18, floors: 6, flats: 24 },
  { name: 'R', x: 7, z: 18, floors: 6, flats: 24 },
  { name: 'S', x: 21, z: 18, floors: 6, flats: 24 },
]

const GOLD = 0xd4af37

function makeLabel(text: string): THREE.Sprite {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = 'rgba(2,6,23,0.85)'
  ctx.beginPath()
  ctx.roundRect(0, 0, 256, 64, 16)
  ctx.fill()
  ctx.strokeStyle = '#D4AF37'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.roundRect(2, 2, 252, 60, 14)
  ctx.stroke()
  ctx.fillStyle = '#D4AF37'
  ctx.font = 'bold 34px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 128, 34)
  const tex = new THREE.CanvasTexture(canvas)
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(6, 1.5, 1)
  return sprite
}

export default function Society3D() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<(typeof TOWERS)[0] | null>(null)
  const [mode, setMode] = useState<'day' | 'evening'>('day')
  const [autoRotate, setAutoRotate] = useState(true)
  const stateRef = useRef({ mode: 'day' as 'day' | 'evening', autoRotate: true })
  stateRef.current = { mode, autoRotate }

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x020617)
    scene.fog = new THREE.Fog(0x020617, 90, 220)

    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 1000)
    camera.position.set(0, 42, 62)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.maxPolarAngle = Math.PI / 2.15
    controls.minDistance = 18
    controls.maxDistance = 130
    controls.target.set(0, 6, 0)

    const ambient = new THREE.AmbientLight(0xffffff, 0.55)
    scene.add(ambient)
    const sun = new THREE.DirectionalLight(0xfff3d6, 1.1)
    sun.position.set(40, 60, 25)
    scene.add(sun)
    const hemi = new THREE.HemisphereLight(0xbdd7ff, 0x1a2415, 0.5)
    scene.add(hemi)
    const eveningGlow = new THREE.DirectionalLight(0xff9a3c, 0)
    eveningGlow.position.set(-30, 25, 40)
    scene.add(eveningGlow)

    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0f2a1a, roughness: 1 })
    const ground = new THREE.Mesh(new THREE.BoxGeometry(110, 1, 90), groundMat)
    ground.position.y = -0.5
    scene.add(ground)

    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 })
    const road1 = new THREE.Mesh(new THREE.BoxGeometry(110, 0.2, 5), roadMat)
    road1.position.set(0, 0.1, 0)
    scene.add(road1)
    const road2 = new THREE.Mesh(new THREE.BoxGeometry(5, 0.2, 90), roadMat)
    road2.position.set(0, 0.1, 0)
    scene.add(road2)

    const clubhouseMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.35, metalness: 0.55 })
    const clubhouse = new THREE.Mesh(new THREE.BoxGeometry(16, 7, 10), clubhouseMat)
    clubhouse.position.set(0, 3.5, -32)
    scene.add(clubhouse)
    const clubLabel = makeLabel('CLUB HOUSE')
    clubLabel.position.set(0, 10.5, -32)
    scene.add(clubLabel)

    const towerMeshes: THREE.Mesh[] = []
    const winOnMat = new THREE.MeshBasicMaterial({ color: 0xffc861 })
    const winOffMat = new THREE.MeshBasicMaterial({ color: 0x274058 })

    TOWERS.forEach((t) => {
      const h = t.floors * 1.6
      const geo = new THREE.BoxGeometry(7, h, 7)
      const mat = new THREE.MeshStandardMaterial({ color: 0xe8e4da, roughness: 0.75 })
      const tower = new THREE.Mesh(geo, mat)
      tower.position.set(t.x, h / 2, t.z)
      tower.userData = {...t }

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: GOLD })
      )
      tower.add(edges)

      const winGeo = new THREE.BoxGeometry(7.15, 0.55, 7.15)
      for (let f = 0; f < t.floors; f++) {
        const win = new THREE.Mesh(winGeo, winOffMat.clone())
        win.position.y = -h / 2 + 1.1 + f * 1.6
        win.userData.isWindow = true
        tower.add(win)
      }

      const label = makeLabel('TOWER ' + t.name)
      label.position.y = h / 2 + 2.2
      tower.add(label)

      scene.add(tower)
      towerMeshes.push(tower)
    })

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let downPos: [number, number] | null = null

    const onPointerDown = (e: PointerEvent) => {
      downPos = [e.clientX, e.clientY]
    }
    const onPointerUp = (e: PointerEvent) => {
      if (!downPos) return
      const dx = e.clientX - downPos[0]
      const dy = e.clientY - downPos[1]
      downPos = null
      if (Math.hypot(dx, dy) > 6) return
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects(towerMeshes, false)
      if (hits.length > 0) {
        setSelected({...(hits[0].object.userData as (typeof TOWERS)[0]) })
      } else {
        setSelected(null)
      }
    }
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointerup', onPointerUp)

    const applyMode = (m: 'day' | 'evening') => {
      const evening = m === 'evening'
      scene.background = new THREE.Color(evening? 0x0b1026 : 0x020617)
      scene.fog = new THREE.Fog(evening? 0x0b1026 : 0x020617, 90, 220)
      ambient.intensity = evening? 0.28 : 0.55
      sun.intensity = evening? 0.25 : 1.1
      eveningGlow.intensity = evening? 0.9 : 0
      towerMeshes.forEach((tower) => {
        tower.children.forEach((c) => {
          const mesh = c as THREE.Mesh
          if (mesh.userData.isWindow) {
            mesh.material = evening? winOnMat : winOffMat
          }
        })
      })
    }

    let raf = 0
    const animate = () => {
      raf = requestAnimationFrame(animate)
      controls.autoRotate = stateRef.current.autoRotate
      controls.autoRotateSpeed = 0.7
      applyMode(stateRef.current.mode)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      if (!mount) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      mount.removeChild(renderer.domElement)
      renderer.dispose()
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (mesh.geometry) mesh.geometry.dispose()
        const m = mesh.material as THREE.Material | THREE.Material[]
        if (Array.isArray(m)) m.forEach((x) => x.dispose())
        else if (m) m.dispose()
      })
    }
  }, [])

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => setMode(mode === 'day'? 'evening' : 'day')}
          className="px-4 py-2 rounded-full text-sm font-bold bg-[#D4AF37] text-black"
        >
          {mode === 'day'? '🌙 Evening Mode' : '☀️ Day Mode'}
        </button>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className="px-4 py-2 rounded-full text-sm font-bold bg-white/10 border border-white/20"
        >
          {autoRotate? '⏸ Stop Rotate' : '▶ Auto Rotate'}
        </button>
        <span className="px-4 py-2 text-sm opacity-70 self-center">Tower par tap karo 👆</span>
      </div>

      <div ref={mountRef} className="w-full rounded-2xl overflow-hidden border border-[#D4AF37]/40" style={{ height: '70vh', minHeight: 420 }} />

      {selected && (
        <div className="mt-3 p-4 rounded-2xl bg-white dark:bg-white/5 border border-[#D4AF37]/40">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Tower {selected.name}</h3>
            <button onClick={() => setSelected(null)} className="text-sm opacity-60">✕ Close</button>
          </div>
          <p className="text-sm opacity-70 mt-1">
            {selected.floors} Floors • {selected.flats} Flats • Near Dali Bai Circle, Jodhpur
          </p>
        </div>
      )}
    </div>
  )
}
