import { Canvas, useFrame, useThree } from 'react-three-fiber'
import { useState, useRef, useEffect } from 'react'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'


const CameraController = () => {
  const { camera, gl } = useThree();
  useEffect(
    () => {
      const controls = new OrbitControls(camera, gl.domElement);

      controls.minDistance = 3;
      controls.maxDistance = 20;
      return () => {
        controls.dispose();
      };
    },
    []
  );
  return null;
};

let Plane = (props) => {
  let planeRef = useRef();
  let colors = useRef([]);

  colors.current = []

  const { camera, scene } = useThree();

  const mouse = useRef(new THREE.Vector2())
  const raycaster = useRef(new THREE.Raycaster())
  const segs = useRef(400)
  let move = (event) => {
    mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.current.y = - (event.clientY / window.innerHeight) * 2 + 1;
  }
  useEffect(() => {
    window.addEventListener('mousemove', move, false)
  }, [])

  let lastcords
  useFrame(() => {
    raycaster.current.setFromCamera(mouse.current, camera)
    const ints = raycaster.current.intersectObjects(scene.children)
    for (let i = 0; i < ints.length; i++) {
      // console.log(ints[i])
      if (ints[i].face) {
        drawOnFace(ints[i].face, lastcords)
        lastcords = ints[i].face
      }

    }
  })

  let setSickPlane = () => {

    let geometry = new THREE.BufferGeometry();

    const indices = [];

    const vertices = [];
    const normals = [];

    const size = 18;
    const segments = segs.current;

    const halfSize = size / 2;
    const segmentSize = size / segments;

    // generate vertices, normals and color data for a simple grid geometry

    for (let i = 0; i <= segments; i++) {

      const y = (i * segmentSize) - halfSize;

      for (let j = 0; j <= segments; j++) {

        const x = (j * segmentSize) - halfSize;

        vertices.push(x, - y, 0);
        normals.push(0, 0, 1);

        const r = (x / size) + 0.5;
        const g = (y / size) + 0.5;

        colors.current.push(1, 1, 1);

      }

    }

    // generate indices (data for element array buffer)

    for (let i = 0; i < segments; i++) {

      for (let j = 0; j < segments; j++) {

        const a = i * (segments + 1) + (j + 1);
        const b = i * (segments + 1) + j;
        const c = (i + 1) * (segments + 1) + j;
        const d = (i + 1) * (segments + 1) + (j + 1);

        // generate two faces (triangles) per iteration

        indices.push(a, b, d); // face one
        indices.push(b, c, d); // face two

      }

    }
    colors.current[0] = 0
    colors.current[1] = 0
    colors.current[2] = 0

    colors.current[603] = 0
    colors.current[604] = 0
    colors.current[605] = 0
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors.current, 3));
    geometry = geometry.toNonIndexed()
    console.log(geometry)
    return geometry
  }

  let setSickMaterial = () => {
    const material = new THREE.MeshPhongMaterial({
      side: THREE.BackSide,
      vertexColors: true,
      wireframe: false
    });
    return material;
  }

  function setPlaneGeom(min, max) {
    let planeGeom = new THREE.BufferGeometry();
    planeGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
      min.x, max.y, min.z,
      max.x, max.y, max.z,
      min.x, min.y, min.z,
      max.x, min.y, max.z
    ]), 3));
    planeGeom.setIndex([0, 2, 1, 2, 3, 1]);
    return planeGeom;
  }

  let setMat = () => {
    return new THREE.MeshBasicMaterial({ color: "black", wireframe: true, side: THREE.DoubleSide })
  }

  let convertToXY = (cords) => {
    let x = Math.floor((cords.a / 6) % (segs.current + 1))
    let y = Math.floor((cords.a / 6) / (segs.current + 1))
    return [x, y]
    // convertToRGB(x,y)
  }

  let convertToRGB = ([x, y]) => {
    let res = ((y * (segs.current + 1)) + x) * 6
    return res
  }

  let drawOnFace = (cords, last) => {

    let [x,y] = convertToXY(cords)
    if (last) {
      let lastXY = convertToXY(last)
      // console.log(lastXY)
    }

    let toConvert = [[x, y], [x-1, y],[x - 2, y + 1], [x-1, y + 1]]
    let final = [[x,y]]
    let rgb = final.map((ele) => convertToRGB(ele))
    // console.log(rgb)
    rgb.forEach((ele) => {
      // let res = convertToRGB(ele)
      fillColor(ele)
    })

    planeRef.current.geometry.attributes.color.needsUpdate = true;

  }

  let fillColor = (pos) => {
    for (let i = 0; i < 18; i++) {
      planeRef.current.geometry.attributes.color.array[(pos * 3) + i] = 0
    }

  }

  return (
    <mesh ref={planeRef} {...props} geometry={setSickPlane()} material={setSickMaterial()} onClick={(e) => console.log(e.face)} />
  );
}


let App = () => {

  return (
    <Canvas camera={{ position: [0, 0, -6] }} >
      <ambientLight intensity={1} />
      {/* <CameraController /> */}
      <Plane position={[0, 0, 0]} />
    </Canvas>
  );
}

export default App;
