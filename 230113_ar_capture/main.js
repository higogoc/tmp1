import * as THREE from '../libs/three.js-r132/build/three.module.js';
import {ARButton} from '../../libs/three.js-r132/examples/jsm/webxr/ARButton.js';


document.addEventListener('DOMContentLoaded', () => {
  const initialize = async() => {
    const arButton = document.querySelector("#ar-button");
    const captureButton = document.querySelector("#capture-button");
    var cup = document.querySelector("#cup");
    const eventsDiv = document.querySelector("#events");



    // check and request webxr session 
    const supported = navigator.xr && await navigator.xr.isSessionSupported('immersive-ar');
    if (!supported) {
      arButton.textContent = "Not Supported";
      arButton.disabled = true;
      return;
    }

    // build three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();
    // preserveDrawingBuffer flag will help you to get the base64 encoding of the current frame The code for that will be something like this
    const loader = new THREE.TextureLoader();
    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, preserveDrawingBuffer: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // create AR object
    const geometry = new THREE.BoxGeometry(0.06, 0.06, 0.06); 
    // const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    const material =  new THREE.MeshBasicMaterial({
            map: loader.load('../cut_dog.jpg', undefined, undefined, function(err) {
                alert('Error');
            }),
        });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0, -0.3);
    scene.add(cube);

    const light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
    scene.add(light);

    // render.xr.addEventListener는 WebXR API에서 사용되는 함수로, 웹 브라우저에서 XR콘텐츠를 구현할 때 사용함.
    // 이 함수는 XRSession 객체에 이벤트리스너를 추가하는데 사용함 
    // 두개 중 start함수를 예를 들면, renderer 객체에 sessionstart 이벤트가 발생할 때마다 consol log를 호출되도록 설정됨
    renderer.xr.addEventListener("sessionstart", (e) => {
      console.log("session start");
    });
    renderer.xr.addEventListener("sessionend", () => {
      console.log("session end");
    });

    let currentSession = null;
    const start = async() => {
        // navigator.xr.requestSession('immersive-ar')는 WebXR API에서 사용되는 함수
        // 브라우저에서 immersive-ar 세션을 요청하는데 사용함. 이 함수는 "Promise"를 반환하며, 성공적으로 요청되면 'XRSession' 객체를 가진 resolve함수를 호출하고, 실패하면 reject함수를 호출함
      currentSession = await navigator.xr.requestSession('immersive-ar', {optionalFeatures: ['dom-overlay'], domOverlay: {root: document.body}});
        // renderer.xr.enabled는 THREE.WebXRManager object의 property로 THREE.js에서 제공하는 라이브러리
        // 브라우저가 WebXR API를 지원하는지 여부와 THREE.WebXRManager가 현재 활성화 되어잇는지 여부를 나타내는 Boolean
        // "true"로 설정하면 브라우저가 WebXR API 를 지원하고 XR Session이 활성상태임을 나타냄
      renderer.xr.enabled = true;
      renderer.xr.setReferenceSpaceType('local');
      await renderer.xr.setSession(currentSession);
      arButton.textContent = "End";

      animate();
  //     renderer.setAnimationLoop(() => {
	// renderer.render(scene, camera);
  //     });
    }
    const end = async() => {
      currentSession.end();
      renderer.setAnimationLoop(null);
      renderer.clear();
      arButton.style.display = "none";
    }
    arButton.addEventListener('click', () => {
      if (currentSession) {
	end();
      } else {
	start();
      }
    });

    const save = async() => {
      console.log("activate save");
      var cap_img;
      cap_img = renderer.domElement.toDataURL();
      //add an HTML element to the end of the body element of an HTML document
      cup.src = cap_img

      var cap_texture = new THREE.TextureLoader().load(cap_img);
      var cap_material = new THREE.MeshBasicMaterial( { map: cap_texture } );
      cube.material = cap_material

      // scene.add(cap_img);

      // output canvas
      // const data = renderer.domElement.toDataURL('image/png');
      // const link = document.createElement('a');
      // link.download = 'photo.png';
      // link.href = data;
      // link.click();

    }



    const add_cube = async() => {
      console.log("add cube");
      const add_geometry = new THREE.BoxGeometry(0.06, 0.06, 0.06); 
      const add_material = new THREE.MeshBasicMaterial({color: 0x00ff00});
      const add_mesh = new THREE.Mesh(add_geometry, add_material);
      add_mesh.position.set(0, 0, -0.3);
      scene.add(add_mesh);

    }
    function animate(){
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
      renderer.setAnimationLoop(animate);
    };

    // 컨트롤러 
    const controller = renderer.xr.getController(0);
    scene.add(controller);
    // controller.addEventListener('selectstart', () => {
    //   eventsDiv.prepend("selectstart \n");
    // });
    // controller.addEventListener('selectend', () => {
    //   eventsDiv.prepend("selectend \n");
    //   save();
    //   add_cube();
    //   console.log("selectend");
    // });
    controller.addEventListener('select', () => {
      const geometry = new THREE.BoxGeometry(0.06, 0.06, 0.06); 
      var cap_img;
      cap_img = renderer.domElement.toDataURL();
      var cap_texture = new THREE.TextureLoader().load(cap_img);
      //const material = new THREE.MeshBasicMaterial( { map: cap_texture } );
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff * Math.random()});
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.applyMatrix4(controller.matrixWorld);
      mesh.quaternion.setFromRotationMatrix(controller.matrixWorld);
      scene.add(mesh);
    });

    captureButton.addEventListener('click', () => {
      if (currentSession) {
        save();
        add_cube();
        console.log("clicked and saved");
      } else {
        console.log("error");
      }
    });


    // AR 내 버튼 만들기
    // const Btn = ARButton.createButton(renderer, {optionalFeatures: ['dom-overlay'], domOverlay: {root: document.body}});
    // document.body.appendChild(renderer.domElement);
    // document.body.appendChild(Btn);
  }

  initialize();
});