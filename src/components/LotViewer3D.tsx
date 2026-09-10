import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import type { Project } from '../domain/project';

interface LotViewer3DProps {
  project: Project;
}

const TYPE_COLORS: Record<string, string> = {
  bedroom: '#a5d6a7',
  bathroom: '#90caf9',
  kitchen: '#ffcc80',
  living: '#f48fb1',
  dining: '#ce93d8',
  office: '#80deea',
  laundry: '#c5e1a5',
  storage: '#bcaaa4',
  garage: '#b0bec5',
  garden: '#66bb6a',
  deck: '#d7ccc8',
  terrace: '#ffe0b2',
  corridor: '#eeeeee',
};

export function LotViewer3D({ project }: LotViewer3DProps) {
  const lotW = Math.max(project.lot_width || 12, 1);
  const lotD = Math.max(project.lot_depth || 25, 1);
  const rooms = project.room_schedule?.rooms ?? [];
  const firstFloorRooms = rooms.filter((r) => r.floor === 1);

  // Center the lot around origin.
  const offsetX = -lotW / 2;
  const offsetZ = -lotD / 2;

  return (
    <Canvas camera={{ position: [lotW * 1.2, Math.max(lotW, lotD) * 1.5, lotD * 1.2], fov: 45 }} style={{ height: 400, borderRadius: 16 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

      {/* Ground / lot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[lotW, lotD]} />
        <meshStandardMaterial color="#efebe9" />
      </mesh>

      {/* Grid lines on the lot */}
      <gridHelper args={[Math.max(lotW, lotD), 10, '#9e9e9e', '#e0e0e0']} position={[0, 0, 0]} />

      {/* Building envelope / first floor rooms */}
      {firstFloorRooms.map((room) => {
        const color = TYPE_COLORS[room.type] || '#ffffff';
        const x = offsetX + room.x + room.width_m / 2;
        const z = offsetZ + room.y + room.depth_m / 2;
        const h = 2.8; // standard ceiling height

        return (
          <group key={room.id} position={[x, h / 2, z]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[room.width_m - 0.1, h, room.depth_m - 0.1]} />
              <meshStandardMaterial color={color} />
            </mesh>
            {room.area_m2 > 6 && (
              <Text
                position={[0, 0, room.depth_m / 2 + 0.05]}
                fontSize={0.35}
                color="#1a1a1a"
                anchorX="center"
                anchorY="middle"
                rotation={[0, 0, 0]}
              >
                {room.name}
              </Text>
            )}
          </group>
        );
      })}

      {/* Garden / outdoor areas on ground */}
      {rooms
        .filter((r) => r.floor === 0)
        .map((room) => {
          const color = TYPE_COLORS[room.type] || '#81c784';
          const x = offsetX + room.x + room.width_m / 2;
          const z = offsetZ + room.y + room.depth_m / 2;
          return (
            <mesh key={room.id} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, z]} receiveShadow>
              <planeGeometry args={[room.width_m, room.depth_m]} />
              <meshStandardMaterial color={color} transparent opacity={0.85} />
            </mesh>
          );
        })}

      {/* North arrow */}
      <NorthArrow x={lotW / 2 - 1.5} z={-lotD / 2 + 1.5} />

      {/* Compass labels */}
      <Text position={[0, -0.5, lotD / 2 + 1]} fontSize={0.5} color="#5d4037" anchorX="center">
        Frente
      </Text>
    </Canvas>
  );
}

function NorthArrow({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0.2, z]}>
      <mesh rotation={[0, -Math.PI / 2, 0]}>
        <coneGeometry args={[0.3, 0.8, 8]} />
        <meshStandardMaterial color="#ba1a1a" />
      </mesh>
      <Text position={[0, 0.6, 0]} fontSize={0.35} color="#ba1a1a" anchorX="center">
        N
      </Text>
    </group>
  );
}
