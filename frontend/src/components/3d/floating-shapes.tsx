import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Mesh } from 'three';

interface FloatingShapeProps {
    position: [number, number, number];
    color: string;
    speed?: number;
    shape: 'box' | 'sphere' | 'ring' | 'cylinder' | 'cone';
    scale?: number;
    opacity?: number;
    emissiveIntensity?: number;
}

export function FloatingShape({
    position,
    color,
    speed = 1,
    shape,
    scale = 1,
    opacity = 0.8,
    emissiveIntensity = 0.6,
}: FloatingShapeProps) {
    const meshRef = useRef<Mesh>(null);
    const { mouse } = useThree();

    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.elapsedTime;
            
            // Mouse reactive movement
            const mouseInfluenceX = mouse.x * 2;
            const mouseInfluenceY = mouse.y * 2;

            // Intense rotation for DJ vibe
            meshRef.current.rotation.x += 0.02 * speed;
            meshRef.current.rotation.y += 0.03 * speed;
            meshRef.current.rotation.z += 0.015 * speed;

            // Mouse-reactive positioning with stronger response
            meshRef.current.position.y =
                position[1] +
                Math.sin(time * speed * 1.5) * 1.5 +
                mouseInfluenceY * 2;
            meshRef.current.position.x =
                position[0] +
                Math.cos(time * speed * 1.2) * 1.2 +
                mouseInfluenceX * 2;
            meshRef.current.position.z =
                position[2] + 
                Math.sin(time * speed * 0.8) * 0.8 +
                (mouseInfluenceX + mouseInfluenceY) * 0.5;

            // Pulsing scale animation synchronized with music-like beats
            const pulseFactor = 1 + Math.sin(time * speed * 3) * 0.2;
            meshRef.current.scale.setScalar(scale * pulseFactor);

            // Color intensity based on mouse movement
            const intensity = 0.6 + (Math.abs(mouse.x) + Math.abs(mouse.y)) * 0.4;
            if (meshRef.current.material) {
                (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 
                    emissiveIntensity * intensity;
            }
        }
    });

    const geometryMap = {
        box: <boxGeometry args={[0.8 * scale, 0.8 * scale, 0.8 * scale]} />,
        sphere: <sphereGeometry args={[0.5 * scale, 16, 16]} />,
        ring: <ringGeometry args={[0.3 * scale, 0.6 * scale, 32]} />,
        cylinder: <cylinderGeometry args={[0.4 * scale, 0.4 * scale, 1.2 * scale, 16]} />,
        cone: <coneGeometry args={[0.5 * scale, 1.2 * scale, 16]} />,
    };

    return (
        <mesh ref={meshRef} position={position}>
            {geometryMap[shape]}
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={emissiveIntensity}
                transparent
                opacity={opacity}
                roughness={0.2}
                metalness={0.8}
                wireframe={false}
            />
        </mesh>
    );
}

export function FloatingShapes() {
    return (
        <>
            {/* Primary DJ elements - intense and reactive */}
            {/* <FloatingShape
                position={[-3, 0, -2]}
                color="#ff0000"
                shape="ring"
                speed={1.2}
                scale={1.8}
                opacity={0.9}
                emissiveIntensity={1.0}
            />
            <FloatingShape
                position={[3, 1, -3]}
                color="#00ff00"
                shape="cylinder"
                speed={1.5}
                scale={1.6}
                opacity={0.9}
                emissiveIntensity={1.0}
            />
            <FloatingShape
                position={[0, -2, -4]}
                color="#0000ff"
                shape="cone"
                speed={1.8}
                scale={2.0}
                opacity={0.9}
                emissiveIntensity={1.0}
            />
            <FloatingShape
                position={[-4, -1, -3]}
                color="#ffff00"
                shape="ring"
                speed={1.3}
                scale={1.5}
                opacity={0.9}
                emissiveIntensity={0.9}
            />
            <FloatingShape
                position={[4, 2, -2]}
                color="#ff00ff"
                shape="cylinder"
                speed={1.6}
                scale={1.7}
                opacity={0.9}
                emissiveIntensity={0.9}
            /> */}

            {/* Secondary intense elements */}
            {/* <FloatingShape
                position={[-6, 3, -5]}
                color="#00ffff"
                shape="cone"
                speed={2.0}
                scale={1.3}
                opacity={0.8}
                emissiveIntensity={0.8}
            />
            <FloatingShape
                position={[6, -3, -4]}
                color="#ff8000"
                shape="ring"
                speed={1.4}
                scale={1.4}
                opacity={0.8}
                emissiveIntensity={0.8}
            />
            <FloatingShape
                position={[-2, 4, -6]}
                color="#8000ff"
                shape="cylinder"
                speed={1.7}
                scale={1.2}
                opacity={0.8}
                emissiveIntensity={0.8}
            /> */}
            {/* <FloatingShape
                position={[2, -4, -5]}
                color="#00ff80"
                shape="cone"
                speed={1.9}
                scale={1.3}
                opacity={0.8}
                emissiveIntensity={0.8}
            />

            {/* Fast moving background elements */}
            {/* <FloatingShape
                position={[-8, 0, -8]}
                color="#ff0040"
                shape="sphere"
                speed={2.5}
                scale={0.8}
                opacity={0.7}
                emissiveIntensity={0.6}
            />
            <FloatingShape
                position={[8, 1, -7]}
                color="#40ff00"
                shape="box"
                speed={2.2}
                scale={0.9}
                opacity={0.7}
                emissiveIntensity={0.6}
            /> */}
            {/* <FloatingShape
                position={[0, -6, -9]}
                color="#0040ff"
                shape="ring"
                speed={2.8}
                scale={0.7}
                opacity={0.7}
                emissiveIntensity={0.6}
            />  */}

            {/* DJ Laser beams */}
            {/* <LaserBeams /> */}
            {/* <DJLights /> */}
            <ReactiveParticles />
        </>
    );
}

function LaserBeams() {
    const laser1Ref = useRef<THREE.Mesh>(null);
    const laser2Ref = useRef<THREE.Mesh>(null);
    const laser3Ref = useRef<THREE.Mesh>(null);
    const { mouse } = useThree();

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        
        if (laser1Ref.current) {
            laser1Ref.current.rotation.z += 0.05;
            laser1Ref.current.position.y = Math.sin(time * 3) * 2 + mouse.y * 3;
        }
        if (laser2Ref.current) {
            laser2Ref.current.rotation.x += 0.04;
            laser2Ref.current.position.x = Math.cos(time * 2.5) * 2 + mouse.x * 3;
        }
        if (laser3Ref.current) {
            laser3Ref.current.rotation.y += 0.06;
            laser3Ref.current.position.z = Math.sin(time * 2) * 1 - 5;
        }
    });

    return (
        <>
            <mesh ref={laser1Ref} position={[-5, 0, -4]}>
                <cylinderGeometry args={[0.02, 0.02, 15, 8]} />
                <meshBasicMaterial color="#ff0000" transparent opacity={0.8} />
            </mesh>
            <mesh ref={laser2Ref} position={[0, 5, -4]}>
                <cylinderGeometry args={[0.02, 0.02, 15, 8]} />
                <meshBasicMaterial color="#00ff00" transparent opacity={0.8} />
            </mesh>
            <mesh ref={laser3Ref} position={[5, 0, -4]}>
                <cylinderGeometry args={[0.02, 0.02, 15, 8]} />
                <meshBasicMaterial color="#0000ff" transparent opacity={0.8} />
            </mesh>
        </>
    );
}

function DJLights() {
    const light1Ref = useRef<THREE.PointLight>(null);
    const light2Ref = useRef<THREE.PointLight>(null);
    const light3Ref = useRef<THREE.PointLight>(null);
    const light4Ref = useRef<THREE.PointLight>(null);
    const { mouse } = useThree();

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        if (light1Ref.current) {
            light1Ref.current.intensity = 1.5 + Math.sin(time * 8) * 0.8;
            light1Ref.current.position.x = Math.cos(time * 2) * 4 + mouse.x * 5;
            light1Ref.current.color.setHSL(Math.sin(time * 0.5) * 0.5 + 0.5, 1, 0.8);
        }

        if (light2Ref.current) {
            light2Ref.current.intensity = 1.2 + Math.cos(time * 6) * 0.6;
            light2Ref.current.position.y = Math.sin(time * 1.5) * 3 + mouse.y * 4;
            light2Ref.current.color.setHSL(Math.cos(time * 0.3) * 0.5 + 0.5, 1, 0.8);
        }

        if (light3Ref.current) {
            light3Ref.current.intensity = 1.0 + Math.sin(time * 10) * 0.5;
            light3Ref.current.position.z = -2 + Math.cos(time * 4) * 2;
        }

        if (light4Ref.current) {
            light4Ref.current.intensity = 0.8 + Math.sin(time * 12) * 0.4;
            light4Ref.current.position.x = mouse.x * 8;
            light4Ref.current.position.y = mouse.y * 6;
        }
    });

    return (
        <>
            <ambientLight intensity={0.1} color="#ffffff" />
            
            <pointLight
                ref={light1Ref}
                position={[0, 0, 2]}
                intensity={1.5}
                color="#ff0000"
                distance={30}
                decay={1}
            />
            <pointLight
                ref={light2Ref}
                position={[0, 0, 2]}
                intensity={1.2}
                color="#00ff00"
                distance={25}
                decay={1}
            />
            <pointLight
                ref={light3Ref}
                position={[0, 0, 2]}
                intensity={1.0}
                color="#0000ff"
                distance={20}
                decay={1}
            />
            <pointLight
                ref={light4Ref}
                position={[0, 0, 0]}
                intensity={0.8}
                color="#ffffff"
                distance={15}
                decay={1}
            />

            <spotLight
                position={[0, 10, 5]}
                intensity={2}
                color="#ffffff"
                angle={Math.PI / 3}
                penumbra={0.5}
                decay={1}
                distance={50}
            />
        </>
    );
}

function ReactiveParticles() {
    const particlesRef = useRef<THREE.Points>(null);
    const { mouse } = useThree();

    useFrame((state) => {
        if (particlesRef.current) {
            const time = state.clock.elapsedTime;
            particlesRef.current.rotation.x += 0.001;
            particlesRef.current.rotation.y += 0.002;
            
            // Mouse reactive particle movement
            particlesRef.current.position.x = mouse.x * 2;
            particlesRef.current.position.y = mouse.y * 2;
        }
    });

    const particleCount =150;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

        colors[i * 3] = Math.random();
        colors[i * 3 + 1] = Math.random();
        colors[i * 3 + 2] = Math.random();
    }

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particleCount}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={particleCount}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.1}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation
            />
        </points>
    );
}