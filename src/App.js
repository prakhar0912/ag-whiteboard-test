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

  let setSickPlane = () => {
    const geometry = new THREE.BufferGeometry();

    const indices = [];

    const vertices = [];
    const normals = [];

    const size = 18;
    const segments = 200;

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


    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors.current, 3));
    return geometry
  }

  let setSickMaterial = () => {
    const material = new THREE.MeshPhongMaterial({
      side: THREE.BackSide,
      vertexColors: true
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

  let clk = (e) => {
    // console.log(e)
    let cords = e.face
    // console.log(e)
    let plane = e.eventObject;
    for (let i = 0; i < 3; i++) {
      plane.geometry.attributes.color.array[cords.a*3 + i] = 0
      plane.geometry.attributes.color.array[cords.b*3 + i] = 0
      plane.geometry.attributes.color.array[cords.c*3 + i] = 0
    }
    plane.geometry.attributes.color.needsUpdate = true
  }

  return (
    <mesh ref={planeRef} {...props} onPointerMove = {(e) => clk(e)} onPoin geometry={setSickPlane()} material={setSickMaterial()} />
  );
}


let App = () => {


  return (
    <Canvas camera = {{position: [0,0,-6]}}>
      <ambientLight intensity = {20}/>
      {/* <CameraController/> */}
      <Plane position = {[0,0,0]}/>
      {/* <gridHelper /> */}
    </Canvas>
  );
}

export default App;
