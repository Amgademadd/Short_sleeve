import React, { useRef } from "react";
import { Rnd } from "react-rnd";

export default function LayoutEditor({ elements = [], setElements }) {
  const fileInputRef = useRef();

  const addText = () => {
    setElements((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "text",
        content: "New Text",
        x: 50,
        y: 50,
        width: 100,
        height: 40,
      },
    ]);
  };

  const addImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setElements((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "image",
          content: ev.target.result, // ✅ dataURL so it works offline and mobile
          x: 50,
          y: 50,
          width: 120,
          height: 120,
        },
      ]);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={addText}>Add Text</button>
        <button onClick={() => fileInputRef.current.click()}>Add Image</button>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: "none" }}
          onChange={addImage}
        />
      </div>

      <div
        style={{
          width: "400px",
          height: "400px",
          position: "relative",
          border: "2px dashed gray",
          background: "white",
        }}
      >
        {elements.map((el) => (
          <Rnd
            key={el.id}
            size={{ width: el.width, height: el.height }}
            position={{ x: el.x, y: el.y }}
            onDragStop={(e, d) =>
              setElements((prev) =>
                prev.map((item) =>
                  item.id === el.id ? { ...item, x: d.x, y: d.y } : item
                )
              )
            }
            onResizeStop={(e, dir, ref, delta, pos) =>
              setElements((prev) =>
                prev.map((item) =>
                  item.id === el.id
                    ? {
                        ...item,
                        width: parseInt(ref.style.width),
                        height: parseInt(ref.style.height),
                        ...pos,
                      }
                    : item
                )
              )
            }
            bounds="parent"
            style={{
              border: "1px solid red",
              background: "rgba(255,0,0,0.1)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "move",
            }}
          >
            {el.type === "text" ? (
              <input
                type="text"
                value={el.content}
                onChange={(e) =>
                  setElements((prev) =>
                    prev.map((item) =>
                      item.id === el.id
                        ? { ...item, content: e.target.value }
                        : item
                    )
                  )
                }
                style={{
                  border: "none",
                  background: "transparent",
                  width: "100%",
                  textAlign: "center",
                }}
              />
            ) : (
              <img
                src={el.content}
                alt=""
                style={{ maxWidth: "100%", maxHeight: "100%" }}
              />
            )}
          </Rnd>
        ))}
      </div>
    </div>
  );
}
