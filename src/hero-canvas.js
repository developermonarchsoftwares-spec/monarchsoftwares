/**
 * Photorealistic 3D Earth Globe
 * High-definition NASA satellite Earth imagery, nocturnal city lights,
 * Rayleigh atmospheric scattering, and telemetry arcs.
 *
 * Requirements:
 * - Firmly anchored ("sticked") in the right area without position shifting.
 * - Increased size for strong visual impact.
 * - Free 360-degree interactive spin in any direction on drag with smooth inertia.
 * - Naturally returns to steady clockwise rotation when idle.
 */
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';

export function initHeroCanvas(containerId = 'hero-canvas-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene setup
    const scene = new THREE.Scene();

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Fixed Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 4000);
    camera.position.set(0, 0, 380);

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Pure transparent WebGL canvas
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Dynamic Lighting for Photorealistic Earth
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.2);
    scene.add(ambientLight);

    // Key sunlight illuminating the visible hemisphere
    const sunLight = new THREE.DirectionalLight(0xffffff, 3.2);
    sunLight.position.set(-250, 250, 400);
    scene.add(sunLight);

    // Cyan/azure atmospheric rim light
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    rimLight.position.set(350, 50, 250);
    scene.add(rimLight);

    // Telemetry & Data Arcs (Sleek, glowing curved trajectories)
    const sampleArcs = [
        { order: 1, startLat: 11.0168, startLng: 76.9558, endLat: 1.3521, endLng: 103.8198, arcAlt: 0.16, color: '#38bdf8' }, // Coimbatore -> Singapore
        { order: 1, startLat: 11.0168, startLng: 76.9558, endLat: 51.5074, endLng: -0.1278, arcAlt: 0.30, color: '#ffffff' }, // Coimbatore -> London
        { order: 1, startLat: 11.0168, startLng: 76.9558, endLat: 25.2048, endLng: 55.2708, arcAlt: 0.14, color: '#38bdf8' }, // Coimbatore -> Dubai
        { order: 2, startLat: 1.3521, startLng: 103.8198, endLat: 35.6762, endLng: 139.6503, arcAlt: 0.20, color: '#67e8f9' }, // Singapore -> Tokyo
        { order: 2, startLat: 37.7749, startLng: -122.4194, endLat: 40.7128, endLng: -74.006, arcAlt: 0.18, color: '#ffffff' }, // SF -> NY
        { order: 3, startLat: 40.7128, startLng: -74.006, endLat: 51.5072, endLng: -0.1276, arcAlt: 0.28, color: '#38bdf8' }, // NY -> London
        { order: 3, startLat: 37.7749, startLng: -122.4194, endLat: 35.6762, endLng: 139.6503, arcAlt: 0.35, color: '#67e8f9' }, // SF -> Tokyo
        { order: 4, startLat: 1.3521, startLng: 103.8198, endLat: -33.8688, endLng: 151.2093, arcAlt: 0.22, color: '#38bdf8' }, // Singapore -> Sydney
        { order: 4, startLat: 51.5072, startLng: -0.1276, endLat: 48.8566, endLng: 2.3522, arcAlt: 0.10, color: '#ffffff' }, // London -> Paris
        { order: 5, startLat: 28.6139, startLng: 77.209, endLat: 1.3521, endLng: 103.8198, arcAlt: 0.18, color: '#38bdf8' }
    ];

    // Global City Beacons
    const cities = [
        { lat: 11.0168, lng: 76.9558, name: 'Coimbatore (HQ)' },
        { lat: 1.3521, lng: 103.8198, name: 'Singapore' },
        { lat: 51.5074, lng: -0.1278, name: 'London' },
        { lat: 37.7749, lng: -122.4194, name: 'San Francisco' },
        { lat: 40.7128, lng: -74.0060, name: 'New York' },
        { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
        { lat: 25.2048, lng: 55.2708, name: 'Dubai' },
        { lat: -33.8688, lng: 151.2093, name: 'Sydney' }
    ];

    // Radar rings on key hubs
    const ringsData = [
        { lat: 11.0168, lng: 76.9558, maxR: 2.8, propSpeed: 2.0, repeatPeriod: 1400 }, // Coimbatore
        { lat: 37.7749, lng: -122.4194, maxR: 2.4, propSpeed: 1.8, repeatPeriod: 1600 }, // SF
        { lat: 51.5074, lng: -0.1278, maxR: 2.4, propSpeed: 1.8, repeatPeriod: 1600 }, // London
        { lat: 1.3521, lng: 103.8198, maxR: 2.4, propSpeed: 1.8, repeatPeriod: 1500 }  // Singapore
    ];

    // Initialize Real 3D Earth Globe with NASA Textures
    const globe = new ThreeGlobe()
        .globeImageUrl('/textures/earth-night.webp')
        .bumpImageUrl('/textures/earth-topology.webp')
        .showAtmosphere(true)
        .atmosphereColor('#38bdf8') // Photorealistic azure atmospheric halo
        .atmosphereAltitude(0.20)
        .arcsData(sampleArcs)
        .arcStartLat(d => d.startLat)
        .arcStartLng(d => d.startLng)
        .arcEndLat(d => d.endLat)
        .arcEndLng(d => d.endLng)
        .arcColor(d => d.color)
        .arcAltitude(d => d.arcAlt)
        .arcStroke(0.5)
        .arcDashLength(0.9)
        .arcDashInitialGap(d => d.order * 1.5)
        .arcDashGap(2.5)
        .arcDashAnimateTime(1900)
        .pointsData(cities)
        .pointColor(() => '#38bdf8')
        .pointAltitude(0.015)
        .pointRadius(1.1)
        .pointsMerge(true)
        .ringsData(ringsData)
        .ringColor(() => 'rgba(56, 189, 248, 0.65)')
        .ringMaxRadius(d => d.maxR)
        .ringPropagationSpeed(d => d.propSpeed)
        .ringRepeatPeriod(d => d.repeatPeriod);

    // Globe Material properties
    const globeMat = globe.globeMaterial();
    globeMat.roughness = 0.65;
    globeMat.metalness = 0.15;

    // Root Group firmly anchored in place (sticked to location)
    const globeGroup = new THREE.Group();
    globeGroup.add(globe);
    scene.add(globeGroup);

    // Initial tilt and orientation
    globe.rotation.x = 0.22;
    globe.rotation.y = -1.65;
    window.__heroGlobe = globe;

    // Responsive Positioning - Anchored in right area with increased size
    function updateResponsiveLayout() {
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;

        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);

        if (w >= 1100) {
            // Desktop: Firmly sticked in right area, elevated to maintain clear separation above banner
            globeGroup.position.set(100, 22, 0);
            globeGroup.scale.set(0.95, 0.95, 0.95);
            camera.position.set(0, 0, 380);
        } else if (w >= 768) {
            // Tablet: Anchored in right area with comfortable bottom clearance
            globeGroup.position.set(65, 8, 0);
            globeGroup.scale.set(0.82, 0.82, 0.82);
            camera.position.set(0, 0, 390);
        } else {
            // Mobile: Centered below headline with clean clearance
            globeGroup.position.set(0, -35, 0);
            globeGroup.scale.set(0.68, 0.68, 0.68);
            camera.position.set(0, 0, 400);
        }
    }

    window.addEventListener('resize', updateResponsiveLayout);
    updateResponsiveLayout();

    // ── Interactive Drag & Free Spin (Sticked in location) ──────────────────────────
    let isDragging = false;
    let prevPointer = { x: 0, y: 0 };
    const spinVelocity = { x: 0, y: -0.003 }; // Default clockwise spin
    const BASE_CLOCKWISE_SPEED = -0.0028;

    const onPointerDown = (e) => {
        isDragging = true;
        prevPointer.x = e.clientX;
        prevPointer.y = e.clientY;
        container.style.cursor = 'grabbing';
    };

    const onPointerMove = (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - prevPointer.x;
        const deltaY = e.clientY - prevPointer.y;

        prevPointer.x = e.clientX;
        prevPointer.y = e.clientY;

        // Direct 1:1 free rotation in any direction
        const rotSpeed = 0.0055;
        globe.rotation.y += deltaX * rotSpeed;
        globe.rotation.x += deltaY * rotSpeed;

        // Clamp vertical pitch to prevent inversion
        globe.rotation.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, globe.rotation.x));

        // Store velocity for momentum
        spinVelocity.y = deltaX * rotSpeed;
        spinVelocity.x = deltaY * rotSpeed;
    };

    const onPointerUp = () => {
        if (!isDragging) return;
        isDragging = false;
        container.style.cursor = 'grab';
    };

    container.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });

    // IntersectionObserver to pause rendering when offscreen
    let isVisible = true;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isVisible = entry.isIntersecting;
        });
    }, { threshold: 0.05 });
    observer.observe(container);

    // Animation Loop: Free inertia spin, smoothly returning to base clockwise rotation
    let animationFrameId;
    const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        if (!isVisible) return;

        if (!prefersReducedMotion) {
            if (!isDragging) {
                // Apply momentum
                globe.rotation.y += spinVelocity.y;
                globe.rotation.x += spinVelocity.x;

                // Damp vertical pitch back toward natural tilt (0.22)
                globe.rotation.x = THREE.MathUtils.lerp(globe.rotation.x, 0.22, 0.015);
                spinVelocity.x *= 0.94;

                // Damp horizontal rotation smoothly toward clockwise rotation
                spinVelocity.y = THREE.MathUtils.lerp(spinVelocity.y, BASE_CLOCKWISE_SPEED, 0.018);
            }
        }

        renderer.render(scene, camera);
    };

    animate();

    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', updateResponsiveLayout);
        container.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
        observer.disconnect();
        renderer.dispose();
    };
}
