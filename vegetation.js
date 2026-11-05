import * as THREE from 'three';
// Shared geometry + GPU instancing. No external plant models or photographs are loaded.
export function createVegetation(parent,lightweight=false){
if(!lightweight)return createDesktopGarden(parent);
const garden=new THREE.Group();garden.name='Vegetação · faixas orgânicas';parent.add(garden);
let state=418375;function random(){state=(1664525*state+1013904223)>>>0;return state/4294967296;}
const palette=[0x457928,0x8aa83d,0x24532e,0x657e43,0x653343,0x3d7639];
function leafGeometry(narrow=false){const pos=[],uv=[],index=[],steps=lightweight?3:5;for(let i=0;i<=steps;i++){const t=i/steps,w=Math.pow(Math.sin(Math.PI*t),.78)*(narrow?.14:.33);for(const side of [-1,0,1]){pos.push(side*w,t,Math.sin(t*Math.PI)*.11-Math.abs(side)*w*.16);uv.push((side+1)/2,t);}}for(let i=0;i<steps;i++)for(let j=0;j<2;j++){const a=i*3+j,b=a+3;index.push(a,b,a+1,a+1,b,b+1);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(index);g.computeVertexNormals();return g;}
function leafTexture(variegated=false){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');const grad=ctx.createLinearGradient(0,0,128,0);grad.addColorStop(0,'#9aa88c');grad.addColorStop(.48,'#f0f1d4');grad.addColorStop(1,'#a6b29b');ctx.fillStyle=grad;ctx.fillRect(0,0,128,128);if(variegated){ctx.fillStyle='#f3e8b9';for(let i=0;i<13;i++){ctx.beginPath();ctx.ellipse(random()*128,random()*128,6+random()*12,9+random()*16,random()*3,0,Math.PI*2);ctx.fill();}}
ctx.strokeStyle='rgba(222,235,176,.55)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(64,0);ctx.lineTo(64,128);for(let y=14;y<122;y+=15){ctx.moveTo(64,y);ctx.lineTo(8,y+22);ctx.moveTo(64,y);ctx.lineTo(120,y+22);}ctx.stroke();const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
const broad=leafGeometry(),narrow=leafGeometry(true),texture=leafTexture(),variegated=leafTexture(true);
const buckets=palette.map((color,i)=>({geometry:i===3||i===5?narrow:broad,material:lightweight
 ?new THREE.MeshLambertMaterial({color,map:i===3?variegated:texture,side:THREE.DoubleSide})
 :new THREE.MeshPhysicalMaterial({
  color,map:i===3?variegated:texture,side:THREE.DoubleSide,
  roughness:i===5?.83:.65,sheen:.38,sheenColor:new THREE.Color(color),
  clearcoat:i===5?.04:.12,clearcoatRoughness:.48
 }),matrices:[],colors:[]}));
const matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),scale=new THREE.Vector3(),position=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
function clearServices(x,y){return x>8.10&&x<8.76&&y>.23&&y<.91;}
function leaf(kind,x,y,z,length,angle,tilt=0){if(x<.14||x>9.66||y<.22||y>4.46||clearServices(x,y))return;position.set(x,y,z);q.setFromEuler(new THREE.Euler(tilt,(random()-.5)*1.0,angle));const sizeBoost=lightweight?1.3:1;scale.set(length*sizeBoost,length*sizeBoost,length*sizeBoost);matrix.compose(position,q,scale);buckets[kind].matrices.push(matrix.clone());const v=.82+random()*.28;buckets[kind].colors.push(new THREE.Color(v,v*(.96+random()*.08),v));}
const stems=[];
function stem(a,b,r=.0012){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av);matrix.compose(av.add(bv).multiplyScalar(.5),q.setFromUnitVectors(up,d.clone().normalize()),scale.set(r,d.length(),r));stems.push(matrix.clone());}
function band(x,y){const f=x+.64*Math.sin(y*.95)+.18*Math.sin(y*2.5);const t=((f%3.35)+3.35)%3.35;if(t<.42)return 4;if(t<1.10)return 1;if(t<1.78)return 5;if(t<2.43)return 2;if(t<2.85)return 3;return 0;}
for(let row=0;row<14;row++)for(let col=0;col<19;col++){if(row===1&&col===16)continue;const baseX=.15+col*.5,baseY=.225+row*.3;
for(let k=0;k<(lightweight?2:3);k++){const rootX=baseX+.10+k*(lightweight?.29:.16)+(random()-.5)*.05,rootY=baseY+.13,rootZ=.15;const kind=band(rootX,rootY);
// Layered rosettes and trailing vines; no leaf projects beyond the lamp heads at z≈0.5 m.
const vineLength=.26+random()*.30,lean=(random()-.5)*.26;
for(let j=0;j<(lightweight?6:10);j++){const t=j/(lightweight?5:9),dir=j%2?1:-1;const x=rootX+lean*t,y=rootY+.13-t*vineLength,z=.20+Math.sin(t*Math.PI)*.09+random()*.025;const size=kind===5?.11+random()*.07:.12+random()*.09;leaf(kind,x,y,z,size,dir*(.62+random()*.7)+(kind===5?Math.PI*.25:0),-.15+random()*.6);}
stem([rootX,rootY,rootZ],[rootX+lean,rootY+.13-vineLength,.22]);
for(let j=0;j<(lightweight?4:6);j++){const angle=(j/(lightweight?4:6))*Math.PI*2+(random()-.5)*.5;const length=(kind===3?.19:.14)+random()*.10;leaf(kind,rootX,rootY+.04,.22+random()*.13,length,angle,random()*.8);}
if(kind===5){for(let f=0;f<(lightweight?1:2);f++){const fx=rootX+(f-.5)*.13,fy=rootY+.09,fl=.33+random()*.25;stem([fx,fy,.22],[fx+.04,fy-fl,.29],.0009);for(let j=0;j<(lightweight?5:8);j++){const t=j/(lightweight?5:8),w=.065*(1-t*.65);for(const side of [-1,1])leaf(5,fx+.04*t,fy-fl*t,.26+random()*.03,w,side*1.05+Math.PI,.1);}}}
}}
let total=0;for(const b of buckets){const count=b.matrices.length;if(!count)continue;const inst=new THREE.InstancedMesh(b.geometry,b.material,count);for(let i=0;i<count;i++){inst.setMatrixAt(i,b.matrices[i]);inst.setColorAt(i,b.colors[i]);}inst.computeBoundingSphere();garden.add(inst);total+=count;}
const stemMesh=new THREE.InstancedMesh(new THREE.CylinderGeometry(1,1,1,5,1),new THREE.MeshStandardMaterial({color:0x425c27,roughness:1}),stems.length);stems.forEach((m,i)=>stemMesh.setMatrixAt(i,m));stemMesh.computeBoundingSphere();garden.add(stemMesh);
garden.userData={leaves:total,renderBatches:garden.children.length};return garden;
}


function createDesktopGarden(parent){
 const garden=new THREE.Group();
 garden.name='Vegetação · composição tropical';
 parent.add(garden);
 let seed=61437;
 const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const forms=[
  {width:.34,bend:.14,shape:.46,colors:[0x386527,0x507c2f,0x678d3e]},
  {width:.25,bend:.24,shape:.69,colors:[0x1c432d,0x2b5c33,0x407442]},
  {width:.20,bend:.18,shape:.72,colors:[0x471f30,0x6d2940,0x813648]},
  {width:.13,bend:.31,shape:.83,colors:[0x61814a,0x819657,0x95a365]},
  {width:.18,bend:.19,shape:.64,colors:[0x4b7428,0x679331,0x90ad4b]},
  {width:.29,bend:.17,shape:.57,colors:[0x618745,0x789951,0x92a65c]}
 ];
 const batches=forms.map((form,i)=>{
  const geometry=botanicalBlade(form,i===0||i===5);
  const material=new THREE.MeshPhysicalMaterial({
   map:botanicalSurface(i===3||i===5),side:THREE.DoubleSide,
   roughness:i===1?.49:.68,sheen:.24,sheenColor:new THREE.Color(0x75814c),
   clearcoat:i===0||i===1?.22:.07,clearcoatRoughness:.52
  });
  return {geometry,material,matrices:[],colors:[]};
 });
 const matrix=new THREE.Matrix4(),rotation=new THREE.Quaternion();
 const position=new THREE.Vector3(),size=new THREE.Vector3(),axis=new THREE.Vector3(0,1,0);
 const stems=[];
 function stem(a,b,r){
  const delta=new THREE.Vector3().subVectors(b,a);
  matrix.compose(position.copy(a).lerp(b,.5),rotation.setFromUnitVectors(axis,delta.clone().normalize()),size.set(r,delta.length(),r));
  stems.push(matrix.clone());
 }
 function leaf(kind,x,y,z,length,angle,tilt){
  if(x<.16||x>9.64||y<.25||y>4.43||(x>8.08&&x<8.78&&y>.23&&y<.94))return;
  position.set(x,y,z);
  rotation.setFromEuler(new THREE.Euler(tilt,(rand()-.5)*1.3,angle));
  size.set(length*(.78+rand()*.36),length,length);
  matrix.compose(position,rotation,size);
  const batch=batches[kind],colors=forms[kind].colors;
  batch.matrices.push(matrix.clone());
  batch.colors.push(new THREE.Color(colors[Math.floor(rand()*colors.length)]).multiplyScalar(.74+rand()*.34));
 }
 function patch(x,y){
  const band=x+.58*Math.sin(y*1.31+x*.28)+.25*Math.sin(y*2.1-x*.61);
  if(Math.abs(band-2.65)<.50||Math.abs(band-7.05)<.43)return 2;
  if(Math.abs(band-1.05)<.37||Math.abs(band-5.22)<.45||Math.abs(band-8.71)<.42)return 3;
  if(Math.abs(band-3.64)<.50||Math.abs(band-6.15)<.34)return 4;
  if(Math.sin(band*1.9+y*.77)>.67)return 5;
  return Math.sin(band*1.2-y*.32)>0?0:1;
 }
 for(let row=0;row<14;row++)for(let column=0;column<19;column++){
  if(row===1&&column===16)continue;
  for(let plant=0;plant<3;plant++){
   const x=.215+column*.5+plant*.171+(rand()-.5)*.09;
   const y=.355+row*.3+(rand()-.5)*.09;
   const kind=patch(x,y);
   const root=new THREE.Vector3(x,y,.15);
   if(kind===4||kind===3){
    const fronds=kind===4?3:2;
    for(let f=0;f<fronds;f++){
     const lean=(f-(fronds-1)/2)*.18+(rand()-.5)*.17;
     const drop=.25+rand()*.23;
     let previous=root;
     for(let n=1;n<=7;n++){
      const t=n/7;
      const point=new THREE.Vector3(x+lean*t,y+.13*Math.sin(t*2.5)-drop*t*t,.16+.27*t-.09*t*t);
      stem(previous,point,.00145-.0007*t);
      previous=point;
      const length=(kind===4?.122:.21)*(1-.64*t)*(.85+rand()*.3);
      for(const side of [-1,1])leaf(kind,point.x,point.y,point.z,length,Math.PI+side*(.80+.49*(1-t)),.15+(rand()-.5)*.65);
     }
    }
   }else{
    const drop=.19+rand()*.20,lean=(rand()-.5)*.31;
    let previous=root;
    const count=kind===2?12:8;
    for(let n=0;n<count;n++){
     const t=n/(count-1);
     const point=new THREE.Vector3(x+lean*t,y+.11-drop*t,.20+.18*Math.sin(t*2.1));
     stem(previous,point,.0018-.0007*t);
     previous=point;
     const length=(kind===2?.096:.153)*(1-.32*t)*(.72+rand()*.63);
     leaf(kind,point.x,point.y,point.z,length,(n%2?1:-1)*(.65+rand()*1.9),.10+(rand()-.5)*1.3);
     leaf(kind,point.x,point.y,point.z-.036,length*.78,(n%2?-1:1)*(.85+rand()*1.7),(rand()-.5)*1.35);
    }
    for(let n=0;n<5;n++){
     leaf(kind,x+(rand()-.5)*.09,y+.01,.30+rand()*.11,(kind===2?.105:.17)*(.75+rand()*.4),n*1.26+rand()*.6,(rand()-.5)*1.25);
    }
   }
  }
 }
 for(const {geometry,material,matrices,colors} of batches){
  if(!matrices.length)continue;
  const leaves=new THREE.InstancedMesh(geometry,material,matrices.length);
  matrices.forEach((transform,i)=>{leaves.setMatrixAt(i,transform);leaves.setColorAt(i,colors[i]);});
  leaves.computeBoundingSphere();
  garden.add(leaves);
 }
 const branches=new THREE.InstancedMesh(new THREE.CylinderGeometry(1,.78,1,4),new THREE.MeshStandardMaterial({color:0x4b5934,roughness:.91}),stems.length);
 stems.forEach((transform,i)=>branches.setMatrixAt(i,transform));
 branches.computeBoundingSphere();
 garden.add(branches);
 return garden;
}

function botanicalBlade(form,round){
 const positions=[],uvs=[],faces=[];
 const steps=6;
 for(let i=0;i<=steps;i++){
  const t=i/steps;
  const envelope=Math.pow(Math.sin(Math.PI*t),form.shape)*(round?1.16-.30*t:.84+.28*t);
  for(const side of [-1,0,1]){
   const width=form.width*envelope;
   const edge=Math.abs(side)*width;
   positions.push(side*width*(1+.10*Math.sin(16*t+side)),t,
    form.bend*t*t-.41*edge+.07*edge*Math.sin(21*t+side));
   uvs.push((side+1)*.5,t);
  }
 }
 for(let i=0;i<steps;i++)for(let j=0;j<2;j++){
  const a=i*3+j,b=a+3;
  if(i>0)faces.push(a,a+1,b);
  if(i<steps-1)faces.push(a+1,b+1,b);
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
 geometry.setIndex(faces);
 geometry.computeVertexNormals();
 return geometry;
}

function botanicalSurface(variegated){
 const canvas=document.createElement('canvas');
 canvas.width=canvas.height=128;
 const ctx=canvas.getContext('2d');
 const pixels=ctx.createImageData(128,128);
 let seed=88241;
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){
  const u=x/127,v=y/127,edge=Math.abs(u-.5)*2;
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const grain=seed/4294967296-.5;
  const vein=Math.pow(Math.max(0,Math.cos(52*v-13*edge-4*edge*edge)),20)*(1-edge*.55);
  const rib=Math.exp(-edge*90);
  const mottling=Math.sin(38*u+12*v)*Math.sin(22*v-6*u)+.5*Math.sin(121*u+19*v);
  const cream=variegated?23*Math.pow(edge,2)*(1+.5*Math.sin(21*v+4*u)):0;
  const value=215+12*mottling+14*grain+13*vein+26*rib+cream-21*edge;
  const i=(y*128+x)*4;
  pixels.data.set([value+cream*.45,value,value-8-cream*.42,255],i);
 }
 ctx.putImageData(pixels,0,0);
 const map=new THREE.CanvasTexture(canvas);
 map.colorSpace=THREE.SRGBColorSpace;
 map.anisotropy=4;
 return map;
}
