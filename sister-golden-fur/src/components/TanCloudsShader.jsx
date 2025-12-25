import { useRef } from 'react'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Tan Clouds Shader
 * Creates an animated cloud-like texture using FBM noise
 * Warm tan/brown/golden colors for soft cloudy atmosphere
 */
const TanCloudsMaterial = shaderMaterial(
    {
        uTime: 0,
        uMouse: new THREE.Vector2(0.5, 0.5),
        uZoom: 1.0, // Controls zoom level (1.0 = normal, higher = zoomed in)
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

        // Pseudo-random number generator
        float random(in vec2 _st) {
            return fract(sin(dot(_st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        // Value noise
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

        // Fractal Brownian Motion for fur texture
        float fbm(in vec2 st) {
            float v = 0.0;
            float a = 0.5;
            mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
            for (int i = 0; i < 6; ++i) {
                v += a * noise(st);
                st = rot * st * 2.0;
                a *= 0.5;
            }
            return v;
        }

        void main() {
            // Apply zoom - higher zoom = more detail
            vec2 st = vUv * (3.0 * uZoom);

            // Mouse interaction - gentle fur movement
            float dist = distance(vUv, uMouse);
            float mouseInfluence = smoothstep(0.5, 0.0, dist);
            st += (uMouse - 0.5) * mouseInfluence * 0.8;

            // Layered FBM for fur texture
            vec2 q = vec2(0.0);
            q.x = fbm(st);
            q.y = fbm(st + vec2(1.0));

            vec2 r = vec2(0.0);
            r.x = fbm(st + q + vec2(1.7, 9.2) + 0.05 * uTime); // Slower movement for fur
            r.y = fbm(st + q + vec2(8.3, 2.8) + 0.04 * uTime);

            float f = fbm(st + r);

            // Tan cloud colors (warm golds, tans, browns)
            vec3 darkCloud = vec3(0.4, 0.25, 0.1);      // Dark brown base
            vec3 mediumCloud = vec3(0.8, 0.55, 0.2);    // Golden tan
            vec3 lightCloud = vec3(0.95, 0.75, 0.45);   // Light golden highlights

            // Build up cloud color with layers
            vec3 color = mix(
                darkCloud,
                mediumCloud,
                clamp((f * f) * 4.0, 0.0, 1.0)
            );
            color = mix(color, mediumCloud, clamp(length(q), 0.0, 1.0));
            color = mix(color, lightCloud, clamp(length(r.x) * 0.7, 0.0, 1.0));

            // Add some glow for soft clouds
            color += vec3(0.15, 0.1, 0.05) * smoothstep(0.5, 0.7, f);

            gl_FragColor = vec4(color, 1.0);
        }
    `
)

// Register the custom material with R3F
extend({ TanCloudsMaterial })

/**
 * TanCloudsBackground Component
 * Renders a full-viewport animated tan clouds shader with zoom capability
 */
export default function TanCloudsBackground({ zoom = 1.0 }) {
    const materialRef = useRef()
    const { viewport } = useThree()

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.elapsedTime
            // Normalize pointer to 0-1 range for UV space
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
            <tanCloudsMaterial ref={materialRef} />
        </mesh>
    )
}
