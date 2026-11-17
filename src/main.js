import * as THREE from 'three';

// ==========================================
// NAVEGACIÓN
// ==========================================

const screens = document.querySelectorAll('.screen');

function showScreen(number) {
    screens.forEach(screen => screen.classList.remove('active'));

    const target = document.querySelector(`#screen-${number}`);

    if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ==========================================
// STICKERS
// ==========================================

const stickerTimers = new Map();

const publicBase = import.meta.env.BASE_URL;

const stickerConfig = [
    { id: 'sticker-1', screen: 1, file: `${publicBase}stickers/sticker-1.webp` },
    { id: 'sticker-2', screen: 3, file: `${publicBase}stickers/sticker-2.webp` },
    { id: 'sticker-3', screen: 6, file: `${publicBase}stickers/sticker-3.webp` },
    { id: 'sticker-4', screen: 4, file: `${publicBase}stickers/sticker-4.webp` }
];

function createStickers() {
    stickerConfig.forEach(config => {
        const screen = document.querySelector(`#screen-${config.screen}`);
        const card = screen?.querySelector('.glass-card');

        if (!card) {
            console.warn(`No se encontró la tarjeta de la pantalla ${config.screen}`);
            return;
        }

        const img = document.createElement('img');

        img.id = config.id;
        img.className = 'chat-sticker';
        img.src = config.file;
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');

        card.appendChild(img);
        card.classList.add('stickers-enabled');
    });
}

function showSticker(id) {
    const sticker = document.querySelector(`#${id}`);

    if (!sticker) return;

    clearTimeout(stickerTimers.get(id));

    sticker.classList.remove('show', 'hide');
    sticker.style.visibility = 'visible';

    // Reinicia la animación
    void sticker.offsetWidth;

    sticker.classList.add('show');

    const hideTimer = setTimeout(() => {
        sticker.classList.remove('show');
        sticker.classList.add('hide');

        const removeTimer = setTimeout(() => {
            sticker.classList.remove('hide');
            sticker.style.visibility = 'hidden';
        }, 350);

        stickerTimers.set(id, removeTimer);

    }, 2600);

    stickerTimers.set(id, hideTimer);
}

function showStickerForScreen(screenId) {
    const config = stickerConfig.find(item => item.screen === screenId);

    if (config) {
        showSticker(config.id);
    }
}

createStickers();

// Sticker inicial
showStickerForScreen(1);

// Detectar cambios de pantalla
const screenObserver = new MutationObserver(() => {
    const activeScreen = document.querySelector('.screen.active');

    if (!activeScreen) return;

    const screenNumber = Number(activeScreen.id.replace('screen-', ''));

    showStickerForScreen(screenNumber);
});

screens.forEach(screen => {
    screenObserver.observe(screen, {
        attributes: true,
        attributeFilter: ['class']
    });
});

// ==========================================
// BOTONES DE NAVEGACIÓN
// ==========================================

document.querySelectorAll('[data-next]').forEach(button => {
    button.addEventListener('click', () => {
        showScreen(button.dataset.next);
    });
});

// ==========================================
// BOTÓN SÍ
// ==========================================

document.querySelector('#yes-button')?.addEventListener('click', () => {
    showScreen(5);
});

// ==========================================
// BOTÓN NO
// ==========================================

const noButton = document.querySelector('#no-button');
const noHint = document.querySelector('#no-hint');

let noCount = 0;

noButton?.addEventListener('click', () => {

    // Sticker al pulsar NO
    showSticker('sticker-4');

    noCount++;

    if (noCount <= 3) {
        const jokes = [
            'JAJAJA casi casi 🤭',
            'hmmm, estás segura? 👀',
            'bueno, ya no te molesto JAJAJA'
        ];

        const movements = [
            'translate(35px, -12px) rotate(5deg)',
            'translate(-30px, 14px) rotate(-5deg)',
            'translate(15px, -20px) rotate(3deg)'
        ];

        noButton.style.transform = movements[noCount - 1];
        noHint.textContent = jokes[noCount - 1];

    } else {
        noButton.style.transform = 'none';
        noButton.textContent = 'Rechazar';
        noHint.textContent = 'Está bien, puedes elegir libremente 💗';

        showScreen(7);
    }
});

// ==========================================
// SELECCIÓN DEL DÍA
// ==========================================

const dayButtons = document.querySelectorAll('.day');
const chosenDay = document.querySelector('#chosen-day');

dayButtons.forEach(button => {
    button.addEventListener('click', () => {
        chosenDay.textContent = `hasta el ${button.dataset.day} 🌷`;

        showScreen(6);
        createFlowerBurst();
    });
});

// ==========================================
// ESCENA THREE.JS
// ==========================================

const world = document.querySelector('#world');

let scene;
let camera;
let renderer;

const floatingObjects = [];
const petals = [];

let mouseX = 0;
let mouseY = 0;

function init3D() {
    try {
        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(
            55,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );

        camera.position.z = 12;

        renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);

        world.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xffffff, 2));

        const pinkLight = new THREE.PointLight(0xff6b91, 35, 30);
        pinkLight.position.set(-5, 5, 5);
        scene.add(pinkLight);

        const warmLight = new THREE.PointLight(0xffccd5, 25, 30);
        warmLight.position.set(5, -4, 5);
        scene.add(warmLight);

        createFloatingHearts();
        createCherries();
        createBackgroundParticles();

        animate();

    } catch (error) {
        console.error('Error iniciando Three.js:', error);
    }
}

// ==========================================
// CORAZONES 3D
// ==========================================

function createHeart() {
    const shape = new THREE.Shape();

    shape.moveTo(0, 0.3);
    shape.bezierCurveTo(0, 0.3, -0.6, 0.8, -0.8, 0.35);
    shape.bezierCurveTo(-1.1, -0.2, -0.4, -0.65, 0, -1);
    shape.bezierCurveTo(0.4, -0.65, 1.1, -0.2, 0.8, 0.35);
    shape.bezierCurveTo(0.6, 0.8, 0, 0.3, 0, 0.3);

    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.25,
        bevelEnabled: true,
        bevelSegments: 3,
        bevelSize: 0.08,
        bevelThickness: 0.08
    });

    const material = new THREE.MeshPhysicalMaterial({
        color: 0xc9184a,
        roughness: 0.25,
        clearcoat: 1
    });

    return new THREE.Mesh(geometry, material);
}

function createFloatingHearts() {
    for (let i = 0; i < 10; i++) {
        const heart = createHeart();

        heart.position.set(
            (Math.random() - 0.5) * 17,
            (Math.random() - 0.5) * 13,
            (Math.random() - 0.5) * 5
        );

        heart.scale.setScalar(0.15 + Math.random() * 0.28);

        scene.add(heart);

        floatingObjects.push({
            mesh: heart,
            speed: 0.3 + Math.random() * 0.5,
            rotation: Math.random() * 0.5
        });
    }
}

// ==========================================
// CEREZAS 3D
// ==========================================

function createCherries() {
    const cherryMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xa4133c,
        roughness: 0.2,
        clearcoat: 1
    });

    const stemMaterial = new THREE.MeshStandardMaterial({
        color: 0x526b35
    });

    for (let i = 0; i < 4; i++) {
        const group = new THREE.Group();

        for (let j = 0; j < 2; j++) {
            const geometry = new THREE.SphereGeometry(0.38, 32, 32);
            const cherry = new THREE.Mesh(geometry, cherryMaterial);

            cherry.position.set(j * 0.5, j === 0 ? 0 : -0.08, 0);
            group.add(cherry);

            const curve = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(j * 0.5, 0.3, 0),
                new THREE.Vector3(0.25, 0.9, 0),
                new THREE.Vector3(0.3, 1.1, 0)
            );

            const stem = new THREE.Mesh(
                new THREE.TubeGeometry(curve, 16, 0.025, 8, false),
                stemMaterial
            );

            group.add(stem);
        }

        group.position.set(
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 10,
            -1
        );

        group.scale.setScalar(0.65 + Math.random() * 0.35);

        scene.add(group);

        floatingObjects.push({
            mesh: group,
            speed: 0.25 + Math.random() * 0.35,
            rotation: 0.2
        });
    }
}

// ==========================================
// PARTÍCULAS
// ==========================================

function createBackgroundParticles() {
    const positions = [];

    for (let i = 0; i < 180; i++) {
        positions.push(
            (Math.random() - 0.5) * 24,
            (Math.random() - 0.5) * 18,
            (Math.random() - 0.5) * 10
        );
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
    );

    const material = new THREE.PointsMaterial({
        color: 0xc9184a,
        size: 0.045,
        transparent: true,
        opacity: 0.6
    });

    scene.add(new THREE.Points(geometry, material));
}

// ==========================================
// EXPLOSIÓN DE PÉTALOS
// ==========================================

function createFlowerBurst() {
    if (!scene) return;

    const colors = [
        0xc9184a,
        0xff8fab,
        0xffccd5,
        0xffffff,
        0x800f2f
    ];

    for (let i = 0; i < 65; i++) {
        const geometry = new THREE.SphereGeometry(0.08, 8, 8);
        geometry.scale(1, 1.7, 0.35);

        const material = new THREE.MeshStandardMaterial({
            color: colors[Math.floor(Math.random() * colors.length)]
        });

        const petal = new THREE.Mesh(geometry, material);

        petal.position.set(
            (Math.random() - 0.5) * 1.5,
            (Math.random() - 0.5) * 1.5,
            3
        );

        scene.add(petal);

        petals.push({
            mesh: petal,
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.16,
                Math.random() * 0.16 + 0.04,
                (Math.random() - 0.5) * 0.08
            ),
            rotation: Math.random() * 0.15
        });
    }
}

function animatePetals() {
    for (let i = petals.length - 1; i >= 0; i--) {
        const petal = petals[i];

        petal.mesh.position.add(petal.velocity);
        petal.mesh.rotation.z += petal.rotation;

        if (petal.mesh.position.y > 10) {
            scene.remove(petal.mesh);
            petal.mesh.geometry.dispose();
            petal.mesh.material.dispose();
            petals.splice(i, 1);
        }
    }
}

// ==========================================
// RATÓN Y TAMAÑO DE PANTALLA
// ==========================================

window.addEventListener('pointermove', event => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = (event.clientY / window.innerHeight) * 2 - 1;
});

window.addEventListener('resize', () => {
    if (!camera || !renderer) return;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==========================================
// ANIMACIÓN PRINCIPAL
// ==========================================

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now() * 0.001;

    floatingObjects.forEach((object, index) => {
        const mesh = object.mesh;

        mesh.position.y += Math.sin(time * object.speed + index) * 0.002;
        mesh.rotation.y += 0.002 * object.rotation;
        mesh.rotation.z += 0.001;
    });

    camera.position.x += (mouseX * 0.35 - camera.position.x) * 0.025;
    camera.position.y += (-mouseY * 0.35 - camera.position.y) * 0.025;

    camera.lookAt(0, 0, 0);

    animatePetals();

    renderer.render(scene, camera);
}

// ==========================================
// INICIAR
// ==========================================

init3D();