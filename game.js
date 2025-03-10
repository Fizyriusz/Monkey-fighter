// Zmienne globalne
let scene, camera, renderer, clock;
let monkey, enemies = [], trees = [], rocks = [];
let score = 0, jumps = 0, punches = 0;
let isJumping = false, isPunching = false, isClimbing = false;
let monkeySize = 1.0;
let gravity = 0.1;
let groundY = 0;
let velocity = { x: 0, y: 0, z: 0 };
let controls = { up: false, down: false, left: false, right: false, jump: false, punch: false, climb: false };
let gameActive = true;
let monkeyColor = 0x8B4513;
let terrainSize = 50;
let enemySpeed = 0.05;

console.log("game.js loaded");

function init() {
    console.log("init called");
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    console.log("Renderer initialized");
    
    clock = new THREE.Clock();
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);
    
    createTerrain();
    createMonkey();
    createEnvironment();
    createEnemies(5);
    setupEventListeners();
    
    animate();
}

function createTerrain() {
    const terrainGeometry = new THREE.PlaneGeometry(terrainSize, terrainSize, 10, 10);
    const terrainMaterial = new THREE.MeshStandardMaterial({ color: 0x4CAF50, side: THREE.DoubleSide });
    const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = groundY;
    scene.add(terrain);
    
    for (let i = 0; i < 10; i++) {
        const hillGeometry = new THREE.SphereGeometry(Math.random() * 2 + 1, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const hillMaterial = new THREE.MeshStandardMaterial({ color: 0x4CAF50 });
        const hill = new THREE.Mesh(hillGeometry, hillMaterial);
        const x = Math.random() * terrainSize - terrainSize / 2;
        const z = Math.random() * terrainSize - terrainSize / 2;
        hill.position.set(x, groundY, z);
        scene.add(hill);
    }
}

function createMonkey() {
    monkey = new THREE.Group();
    
    const bodyGeometry = new THREE.CylinderGeometry(monkeySize * 0.4, monkeySize * 0.4, monkeySize * 0.6, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: monkeyColor });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = monkeySize * 0.5;
    monkey.add(body);
    
    const headGeometry = new THREE.SphereGeometry(monkeySize * 0.3, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: monkeyColor });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = monkeySize * 1.1;
    monkey.add(head);
    
    const earGeometry = new THREE.SphereGeometry(monkeySize * 0.1, 8, 8);
    const earMaterial = new THREE.MeshStandardMaterial({ color: monkeyColor });
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(monkeySize * 0.35, monkeySize * 1.2, 0);
    head.add(leftEar);
    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(-monkeySize * 0.35, monkeySize * 1.2, 0);
    head.add(rightEar);
    
    const faceGeometry = new THREE.SphereGeometry(monkeySize * 0.15, 16, 16);
    const faceMaterial = new THREE.MeshStandardMaterial({ color: 0xE3B58C });
    const face = new THREE.Mesh(faceGeometry, faceMaterial);
    face.position.z = monkeySize * 0.2;
    head.add(face);
    
    const eyeGeometry = new THREE.SphereGeometry(monkeySize * 0.05, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(monkeySize * 0.1, monkeySize * 0.1, monkeySize * 0.25);
    head.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(-monkeySize * 0.1, monkeySize * 0.1, monkeySize * 0.25);
    head.add(rightEye);
    
    const limbGeometry = new THREE.CylinderGeometry(monkeySize * 0.1, monkeySize * 0.1, monkeySize * 0.4, 8);
    const limbMaterial = new THREE.MeshStandardMaterial({ color: monkeyColor });
    
    const leftArm = new THREE.Mesh(limbGeometry, limbMaterial);
    leftArm.position.set(monkeySize * 0.5, monkeySize * 0.5, 0);
    monkey.add(leftArm);
    
    const rightArm = new THREE.Mesh(limbGeometry, limbMaterial);
    rightArm.position.set(-monkeySize * 0.5, monkeySize * 0.5, 0);
    monkey.add(rightArm);
    
    const leftLeg = new THREE.Mesh(limbGeometry, limbMaterial);
    leftLeg.position.set(monkeySize * 0.2, monkeySize * 0.1, 0);
    monkey.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(limbGeometry, limbMaterial);
    rightLeg.position.set(-monkeySize * 0.2, monkeySize * 0.1, 0);
    monkey.add(rightLeg);
    
    const tailGeometry = new THREE.CylinderGeometry(monkeySize * 0.05, monkeySize * 0.02, monkeySize * 0.8, 8);
    const tailMaterial = new THREE.MeshStandardMaterial({ color: monkeyColor });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, monkeySize * 0.2, -monkeySize * 0.4);
    tail.rotation.x = Math.PI / 3;
    monkey.add(tail);
    
    monkey.position.y = groundY + monkeySize * 0.5;
    scene.add(monkey);
}

function createEnvironment() {
    for (let i = 0; i < 8; i++) {
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 8, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        const x = Math.random() * (terrainSize - 10) - (terrainSize / 2 - 5);
        const z = Math.random() * (terrainSize - 10) - (terrainSize / 2 - 5);
        trunk.position.set(x, groundY + 4, z);
        
        const leavesGeometry = new THREE.ConeGeometry(2, 4, 8);
        const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 6;
        trunk.add(leaves);
        
        scene.add(trunk);
        trees.push(trunk);
    }
    
    for (let i = 0; i < 15; i++) {
        const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 0.5 + 0.5);
        const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        const x = Math.random() * (terrainSize - 5) - (terrainSize / 2 - 2.5);
        const z = Math.random() * (terrainSize - 5) - (terrainSize / 2 - 2.5);
        rock.position.set(x, groundY + 0.5, z);
        rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        scene.add(rock);
        rocks.push(rock);
    }
}

function createEnemies(count) {
    for (let i = 0; i < count; i++) {
        const enemyBody = new THREE.Group();
        
        const bodyGeometry = new THREE.SphereGeometry(monkeySize * 0.5, 16, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x964B00 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        enemyBody.add(body);
        
        const headGeometry = new THREE.SphereGeometry(monkeySize * 0.3, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0x964B00 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = monkeySize * 0.6;
        enemyBody.add(head);
        
        const faceGeometry = new THREE.SphereGeometry(monkeySize * 0.15, 16, 16);
        const faceMaterial = new THREE.MeshStandardMaterial({ color: 0xE3B58C });
        const face = new THREE.Mesh(faceGeometry, faceMaterial);
        face.position.z = monkeySize * 0.2;
        head.add(face);
        
        const eyeGeometry = new THREE.SphereGeometry(monkeySize * 0.05, 8, 8);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(monkeySize * 0.1, monkeySize * 0.1, monkeySize * 0.25);
        head.add(leftEye);
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(-monkeySize * 0.1, monkeySize * 0.1, monkeySize * 0.25);
        head.add(rightEye);
        
        const x = Math.random() * (terrainSize - 10) - (terrainSize / 2 - 5);
        const z = Math.random() * (terrainSize - 10) - (terrainSize / 2 - 5);
        enemyBody.position.set(x, groundY + monkeySize * 0.5, z);
        
        const enemy = {
            mesh: enemyBody,
            speed: Math.random() * 0.03 + enemySpeed,
            health: 100,
            direction: new THREE.Vector3(Math.random() * 2 - 1, 0, Math.random() * 2 - 1).normalize(),
            state: "patrol"
        };
        
        scene.add(enemyBody);
        enemies.push(enemy);
    }
}

function setupEventListeners() {
    window.addEventListener('keydown', (event) => {
        switch(event.code) {
            case 'KeyW': controls.up = true; break;
            case 'KeyS': controls.down = true; break;
            case 'KeyA': controls.left = true; break;
            case 'KeyD': controls.right = true; break;
            case 'Space': 
                controls.jump = true;
                if (!isJumping && !isClimbing) jump();
                break;
            case 'KeyR': 
                controls.climb = true;
                attemptClimb();
                break;
        }
    });
    
    window.addEventListener('keyup', (event) => {
        switch(event.code) {
            case 'KeyW': controls.up = false; break;
            case 'KeyS': controls.down = false; break;
            case 'KeyA': controls.left = false; break;
            case 'KeyD': controls.right = false; break;
            case 'Space': controls.jump = false; break;
            case 'KeyR': controls.climb = false; break;
        }
    });
    
    document.addEventListener('mousemove', (event) => {
        if (document.pointerLockElement === document.body) {
            const sensitivity = 0.002; // Zmniejszona czułość dla płynności
            const yaw = -event.movementX * sensitivity;
            const pitch = -event.movementY * sensitivity;
            
            // Aktualizuj rotację kamery płynnie
            camera.rotation.y += yaw;
            camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x + pitch));
        }
    });
    
    document.addEventListener('click', () => {
        document.body.requestPointerLock();
    });
    
    window.addEventListener('mousedown', (event) => {
        if (event.button === 0) punch();
    });
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function jump() {
    if (!isJumping && !isClimbing) {
        isJumping = true;
        velocity.y = 0.3;
        jumps++;
        updateScore();
    }
}

function punch() {
    if (!isPunching) {
        isPunching = true;
        checkPunchCollisions();
        setTimeout(() => {
            isPunching = false;
        }, 300);
        punches++;
        updateScore();
    }
}

function attemptClimb() {
    if (!isClimbing) {
        let nearestTree = null;
        let minDistance = Infinity;
        
        for (const tree of trees) {
            const distance = monkey.position.distanceTo(tree.position);
            if (distance < 3 && distance < minDistance) {
                minDistance = distance;
                nearestTree = tree;
            }
        }
        
        if (nearestTree) {
            isClimbing = true;
            monkey.userData.climbingTree = nearestTree;
            velocity.y = 0;
            monkey.position.x = nearestTree.position.x;
            monkey.position.z = nearestTree.position.z;
        }
    } else {
        isClimbing = false;
        monkey.userData.climbingTree = null;
    }
}

function updateCameraPosition() {
    const distance = 10;
    const height = 5;
    // Płynne śledzenie postaci bez drgań
    const targetPosition = new THREE.Vector3(
        monkey.position.x,
        monkey.position.y + height,
        monkey.position.z + distance
    );
    camera.position.lerp(targetPosition, 0.1); // Interpolacja dla płynności
    camera.lookAt(monkey.position);
}

function checkPunchCollisions() {
    const punchRange = 2;
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        const distance = monkey.position.distanceTo(enemy.mesh.position);
        
        if (distance < punchRange) {
            enemy.health -= 20;
            const direction = new THREE.Vector3().subVectors(enemy.mesh.position, monkey.position).normalize();
            enemy.mesh.position.x += direction.x * 2;
            enemy.mesh.position.z += direction.z * 2;
            enemy.state = "stunned";
            setTimeout(() => {
                if (enemy.health > 0) enemy.state = "chase";
            }, 1000);
            score += 10;
            updateScore();
            
            if (enemy.health <= 0) {
                scene.remove(enemy.mesh);
                enemies.splice(i, 1);
                i--;
                score += 50;
                updateScore();
                setTimeout(() => {
                    if (gameActive) createEnemies(1);
                }, 3000);
            }
        }
    }
}

function updateScore() {
    document.getElementById('score').textContent = `Punkty: ${score} | Skoki: ${jumps} | Uderzenia: ${punches}`;
}

function checkCollisions() {
    for (const rock of rocks) {
        const distance = monkey.position.distanceTo(rock.position);
        if (distance < 1.5) {
            const direction = new THREE.Vector3().subVectors(monkey.position, rock.position).normalize();
            monkey.position.x += direction.x * 0.2;
            monkey.position.z += direction.z * 0.2;
        }
    }
    
    const halfSize = terrainSize / 2;
    if (monkey.position.x > halfSize) monkey.position.x = halfSize;
    if (monkey.position.x < -halfSize) monkey.position.x = -halfSize;
    if (monkey.position.z > halfSize) monkey.position.z = halfSize;
    if (monkey.position.z < -halfSize) monkey.position.z = -halfSize;
}

function updateEnemies(deltaTime) {
    for (const enemy of enemies) {
        switch (enemy.state) {
            case "patrol":
                enemy.mesh.position.x += enemy.direction.x * enemy.speed;
                enemy.mesh.position.z += enemy.direction.z * enemy.speed;
                if (Math.random() < 0.01) {
                    enemy.direction.x = Math.random() * 2 - 1;
                    enemy.direction.z = Math.random() * 2 - 1;
                    enemy.direction.normalize();
                }
                const distanceToPlayer = enemy.mesh.position.distanceTo(monkey.position);
                if (distanceToPlayer < 10) enemy.state = "chase";
                break;
                
            case "chase":
                const directionToPlayer = new THREE.Vector3().subVectors(monkey.position, enemy.mesh.position).normalize();
                enemy.mesh.position.x += directionToPlayer.x * enemy.speed * 1.5;
                enemy.mesh.position.z += directionToPlayer.z * enemy.speed * 1.5;
                const chaseDistance = enemy.mesh.position.distanceTo(monkey.position);
                if (chaseDistance > 15) enemy.state = "patrol";
                if (chaseDistance < 2) enemy.state = "attack";
                break;
                
            case "attack":
                if (Math.random() < 0.02) {
                    const originalColor = monkey.children[0].material.color.clone();
                    monkey.children[0].material.color.set(0xFF0000);
                    setTimeout(() => {
                        monkey.children[0].material.color.copy(originalColor);
                    }, 200);
                    score = Math.max(0, score - 5);
                    updateScore();
                }
                const attackDistance = enemy.mesh.position.distanceTo(monkey.position);
                if (attackDistance > 2) enemy.state = "chase";
                break;
                
            case "stunned":
                break;
        }
        
        const halfSize = terrainSize / 2;
        if (enemy.mesh.position.x > halfSize) enemy.mesh.position.x = halfSize;
        if (enemy.mesh.position.x < -halfSize) enemy.mesh.position.x = -halfSize;
        if (enemy.mesh.position.z > halfSize) enemy.mesh.position.z = halfSize;
        if (enemy.mesh.position.z < -halfSize) enemy.mesh.position.z = -halfSize;
    }
}

function animate() {
    if (!gameActive) return;
    
    requestAnimationFrame(animate);
    
    const deltaTime = clock.getDelta();
    const moveSpeed = 0.2;
    
    // Ruch postaci tylko, gdy nie wspina się
    if (!isClimbing) {
        if (controls.up) {
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
            forward.y = 0;
            forward.normalize().multiplyScalar(moveSpeed);
            monkey.position.add(forward);
        }
        if (controls.down) {
            const backward = new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion);
            backward.y = 0;
            backward.normalize().multiplyScalar(moveSpeed);
            monkey.position.add(backward);
        }
        if (controls.left) {
            const left = new THREE.Vector3(-1, 0, 0).applyQuaternion(camera.quaternion);
            left.y = 0;
            left.normalize().multiplyScalar(moveSpeed);
            monkey.position.add(left);
        }
        if (controls.right) {
            const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
            right.y = 0;
            right.normalize().multiplyScalar(moveSpeed);
            monkey.position.add(right);
        }
    }
    
    if (isClimbing) {
        const tree = monkey.userData.climbingTree;
        if (controls.up) monkey.position.y += 0.1;
        if (controls.down) monkey.position.y -= 0.1;
        
        monkey.position.x = tree.position.x;
        monkey.position.z = tree.position.z;
        
        if (monkey.position.y > tree.position.y + 8) monkey.position.y = tree.position.y + 8;
        if (monkey.position.y < groundY + monkeySize * 0.5) {
            isClimbing = false;
            monkey.userData.climbingTree = null;
        }
    } else {
        velocity.y -= gravity;
        monkey.position.y += velocity.y;
        if (monkey.position.y < groundY + monkeySize * 0.5) {
            monkey.position.y = groundY + monkeySize * 0.5;
            velocity.y = 0;
            isJumping = false;
        }
    }
    
    const time = clock.getElapsedTime();
    if (controls.up || controls.down || controls.left || controls.right) {
        monkey.children[2].rotation.z = Math.sin(time * 5) * 0.5;
        monkey.children[3].rotation.z = -Math.sin(time * 5) * 0.5;
        monkey.children[4].rotation.z = -Math.sin(time * 5) * 0.5;
        monkey.children[5].rotation.z = Math.sin(time * 5) * 0.5;
    } else {
        monkey.children[2].rotation.z = 0;
        monkey.children[3].rotation.z = 0;
        monkey.children[4].rotation.z = 0;
        monkey.children[5].rotation.z = 0;
    }
    
    updateCameraPosition();
    checkCollisions();
    updateEnemies(deltaTime);
    
    renderer.render(scene, camera);
}

window.onload = init;
