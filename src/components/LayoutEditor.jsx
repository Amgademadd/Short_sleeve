import React, { useRef, useState } from "react";
import { Rnd } from "react-rnd";
import html2canvas from "html2canvas";

export default function LayoutEditor({ onExport }) {
  const stageRef = useRef(null);
  const [items, setItems] = useState([]);

  // Layout measures (adjusted for your T-shirt area if needed)
  const LAYOUT_W = 600;
  const LAYOUT_H = 360;

  // Add a text box with placeholder
  const addText = () => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "text",
        x: -821,   // 👈 T-shirt X
        y: 272,    // 👈 T-shirt Y
        width: 220,
        height: 90,
        rotate: 0,
        value: "Double-click to edit", // placeholder text
        style: {
          fontSize: 28,
          color: "#111",
          fontWeight: 700,
          textAlign: "center",
          lineHeight: 1.2,
          background: "rgba(255,255,255,0.85)",
          border: "1px dashed red", // red so you can see box
          borderRadius: 8,
          padding: "8px 12px",
        },
      },
    ]);
  };

  // Add an image box
  const addImage = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "image",
        src: url,
        x: -821,  // 👈 T-shirt X
        y: 272,   // 👈 T-shirt Y
        width: 200,
        height: 200,
        rotate: 0,
      },
    ]);
  };

  // Export snapshot as PNG
  const onSnapshot = async () => {
    if (!stageRef.current) return;
    const canvas = await html2canvas(stageRef.current, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    });
    const dataUrl = canvas.toDataURL("image/png");
    onExport?.(dataUrl);
  };

  return (
    <div
      style={{
        width: 360,
        minWidth: 360,
        borderLeft: "1px solid #333",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          padding: 12,
          borderBottom: "1px solid #333",
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <button onClick={addText}>🅣 Add Text</button>
        <label style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
          <span>🖼️ Add Image</span>
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => addImage(e.target.files?.[0])}
          />
        </label>
        <button onClick={onSnapshot}>⬇️ Export</button>
      </div>

      {/* Layout area */}
      <div style={{ padding: 12 }}>
        <div
          ref={stageRef}
          className="layout-bg"
          style={{
            width: LAYOUT_W,
            height: LAYOUT_H,
            backgroundColor: "transparent",
            position: "relative",
            overflow: "visible", // 👈 allow negative positions
            borderRadius: 10,
            border: "1px solid #444",
            boxShadow: "0 0 0 1px #000 inset",
          }}
        >
          {items.map((item) => (
            <Rnd
              key={item.id}
              // ⛔ removed bounds="parent" so you can drag outside
              size={{ width: item.width, height: item.height }}
              position={{ x: item.x, y: item.y }}
              enableResizing={{
                top: true,
                right: true,
                bottom: true,
                left: true,
                topRight: true,
                bottomRight: true,
                bottomLeft: true,
                topLeft: true,
              }}
              onDragStop={(e, d) => {
                console.log(`📍 Item ${item.id} dragged to: x=${d.x}, y=${d.y}`);
                setItems((prev) =>
                  prev.map((p) =>
                    p.id === item.id ? { ...p, x: d.x, y: d.y } : p
                  )
                );
              }}
              onResizeStop={(e, dir, ref, delta, pos) => {
                setItems((prev) =>
                  prev.map((p) =>
                    p.id === item.id
                      ? {
                          ...p,
                          width: ref.offsetWidth,
                          height: ref.offsetHeight,
                          x: pos.x,
                          y: pos.y,
                        }
                      : p
                  )
                );
              }}
              style={{ transform: `rotate(${item.rotate}deg)` }}
            >
              {item.type === "text" ? (
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const text = e.currentTarget.innerText;
                    setItems((prev) =>
                      prev.map((p) =>
                        p.id === item.id ? { ...p, value: text } : p
                      )
                    );
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    ...item.style,
                  }}
                >
                  {item.value}
                </div>
              ) : (
                <img
                  src={item.src}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    background: "rgba(255,255,255,0.85)",
                    border: "1px dashed #888",
                    borderRadius: 8,
                  }}
                />
              )}
            </Rnd>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: "#bbb" }}>
          Layout size: {Math.round(LAYOUT_W)} × {Math.round(LAYOUT_H)} px
          (export is transparent PNG)
        </div>
      </div>
    </div>
  );
}
