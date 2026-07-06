import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Float, Line, Stars, Text, Center } from '@react-three/drei'
import { Component, Suspense, useRef, useMemo, useEffect } from 'react'

// React Three Fiber's <Suspense> only handles the *loading* phase of
// useGLTF — it does NOT catch thrown errors. If the .glb is missing,
// corrupted, or fails to fetch, that error propagates up and unmounts
// the whole app (blank white screen) unless we catch it here.
class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('Heart model failed to load:', error)
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

function HeartModel({ bpm, severity }) {
  const { scene } = useGLTF('/realistic_human_heart.glb')
  const heartRef = useRef()

  // Scene isolation preventing asset disappearing across renders
  const clonedScene = useMemo(() => scene.clone(), [scene])

  // Dispose cloned geometries/materials on unmount so re-uploading
  // repeatedly doesn't leak GPU memory over a long session.
  useEffect(() => {
    return () => {
      clonedScene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
          materials.forEach((m) => m.dispose())
        }
      })
    }
  }, [clonedScene])

  // Tint the heart's materials red as anomaly severity rises (0 = calm,
  // 1 = critical). Uses emissive so the underlying texture/color of the
  // model is preserved rather than overwritten.
  useEffect(() => {
    const s = Math.min(Math.max(severity ?? 0, 0), 1)
    clonedScene.traverse((obj) => {
      if (obj.material) {
        const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
        materials.forEach((m) => {
          if (m.emissive) {
            m.emissive.setRGB(0.5 * s, 0, 0)
            m.emissiveIntensity = s
          }
        })
      }
    })
  }, [clonedScene, severity])

  // Beats-per-minute drives the pulse frequency. sin(x)^10 produces two
  // positive lobes per 2π of phase, so to get exactly one visible pulse
  // per real heartbeat, the angular speed is bpm/60 beats-per-second
  // scaled by π (not 2π) — see comment below for the derivation.
  const bpmSafe = typeof bpm === 'number' && bpm > 0 ? bpm : 72
  const omega = (Math.PI * bpmSafe) / 60

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const pulse = 1 + Math.pow(Math.sin(t * omega), 10) * 0.04
    if (heartRef.current) {
      heartRef.current.scale.set(pulse, pulse, pulse)
      heartRef.current.rotation.y += 0.005 
    }
  })

  return (
    <Center>
      <primitive ref={heartRef} object={clonedScene} />
    </Center>
  )
}

function ModelUnavailable() {
  return (
    <Text color="#ef4444" anchorX="center" anchorY="middle" fontSize={0.2}>
      3D MODEL UNAVAILABLE
    </Text>
  )
}

export function HeartView({ bpm, severity }) {
  return (
    /* Updated layout classes to use Tailwind v4 canonical h-125 and rounded-4xl */
    <div className="h-125 w-full bg-[#050505] rounded-4xl border border-white/5 relative overflow-hidden shadow-2xl">
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-1">Biological Sync</p>
        <h3 className="text-xl font-bold italic tracking-tighter text-white">MYOCARDIUM PROJECTION</h3>
        {typeof bpm === 'number' && (
          <p className="text-[10px] font-mono text-zinc-500 mt-1">Pulse locked to {bpm} BPM</p>
        )}
      </div>
      
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />
        <pointLight position={[-5, -5, -2]} intensity={1} color="#ff0000" />
        
        <Suspense fallback={<Text color="white" anchorX="center" anchorY="middle">LOADING MODEL...</Text>}>
          <ModelErrorBoundary fallback={<ModelUnavailable />}>
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
              <HeartModel bpm={bpm} severity={severity} />
            </Float>
          </ModelErrorBoundary>
          <Stars radius={100} count={2000} factor={4} fade speed={0.5} />
        </Suspense>
        <OrbitControls enableZoom={true} makeDefault />
      </Canvas>
    </div>
  )
}

// A stylized, illustrative "normal sinus rhythm" reference beat — NOT
// derived from real clinical waveform data. It exists purely as a visual
// comparison aid in the 3D view so the uploaded trace's general shape and
// spacing can be eyeballed against a textbook-normal pattern. Repeats
// across whatever x-range the actual signal spans.
function generateReferenceTrace(xMin, xMax) {
  const points = []
  const step = 0.05
  const beatWidth = 6
  for (let x = xMin; x <= xMax; x += step) {
    const phase = (((x - xMin) % beatWidth) + beatWidth) % beatWidth / beatWidth
    let y = 0
    y += 0.15 * Math.exp(-Math.pow((phase - 0.15) / 0.03, 2)) // P wave
    y += 1.0 * Math.exp(-Math.pow((phase - 0.35) / 0.01, 2))  // R spike
    y -= 0.2 * Math.exp(-Math.pow((phase - 0.32) / 0.008, 2)) // Q dip
    y += 0.3 * Math.exp(-Math.pow((phase - 0.55) / 0.05, 2))  // T wave
    points.push([x, y, -0.01])
  }
  return points
}

export function SignalView({ points }) {
  const gridPoints = useMemo(() => {
    const lines = []
    for (let i = -20; i <= 20; i += 2) {
      lines.push(<Line key={`h-${i}`} points={[[-20, i, 0], [20, i, 0]]} color="#111" lineWidth={0.5} />)
      lines.push(<Line key={`v-${i}`} points={[[i, -20, 0], [i, 20, 0]]} color="#111" lineWidth={0.5} />)
    }
    return lines
  }, [])

  const linePoints = useMemo(() => {
    // <Line> needs at least 2 points to draw a segment — guard against
    // both an empty array and a single stray point (e.g. a near-blank
    // or unreadable source image producing almost no traced pixels).
    if (!points || points.length < 2) return [[-10, 0, 0], [10, 0, 0]]
    return points.map(p => [p[0], p[1], p[2] || 0])
  }, [points])

  const referencePoints = useMemo(() => {
    const xs = linePoints.map(p => p[0])
    return generateReferenceTrace(Math.min(...xs), Math.max(...xs))
  }, [linePoints])

  return (
    /* Updated layout classes to use Tailwind v4 canonical h-125 and rounded-4xl */
    <div className="h-125 w-full bg-[#050505] rounded-4xl border border-white/5 relative overflow-hidden shadow-2xl">
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-1">Telemetry Trace</p>
        <h3 className="text-xl font-bold italic tracking-tighter text-white">INTERPOLATED ECG SIGNAL</h3>
      </div>
      <div className="absolute bottom-8 left-8 z-10 pointer-events-none flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest">
        <span className="flex items-center gap-1.5 text-red-400"><span className="w-2 h-0.5 bg-red-500 inline-block" /> Your trace</span>
        <span className="flex items-center gap-1.5 text-zinc-500"><span className="w-2 h-0.5 bg-zinc-600 inline-block" /> Normal reference (illustrative)</span>
      </div>

      <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
        <ambientLight intensity={1.5} />
        {gridPoints}
        <Suspense fallback={null}>
          <Line points={referencePoints} color="#52525b" lineWidth={1} transparent opacity={0.5} />
          <Line points={linePoints} color="#ef4444" lineWidth={2.5} />
        </Suspense>
        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/realistic_human_heart.glb')