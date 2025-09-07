import React, { useState, useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Tshirt from "./components/Tshirt";
import LayoutEditor from "./components/LayoutEditor";
import * as THREE from "three";
import JSZip from "jszip";
import { saveAs } from "file-saver";

/* ===== Helper for capturing canvas screenshots ===== */
function CaptureHelper({ onReady }) {
  const { gl, scene, camera } = useThree();

  const screenshot = () => {
    const prev = scene.background;
    scene.background = new THREE.Color("#ffffff");
    gl.render(scene, camera);
    const dataURL = gl.domElement.toDataURL("image/png");
    scene.background = prev;
    return dataURL;
  };

  const snapAtAngle = async (angleRad) => {
    const radius = 3;
    const height = 1.5;

    camera.position.x = radius * Math.sin(angleRad);
    camera.position.z = radius * Math.cos(angleRad);
    camera.position.y = height;
    camera.lookAt(0, 1.5, 0);

    await new Promise((r) => setTimeout(r, 280));
    const dataURL = screenshot();
    return dataURL.split(",")[1];
  };

  useEffect(() => {
    if (!onReady) return;

    const api = {
      exportZip: async () => {
        const angles = [
          { name: "front", a: 0 },
          { name: "right", a: Math.PI / 2 },
          { name: "back", a: Math.PI },
          { name: "left", a: -Math.PI / 2 },
        ];

        const zip = new JSZip();
        for (const s of angles) {
          const b64 = await snapAtAngle(s.a);
          zip.file(`hoodie-${s.name}.png`, b64, { base64: true });
        }

        const blob = await zip.generateAsync({ type: "blob" });
        saveAs(blob, "hoodie-views.zip");
      },
    };

    onReady(api);
  }, [onReady]);

  return null;
}

/* ====== Camera tween when switching sides ====== */
function CameraController({ activeSide }) {
  const { camera } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    let targetAngle;
    switch (activeSide) {
      case "front":
        targetAngle = 0;
        break;
      case "right":
        targetAngle = Math.PI / 2;
        break;
      case "back":
        targetAngle = Math.PI;
        break;
      case "left":
        targetAngle = -Math.PI / 2;
        break;
      default:
        targetAngle = 0;
    }

    const radius = 3;
    const height = 1.5;

    const startPos = camera.position.clone();
    const startAngle = Math.atan2(startPos.x, startPos.z);
    const endAngle = targetAngle;

    const duration = 700;
    const startTime = performance.now();

    function animate() {
      const t = Math.min((performance.now() - startTime) / duration, 1);
      const k = 0.5 - 0.5 * Math.cos(Math.PI * t);
      const angle = startAngle + (endAngle - startAngle) * k;

      camera.position.x = radius * Math.sin(angle);
      camera.position.z = radius * Math.cos(angle);
      camera.position.y = height;
      camera.lookAt(0, 1.5, 0);

      if (t < 1) requestAnimationFrame(animate);
    }

    animate();
  }, [activeSide, camera]);

  return <OrbitControls ref={controlsRef} enablePan={false} />;
}

export default function App() {
  const [activeSide, setActiveSide] = useState("front");
  const [elementsBySide, setElementsBySide] = useState({
    front: [],
    back: [],
    left: [],
    right: [],
  });
  const [shirtColor, setShirtColor] = useState("#ffffff"); // ✅ renamed

  const [device, setDevice] = useState("desktop");

  const captureApiRef = useRef(null);
  const setCaptureApi = (api) => (captureApiRef.current = api);

  /* ===== Responsive breakpoints ===== */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setDevice("mobile");
      } else if (window.innerWidth < 1024) {
        setDevice("tablet");
      } else {
        setDevice("desktop");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const buttonStyle = {
    background: "#ff6600",
    color: "#fff",
    padding: "10px 15px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px",
    transition: "all 0.2s ease",
  };

  const hoverStyle = { background: "#cc5200" };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: device === "mobile" ? "column" : "row",
        height: "100vh",
        background: "black",
      }}
    >
      {/* LEFT PANEL */}
      <div
        style={{
          flex:
            device === "mobile"
              ? "0 0 auto"
              : device === "tablet"
              ? "0 0 60%"
              : "0 0 50%",
          width:
            device === "mobile" ? "100%" : device === "tablet" ? "60%" : "50%",
          padding: "12px",
          overflowY: "auto",
          background: "#1c1f26",
          color: "#fff",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            fontSize: "50px",
            marginBottom: "16px",
            color: "#ff6600",
          }}
        >
          Hoodie Designer
        </h2>

        <div style={{ marginBottom: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["front", "back", "left", "right"].map((side) => (
            <button
              key={side}
              onClick={() => setActiveSide(side)}
              style={buttonStyle}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = hoverStyle.background)
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = buttonStyle.background)
              }
            >
              {side.charAt(0).toUpperCase() + side.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ margin: "8px 0 14px 0" }}>
          <button
            style={buttonStyle}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = hoverStyle.background)
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = buttonStyle.background)
            }
            onClick={() => captureApiRef.current?.exportZip()}
          >
            ⬇️ Download ZIP (4 Sides)
          </button>
        </div>

        {/* 2D Editor */}
        <LayoutEditor
          elementsBySide={elementsBySide}
          setElementsBySide={setElementsBySide}
          activeSide={activeSide}
          shirtColor={shirtColor}       // ✅ fixed
          setShirtColor={setShirtColor} // ✅ fixed
        />
      </div>

      {/* RIGHT PANEL */}
      <div
        style={{
          flex: "1",
          width:
            device === "mobile" ? "100%" : device === "tablet" ? "40%" : "50%",
          height: device === "mobile" ? "400px" : "100%",
          background: "#1c1f26",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            border: "4px solid #ff6600",
            borderRadius: "12px",
            boxShadow: "0 0 20px rgba(255, 102, 0, 0.5)",
            width: "95%",
            height: "95%",
            overflow: "hidden",
          }}
        >
          <Canvas camera={{ position: [0, 1.2, 2.5], fov: 45 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <Tshirt elementsBySide={elementsBySide} shirtColor={shirtColor} /> {/* ✅ fixed */}
            <CameraController activeSide={activeSide} />
            <CaptureHelper onReady={setCaptureApi} />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
