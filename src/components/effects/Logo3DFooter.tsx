import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Logo3D
 * Renders the brand logo as an interactive 3D mesh for the scene.
 * Allows the user to rotate and zoom around the logo.
 */
export default function Logo3DFooter({ style, color = '#2d3d1a', highlightColor = '#b7c25e' }: { style?: React.CSSProperties, color?: string, highlightColor?: string }) {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const W = mount.clientWidth || 400;
        const H = mount.clientHeight || 400;

        /* ── Renderer ── */
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        mount.appendChild(renderer.domElement);

        /* ── Scene & camera ── */
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
        camera.position.set(0, 0.2, 5.8);

        /* ── Lighting ── */
        scene.add(new THREE.AmbientLight(0xffffff, 0.45));

        const key = new THREE.DirectionalLight(0xffffff, 3.0);
        key.position.set(4, 6, 5);
        scene.add(key);

        const fill = new THREE.DirectionalLight(0xffffff, 1.2);
        fill.position.set(-5, -2, 4);
        scene.add(fill);

        const rim = new THREE.DirectionalLight(0xaaaaaa, 0.8);
        rim.position.set(0, -6, -3);
        scene.add(rim);

        /* ── Petal shape ── */
        const ps = new THREE.Shape();
        ps.moveTo(0, 0);
        ps.bezierCurveTo(0.44, 0.16, 0.52, 0.72, 0, 1.15);
        ps.bezierCurveTo(-0.52, 0.72, -0.44, 0.16, 0, 0);

        const petalGeo = new THREE.ExtrudeGeometry(ps, {
            depth: 0.28,
            bevelEnabled: true,
            bevelThickness: 0.07,
            bevelSize: 0.04,
            bevelSegments: 24,
            curveSegments: 64,
        });

        petalGeo.computeBoundingBox();
        const bb = petalGeo.boundingBox;
        if (bb) {
            petalGeo.translate(-(bb.max.x + bb.min.x) / 2, 0, -0.14);
        }

        /* ── Materials ── */
        const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            metalness: 0.6,
            roughness: 0.45,
        });

        const matHighlight = new THREE.MeshStandardMaterial({
            color: new THREE.Color(highlightColor),
            metalness: 0.9,
            roughness: 0.15,
            transparent: true,
            opacity: 0.4,
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

        const sphereGeo = new THREE.SphereGeometry(0.12, 24, 24);
        const sphereMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.9, roughness: 0.1 });
        logo.add(new THREE.Mesh(sphereGeo, sphereMat));

        // Tilt forward to show depth like the original 3D logo
        logo.rotation.x = 0.28;
        scene.add(logo);

        const gleamLight = new THREE.PointLight(0xffffff, 8.0, 15);
        scene.add(gleamLight);

        /* ── Animation loop ── */
        let rafId: number;
        const tick = () => {
            rafId = requestAnimationFrame(tick);

            // Continuously rotate like the main logo
            logo.rotation.y += 0.010;

            // Rotate the light around the logo for a sweeping glint effect
            const time = Date.now() * 0.0015;
            gleamLight.position.x = Math.sin(time) * 4;
            gleamLight.position.y = Math.cos(time) * 2;
            gleamLight.position.z = Math.cos(time) * 4 + 2;

            renderer.render(scene, camera);
        };
        tick();

        /* ── Resize handler ── */
        const onResize = () => {
            const w = mount.clientWidth;
            const h = mount.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', onResize);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', onResize);
            renderer.dispose();
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        };
    }, [color, highlightColor]);

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
