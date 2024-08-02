import * as THREE from 'three'

const scene = new THREE.Scene()


// ring
let radius = 1.6;
let segments = 32;
const geometry = new THREE.RingGeometry(radius-.3, radius+.3); 

// pivot
const pivot = new THREE.Object3D();
scene.add(pivot);

// Generate random points on the plane surface
const numPoints = segments * 4;
const points = [];
const pointMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: .07 });
for (let i = 0; i < numPoints / segments; i++) {
    for (let j = 0; j < segments; j++) {
        let location = randomPointInRingGeometry(geometry, j);
        let point = renderCircle(location);
        points.push(
            point
        );
    }
}
// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight)
camera.position.z = 3
scene.add(camera)

// Canvas
const canvas = document.querySelector('#c')

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.render(scene, camera)

const animate = () => {

    pivot.rotation.z -= 0.002;

    drawConnections();
    renderer.render(scene, camera);

    // Request the next frame
    requestAnimationFrame(animate);
}

let connections = Array();
animate()

// Function to generate a random point inside the RingGeometry
function randomPointInRingGeometry(ringGeometry, segment) {
    // Get the inner and outer radius from the geometry parameters
    const innerRadius = ringGeometry.parameters.innerRadius;
    const outerRadius = ringGeometry.parameters.outerRadius;

    // Generate a random radius squared to account for the area
    const r = Math.sqrt(Math.random() * (outerRadius * outerRadius - innerRadius * innerRadius) + innerRadius * innerRadius);
    const theta = (Math.random() * 2 * Math.PI / segments) + (2 * Math.PI * segment/segments);
    console.log(segments);

    // Convert polar coordinates to Cartesian coordinates
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);

    return new THREE.Vector3(x, y, 0); // Assuming the ring lies in the XY plane
}

function renderCircle(position) {
    let geometry = new THREE.CircleGeometry(0.02, 32); 
    let material = new THREE.MeshBasicMaterial( { color: 0xffffff } ); 
    let circle = new THREE.Mesh( geometry, material ); 
    circle.position.set(position.x, position.y, position.z);
    pivot.add(circle);
    return circle;
}


function drawConnections() {
    // Remove previous connections
    connections.forEach(line => pivot.remove(line));
    connections = Array();

    // Loop over each pair of points
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const point1 = points[i];
            const point2 = points[j];

            // Calculate distance between the points
            const distance = point1.position.distanceTo(point2.position);

            // If distance is less than threshold, draw a line
            if (distance < .25) {
                const geometry = new THREE.BufferGeometry().setFromPoints([point1.position, point2.position]);
                const material = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true });
                const line = new THREE.Line(geometry, material);
                pivot.add(line);
                connections.push(line);
            }
        }
    }
}