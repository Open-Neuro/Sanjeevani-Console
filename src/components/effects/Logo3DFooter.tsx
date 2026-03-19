import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Logo3D
 * Renders the brand logo as an interactive 3D mesh for the scene.
 */
export default function Logo3DFooter({
    style,
    color = '#2d3d1a',
    highlightColor = '#b7c25e',
    isStatic = false,
    rotationY = 0.5
}: {
    style?: React.CSSProperties,
    color?: string,
    highlightColor?: string,
    isStatic?: boolean,
    rotationY?: number
}) {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const W = mount.clientWidth || 200;
        const H = mount.clientHeight || 200;

        /* ── Renderer ── */
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mount.appendChild(renderer.domElement);

        /* ── Scene & camera ── */
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 100);
        camera.position.set(0, 0, 5.5);

        /* ── Lighting ── */
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const key = new THREE.DirectionalLight(0xffffff, 2.5);
        key.position.set(5, 5, 5);
        scene.add(key);

        /* ── Petal shape ── */
        const ps = new THREE.Shape();
        ps.moveTo(0, 0);
        ps.bezierCurveTo(0.44, 0.16, 0.52, 0.72, 0, 1.15);
        ps.bezierCurveTo(-0.52, 0.72, -0.44, 0.16, 0, 0);

        const petalGeo = new THREE.ExtrudeGeometry(ps, {
            depth: 0.25,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.03,
            bevelSegments: 12,
            curveSegments: 32,
        });

        petalGeo.computeBoundingBox();
        const bb = petalGeo.boundingBox;
        if (bb) {
            petalGeo.translate(-(bb.max.x + bb.min.x) / 2, 0, -0.12);
        }

        /* ── Materials ── */
        const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            metalness: 0.5,
            roughness: 0.4,
        });

        const matHighlight = new THREE.MeshStandardMaterial({
            color: new THREE.Color(highlightColor),
            metalness: 0.8,
            roughness: 0.2,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
        });

        /* ── Logo group ── */
        const logo = new THREE.Group();
        for (let i = 0; i < 6; i++) {
            const petal = new THREE.Mesh(petalGeo, mat);
            const highlight = new THREE.Mesh(petalGeo, matHighlight);
            petal.rotation.z = highlight.rotation.z = (i / 6) * Math.PI * 2;
            logo.add(petal);
            logo.add(highlight);
        }

        const sphereGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const sphereMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.8, roughness: 0.2 });
        logo.add(new THREE.Mesh(sphereGeo, sphereMat));

        logo.rotation.y = rotationY;
        logo.rotation.x = isStatic ? 0 : 0.2; // Front-on for static logo
        scene.add(logo);

        /* ── Animation loop ── */
        let rafId: number;
        const tick = () => {
            if (!isStatic) {
                logo.rotation.y += 0.01;
            }
            renderer.render(scene, camera);
            rafId = requestAnimationFrame(tick);
        };
        tick();

        /* ── Resize handler ── */
        const onResize = () => {
            const w = mount.clientWidth;
            const h = mount.clientHeight;
            if (w && h) {
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
                renderer.setSize(w, h);
            }
        };
        window.addEventListener('resize', onResize);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', onResize);
            renderer.dispose();
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        };
    }, [color, highlightColor, isStatic, rotationY]);

    return (
        <div
            ref={mountRef}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                pointerEvents: 'none',
                ...style
            }}
        />
    );
}
