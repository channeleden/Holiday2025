import { useRef } from 'react'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Golden Retriever Fur Shader
 * Creates long, flowing fur strands with wavy curls
 * Tan/golden colors with subtle wave animation
 */
const GoldenFurMaterial = shaderMaterial(
    {
        uTime: 0,
        uMouse: new THREE.Vector2(0.5, 0.5),
        uZoom: 1.0,
    },
    // Vertex Shader
    /* glsl */ `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    // Fragment Shader
    /* glsl */ `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uZoom;
        varying vec2 vUv;

        // Pseudo-random
        float random(in vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        // Smooth noise
        float noise(in vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        // Create elongated fur strands
        float furStrand(vec2 uv, float offset) {
            // Vertical strand with some horizontal waviness
            float x = uv.x;
            float y = uv.y;

            // Add wavy curl to the strand
            float wave = sin(y * 8.0 + offset + uTime * 0.3) * 0.08;
            wave += sin(y * 4.0 + offset * 2.0 + uTime * 0.2) * 0.05;

            // Create the strand - vertical but with wave
            float strand = abs(x - (0.5 + wave));
            strand = smoothstep(0.015, 0.0, strand); // Thin strand

            // Vary opacity along length for natural look
            float fadeTop = smoothstep(0.0, 0.1, y);
            float fadeBottom = smoothstep(1.0, 0.8, y);
            strand *= fadeTop * fadeBottom;

            return strand;
        }

        void main() {
            // Apply zoom
            vec2 uv = vUv * uZoom;

            // Mouse creates gentle wave distortion
            float dist = distance(vUv, uMouse);
            float mouseWave = smoothstep(0.4, 0.0, dist) * 0.02;
            uv.x += sin(vUv.y * 10.0 + uTime) * mouseWave;

            // Create multiple overlapping fur strands
            float furPattern = 0.0;
            float numStrands = 40.0 * uZoom; // More strands when zoomed

            for (float i = 0.0; i < 40.0; i++) {
                if (i > numStrands) break;

                // Offset each strand horizontally
                float offset = i / 40.0;
                vec2 strandUV = vec2(fract(uv.x * 40.0 + offset), uv.y);

                // Add variation to each strand
                float strandNoise = random(vec2(i, 0.0));
                furPattern += furStrand(strandUV, strandNoise * 10.0) * (0.5 + strandNoise * 0.5);
            }

            // Add overall fur texture noise for depth
            float detailNoise = noise(uv * 50.0 + uTime * 0.1);
            furPattern = mix(furPattern, furPattern * detailNoise, 0.3);

            // Golden retriever colors
            vec3 darkFur = vec3(0.35, 0.22, 0.08);     // Deep brown
            vec3 mediumFur = vec3(0.75, 0.50, 0.18);   // Golden tan
            vec3 lightFur = vec3(0.92, 0.70, 0.35);    // Light golden

            // Color variation based on fur density
            vec3 color = mix(darkFur, mediumFur, furPattern * 1.5);
            color = mix(color, lightFur, furPattern * furPattern * 2.0);

            // Add subtle highlights for shine
            float highlight = pow(furPattern, 3.0);
            color += vec3(0.2, 0.15, 0.05) * highlight;

            // Subtle overall lighting variation
            float lighting = noise(vUv * 2.0) * 0.2 + 0.8;
            color *= lighting;

            gl_FragColor = vec4(color, 1.0);
        }
    `
)

// Register the material
extend({ GoldenFurMaterial })

/**
 * GoldenFurBackground Component
 * Renders flowing golden retriever fur
 */
export default function GoldenFurBackground({ zoom = 1.0 }) {
    const materialRef = useRef()
    const { viewport } = useThree()

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.elapsedTime
            materialRef.current.uMouse.set(
                (state.pointer.x + 1) / 2,
                (state.pointer.y + 1) / 2
            )
            materialRef.current.uZoom = zoom
        }
    })

    return (
        <mesh scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            <goldenFurMaterial ref={materialRef} />
        </mesh>
    )
}
