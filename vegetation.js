import * as THREE from 'three';
// Shared geometry + GPU instancing. No external plant models or photographs are loaded.
export function createVegetation(parent,lightweight=false){
const garden=new THREE.Group();garden.name='Vegetação · faixas orgânicas';parent.add(garden);
let state=418375;function random(){state=(1664525*state+1013904223)>>>0;return state/4294967296;}
const palette=[0x457928,0x8aa83d,0x24532e,0x657e43,0x653343,0x3d7639];
function leafGeometry(narrow=false){const pos=[],uv=[],index=[],steps=lightweight?3:5;for(let i=0;i<=steps;i++){const t=i/steps,w=Math.pow(Math.sin(Math.PI*t),.78)*(narrow?.14:.33);for(const side of [-1,0,1]){pos.push(side*w,t,Math.sin(t*Math.PI)*.11-Math.abs(side)*w*.16);uv.push((side+1)/2,t);}}for(let i=0;i<steps;i++)for(let j=0;j<2;j++){const a=i*3+j,b=a+3;index.push(a,b,a+1,a+1,b,b+1);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(index);g.computeVertexNormals();return g;}
function leafTexture(variegated=false){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');const grad=ctx.createLinearGradient(0,0,128,0);grad.addColorStop(0,'#9aa88c');grad.addColorStop(.48,'#f0f1d4');grad.addColorStop(1,'#a6b29b');ctx.fillStyle=grad;ctx.fillRect(0,0,128,128);if(variegated){ctx.fillStyle='#f3e8b9';for(let i=0;i<13;i++){ctx.beginPath();ctx.ellipse(random()*128,random()*128,6+random()*12,9+random()*16,random()*3,0,Math.PI*2);ctx.fill();}}
ctx.strokeStyle='rgba(222,235,176,.55)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(64,0);ctx.lineTo(64,128);for(let y=14;y<122;y+=15){ctx.moveTo(64,y);ctx.lineTo(8,y+22);ctx.moveTo(64,y);ctx.lineTo(120,y+22);}ctx.stroke();const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
const broad=leafGeometry(),narrow=leafGeometry(true),texture=leafTexture(),variegated=leafTexture(true);
const buckets=palette.map((color,i)=>({geometry:i===3||i===5?narrow:broad,material:new THREE.MeshLambertMaterial({color,map:i===3?variegated:texture,side:THREE.DoubleSide}),matrices:[],colors:[]}));
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
