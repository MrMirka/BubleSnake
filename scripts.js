import * as THREE from './build/three.module.js';
import { OrbitControls } from './js/OrbitControls.js';
import {RGBELoader} from './js/RGBELoader.js'
import {GLTFLoader} from './js/GLTFLoader.js'
import {FlakesTexture} from './js/FlakesTexture.js';
import Stats from './js/stats.module.js';

let camera, scene, renderer, geo, control, mesh, torusMaterial, stats;
let timer;
let mouseX, mouseY;
let normalCount = 1;
init();

function init(){
    window.addEventListener('mousemove', handleMouse);
    mouseX = 0;
    mouseY = 0;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000 );
    scene.add(camera);
   // camera.position.z = 5;


    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    //Orbit
    //control = new OrbitControls(camera, renderer.domElement);  

    const loader = new RGBELoader();
    loader.load('./img/sepulchral_chapel_rotunda_2k.pic', texture => {
        texture.mapping = THREE.EquirectangularRefractionMapping;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapP = THREE.RepeatWrapping;
        texture.repeat.set( 11, 11 );

        let normals = new THREE.TextureLoader().load('./img/normals.jpeg');
        normals.wrapS = THREE.RepeatWrapping;
        normals.wrapT = THREE.RepeatWrapping;
        normals.repeat.set(normalCount,normalCount);
    


        let loadM = new GLTFLoader();
        loadM.load('./torus.glb', gltf => {
            let ring = gltf.scene.children[0];
            gltf.scene.traverse( function( node ) {
                if(node.material) {
                    torusMaterial = node.material;
                    torusMaterial.envMap = texture;
                    torusMaterial.envMapIntensity = 0.6;
                    torusMaterial.metalness = 0.45;
                    torusMaterial.roughness = 0;
                    torusMaterial.normalMap = normals;
                    torusMaterial.normalScale = new THREE.Vector2(3.3, 3.3);
                }
        });
        scene.add(ring);
    });
        
        

    });

    

    //Light
    let light = new THREE.HemisphereLight(0xFF8100, 0xF23359,1);
    scene.add(light);

    let point = new THREE.PointLight(0xffffff, 1);
    point.position.set(-8,2,4);
    scene.add(point);

    stats = new Stats();
	document.body.appendChild( stats.dom );

    animate();
}


function animate(){
    stats.update();
    render();
    requestAnimationFrame(animate);
}

function render(){
    timer = Date.now() * 0.0003;
    camera.position.x = Math.cos(timer *0.5) * 5 ;
    camera.position.z = Math.sin(timer * 0.5) * 5;
    //camera.position.y = Math.abs(Math.sin(timer) * 5);

    //camera.position.x += ( mouseX - camera.position.x ) * .05;
	//camera.position.y += ( - mouseY - camera.position.y ) * .05;
    camera.lookAt(0,0,0);

    normalCount = Math.sin(timer * 0.17) * 2 + 5 ;
    if(torusMaterial != undefined){
        torusMaterial.metalness = Math.abs(Math.sin(timer) - 0.2);
        torusMaterial.roughness = Math.abs(Math.cos(timer) + 0.2);
        torusMaterial.normalMap.repeat.set(normalCount,normalCount);
        torusMaterial.normalMap.rotation += 0.001;
    }



    renderer.render(scene, camera);
}

function handleMouse(evn) {
    mouseX = ( evn.pageX - window.innerWidth ) / 100;
	mouseY = ( evn.pageY - window.innerHeight ) / 100;
}