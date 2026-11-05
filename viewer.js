import * as THREE from 'three';
import {createVegetation} from './vegetation.js?v=28';
import {createArchitecture} from './architecture.js?v=24';
import {OrbitControls} from './vendor/three/examples/jsm/controls/OrbitControls.js';
const canvas=document.querySelector('canvas');
try{
const mobileMode=matchMedia('(pointer:coarse)').matches||innerWidth<800;const renderer=new THREE.WebGLRenderer({canvas,antialias:!mobileMode,powerPreference:'low-power'});renderer.setPixelRatio(mobileMode?.85:Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
const scene=new THREE.Scene();scene.background=new THREE.Color('#e9eae2');
const camera=new THREE.OrthographicCamera(-6,6,4,-4,.001,150);const controls=new OrbitControls(camera,canvas);controls.enableDamping=false;controls.screenSpacePanning=true;controls.minZoom=.25;controls.maxZoom=25;
const ambient=new THREE.HemisphereLight(0xffffff,0x79806b,2.5);scene.add(ambient);const sun=new THREE.DirectionalLight(0xfff6e3,3);sun.position.set(-4,8,6);scene.add(sun);const fill=new THREE.DirectionalLight(0xe4f2ff,1.5);fill.position.set(6,4,-2);scene.add(fill);
const plastic=new THREE.MeshStandardMaterial({color:0x222725,roughness:.72,metalness:.03,side:THREE.DoubleSide});const rimMat=new THREE.MeshStandardMaterial({color:0x303633,roughness:.65});const black=new THREE.MeshStandardMaterial({color:0x171b19,roughness:.48,metalness:.42});const recess=new THREE.MeshStandardMaterial({color:0x080b09,roughness:.9});const diffuser=new THREE.MeshStandardMaterial({color:0xf4e3be,roughness:.5,emissive:0xffc777,emissiveIntensity:0});const wallMat=new THREE.MeshStandardMaterial({color:0xe5dfcf,roughness:.96});
function mesh(g,m,parent,pos){const o=new THREE.Mesh(g,m);if(pos)o.position.set(...pos);parent.add(o);return o;}
function box(parent,w,h,d,x,y,z,mat=plastic){return mesh(new THREE.BoxGeometry(w,h,d),mat,parent,[x,y,z]);}
function rod(parent,a,b,r,mat){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av);const o=mesh(new THREE.CylinderGeometry(r,r,delta.length(),12),mat,parent,av.clone().add(bv).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return o;}
function extrudeProfile(parent,points,x,depth,mat=plastic){const sh=new THREE.Shape();sh.moveTo(...points[0]);for(const v of points.slice(1))sh.lineTo(...v);sh.closePath();const g=new THREE.ExtrudeGeometry(sh,{depth,bevelEnabled:false,curveSegments:24});g.rotateY(-Math.PI/2);g.translate(x+depth,0,0);return mesh(g,mat,parent);}
// Model units: metres; module lower-left rear corner is (0,0,0).
// Overall dimensions are manufacturer dimensions; unquoted shell/rib details are visual approximations.
function moduleModel(){const g=new THREE.Group();g.name='Plastwall 12 L';
box(g,.5,.3,.0035,.25,.15,.00175);
box(g,.492,.004,.17,.25,.007,.088);
const side=new THREE.Shape();side.moveTo(0,.3);side.bezierCurveTo(.008,.17,.06,.119,.199,.113);side.lineTo(.199,.018);side.quadraticCurveTo(.199,0,.18,0);side.lineTo(.006,0);side.lineTo(0,.3);
const sg=new THREE.ExtrudeGeometry(side,{depth:.0035,bevelEnabled:false,curveSegments:28});sg.rotateY(-Math.PI/2);sg.translate(.0035,0,0);mesh(sg,plastic,g);const s2=mesh(sg,plastic,g);s2.position.x=.4965;
// Front lip: 113 mm high. Lower face subtly slopes inwards, matching the official product silhouette.
extrudeProfile(g,[[.178,0],[.192,.01],[.199,.025],[.199,.113],[.195,.113],[.195,.027],[.188,.014],[.178,.004]],.0035,.493);
box(g,.5,.0045,.006,.25,.111,.196,rimMat);box(g,.5,.005,.006,.25,.2975,.003,rimMat);
const curve=new THREE.CubicBezierCurve3(new THREE.Vector3(0,.3,0),new THREE.Vector3(0,.17,.008),new THREE.Vector3(0,.119,.06),new THREE.Vector3(0,.113,.199));const tube=new THREE.TubeGeometry(curve,28,.0018,6,false);mesh(tube,rimMat,g,[.002,0,0]);mesh(tube,rimMat,g,[.498,0,0]);
// Ribs/recesses follow the photographs; these are not a drilling template.
for(const x of [.012,.085,.25,.415,.488]){const h=(x<.02||x>.48)?.023:.047;box(g,.007,h,.004,x,.3-h/2,.005,rimMat);const hole=mesh(new THREE.CircleGeometry(.0023,12),recess,g,[x,.3-h+.005,.0073]);}
for(const x of [.085,.25,.415]){box(g,.006,.059,.014,x,.039,.013,rimMat);box(g,.006,.005,.156,x,.011,.093,rimMat);box(g,.011,.009,.013,x,.004,.168,rimMat);rod(g,[x,.008,.145],[x,-.001,.145],.003,recess);}
return g;}
function lampModel(){
 const g=new THREE.Group();g.name='GreenUP Light-up LJVGD1';
 const head=new THREE.Vector3(0,0,.57), direction=new THREE.Vector3(0,1.36,-.27).normalize();
 const end=(distance)=>head.clone().addScaledVector(direction,distance).toArray();
 box(g,.045,.06,.01,0,0,.005,black);
 rod(g,[0,0,.01],head.toArray(),.006,black);
 rod(g,end(-.035),end(.025),.027,black);
 rod(g,end(.025),end(.028),.022,diffuser);
 return g;
}
const assembly=new THREE.Group();scene.add(assembly);const wall=new THREE.Group(),modules=new THREE.Group(),lamps=new THREE.Group();assembly.add(wall,modules,lamps);const architecture=createArchitecture(wall);
const proto=moduleModel();for(let row=0;row<14;row++)for(let col=0;col<19;col++){if(row===1&&col===16)continue;const m=proto.clone();m.position.set(.15+col*.5,.225+row*.3,.0005);m.userData.label=`M${String(row*19+col+1).padStart(3,'0')} · coluna ${col+1}, fileira ${row+1}`;modules.add(m);}
// Batch repeated module meshes by shared geometry/material, instead of thousands of draw calls.
function batchRepeatedMeshes(group){group.updateMatrixWorld(true);const inv=group.matrixWorld.clone().invert(),buckets=new Map();group.traverse(o=>{if(!o.isMesh)return;const key=o.geometry.uuid+':'+o.material.uuid;if(!buckets.has(key))buckets.set(key,{geometry:o.geometry,material:o.material,matrices:[]});buckets.get(key).matrices.push(new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld));});group.clear();for(const b of buckets.values()){const inst=new THREE.InstancedMesh(b.geometry,b.material,b.matrices.length);b.matrices.forEach((m,i)=>inst.setMatrixAt(i,m));inst.computeBoundingSphere();group.add(inst);}}
batchRepeatedMeshes(modules);
const vegetation=createVegetation(assembly,mobileMode);document.getElementById('vegetation').onchange=e=>{vegetation.visible=e.target.checked;render();};
const lampProto=lampModel();
const projectedLights=[];
function addEmission(lamp){
 const direction=new THREE.Vector3(0,1.36,-.27).normalize();
 const spot=new THREE.SpotLight(0xffc990,0,4,Math.PI/12,.45,2);
 spot.position.set(0,0,.57);spot.position.addScaledVector(direction,.029);
 const target=new THREE.Object3D();target.position.set(0,1.36,.30);
 lamp.add(target,spot);spot.target=target;spot.visible=false;projectedLights.push(spot);
}
const lampHeights=[.14,4.54];
const lampXs=Array.from({length:11},(_,column)=>.40+column*.90);
for(let row=0;row<lampHeights.length;row++){
 for(const [column,x] of lampXs.entries()){
  const lamp=lampProto.clone();
  lamp.position.set(x,lampHeights[row],0);
  if(row===1)lamp.rotation.z=Math.PI;
  const id=String(row*lampXs.length+column+1).padStart(2,'0');
  lamp.userData.label='L'+id+' · GreenUP Light-up · '+Math.round(lampHeights[row]*100)+' cm do piso';
  addEmission(lamp);lamps.add(lamp);
 }
}
// Conceptual electrical layout: embedded boxes and orthogonal conduit centre lines.
// X-ray inspection materials reveal the concealed system without changing its physical position.
const electrical=new THREE.Group();electrical.name='Elétrica · estudo de percurso';assembly.add(electrical);
const conduitMat=new THREE.MeshStandardMaterial({color:0xff9b24,emissive:0xb84606,emissiveIntensity:.4,roughness:.65,depthTest:true,depthWrite:true});
const boxMat=new THREE.MeshStandardMaterial({color:0x347c9c,emissive:0x16435a,emissiveIntensity:.45,roughness:.65,depthTest:true,depthWrite:true});
const pointMat=new THREE.MeshStandardMaterial({color:0x171b19,roughness:.58,metalness:.25});
const pointScrewMat=new THREE.MeshStandardMaterial({color:0x747c7a,roughness:.35,metalness:.8});
const lidMat=new THREE.MeshStandardMaterial({color:0x87c5db,transparent:true,opacity:.58,depthTest:true,depthWrite:true});
let conduitLength=0;
function conduit(a,b){conduitLength+=new THREE.Vector3(...a).distanceTo(new THREE.Vector3(...b));const o=rod(electrical,a,b,.01,conduitMat);o.renderOrder=30;}
function electricalBox(x,y,name,junction=false){const w=.05,h=.10,d=.045;const g=new THREE.Group();
g.position.set(x,y,0);
g.userData.label=name;electrical.add(g);
for(const dx of [-w/2+.0015,w/2-.0015]){const o=box(g,.003,h,d,dx,0,-d/2,boxMat);o.renderOrder=31;}
for(const dy of [-h/2+.0015,h/2-.0015]){const o=box(g,w,.003,d,0,dy,-d/2,boxMat);o.renderOrder=31;}
const rear=box(g,w,h,.002,0,0,-.044,boxMat);rear.renderOrder=31;const lid=box(g,w-.006,h-.006,.002,0,0,.001,lidMat);lid.renderOrder=32;
if(!junction){

 box(g,.05,.10,.008,0,0,.006,pointMat);
 for(const dy of [-.035,.035])rod(g,[0,dy,.010],[0,dy,.012],.0022,pointScrewMat);
}

}
const riserX=9.775,zConduit=-.035,feedHeight=4.60;
conduit([9.8,feedHeight,zConduit],[riserX,feedHeight,zConduit]);
conduit([riserX,feedHeight,zConduit],[riserX,lampHeights[0],zConduit]);
for(const [row,y] of lampHeights.entries()){
 electricalBox(riserX,y,'Derivação · faixa '+(row+1),true);
 conduit([riserX,y,zConduit],[lampXs[0]+.09,y,zConduit]);
 for(const [column,x] of lampXs.entries()){
  const boxX=row===0 && Math.abs(x-4.9)<.01?5.14:x+.09;
  const id=String(row*lampXs.length+column+1).padStart(2,'0');
  electricalBox(boxX,y,'Caixa embutida · L'+id);
 }
}
document.getElementById('electricalSummary').textContent=`22 caixas de luminárias + 2 derivações · aproximadamente ${conduitLength.toFixed(1).replace('.',',')} m de percurso`;
// Water supply concept: independent right-hand riser, two separately valved outlets.
const plumbing=new THREE.Group();plumbing.name='Água · uso e irrigação';assembly.add(plumbing);
const waterPipeMat=new THREE.MeshStandardMaterial({color:0x1977ba,roughness:.6});const brassMat=new THREE.MeshStandardMaterial({color:0xb99b54,roughness:.45,metalness:.65});
function waterPipe(a,b,r=.0125){return rod(plumbing,a,b,r,waterPipeMat);}
const pz=-.035;
waterPipe([9.8,4.35,pz],[9.715,4.35,pz]);waterPipe([9.715,4.35,pz],[9.715,.40,pz]);waterPipe([9.715,.40,pz],[8.30,.40,pz]);
const tapMat=new THREE.MeshStandardMaterial({color:0x111614,roughness:.48,metalness:.55});
for(const [x,name] of [[8.30,'Torneira preta · uso'],[8.55,'Torneira preta · irrigação do jardim']]){
 waterPipe([x,.40,pz],[x,.55,pz]);
 const tap=new THREE.Group();tap.userData.label=name;plumbing.add(tap);
 // Concealed supply to the finished wall, followed by a local sealed extension through the vessel.
 rod(tap,[x,.55,pz],[x,.55,0],.0125,brassMat);
 rod(tap,[x,.55,0],[x,.55,.257],.0125,tapMat);
 rod(tap,[x,.55,.200],[x,.55,.208],.028,tapMat);
 // Garden tap body, downward spout, threaded hose connection and cross handle.
 rod(tap,[x,.55,.250],[x,.55,.291],.019,tapMat);
 rod(tap,[x,.55,.288],[x,.522,.327],.013,tapMat);
 rod(tap,[x,.522,.327],[x,.475,.327],.013,tapMat);
 rod(tap,[x,.479,.327],[x,.466,.327],.016,tapMat);
 for(let i=0;i<4;i++){const ring=mesh(new THREE.TorusGeometry(.0152,.001,6,24),tapMat,tap,[x,.469+i*.003,.327]);ring.rotation.x=Math.PI/2;}
 rod(tap,[x,.55,.272],[x,.603,.272],.008,tapMat);
 rod(tap,[x-.033,.607,.272],[x+.033,.607,.272],.005,tapMat);
 rod(tap,[x,.607,.245],[x,.607,.299],.005,tapMat);
 mesh(new THREE.SphereGeometry(.008,12,8),tapMat,tap,[x,.607,.272]);
 const opening=mesh(new THREE.CircleGeometry(.010,24),recess,tap,[x,.4655,.327]);opening.rotation.x=Math.PI/2;
}
document.getElementById('installations').onchange=({target})=>{
 electrical.visible=target.checked;
 plumbing.visible=target.checked;
 render();
};
const display=new THREE.Group();scene.add(display);display.visible=false;let mode='geral',span=7.8;
let renderPending=false,lastWidth=0,lastHeight=0;function render(){if(renderPending)return;renderPending=true;requestAnimationFrame(()=>{renderPending=false;drawFrame();});}
function drawFrame(){const w=canvas.clientWidth,h=canvas.clientHeight;if(w!==lastWidth||h!==lastHeight){renderer.setSize(w,h,false);lastWidth=w;lastHeight=h;}const aspect=w/h;const s=mode==='modulo'||mode==='luminaria'?Math.max(span,span/aspect):Math.max(span,12/aspect);camera.left=-s*aspect/2;camera.right=s*aspect/2;camera.top=s/2;camera.bottom=-s/2;camera.updateProjectionMatrix();renderer.render(scene,camera);}
function pose(eye,target){camera.zoom=1;camera.position.set(...eye);controls.target.set(...target);controls.update();render();}
const titles={geral:'Perspectiva geral',frente:'Elevação frontal · 19 × 14',lado:'Perfil · parede de 200 mm',topo:'Vista superior',modulo:'Plastwall 12 L · inspeção 3D',luminaria:'GreenUP Light-up · inspeção 3D'};
function view(v){mode=v;document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));document.querySelector('#viewLabel').textContent=titles[v];assembly.visible=!['modulo','luminaria'].includes(v);display.clear();display.visible=!assembly.visible;camera.up.set(0,1,0);span=7.8;
if(v==='modulo'){display.add(proto.clone());span=.62;pose([.85,.53,.85],[.25,.15,.09]);}
else if(v==='luminaria'){const detail=lampProto.clone();addEmission(detail);projectedLights.at(-1).intensity=document.getElementById('glow').checked?4:0;projectedLights.at(-1).visible=document.getElementById('glow').checked&&!mobileMode;display.add(detail);span=.65;pose([.65,.37,.78],[0,-.01,.25]);}
else if(v==='frente')pose([4.9,2.325,15],[4.9,2.325,0]);
else if(v==='lado'){span=6;pose([16,2.325,.15],[4.9,2.325,.15]);}
else if(v==='topo'){camera.up.set(0,0,-1);pose([4.9,16,.15],[4.9,2.325,.15]);}
else pose([10.7,6.5,14],[4.9,2.1,.5]);render();}
for(const b of document.querySelectorAll('[data-view]'))b.onclick=()=>view(b.dataset.view);
for(const [id,g] of Object.entries({modules,lamps}))document.getElementById(id).onchange=e=>{g.visible=e.target.checked;render();};for(const [id,g] of Object.entries(architecture)){const el=document.getElementById(id);if(el)el.onchange=e=>{g.visible=e.target.checked;render();};}document.getElementById('glow').onchange=e=>{const on=e.target.checked;diffuser.emissiveIntensity=on?7:0;projectedLights.forEach(l=>{l.visible=on&&!mobileMode;l.intensity=on?4:0;});ambient.intensity=on?.65:2.5;sun.intensity=on?1:3;fill.intensity=on?.35:1.5;if(on){lamps.visible=true;document.getElementById('lamps').checked=true;}render();};for(const [id,keys] of Object.entries({finishLayer:['paint','skim','waterproof','render','scratch'],wall:['bricks','mortar','back','structure','floor','left','stone','right','door','drain']})){document.getElementById(id).onchange=e=>{keys.forEach(k=>architecture[k].visible=e.target.checked);render();};}document.getElementById('fit').onclick=()=>view(mode);controls.addEventListener('change',render);window.addEventListener('resize',render);
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let start;canvas.addEventListener('pointerdown',e=>start=[e.clientX,e.clientY]);canvas.addEventListener('pointerup',e=>{if(!start||Math.hypot(e.clientX-start[0],e.clientY-start[1])>4||!assembly.visible)return;const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects([...(plumbing.visible?plumbing.children:[]),...(electrical.visible?electrical.children:[]),...(modules.visible?modules.children:[]),...(lamps.visible?lamps.children:[])],true);if(hits.length){let o=hits[0].object;while(o&&!o.userData.label)o=o.parent;if(o)document.querySelector('#viewLabel').textContent=o.userData.label;}});
if(mobileMode){document.querySelector('.badge span').textContent='MODO LEVE';document.querySelector('label:has(#glow)').lastChild.textContent=' Acender difusores · modo leve';}
view('geral');
}catch(e){const el=document.getElementById('error');el.hidden=false;el.textContent='Não foi possível abrir o modelo 3D: '+e.message;}
