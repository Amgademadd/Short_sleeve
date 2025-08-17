import { Canvas } from "@react-three/fiber";
import React, { useState } from "react";
import Experience from "./components/Experience";
import LayoutEditor from "./components/LayoutEditor";
import "./index.css";

export default function App() {
  const [decalURL, setDecalURL] = useState(null);

  return (
    <div style={{display:"flex", width:"100%", height:"100%"}}>
      {/* 3D view */}
      <div style={{flex:1, position:"relative"}}>
        <Canvas shadows camera={{ position: [0, 0.2, 5], fov: 45 }}>
          <Experience decalURL={decalURL} />
        </Canvas>

        {/* helpful hint */}
        <div style={{position:"absolute", top:12, left:12, background:"rgba(0,0,0,0.5)", padding:"8px 10px", borderRadius:6, fontSize:12}}>
          1) Add text/images → 2) Export → decal is applied to the T-shirt
        </div>
      </div>

      {/* Layout editor panel */}
      <LayoutEditor onExport={(png) => setDecalURL(png)} />
    </div>
  );
}
