import { OrbitControls, Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Tshirt from "./Tshirt";

export default function Experience({ text, box, activeSide }) {
  return (
<Canvas camera={{ position: [0, 1.2, 3], fov: 50 }}>
      <OrbitControls />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Tshirt text={text} box={box} activeSide={activeSide} />
      <Environment preset="sunset" />
    </Canvas>
  );
}
