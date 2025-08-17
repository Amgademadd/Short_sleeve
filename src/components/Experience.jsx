import { ContactShadows, Environment, Float, OrbitControls } from "@react-three/drei";
import { TShirt } from "./Tshirt";

export default function Experience({ decalURL }) {
  return (
    <>
      <OrbitControls enablePan={false} enableZoom />
      <Float speed={1} rotationIntensity={0.25} floatIntensity={0.3}>
        <TShirt decalURL={decalURL} />
      </Float>
      <ContactShadows position={[0, -1.2, 0]} opacity={0.4} scale={10} blur={2}/>
<Environment preset="city" background />
    </>
  );
}
