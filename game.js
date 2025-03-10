// Zmienne globalne
let scene, camera, renderer, clock;
let monkey, enemies = [], trees = [], rocks = [];
let score = 0, jumps = 0, punches = 0;
let isJumping = false, isPunching = false, isClimbing = false;
let monkeySize = 1.0;
let gravity = 0.1;
let groundY = 0;
let velocity = { x: 0, y: 0, z: 0 };
let cameraOffset = { x: 0, y: 5, z: 10 };
let controls = { up: false, down: false, left: false, right: false, jump: false, punch: false, climb: false };
let gameActive = true;
let monkeyColor = 0x8B4513; // Brązowy kolor dla małpek
let terrainSize = 50;
let enemySpeed = 0.05;

// Inicjalizacja gry
function init() {
    // Utwórz scenę, kamerę i renderer
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Niebieskie niebo
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(cameraOffset.x, cameraOffset.y, cameraOffset.z);
    camera.lookAt(0, 0, 0);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    clock = new THREE.Clock();
    
    // Utwórz światło
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);
    
    // Utwórz teren (podłoże)
    createTerrain();
    
    // Utwórz małpę gracza
    createMonkey();
    
    // Utwórz elementy otoczenia
    createEnvironment();
    
    // Utwórz przeciwników
    createEnemies(5);
    
    // Ustaw obsługę zdarzeń
    setupEventListeners();
    
    // Uruchom pętlę animacji
    animate();
}

// Tworzenie terenu
function createTerrain() {
    const terrainGeometry = new THREE.PlaneGeometry(terrainSize, terrainSize, 10, 10);
    const terrainMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4CAF50, // Zielona trawa
        side: THREE.DoubleSide,
        wireframe: false
    });
    
    const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrain.rotation.x = Math.PI / 2;
    terrain.position.y = groundY;
    scene.add(terrain);
    
    // Dodaj kilka pagórków dla urozmaicenia terenu
    for (let i = 0; i < 10; i++) {
        const hillGeometry = new THREE.SphereGeometry(Math.random() * 2 + 1, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const hillMaterial = new THREE.MeshStandardMaterial({ color: 0x4CAF50 });
        const hill = new THREE.Mesh(hillGeometry, hillMaterial);
        
        const x = Math.random() * terrainSize - terrainSize/2;
        const z = Math.random() * terrainSize - terrainSize/2;
        hill.position.set(x, groundY, z);
        scene.add(hill);
    }
}

// Tworzenie małpy gracza
function createMonkey() {
    // Ciało małpy
    const bodyGeometry = new THREE.SphereGeometry(monkeySize * 0.5, 16, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: monkeyColor });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = groundY + monkeySize * 0.5;
    
    // Głowa małpy
    const headGeometry = new THREE.SphereGeometry(monkeySize * 0.3, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: monkeyColor });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = monkeySize * 0.6;
    body.add(head);
    
    // Twarz (pysk)
    const faceGeometry = new THREE.SphereGeometry(monkeySize * 0.15, 16, 16);
    const faceMaterial = new THREE.MeshStandardMaterial({ color: 0xE3B58C });
    const face = new THREE.Mesh(faceGeometry, faceMaterial);
    face.position.z = monkeySize * 0.2;
    head.add(face);
    
    // Oczy
    const eyeGeometry = new THREE.SphereGeometry(monkeySize * 0.05, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(monkeySize * 0.1, monkeySize * 0.1, monkeySize * 0.25);
    head.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(-monkeySize * 0.1, monkeySize * 0.1, monkeySize * 0.25);
    head.add(rightEye);
    
    // Kończyny
    const limbGeometry = new THREE.CylinderGeometry(monkeySize * 0.1, monkeySize * 0.1, monkeySize * 0.4);
    const limbMaterial = new THREE.MeshStandardMaterial({ color: monkeyColor });
    
    // Ręce
    const leftArm = new THREE.Mesh(limbGeometry, limbMaterial);
    leftArm.position.set(monkeySize * 0.5, 0, 0);
    leftArm.rotation.z = Math.PI / 2;
    body.add(leftArm);
    
    const rightArm = new THREE.Mesh(limbGeometry, limbMaterial);
    rightArm.position.set(-monkeySize * 0.5, 0, 0);
    rightArm.rotation.z = -Math.PI / 2;
    body.add(rightArm);
    
    // Nogi
    const leftLeg = new THREE.Mesh(limbGeometry, limbMaterial);
    leftLeg.position.set(monkeySize * 0.2, -monkeySize * 0.5, 0);
    body.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(limbGeometry, limbMaterial);
    rightLeg.position.set(-monkeySize * 0.2, -monkeySize * 0.5, 0);
    body.add(rightLeg);
    
    // Ogon
    const tailGeometry = new THREE.CylinderGeometry(monkeySize * 0.08, monkeySize * 0.02, monkeySize * 0.8);
    const tailMaterial = new THREE.MeshStandardMaterial({ color: monkeyColor });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, -monkeySize * 0.2, -monkeySize * 0.4);
    tail.rotation.x = Math.PI / 3;
    body.add(tail);
    
    // Dodaj całą małpę do sceny
    monkey = body;
    scene.add(monkey);
}

// Tworzenie elementów otoczenia
function createEnvironment() {
    // Dodaj drzewa do wspinaczki
    for (let i = 0; i < 8; i++) {
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 8, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        
        const x = Math.random() * (terrainSize - 10) - (terrainSize/2 - 5);
        const z = Math.random() * (terrainSize - 10) - (terrainSize/2 - 5);
        trunk.position.set(x, groundY + 4, z);
        
        // Korona drzewa
        const leavesGeometry = new THREE.SphereGeometry(2, 8, 8);
        const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 4;
        trunk.add(leaves);
        
        scene.add(trunk);
        trees.push(trunk);
    }
    
    // Dodaj kamienie jako przeszkody
    for (let i = 0; i < 15; i++) {
        const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 0.5 + 0.5);
        const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        
        const x = Math.random() * (terrainSize - 5) - (terrainSize/2 - 2.5);
        const z = Math.random() * (terrainSize - 5) - (terrainSize/2 - 2.5);
        rock.position.set(x, groundY + 0.5, z);
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        scene.add(rock);
        rocks.push(rock);
    }
}

// Tworzenie przeciwników
function createEnemies(count) {
    for (let i = 0; i < count; i++) {
        // Tworzymy wrogą małpę podobną do gracza, ale w innym kolorze
        const enemyBody = new THREE.Group();
        
        // Ciało małpy
        const bodyGeometry = new THREE.SphereGeometry(monkeySize * 0.5, 16, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x964B00 }); // Ciemniejszy brąz
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        enemyBody.add(body);
        
        // Głowa małpy
        const headGeometry = new THREE.SphereGeometry(monkeySize * 0.3, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0x964B00 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = monkeySize * 0.6;
        enemyBody.add(head);
        
        // Twarz (pysk)
        const faceGeometry = new THREE.SphereGeometry(monkeySize * 0.15, 16, 16);
        const faceMaterial = new THREE.MeshStandardMaterial({ color: 0xE3B58C });
        const face = new THREE.Mesh(faceGeometry, faceMaterial);
        face.position.z = monkeySize * 0.2;
        head.add(face);
        
        // Oczy
        const eyeGeometry = new THREE.SphereGeometry(monkeySize * 0.05, 8, 8);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xFF0000 }); // Czerwone oczy u przeciwników
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(monkeySize * 0.1, monkeySize * 0.1, monkeySize * 0.25);
        head.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(-monkeySize * 0.1, monkeySize * 0.1, monkeySize * 0.25);
        head.add(rightEye);
        
        // Ustaw pozycję przeciwnika
        const x = Math.random() * (terrainSize - 10) - (terrainSize/2 - 5);
        const z = Math.random() * (terrainSize - 10) - (terrainSize/2 - 5);
        enemyBody.position.set(x, groundY + monkeySize * 0.5, z);
        
        // Dodaj dane przeciwnika
        const enemy = {
            mesh: enemyBody,
            speed: Math.random() * 0.03 + enemySpeed,
            health: 100,
            direction: new THREE.Vector3(
                Math.random() * 2 - 1,
                0,
                Math.random() * 2 - 1
            ).normalize(),
            state: "patrol" // patrol, chase, attack, stunned
        };
        
        scene.add(enemyBody);
        enemies.push(enemy);
    }
}

// Obsługa zdarzeń klawiatury i myszy
function setupEventListeners() {
    window.addEventListener('keydown', (event) => {
        switch(event.code) {
            case 'KeyW': controls.up = true; break;
            case 'KeyS': controls.down = true; break;
            case 'KeyA': controls.left = true; break;
            case 'KeyD': controls.right = true; break;
            case 'Space': 
                controls.jump = true;
                if (!isJumping && !isClimbing) {
                    jump();
                }
                break;
            case 'KeyR': 
                controls.climb = true;
                attemptClimb();
                break;
            case 'KeyQ':
                // Obróć kamerę w lewo
                rotateCamera(-0.1);
                break;
            case 'KeyE':
                // Obróć kamerę w prawo
                rotateCamera(0.1);
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
    
    window.addEventListener('mousedown', (event) => {
        if (event.button === 0) { // lewy przycisk myszy
            controls.punch = true;
            punch();
        }
    });
    
    window.addEventListener('mouseup', (event) => {
        if (event.button === 0) {
            controls.punch = false;
        }
    });
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Funkcja skoku
function jump() {
    if (!isJumping && !isClimbing) {
        isJumping = true;
        velocity.y = 0.3;
        jumps++;
        updateScore();
    }
}

// Funkcja uderzenia
function punch() {
    if (!isPunching) {
        isPunching = true;
        
        // Animacja uderzenia (obrót ręki)
        const punchAnimation = () => {
            // Sprawdź kolizje z przeciwnikami
            checkPunchCollisions();
            
            // Zakończ animację uderzenia po 300ms
            setTimeout(() => {
                isPunching = false;
            }, 300);
        };
        
        punchAnimation();
        punches++;
        updateScore();
    }
}

// Funkcja wspinaczki
function attemptClimb() {
    if (!isClimbing) {
        // Sprawdź, czy małpa jest blisko drzewa
        for (const tree of trees) {
            const distance = monkey.position.distanceTo(tree.position);
            if (distance < 3) {
                isClimbing = true;
                velocity.y = 0; // Zatrzymaj grawitację podczas wspinaczki
                break;
            }
        }
    } else {
        isClimbing = false;
    }
}

// Obracanie kamery
function rotateCamera(angle) {
    const x = cameraOffset.x;
    const z = cameraOffset.z;
    
    cameraOffset.x = x * Math.cos(angle) - z * Math.sin(angle);
    cameraOffset.z = x * Math.sin(angle) + z * Math.cos(angle);
    
    updateCameraPosition();
}

// Aktualizacja pozycji kamery
function updateCameraPosition() {
    camera.position.x = monkey.position.x + cameraOffset.x;
    camera.position.y = monkey.position.y + cameraOffset.y;
    camera.position.z = monkey.position.z + cameraOffset.z;
    camera.lookAt(monkey.position);
}

// Sprawdzanie kolizji uderzenia
function checkPunchCollisions() {
    const punchRange = 2;
    
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        const distance = monkey.position.distanceTo(enemy.mesh.position);
        
        if (distance < punchRange) {
            // Zadaj obrażenia przeciwnikowi
            enemy.health -= 20;
            
            // Efekt odrzutu
            const direction = new THREE.Vector3().subVectors(enemy.mesh.position, monkey.position).normalize();
            enemy.mesh.position.x += direction.x * 2;
            enemy.mesh.position.z += direction.z * 2;
            
            // Zmień stan przeciwnika na ogłuszony
            enemy.state = "stunned";
            setTimeout(() => {
                if (enemy.health > 0) {
                    enemy.state = "chase";
                }
            }, 1000);
            
            // Dodaj punkty
            score += 10;
            updateScore();
            
            // Sprawdź, czy przeciwnik został pokonany
            if (enemy.health <= 0) {
                scene.remove(enemy.mesh);
                enemies.splice(i, 1);
                i--;
                
                // Dodaj punkty za pokonanie przeciwnika
                score += 50;
                updateScore();
                
                // Dodaj nowego przeciwnika po pewnym czasie
                setTimeout(() => {
                    if (gameActive) {
                        createEnemies(1);
                    }
                }, 3000);
            }
        }
    }
}

// Aktualizacja wyniku
function updateScore() {
    document.getElementById('score').textContent = `Punkty: ${score} | Skoki: ${jumps} | Uderzenia: ${punches}`;
}

// Sprawdzanie kolizji
function checkCollisions() {
    // Sprawdź kolizje z kamieniami
    for (const rock of rocks) {
        const distance = monkey.position.distanceTo(rock.position);
        if (distance < 1.5) {
            // Odbij się od kamienia
            const direction = new THREE.Vector3().subVectors(monkey.position, rock.position).normalize();
            monkey.position.x += direction.x * 0.2;
            monkey.position.z += direction.z * 0.2;
        }
    }
    
    // Sprawdź granice terenu
    const halfSize = terrainSize / 2;
    if (monkey.position.x > halfSize) monkey.position.x = halfSize;
    if (monkey.position.x < -halfSize) monkey.position.x = -halfSize;
    if (monkey.position.z > halfSize) monkey.position.z = halfSize;
    if (monkey.position.z < -halfSize) monkey.position.z = -halfSize;
}

// Aktualizacja przeciwników
function updateEnemies(deltaTime) {
    for (const enemy of enemies) {
        switch (enemy.state) {
            case "patrol":
                // Losowy ruch patrolowy
                enemy.mesh.position.x += enemy.direction.x * enemy.speed;
                enemy.mesh.position.z += enemy.direction.z * enemy.speed;
                
                // Zmień kierunek co jakiś czas
                if (Math.random() < 0.01) {
                    enemy.direction.x = Math.random() * 2 - 1;
                    enemy.direction.z = Math.random() * 2 - 1;
                    enemy.direction.normalize();
                }
                
                // Jeśli gracz jest blisko, zacznij pościg
                const distanceToPlayer = enemy.mesh.position.distanceTo(monkey.position);
                if (distanceToPlayer < 10) {
                    enemy.state = "chase";
                }
                break;
                
            case "chase":
                // Pościg za graczem
                const directionToPlayer = new THREE.Vector3().subVectors(monkey.position, enemy.mesh.position).normalize();
                enemy.mesh.position.x += directionToPlayer.x * enemy.speed * 1.5;
                enemy.mesh.position.z += directionToPlayer.z * enemy.speed * 1.5;
                
                // Jeśli gracz jest daleko, wróć do patrolu
                const chaseDistance = enemy.mesh.position.distanceTo(monkey.position);
                if (chaseDistance > 15) {
                    enemy.state = "patrol";
                }
                
                // Jeśli gracz jest bardzo blisko, atakuj
                if (chaseDistance < 2) {
                    enemy.state = "attack";
                }
                break;
                
            case "attack":
                // Zadaj obrażenia graczowi
                if (Math.random() < 0.02) {
                    // Animacja ataku (zmiana koloru małpy)
                    const originalColor = monkey.material.color.clone();
                    monkey.material.color.set(0xFF0000);
                    
                    setTimeout(() => {
                        monkey.material.color.copy(originalColor);
                    }, 200);
                    
                    // Odejmij punkty
                    score = Math.max(0, score - 5);
                    updateScore();
                }
                
                // Jeśli gracz się oddalił, wróć do pościgu
                const attackDistance = enemy.mesh.position.distanceTo(monkey.position);
                if (attackDistance > 2) {
                    enemy.state = "chase";
                }
                break;
                
            case "stunned":
                // Nic nie rób, przeciwnik jest ogłuszony
                break;
        }
        
        // Sprawdź granice terenu dla przeciwników
        const halfSize = terrainSize / 2;
        if (enemy.mesh.position.x > halfSize) enemy.mesh.position.x = halfSize;
        if (enemy.mesh.position.x < -halfSize) enemy.mesh.position.x = -halfSize;
        if (enemy.mesh.position.z > halfSize) enemy.mesh.position.z = halfSize;
        if (enemy.mesh.position.z < -halfSize) enemy.mesh.position.z = -halfSize;
    }
}

// Główna pętla animacji
function animate() {
    if (!gameActive) return;
    
    requestAnimationFrame(animate);
    
    const deltaTime = clock.getDelta();
    
    // Aktualizuj pozycję małpy gracza
    const moveSpeed = 0.2;
    
    // Ruch do przodu/tyłu uwzględniając kierunek kamery
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
    
    // Ruch w lewo/prawo uwzględniając kierunek kamery
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
    
    // Wspinaczka
    if (isClimbing && controls.climb) {
        monkey.position.y += 0.1;
        
        // Sprawdź, czy małpa jest nadal przy drzewie
        let nearTree = false;
        for (const tree of trees) {
            const horizontalDist = new THREE.Vector2(
                monkey.position.x - tree.position.x,
                monkey.position.z - tree.position.z
            ).length();
            
            if (horizontalDist < 3 && Math.abs(monkey.position.y - tree.position.y) < 10) {
                nearTree = true;
                break;
            }
        }
        
        if (!nearTree) {
            isClimbing = false;
        }
    }
    
    // Zastosuj grawitację, jeśli małpa nie wspina się
    if (!isClimbing) {
        velocity.y -= gravity;
        monkey.position.y += velocity.y;
        
        // Sprawdź kolizję z podłożem
        if (monkey.position.y < groundY + monkeySize * 0.5) {
            monkey.position.y = groundY + monkeySize * 0.5;
            velocity.y = 0;
            isJumping = false;
        }
    }
    
    // Aktualizuj pozycję kamery
    updateCameraPosition();
    
    // Sprawdź kolizje
    checkCollisions();
    
    // Aktualizuj przeciwników
    updateEnemies(deltaTime);
    
    renderer.render(scene, camera);
}

// Uruchom grę
window.onload = init;