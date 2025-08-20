import React, { useRef, useState } from "react";
import { Rnd } from "react-rnd";

export default function LayoutEditor({ elements = [], setElements, activeSide, shirtColor, setShirtColor }) {
  const fileInputRef = useRef();
  const [selectedId, setSelectedId] = useState(null);

  const addText = () => {
    setElements((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "text",
        content: "New Text",
        x: 150,
        y: 150,
        width: 100,
        height: 40,
        fontSize: 24,
        fontFamily: "Arial",
        color: "#000000",
        bold: false,
        italic: false,
        align: "center",
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
          content: ev.target.result,
          x: 140,
          y: 140,
          width: 120,
          height: 120,
        },
      ]);
    };
    reader.readAsDataURL(file);
  };

  const maskMap = {
    front: "/models/tshirt_Front.png",
    back: "/models/tshirt_Back.png",
    left: "/models/tshirt_Left.png",
    right: "/models/tshirt_Right.png",
  };

  const maskImage = maskMap[activeSide];

  const editorSize =
    activeSide === "left" || activeSide === "right"
      ? { width: 500, height: 400 }
      : { width: 400, height: 400 };

  const selectedElement = elements.find((el) => el.id === selectedId);

  return (
    <div>
      {/* Global controls */}
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

        {/* Shirt Color Picker */}
        <label style={{ marginLeft: "10px" }}>
          Shirt Color:
          <input
            type="color"
            value={shirtColor}
            onChange={(e) => setShirtColor(e.target.value)}
          />
        </label>
      </div>

      {/* Text controls if a text element is selected */}
      {selectedElement && selectedElement.type === "text" && (
        <div style={{ marginBottom: "10px" }}>
          <label>
            Font:
            <select
              value={selectedElement.fontFamily}
              onChange={(e) =>
                setElements((prev) =>
                  prev.map((el) =>
                    el.id === selectedElement.id
                      ? { ...el, fontFamily: e.target.value }
                      : el
                  )
                )
              }
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Verdana">Verdana</option>
            </select>
          </label>

          <label style={{ marginLeft: "10px" }}>
            Size:
            <input
              type="number"
              value={selectedElement.fontSize}
              min="8"
              max="100"
              onChange={(e) =>
                setElements((prev) =>
                  prev.map((el) =>
                    el.id === selectedElement.id
                      ? { ...el, fontSize: parseInt(e.target.value) }
                      : el
                  )
                )
              }
            />
          </label>

          <label style={{ marginLeft: "10px" }}>
            Color:
            <input
              type="color"
              value={selectedElement.color}
              onChange={(e) =>
                setElements((prev) =>
                  prev.map((el) =>
                    el.id === selectedElement.id
                      ? { ...el, color: e.target.value }
                      : el
                  )
                )
              }
            />
          </label>

          <button
            style={{ marginLeft: "10px" }}
            onClick={() =>
              setElements((prev) =>
                prev.map((el) =>
                  el.id === selectedElement.id
                    ? { ...el, bold: !el.bold }
                    : el
                )
              )
            }
          >
            {selectedElement.bold ? "Unbold" : "Bold"}
          </button>

          <button
            style={{ marginLeft: "5px" }}
            onClick={() =>
              setElements((prev) =>
                prev.map((el) =>
                  el.id === selectedElement.id
                    ? { ...el, italic: !el.italic }
                    : el
                )
              )
            }
          >
            {selectedElement.italic ? "Unitalic" : "Italic"}
          </button>

          <select
            style={{ marginLeft: "10px" }}
            value={selectedElement.align}
            onChange={(e) =>
              setElements((prev) =>
                prev.map((el) =>
                  el.id === selectedElement.id
                    ? { ...el, align: e.target.value }
                    : el
                )
              )
            }
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      )}

      {/* Editor area */}
      <div
        style={{
          width: `${editorSize.width}px`,
          height: `${editorSize.height}px`,
          position: "relative",
          background: "white",
          border: "2px dashed gray",
          WebkitMaskImage: `url(${maskImage})`,
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          WebkitMaskPosition: "center",
          maskImage: `url(${maskImage})`,
          maskRepeat: "no-repeat",
          maskSize: "contain",
          maskPosition: "center",
          overflow: "hidden",
        }}
      >
        {elements.map((el) => (
          <Rnd
            key={el.id}
            size={{ width: el.width, height: el.height }}
            position={{ x: el.x, y: el.y }}
            onClick={() => setSelectedId(el.id)}
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
              border: el.id === selectedId ? "2px solid blue" : "1px solid red",
              background: "rgba(255,0,0,0.05)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "move",
            }}
          >
            {el.type === "text" ? (
              <div
                contentEditable
                suppressContentEditableWarning
                onInput={(e) =>
                  setElements((prev) =>
                    prev.map((item) =>
                      item.id === el.id
                        ? { ...item, content: e.currentTarget.textContent }
                        : item
                    )
                  )
                }
                style={{
                  width: "100%",
                  height: "100%",
                  fontSize: `${el.fontSize}px`,
                  fontFamily: el.fontFamily,
                  color: el.color,
                  fontWeight: el.bold ? "bold" : "normal",
                  fontStyle: el.italic ? "italic" : "normal",
                  textAlign: el.align,
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    el.align === "center"
                      ? "center"
                      : el.align === "right"
                      ? "flex-end"
                      : "flex-start",
                }}
              >
                {el.content}
              </div>
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
