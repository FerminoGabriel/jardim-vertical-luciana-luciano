import * as THREE from 'three';
export function createArchitecture(parent,lightweight=true){
const layers={};function group(key){const g=new THREE.Group();g.name=key;layers[key]=g;parent.add(g);return g;}
let seed=73281;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
function noiseTexture(base,range=12,cloud=false){const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');const im=ctx.createImageData(256,256);for(let y=0;y<256;y++)for(let x=0;x<256;x++){const i=(y*256+x)*4;const n=(rand()-.5)*range+(cloud?(Math.sin(x*.03+y*.02)+Math.sin(x*.08-y*.04))*3:0);for(let k=0;k<3;k++)im.data[i+k]=base[k]+n;im.data[i+3]=255;}ctx.putImageData(im,0,0);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;}
const rough=noiseTexture([170,170,170],80),ceramic=noiseTexture([178,86,54],34),cement=noiseTexture([155,151,141],26),paintTex=noiseTexture([47,48,46],5),tileTex=noiseTexture([219,217,208],7,true);
function mat(color,map,bump=.001){return new THREE.MeshStandardMaterial({color,map,roughness:.93,bumpMap:rough,bumpScale:bump});}
const brickMat=mat(0xffffff,ceramic,.0012),mortarMat=mat(0xffffff,cement,.001),renderMat=mat(0xc6bfb0,cement,.0012),skimMat=mat(0xf3f0e6,null,.0002),waterMat=mat(0x75766b,null,.0006),paintMat=mat(0xffffff,paintTex,.00015),rearMat=mat(0xe4e0d6,null,.0006);
function box(g,w,h,d,x,y,z,m){
if(g===layers.floor && 4.9-.0505>x-w/2 && 4.9+.0505<x+w/2 && .07-.0505>z-d/2 && .07+.0505<z+d/2){
 const sh=new THREE.Shape();sh.moveTo(x-w/2,z-d/2);sh.lineTo(x+w/2,z-d/2);sh.lineTo(x+w/2,z+d/2);sh.lineTo(x-w/2,z+d/2);sh.closePath();const hole=new THREE.Path();hole.absarc(4.9,.07,.0505,0,Math.PI*2,true);sh.holes.push(hole);const geo=new THREE.ExtrudeGeometry(sh,{depth:h,bevelEnabled:false,curveSegments:48});geo.rotateX(Math.PI/2);geo.translate(0,y+h/2,0);const o=new THREE.Mesh(geo,m);g.add(o);return o;
}
const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o;}
const bricks=group('bricks'),mortar=group('mortar'),scratch=group('scratch'),render=group('render'),waterproof=group('waterproof'),skim=group('skim'),paint=group('paint'),back=group('back'),floor=group('floor'),left=group('left'),stone=group('stone'),right=group('right'),door=group('door');
// Finished wall envelope stays 200 mm: front face z=0 and back face z=-0.200.
// Running bond, nominal masonry 140 mm, joints 10 mm; finish thicknesses are study assumptions.
// Open masonry chases for the concealed electrical system, capped by the finish layers.
const cuts=[];
function subtract(a,b){const lo=[Math.max(a[0],b[0]),Math.max(a[2],b[2]),Math.max(a[4],b[4])],hi=[Math.min(a[1],b[1]),Math.min(a[3],b[3]),Math.min(a[5],b[5])];if(lo.some((v,i)=>v>=hi[i]))return [a];const out=[],mid=a.slice();for(let k=0;k<3;k++){const j=k*2;if(mid[j]<lo[k]){const t=mid.slice();t[j+1]=lo[k];out.push(t);mid[j]=lo[k];}if(mid[j+1]>hi[k]){const t=mid.slice();t[j]=hi[k];out.push(t);mid[j+1]=hi[k];}}return out;}
// Exclude the new concrete structure from masonry; no electrical chases are cut in concrete.
cuts.push([4.75,5.05,0,3.2,-.202,-.060],[0,9.8,3.2,3.7,-.202,-.060]);
function carve(a){let chunks=[a];for(const c of cuts)chunks=chunks.flatMap(b=>subtract(b,c));return chunks;}
function masonryInstances(g,mat,data,variation=false){const inst=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,data.length),matrix=new THREE.Matrix4(),q=new THREE.Quaternion();data.forEach(([a,b,c,d,e,f],i)=>{matrix.compose(new THREE.Vector3((a+b)/2,(c+d)/2,(e+f)/2),q,new THREE.Vector3(b-a,d-c,f-e));inst.setMatrixAt(i,matrix);if(variation)inst.setColorAt(i,new THREE.Color().setRGB(.88+rand()*.12,.87+rand()*.13,.87+rand()*.13));});g.add(inst);}
masonryInstances(mortar,mortarMat,carve([0,9.8,0,4.65,-.198,-.064]));
const bdata=[];for(let row=0;row<24;row++){const y0=row*.2,y1=Math.min(y0+.2,4.65);if(y0>=4.65)break;const shift=row%2?-.15:0;for(let i=0;i<34;i++){const x0=Math.max(0,shift+i*.3),x1=Math.min(9.8,shift+(i+1)*.3);if(x1-x0<.012)continue;bdata.push(...carve([x0+.005,x1-.005,y0+.005,y1-.005,-.201,-.061]));}}
masonryInstances(bricks,brickMat,bdata,true);
const structure=group('structure');const concreteTexture=noiseTexture([152,153,148],35,true);const concreteMat=mat(0xffffff,concreteTexture,.0013);
// 140 mm structural core shown within the existing 200 mm finished wall; depth is provisional.
box(structure,.30,3.20,.14,4.90,1.60,-.131,concreteMat);
box(structure,9.80,.50,.14,4.90,3.45,-.131,concreteMat);

box(scratch,9.8,4.65,.005,4.9,2.325,-.0585,mat(0xa7a18f,cement,.0025));
box(render,9.8,4.65,.050,4.9,2.325,-.031,renderMat);
box(waterproof,9.8,4.65,.002,4.9,2.325,-.005,waterMat);
box(skim,9.8,4.65,.003,4.9,2.325,-.0025,skimMat);
box(paint,9.8,4.65,.001,4.9,2.325,-.0005,paintMat);
box(back,9.8,4.65,.03,4.9,2.325,-.216,rearMat);
// Monolithic floor group, with 1200 mm setting-out and a visible 2 mm grout joint.
box(floor,9.8,.08,1.5,4.9,-.0492,.75,mat(0xb5b1a5,null,.001));
const tileMaterials=Array.from({length:6},()=>{const m=mat(new THREE.Color().setScalar(.96+rand()*.04),tileTex,.00018);m.roughness=.78;return m;});
for(let ix=-1;ix<9;ix++){const xa=Math.max(0,.7+ix*1.2),xb=Math.min(9.8,.7+(ix+1)*1.2);if(xb<=xa)continue;for(const [za,zb] of [[0,.15],[.15,1.35],[1.35,1.5]]){box(floor,xb-xa-.002,.0092,zb-za-.002,(xa+xb)/2,-.0046,(za+zb)/2,tileMaterials[Math.floor(rand()*6)]);}}
// Left return: 1500 mm long and 4650 mm tall; stone is a separate 40 mm facing layer.
box(left,.2,4.65,1.5,-.1,2.325,.75,rearMat);
if(lightweight){
const stoneMats=Array.from({length:12},()=>mat(new THREE.Color().setHSL(.095+rand()*.035,.09+rand()*.13,.35+rand()*.24),null,.002));
// Irregular, shared polygon boundaries avoid the rectangular appearance of stone tiles.
const rows=16,cols=5,grid=[];for(let r=0;r<=rows;r++){grid[r]=[];for(let c=0;c<=cols;c++)grid[r][c]=[c===0?0:c===cols?1.5:c*1.5/cols+(rand()-.5)*.18,r===0?0:r===rows?4.65:r*4.65/rows+(rand()-.5)*.13];}
box(stone,.002,4.65,1.5,.001,2.325,.75,mat(0x777266,null,.002));
for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const ps=[grid[r][c],grid[r][c+1],grid[r+1][c+1],grid[r+1][c]];const cz=ps.reduce((s,p)=>s+p[0],0)/4,cy=ps.reduce((s,p)=>s+p[1],0)/4;const ring=[];for(let j=0;j<4;j++){const a=ps[j],b=ps[(j+1)%4];ring.push([cz+(a[0]-cz)*.985,cy+(a[1]-cy)*.985]);ring.push([cz+((a[0]+b[0])/2-cz)*.99,cy+((a[1]+b[1])/2-cy)*.99]);}const verts=[],faces=[];verts.push(.024+rand()*.016,cy,cz);for(const [z,y] of ring)verts.push(.02+rand()*.015,y,z);for(const [z,y] of ring)verts.push(.002,y,z);const n=ring.length;for(let j=0;j<n;j++){let k=(j+1)%n;faces.push(0,j+1,k+1,j+1,j+1+n,k+1+n,j+1,k+1+n,k+1);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(faces);geo.computeVertexNormals();const m=stoneMats[Math.floor(rand()*stoneMats.length)].clone();m.flatShading=true;stone.add(new THREE.Mesh(geo,m));}
}else{
 addDetailedMoledo(stone,1.5,4.65);
}
// Right return has a clear opening across its 1500 mm length, with a 2500 mm-high door.
box(right,.2,2.15,1.5,9.9,3.575,.75,rearMat);
const alu=new THREE.MeshStandardMaterial({color:0x222522,roughness:.38,metalness:.75});const glass=new THREE.MeshPhysicalMaterial({color:0xbdd4ce,roughness:.08,metalness:0,transparent:true,opacity:.19,depthWrite:false,side:THREE.DoubleSide});
const doorLocal=new THREE.Group();doorLocal.rotation.y=Math.PI/2;doorLocal.position.set(9.85,0,1.5);door.add(doorLocal);
function frame(parent,x0,y0,w,h,z){box(parent,w,.035,.038,x0+w/2,y0+.0175,z,alu);box(parent,w,.035,.038,x0+w/2,y0+h-.0175,z,alu);box(parent,.035,h,.038,x0+.0175,y0+h/2,z,alu);box(parent,.035,h,.038,x0+w-.0175,y0+h/2,z,alu);box(parent,w-.07,h-.07,.006,x0+w/2,y0+h/2,z,glass);}
box(doorLocal,1.5,.045,.10,.75,.0225,0,alu);box(doorLocal,1.5,.045,.10,.75,2.4775,0,alu);for(const x of [.02,1.48])box(doorLocal,.04,2.5,.10,x,1.25,0,alu);
// With local x reversed into world z, the fixed leaf is the one nearest the garden.
frame(doorLocal,.735,.045,.725,2.41,-.022);frame(doorLocal,.04,.045,.73,2.41,.022);
for(const z of [-.025,.025]){box(doorLocal,1.42,.009,.008,.75,.049,z,alu);box(doorLocal,1.42,.009,.008,.75,2.45,z,alu);}
box(doorLocal,.018,.16,.025,.73,1.2,.052,alu);
// DN100 outlet: outer edge 20 mm from finished garden wall, axis z=70 mm.
const drain=group('drain');drain.userData.label='Saída de esgoto Ø100 mm · centro da parede · borda a 20 mm da parede';
const pipeMat=new THREE.MeshStandardMaterial({color:0xd2d1c9,roughness:.62,side:THREE.DoubleSide});
const outer=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.09,48,1,true),pipeMat);outer.position.set(4.9,-.0445,.07);drain.add(outer);
const inner=new THREE.Mesh(new THREE.CylinderGeometry(.047,.047,.09,48,1,true),pipeMat);inner.position.copy(outer.position);drain.add(inner);
const rim=new THREE.Mesh(new THREE.RingGeometry(.047,.05,48),pipeMat);rim.rotation.x=-Math.PI/2;rim.position.set(4.9,.0005,.07);drain.add(rim);
const dark=new THREE.Mesh(new THREE.CircleGeometry(.047,48),new THREE.MeshBasicMaterial({color:0x11130f,side:THREE.DoubleSide}));dark.rotation.x=-Math.PI/2;dark.position.set(4.9,-.087,.07);drain.add(dark);
// 120 x 120 mm black grate, centred over the existing DN100 outlet.
const grateMat=new THREE.MeshStandardMaterial({color:0x090b0a,roughness:.55,metalness:.45});
const grateSize=.12,edge=.008;
box(drain,grateSize,.004,edge,4.9,.002,.07-grateSize/2+edge/2,grateMat);
box(drain,grateSize,.004,edge,4.9,.002,.07+grateSize/2-edge/2,grateMat);
box(drain,edge,.004,grateSize-edge*2,4.9-grateSize/2+edge/2,.002,.07,grateMat);
box(drain,edge,.004,grateSize-edge*2,4.9+grateSize/2-edge/2,.002,.07,grateMat);
for(let i=0;i<9;i++)box(drain,.004,.004,.104,4.9-.048+i*.012,.002,.07,grateMat);
return layers;
}


function addDetailedMoledo(group,width,height){
 let seed=91379;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const {colorMap,surfaceMap}=mineralMaps();
 const bed=new THREE.Mesh(new THREE.BoxGeometry(.009,height,width),
  new THREE.MeshStandardMaterial({color:0x574d3e,map:colorMap,bumpMap:surfaceMap,bumpScale:.003,roughness:1}));
 bed.position.set(.0045,height/2,width/2);
 group.add(bed);

 // Clip each irregular cell to its neighbors and to the wall perimeter.
 const sites=[];
 const columns=6,rows=18;
 for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
  sites.push([(x+.12+random()*.76)*width/columns,(y+.10+random()*.80)*height/rows]);
 }
 const cells=[];
 for(const site of sites){
  let cell=[[0,0],[width,0],[width,height],[0,height]];
  for(const neighbor of sites){
   if(site===neighbor)continue;
   const dx=neighbor[0]-site[0],dy=neighbor[1]-site[1];
   const limit=(dx*(site[0]+neighbor[0])+dy*(site[1]+neighbor[1]))/2;
   cell=clipStonePolygon(cell,dx,dy,limit);
  }
  // Split selected blocks into unequal smaller pieces, like fitted stone offcuts.
  if(random()<.32){
   const angle=random()*Math.PI,dx=Math.cos(angle),dy=Math.sin(angle);
   const limit=dx*site[0]+dy*site[1]+(random()-.5)*.07;
   const halves=[clipStonePolygon(cell,dx,dy,limit),clipStonePolygon(cell,-dx,-dy,-limit)];
   if(halves.every(poly=>poly.length>=3&&stoneArea(poly)>.006)){
    cells.push(...halves);
    continue;
   }
  }
  cells.push(cell);
 }

 const positions=[],colors=[],uvs=[],indices=[];
 const palette=[0xa89275,0x9a8a74,0xb5a58d,0x82715d,0xc1af91,0x938e81,0xa18162,0xc5baa5,0x766553];
 for(const poly of cells){
  const center=poly.reduce(([x,y],p)=>[x+p[0]/poly.length,y+p[1]/poly.length],[0,0]);
  const tint=new THREE.Color(palette[Math.floor(random()*palette.length)]);
  const thickness=.027+random()*.013;
  const slopeX=(random()-.5)*.08,slopeY=(random()-.5)*.08;
  const tilt=random()*Math.PI,cos=Math.cos(tilt),sin=Math.sin(tilt);
  const uOffset=random(),vOffset=random();
  const ring=poly.flatMap((a,i)=>{
   const b=poly[(i+1)%poly.length];
   const t=.25+random()*.5;
   return [a,[THREE.MathUtils.lerp(a[0],b[0],t),THREE.MathUtils.lerp(a[1],b[1],t)]];
  });
  const gap=.002+random()*.002;
  const chipping=ring.map(()=>.002+random()*.009);
  function vertex(x,z,y,shade){
   positions.push(x,y,z);
   uvs.push((cos*z+sin*y)*1.65+uOffset,(-sin*z+cos*y)*1.65+vOffset);
   colors.push(tint.r*shade,tint.g*shade,tint.b*shade);
  }
  const base=positions.length/3,n=ring.length;
  for(let layer=0;layer<4;layer++){
   ring.forEach(([z,y],i)=>{
    const dz=z-center[0],dy=y-center[1],radius=Math.hypot(dz,dy);
    const inset=[gap,gap,gap+chipping[i],radius*.46][layer];
    const scale=Math.max(.12,1-inset/radius);
    const relief=slopeX*dz+slopeY*dy+(random()-.5)*.004;
    const faceDepth=THREE.MathUtils.clamp(thickness+relief,.023,.040);
    const depth=[.005,faceDepth-.009,faceDepth,Math.min(.04,faceDepth+.0015)][layer];
    const shade=[.56,.70,.94,1][layer]*(.91+random()*.18);
    vertex(depth,center[0]+dz*scale,center[1]+dy*scale,shade);
   });
  }
  const peak=positions.length/3;
  vertex(Math.min(.04,thickness+.001),...center,1);
  for(let i=0;i<n;i++){
   const next=(i+1)%n;
   for(let layer=0;layer<3;layer++){
    const a=base+layer*n,b=a+n;
    indices.push(a+i,b+i,a+next,a+next,b+i,b+next);
   }
   indices.push(base+3*n+i,peak,base+3*n+next);
  }
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
 geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
 geometry.setIndex(indices);
 geometry.computeVertexNormals();
 const material=new THREE.MeshStandardMaterial({
  vertexColors:true,map:colorMap,roughnessMap:surfaceMap,
  bumpMap:surfaceMap,bumpScale:.006,roughness:1
 });
 group.add(new THREE.Mesh(geometry,material));
}

function clipStonePolygon(poly,dx,dy,limit){
 const result=[];
 for(let i=0;i<poly.length;i++){
  const a=poly[i],b=poly[(i+1)%poly.length];
  const da=dx*a[0]+dy*a[1]-limit,db=dx*b[0]+dy*b[1]-limit;
  if(da<=0)result.push(a);
  if((da<0&&db>0)||(da>0&&db<0)){
   const t=da/(da-db);
   result.push([THREE.MathUtils.lerp(a[0],b[0],t),THREE.MathUtils.lerp(a[1],b[1],t)]);
  }
 }
 return result;
}

function stoneArea(poly){
 return Math.abs(poly.reduce((area,[x,y],i)=>{
  const [nx,ny]=poly[(i+1)%poly.length];
  return area+x*ny-y*nx;
 },0))*.5;
}

function mineralMaps(){
 const size=512;
 function makeImage(){
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=size;
  const context=canvas.getContext('2d');
  return {canvas,context,image:context.createImageData(size,size)};
 }
 const color=makeImage(),surface=makeImage();
 function hash(x,y){
  const n=Math.imul(x+631,374761393)^Math.imul(y+127,668265263);
  return ((Math.imul(n^(n>>>13),1274126177)^(n>>>16))>>>0)/4294967295;
 }
 function noise(u,v,frequency){
  const x=u*frequency,y=v*frequency;
  const i=Math.floor(x),j=Math.floor(y);
  const f=x-i,g=y-j;
  const a=f*f*(3-2*f),b=g*g*(3-2*g);
  const wrap=n=>((n%frequency)+frequency)%frequency;
  return THREE.MathUtils.lerp(
   THREE.MathUtils.lerp(hash(wrap(i),wrap(j)),hash(wrap(i+1),wrap(j)),a),
   THREE.MathUtils.lerp(hash(wrap(i),wrap(j+1)),hash(wrap(i+1),wrap(j+1)),a),b);
 }
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size,v=y/size;
  const patch=noise(u,v,8),grain=noise(u,v,148),crystals=hash(x,y);
  const strata=noise(u+.038*Math.sin(2*Math.PI*v),v,27);
  const pits=Math.pow(Math.max(0,1-noise(u,v,62)*2.2),2);
  const fleck=Math.max(0,crystals-.92)*420;
  const tone=216+33*(patch-.5)+26*(strata-.5)+34*(grain-.5)-55*pits+fleck;
  const index=(y*size+x)*4;
  color.image.data.set([tone+3,tone,tone-5,255],index);
  surface.image.data.set([110+51*strata+66*grain+19*crystals-74*pits,218+24*grain+12*pits,255,255],index);
 }
 function texture(source){
  source.context.putImageData(source.image,0,0);
  const map=new THREE.CanvasTexture(source.canvas);
  map.wrapS=map.wrapT=THREE.RepeatWrapping;
  map.anisotropy=8;
  return map;
 }
 const colorMap=texture(color);
 colorMap.colorSpace=THREE.SRGBColorSpace;
 return {colorMap,surfaceMap:texture(surface)};
}
