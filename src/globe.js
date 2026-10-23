import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PLACES, GEBCO_URL } from './data.js';

/** A geographically aligned 3D globe with an official GEBCO WMS relief texture. */
export function createGlobe(element, onPick) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
  camera.position.set(2.1, 1.1, 4.1);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  element.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = .065;
  controls.enablePan = false;
  controls.minDistance = 2.25;
  controls.maxDistance = 7.8;
  controls.rotateSpeed = .5;
  controls.zoomSpeed = .72;
  controls.addEventListener('start', () => { cameraDestination = null; });
  scene.add(new THREE.AmbientLight(0xb4f0e9, .65));
  const sun = new THREE.DirectionalLight(0xe5ffff, 2.4);
  sun.position.set(4, 3, 6);
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0x0c8e9c, 1.4);
  rim.position.set(-4, -1, -5);
  scene.add(rim);
  const radius = 1.32;
  const globeGeometry = new THREE.SphereGeometry(radius, 100, 70);
  const globeMat = new THREE.MeshStandardMaterial({color: 0x154f64, roughness: 1, metalness: 0, emissive: 0x061b23, emissiveIntensity: .15 });
  const globe = new THREE.Mesh(globeGeometry, globeMat);
  scene.add(globe);
  // In the absence of a texture we retain a clearly stylized (not measured) globe.
  const latLines = new THREE.Group();
  for (let lat=-75;lat<=75;lat+=15) {
    let pts=[];
    for (let lon=-180;lon<=180;lon+=3) pts.push(lonLatToVec(lat,lon,radius+.002));
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x9bd1d0,transparent:true,opacity:.045,depthWrite:false}));latLines.add(line);
  }
  for (let lon=-180;lon<180;lon+=20) {
    let pts=[];
    for (let lat=-90;lat<=90;lat+=3) pts.push(lonLatToVec(lat,lon,radius+.002));
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x80b1ba,transparent:true,opacity:.055,depthWrite:false}));latLines.add(line);
  }
  scene.add(latLines);
  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(radius*1.085,72,48),new THREE.MeshBasicMaterial({color:0x41d8e0,transparent:true,opacity:.065,side:THREE.BackSide,depthWrite:false}));
  scene.add(atmosphere);
  const halo = new THREE.Mesh(new THREE.RingGeometry(radius*1.08,radius*1.1,128),new THREE.MeshBasicMaterial({color:0x36b9c6,transparent:true,opacity:.08,side:THREE.DoubleSide,depthWrite:false}));
  halo.rotation.x=Math.PI/3;
  scene.add(halo);
  let textureStatus='loading';
  new THREE.TextureLoader().load(GEBCO_URL, texture => {
    texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);
    globeMat.map=texture;
    globeMat.color.set(0xd5e8e8);
    globeMat.emissiveIntensity=.05;
    globeMat.needsUpdate=true;
    textureStatus='GEBCO 2026';
    latLines.visible=false;
  },undefined,()=>{
    textureStatus='Stylized fallback';
    // Transparent disclosure in the user-visible map. The 2D WMS remains directly available.
  });
  const markers=[];
  const markerCollection=new THREE.Group();
  const markerGeo=new THREE.SphereGeometry(.015,12,10);
  const haloGeo=new THREE.RingGeometry(.023,.029,24);
  for(const place of PLACES) {
    const pos=lonLatToVec(place.lat,place.lon,radius+.023);
    const marker=new THREE.Mesh(markerGeo,new THREE.MeshBasicMaterial({color:0xb5fff0}));
    marker.position.copy(pos);
    marker.userData.placeId=place.id;
    const ring=new THREE.Mesh(haloGeo,new THREE.MeshBasicMaterial({color:0x8feae1,transparent:true,opacity:.48,side:THREE.DoubleSide,depthWrite:false}));
    ring.position.copy(pos.clone().multiplyScalar((radius+.035)/(radius+.023)));
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),pos.clone().normalize());
    ring.userData.placeId=place.id;
    markerCollection.add(marker,ring);
    markers.push({place,marker,ring});
  }
  scene.add(markerCollection);
  const starsCount=520;
  const starPositions=new Float32Array(starsCount*3);
  for(let i=0;i<starsCount;i++) {
    const r=7+Math.random()*15;
    const theta=Math.random()*Math.PI*2;
    const phi=Math.acos(2*Math.random()-1);
    starPositions[i*3]=r*Math.sin(phi)*Math.cos(theta);
    starPositions[i*3+1]=r*Math.cos(phi);
    starPositions[i*3+2]=r*Math.sin(phi)*Math.sin(theta);
  }
  const starGeometry=new THREE.BufferGeometry();
  starGeometry.setAttribute('position',new THREE.BufferAttribute(starPositions,3));
  const starField=new THREE.Points(starGeometry,new THREE.PointsMaterial({color:0xb8e9ea,size:.018,transparent:true,opacity:.35,sizeAttenuation:true}));
  scene.add(starField);
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  let downPos=null,activeId='challenger',cameraDestination=null,frame=0,disposed=false;
  renderer.domElement.addEventListener('pointerdown',ev=>{downPos={x:ev.clientX,y:ev.clientY}});
  renderer.domElement.addEventListener('pointerup',ev=>{
    if(!downPos||Math.hypot(ev.clientX-downPos.x,ev.clientY-downPos.y)>6)return;
    const rect=renderer.domElement.getBoundingClientRect();
    pointer.set(((ev.clientX-rect.left)/rect.width)*2-1,-((ev.clientY-rect.top)/rect.height)*2+1);
    raycaster.setFromCamera(pointer,camera);
    const intersects=raycaster.intersectObjects(markerCollection.children,false);
    if(intersects.length)onPick(intersects[0].object.userData.placeId);
    downPos=null;
  });
  function select(id){activeId=id;for(const p of markers){const isActive=p.place.id===id;p.marker.scale.setScalar(isActive?1.7:1);p.ring.material.opacity=isActive?.9:.43;p.ring.scale.setScalar(isActive?1.7:1);}}
  function focus(lat,lon){const target=lonLatToVec(lat,lon,4);cameraDestination=target;}
  function zoom(delta){cameraDestination=null;const dist=camera.position.length();camera.position.setLength(Math.min(7.8,Math.max(2.25,dist*(delta>0?.79:1.25))));}
  function reset(){cameraDestination=new THREE.Vector3(2.1,1.1,4.1);}
  function resize(){const r=element.getBoundingClientRect();if(r.width<=0||r.height<=0)return;camera.aspect=r.width/r.height;camera.updateProjectionMatrix();renderer.setSize(r.width,r.height,false)}
  const ro=new ResizeObserver(resize);ro.observe(element);resize();
  function render(){if(disposed)return;frame=requestAnimationFrame(render);controls.update();if(cameraDestination){camera.position.lerp(cameraDestination,.05);if(camera.position.distanceTo(cameraDestination)<.012)cameraDestination=null;}const t=performance.now()*.001;markers.forEach((p,i)=>{p.ring.scale.setScalar((p.place.id===activeId?1.7:1)*(1+.15*Math.sin(t*1.8+i)));});halo.rotation.z+=.00012;renderer.render(scene,camera);}
  select(activeId);render();
  return {select,focus,zoom,reset,resize,getStatus:()=>textureStatus,destroy:()=>{disposed=true;cancelAnimationFrame(frame);ro.disconnect();controls.dispose();renderer.dispose();globeGeometry.dispose();starGeometry.dispose();markerGeo.dispose();haloGeo.dispose();globeMat.dispose();}};
}
function lonLatToVec(lat,lon,r){const latitude=lat*Math.PI/180,longitude=lon*Math.PI/180;return new THREE.Vector3(r*Math.cos(latitude)*Math.cos(longitude),r*Math.sin(latitude),-r*Math.cos(latitude)*Math.sin(longitude));}