const linkThaiNames=['เริ่มต้นหรือสิ้นสุด','เส้นแสดงทิศทาง','การประมวลผล','รับข้อมูลทางแป้นพิมพ์','การตัดสินใจ','จุดเชื่อมต่อ','แสดงผลบนหน้าจอ','รับเข้าหรือส่งออกทั่วไป'];
const chooseLink=document.querySelector('#chooseLink');
let linkLeft,linkRight,linkPairs,linkSelected,linkTries,linkEnded,linkFeedback,dragStart;
function resetLink(){
 linkLeft=shuffle(indices);linkRight=shuffle(indices);linkPairs=new Set();
 linkSelected=null;linkTries=0;linkEnded=false;linkFeedback='แตะสัญลักษณ์แล้วแตะชื่อ หรือใช้วิธีลากเส้น';
}
function drawLink(){
 if(linkEnded){
  game.innerHTML='<section class="summary"><h2 id="resultTitle" tabindex="-1">จบเกม · สรุปคะแนน</h2><p>โยงเส้นหาคู่</p><p class="result">'+linkPairs.size+' <span>/ 8 คะแนน</span></p><progress value="'+linkPairs.size+'" max="8" aria-label="คะแนนที่ได้"></progress><p>โยงถูก '+linkPairs.size+' คู่ · ลอง '+linkTries+' ครั้ง</p><button class="primary" data-link="replay">เล่นอีกครั้ง</button></section>';
  return;
 }
 const cards=(ids,side)=>ids.map((id,i)=>{
  const done=linkPairs.has(id);
  return '<button class="card link-card '+(side==='left'?'symbol ':'')+(done?'done':'')+'" data-link="card" data-side="'+side+'" data-id="'+id+'" aria-pressed="'+(linkSelected?.side===side&&linkSelected.id===id)+'" '+(done?'disabled ':'')+(side==='left'?'aria-label="สัญลักษณ์ตัวเลือก '+(i+1)+'"':'')+'>'+(side==='left'?mark(id):'<span class="link-name-th">'+linkThaiNames[id]+'</span><span class="link-name-en" lang="en">'+symbols[id][2]+'</span>')+'</button>';
 }).join('');
 game.innerHTML='<div class="bar"><h2>โยงเส้นหาคู่</h2><span class="score">'+linkPairs.size+' / 8 คู่</span></div><p>เชื่อมสัญลักษณ์ทางซ้ายกับชื่อภาษาไทยและภาษาอังกฤษทางขวา</p><div class="link-board"><canvas aria-hidden="true"></canvas><div class="col">'+cards(linkLeft,'left')+'</div><div class="col">'+cards(linkRight,'right')+'</div></div><p class="feedback" role="status">'+linkFeedback+'</p><div class="bar"><button data-link="replay">เล่นใหม่</button><button class="primary" data-link="finish">จบเกมและดูคะแนน</button></div>';
 paintLinks();
}
function paintLinks(pointer){
 const board=game.querySelector('.link-board');
 if(!board)return;
 const canvas=board.querySelector('canvas');
 const bounds=board.getBoundingClientRect();
 const scale=window.devicePixelRatio||1;
 canvas.width=Math.round(bounds.width*scale);
 canvas.height=Math.round(bounds.height*scale);
 const ctx=canvas.getContext('2d');
 ctx.scale(scale,scale);ctx.lineWidth=3;ctx.lineCap='round';ctx.strokeStyle='#087480';
 const endpoint=(side,id)=>{
  const r=board.querySelector('[data-side='+side+'][data-id="'+id+'"]').getBoundingClientRect();
  return [(side==='left'?r.right:r.left)-bounds.left,(r.top+r.height/2)-bounds.top];
 };
 const line=(a,b)=>{ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke()};
 for(const id of linkPairs)line(endpoint('left',id),endpoint('right',id));
 if(pointer&&dragStart){
  ctx.setLineDash([6,5]);
  line(endpoint(dragStart.side,dragStart.id),[pointer.clientX-bounds.left,pointer.clientY-bounds.top]);
 }
}
function linkChoice(side,id){
 if(!linkSelected||linkSelected.side===side){
  linkSelected=linkSelected?.id===id&&linkSelected.side===side?null:{side,id};
  linkFeedback=linkSelected?'เลือกอีกฝั่งเพื่อเชื่อมเส้น':'เลือกสัญลักษณ์หรือชื่อเพื่อเริ่ม';
 }else{
  linkTries++;
  if(linkSelected.id===id){linkPairs.add(id);linkFeedback='ถูกต้อง! '+linkThaiNames[id]+' · '+symbols[id][2];linkEnded=linkPairs.size===symbols.length}
  else linkFeedback='คู่นี้ยังไม่ตรงกัน ลองใหม่ได้เลย';
  linkSelected=null;
 }
}
chooseLink.onclick=()=>{mode='link';render()};
game.addEventListener('click',e=>{
 if(mode!=='link')return;
 const target=e.target.closest('[data-link]');
 if(!target||target.disabled)return;
 const {link,side,id}=target.dataset;
 if(link==='replay')resetLink();
 else if(link==='finish')linkEnded=true;
 else linkChoice(side,Number(id));
 drawLink();
 if(linkEnded)game.querySelector('#resultTitle')?.focus();
 else if(link==='card'){
  const previous=game.querySelector('[data-side='+side+'][data-id="'+id+'"]');
  if(previous&&!previous.disabled)previous.focus();
  else game.querySelector('[data-link=card]:not(:disabled)')?.focus();
 }
});
game.addEventListener('pointerdown',e=>{
 const card=e.target.closest('[data-link=card]');
 if(mode==='link'&&card&&!card.disabled)dragStart={side:card.dataset.side,id:Number(card.dataset.id),x:e.clientX,y:e.clientY};
});
window.addEventListener('pointermove',e=>{if(dragStart&&Math.hypot(e.clientX-dragStart.x,e.clientY-dragStart.y)>8)paintLinks(e)});
window.addEventListener('pointerup',e=>{
 if(!dragStart)return;
 const start=dragStart;dragStart=null;
 if(Math.hypot(e.clientX-start.x,e.clientY-start.y)<8){paintLinks();return}
 const end=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-link=card]');
 if(end&&!end.disabled&&end.dataset.side!==start.side){
  linkSelected=start;
  linkChoice(end.dataset.side,Number(end.dataset.id));
  drawLink();
  if(linkEnded)game.querySelector('#resultTitle')?.focus();
 }else paintLinks();
});
window.addEventListener('pointercancel',()=>{dragStart=null;paintLinks()});
window.addEventListener('resize',()=>{if(mode==='link')paintLinks()});
resetLink();
render();
