import { Decal, useGLTF, PivotControls } from "@react-three/drei"
import { useMemo, useState } from "react"

export function TShirt({ decalTexture }) {
  const { nodes } = useGLTF("/models/tshirt.glb")

  const collectMeshes = (groupNode) => {
    const meshes = []
    groupNode.traverse((child) => {
      if (child.isMesh && child.geometry) meshes.push(child)
    })
    return meshes
  }

  const meshes = useMemo(() => [
    ...collectMeshes(nodes.Body_Front_Node_4),
    ...collectMeshes(nodes.Body_Back_Node_5),
    ...collectMeshes(nodes.Sleeves_Node_6),
    ...collectMeshes(nodes.Sleeves_Node_7),
  ], [nodes])

  // decal state
  const [pos, setPos] = useState([0, 0.25, 0.38])
  const [rotation, setRotation] = useState([0, 0, 0])
  const [scale, setScale] = useState([1.5, 1, 1])

  return (
    <group scale={2.5} position={[0, -3.2, 0]}>
      {meshes.map((mesh, i) => (
        <mesh key={i} geometry={mesh.geometry} material={mesh.material}>
          {decalTexture && (
            <PivotControls
              anchor={[0, 0, 0]}
              depthTest={false}
              scale={1.5}
              onDrag={(local) => {
                setPos([local.worldPosition.x, local.worldPosition.y, local.worldPosition.z])
                setRotation([local.worldRotation.x, local.worldRotation.y, local.worldRotation.z])
              }}
            >
              <Decal
                mesh={mesh}
                position={pos}
                rotation={rotation}
                scale={scale}
              >
                <meshStandardMaterial
                  map={decalTexture}
                  transparent
                  polygonOffset
                  polygonOffsetFactor={-1}
                />
              </Decal>
            </PivotControls>
          )}
        </mesh>
      ))}
    </group>
  )
}

useGLTF.preload("/models/tshirt.glb")
