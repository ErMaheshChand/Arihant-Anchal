'use client'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

type TowerInfo = { name: string; floors: number; flats: number; block: string; x: number; z: number }

const towersData: TowerInfo[] = [
  { name: 'A', floors: 8, flats: 32, block: 'A', x: -120, z: -60 },
  { name: 'B', floors: 8, flats: 32, block: 'A', x: -80, z: -60 },
  { name: 'C', floors: 8, flats: 32, block: 'A', x: -40, z: -60 },
  { name: 'D', floors: 7, flats: 28, block: 'A', x: 0, z: -60 },
  { name: 'E', floors: 7, flats: 28, block: 'A', x: 40, z: -60 },
  { name: 'F', floors: 7, flats: 28, block: 'A', x: 80, z: -60 },
  { name: 'G', floors: 8, flats: 32, block: 'A', x: 120, z: -60 },
  { name: 'H', floors: 8, flats: 32, block: 'B', x: -120, z: 0 },
  { name: 'I', floors: 7, flats: 28, block: 'B', x: -80, z: 0 },
  { name: 'J', floors: 8, flats: 32, block: 'B', x: -40, z: 0 },
  { name: 'K', floors: 7, flats: 28, block: 'B', x: 0, z: 0 },
  { name: 'L', floors: 8, flats: 32, block: 'B', x: 40, z: 0 },
  { name: 'M', floors: 7, flats: 28, block: 'B', x: 80, z: 0 },
  { name: 'N', floors: 7, flats: 28, block: 'C', x: -100, z: 60 },
  { name: 'O', floors: 8, flats: 32, block: 'C', x: -60, z: 60 },
  { name: 'P', floors: 7, flats: 28, block: 'C', x: -20, z: 60 },
  { name: 'Q', floors: 8, flats: 32, block: 'C', x: 20, z: 60 },
  { name: 'R', floors: 7, flats: 28, block: 'C', x: 60, z: 60 },
  { name: 'S', floors: 7, flats: 28, block: 'C', x: 100, z: 60 },
]

function createWindowTexture(floors: number, isEvening: boolean) {
  const w = 256, h = 512
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = isEvening? '#1a1a2e' : '#f5f0e8'
  ctx.fillRect(0,0,w,h)
  const cols = 3
  const rows = floors
  const pad = 12
  const winW = (w - pad*2 - (cols-1)*8)/cols
  const winH = (h - pad*2 - (rows-1)*8)/rows
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const x = pad + c*(winW+8)
      const y = pad + r*(winH+8)
      if(isEvening && Math.random()>0.35){
        ctx.fillStyle = '#ffca7a'
        ctx.shadowColor = '#ffca7a'
        ctx.shadowBlur = 8
      } else {
        ctx.fillStyle = isEvening? '#0f172a' : '#94a3b8'
        ctx.shadowBlur = 0
      }
      ctx.fillRect(x,y,winW,winH)
      ctx.shadowBlur = 0
      if(!isEvening){
        ctx.fillStyle = 'rgba(255,255,255,0.35)'
        ctx.fillRect(x,y,winW,3)
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export default function Society3D(){
  const mountRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<TowerInfo|null>(null)
  const [evening, setEvening] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const [labels, setLabels] = useState(true)
  const sceneRef = useRef<any>(null)

  useEffect(()=>{
    if(!mountRef.current) return
    const mount = mountRef.current
    const width = mount.clientWidth
    const height = mount.clientHeight || 600
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(evening? 0x0f172a : 0x87b5e0)
    scene.fog = new THREE.Fog(evening? 0x0f172a : 0x87b5e0, 180, 400)
    const camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 1000)
    camera.position.set(140, 110, 160)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    mount.appendChild(renderer.domElement)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 40
    controls.maxDistance = 300
    controls.maxPolarAngle = Math.PI/2.2
    controls.autoRotate = autoRotate
    controls.autoRotateSpeed = 0.6
    controls.target.set(0, 0, 0)
    const hemi = new THREE.HemisphereLight(evening? 0x334155 : 0xffffff, evening? 0x1e293b : 0x7da86b, evening? 0.4 : 0.8)
    scene.add(hemi)
    const dir = new THREE.DirectionalLight(evening? 0xffb86c : 0xffffff, evening? 0.6 : 1.2)
    dir.position.set(80, 120, 60)
    dir.castShadow = true
    dir.shadow.mapSize.set(2048,2048)
    scene.add(dir)
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 350), new THREE.MeshLambertMaterial({ color: evening? 0x1e3a2e : 0x7da86b }))
    ground.rotation.x = -Math.PI/2
    ground.receiveShadow = true
    scene.add(ground)
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x3a3a3a })
    const road1 = new THREE.Mesh(new THREE.PlaneGeometry(380, 14), roadMat)
    road1.rotation.x = -Math.PI/2; road1.position.set(0, 0.1, -30); scene.add(road1)
    const road2 = new THREE.Mesh(new THREE.PlaneGeometry(380, 14), roadMat)
    road2.rotation.x = -Math.PI/2; road2.position.set(0, 0.1, 30); scene.add(road2)
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xd6c7a8 })
    const walls = [
      { g: new THREE.BoxGeometry(400, 6, 2), p: [0,3,-175] },
      { g: new THREE.BoxGeometry(400, 6, 2), p: [0,3,175] },
      { g: new THREE.BoxGeometry(2, 6, 350), p: [-200,3,0] },
      { g: new THREE.BoxGeometry(2, 6, 350), p: [200,3,0] },
    ]
    walls.forEach(w=>{ const m = new THREE.Mesh(w.g, wallMat); m.position.set(w.p[0], w.p[1], w.p[2]); scene.add(m) })
    const towerMeshes: THREE.Mesh[] = []
    const eveningMats: any[] = []
    const dayMats: any[] = []
    const labelSprites: THREE.Sprite[] = []
    towersData.forEach(t=>{
      const h = t.floors * 4.2
      const dayTex = createWindowTexture(t.floors, false)
      const eveTex = createWindowTexture(t.floors, true)
      const mat = new THREE.MeshStandardMaterial({ map: dayTex, roughness: 0.8 })
      const eveMat = new THREE.MeshStandardMaterial({ map: eveTex, emissive: new THREE.Color(0xffca7a), emissiveMap: eveTex, emissiveIntensity: 0.9 })
      dayMats.push(mat); eveningMats.push(eveMat)
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(18, h, 14), evening? eveMat : mat)
      mesh.position.set(t.x, h/2, t.z)
      mesh.castShadow = true; mesh.receiveShadow = true; mesh.userData = t
      scene.add(mesh); towerMeshes.push(mesh)
      const roof = new THREE.Mesh(new THREE.BoxGeometry(19, 0.8, 15), new THREE.MeshStandardMaterial({ color: 0x334155 }))
      roof.position.set(t.x, h+0.4, t.z); scene.add(roof)
      const canvas = document.createElement('canvas'); canvas.width=128; canvas.height=64
      const ctx = canvas.getContext('2d')!; ctx.fillStyle='rgba(0,0,0,0.75)'; ctx.fillRect(0,0,128,64); ctx.fillStyle='#D4AF37'; ctx.font='bold 36px sans-serif'; ctx.textAlign='center'; ctx.fillText(t.name,64,44)
      const tex = new THREE.CanvasTexture(canvas)
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }))
      spr.position.set(t.x, h+10, t.z); spr.scale.set(12,6,1); scene.add(spr); labelSprites.push(spr)
    })
    const club = new THREE.Mesh(new THREE.BoxGeometry(50, 10, 28), new THREE.MeshStandardMaterial({ color: 0xD4AF37 }))
    club.position.set(0,5,-130); scene.add(club)
    const clubRoof = new THREE.Mesh(new THREE.BoxGeometry(52,2,30), new THREE.MeshStandardMaterial({ color: 0x7c3aed }))
    clubRoof.position.set(0,11,-130); scene.add(clubRoof)
    const trunkGeo = new THREE.CylinderGeometry(0.4,0.6,6,6)
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5b3a29 })
    const canopyGeo = new THREE.ConeGeometry(3.5, 7, 8)
    const canopyMat = new THREE.MeshLambertMaterial({ color: evening? 0x2d4a22 : 0x2e7d32 })
    const treeCount = 70
    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount)
    const canopies = new THREE.InstancedMesh(canopyGeo, canopyMat, treeCount)
    const dummy = new THREE.Object3D()
    let idx=0
    for(let i=0;i<treeCount;i++){
      let x,z; do{ x = (Math.random()-0.5)*380; z = (Math.random()-0.5)*300 } while(Math.abs(z+60)<20 || Math.abs(z)<20 || Math.abs(z-60)<20 || towersData.some(t=> Math.hypot(x-t.x, z-t.z)<18 ))
      dummy.position.set(x,3,z); dummy.updateMatrix(); trunks.setMatrixAt(idx, dummy.matrix)
      dummy.position.set(x,8.5,z); dummy.updateMatrix(); canopies.setMatrixAt(idx, dummy.matrix); idx++
    }
    trunks.instanceMatrix.needsUpdate=true; canopies.instanceMatrix.needsUpdate=true; scene.add(trunks); scene.add(canopies)
    sceneRef.current = { towers: towerMeshes, controls, eveningMats, dayMats }
    const ray = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    const onClick = (e: MouseEvent)=>{
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((e.clientX-rect.left)/rect.width)*2-1
      mouse.y = -((e.clientY-rect.top)/rect.height)*2+1
      ray.setFromCamera(mouse, camera)
      const hits = ray.intersectObjects(towerMeshes)
      if(hits.length){ const t = hits[0].object.userData as TowerInfo; setSelected(t); towerMeshes.forEach(m=>{ m.scale.set(1,1,1) }); (hits[0].object as THREE.Mesh).scale.set(1.08,1.08,1.08) }
    }
    renderer.domElement.addEventListener('click', onClick)
    let animId=0
    const animate = ()=>{ animId=requestAnimationFrame(animate); controls.update(); labelSprites.forEach(s=>{ s.visible = labels }); renderer.render(scene, camera) }
    animate()
    const onResize = ()=>{ const w = mount.clientWidth; const h = mount.clientHeight||600; camera.aspect = w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h) }
    window.addEventListener('resize', onResize)
    return ()=>{ cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); renderer.domElement.removeEventListener('click', onClick); mount.removeChild(renderer.domElement); renderer.dispose() }
  }, [])

  useEffect(()=>{
    if(!sceneRef.current) return
    const { towers, controls, eveningMats, dayMats } = sceneRef.current
    controls.autoRotate = autoRotate
    towers.forEach((m:any,i:number)=>{ m.material = evening? eveningMats[i] : dayMats[i] })
  }, [evening, autoRotate])

  return (
    <div className="relative w-full">
      <div ref={mountRef} className="w-full h-[620px] rounded-[24px] overflow-hidden bg-slate-900 shadow-2xl" />
      <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2">
        <button onClick={()=>setAutoRotate(!autoRotate)} className={`px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur ${autoRotate?'bg-[#D4AF37] text-black':'bg-white/80'}`}>{autoRotate?'⏸️ Stop':'▶️ Auto'}</button>
        <button onClick={()=>setLabels(!labels)} className={`px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur ${labels?'bg-white/90':'bg-white/60'}`}>🏷️ Labels</button>
        <button onClick={()=>setEvening(!evening)} className={`px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur ${evening?'bg-slate-900 text-white':'bg-white/80'}`}>{evening?'🌙 Evening':'☀️ Day'}</button>
        <span className="px-3 py-1.5 rounded-full bg-white/90 text-xs">19 Towers • 530 Flats • Jodhpur</span>
      </div>
      {selected && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 p-4 rounded-2xl bg-white/95 backdrop-blur shadow-xl border">
          <div className="flex justify-between"><div><p className="font-bold text-lg">Tower {selected.name}</p><p className="text-xs opacity-60">Block {selected.block}</p></div><button onClick={()=>setSelected(null)} className="w-6 h-6 rounded-full bg-black/10">✕</button></div>
          <div className="grid grid-cols-2 gap-3 mt-3 text-sm"><div className="p-2 rounded-xl bg-slate-50"><p className="text-[10px] opacity-60">FLOORS</p><p className="font-bold">{selected.floors}</p></div><div className="p-2 rounded-xl bg-slate-50"><p className="text-[10px] opacity-60">FLATS</p><p className="font-bold">{selected.flats}</p></div><div className="p-2 rounded-xl bg-slate-50"><p className="text-[10px] opacity-60">TYPE</p><p className="font-bold">2/3 BHK</p></div><div className="p-2 rounded-xl bg-[#D4AF37]/20"><p className="text-[10px]">STATUS</p><p className="font-bold">Ready</p></div></div>
        </div>
      )}
    </div>
  )
}
