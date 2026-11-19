const symbols=[
 ['start','#d8e34b','Begin หรือ End','จุดเริ่มต้นหรือจุดสิ้นสุดของการทำงาน'],
 ['flow','#202e39','Flow line','ทิศทางการดำเนินงาน'],
 ['process','#117334','Process','การดำเนินงานหรือการประมวลผล'],
 ['manual','#dd1e65','Manual input','นำเข้าข้อมูลด้วยการป้อนค่าทางแป้นพิมพ์'],
 ['decision','#9183c3','Decision','การตัดสินใจตามเงื่อนไขที่กำหนด'],
 ['connection','#007ddf','Connection','จุดเชื่อมต่อ'],
 ['display','#dd2720','Display','การแสดงผลบนหน้าจอ'],
 ['io','#22367e','General input / output','รับข้อมูลเข้าหรือส่งข้อมูลออกโดยไม่ระบุชนิดอุปกรณ์']
];
const rounds=[
 ['คำนวณผลบวก',[[0,'เริ่มต้น'],[3,'พิมพ์ตัวเลขสองจำนวน'],[2,'บวกตัวเลขทั้งสอง'],[6,'แสดงผลรวมบนหน้าจอ'],[0,'สิ้นสุด']]],
 ['ตรวจว่าคะแนนผ่านหรือไม่',[[0,'เริ่มต้น'],[3,'พิมพ์คะแนน'],[4,'ตรวจว่าคะแนนถึง 50 หรือไม่'],[6,'แสดงผลว่าผ่านหรือไม่ผ่าน'],[0,'สิ้นสุด']]],
 ['คำนวณราคาสินค้า',[[0,'เริ่มต้น'],[7,'รับราคาต่อชิ้นและจำนวนสินค้า'],[2,'คูณราคาต่อชิ้นกับจำนวนสินค้า'],[7,'ส่งออกยอดรวม'],[0,'สิ้นสุด']]]
];
const game=document.querySelector('#game');
const chooseMatch=document.querySelector('#chooseMatch');
const chooseOrder=document.querySelector('#chooseOrder');
const shuffle=(source)=>{
 const result=[...source];
 for(let i=result.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1));
  [result[i],result[j]]=[result[j],result[i]];
 }
 return result;
};
const indices=Array.from(symbols.keys());
const mark=(i)=>'<span aria-hidden="true" class="mark '+symbols[i][0]+'" style="--ink:'+symbols[i][1]+'">'+(i===1?'↓ ↑':'')+'</span>';
let mode='link',left,right,paired,sel,answer,tries,round,order,judged,feedback,checks; const ended={match:false,order:false};
function resetMatch(){
 ended.match=false;
 left=shuffle(indices); right=shuffle(indices); paired=new Set(); sel=null; answer=null; tries=0;
 feedback='เลือกหนึ่งช่องจากแต่ละฝั่ง';
}
function resetOrder(){
 ended.order=false; checks=0;
 const ids=Array.from(rounds[round][1].keys());
 order=shuffle(ids);
 if(order.every((n,i)=>n===i)) order.push(order.shift());
 judged=false;
 feedback='ใช้ปุ่มขึ้นหรือลงเพื่อย้ายขั้นตอน แล้วกดตรวจลำดับ';
}
function drawMatch(){
 const card=(i,side)=>{
  const done=paired.has(i);
  const selected=side==='shape'?sel:answer;
  const inner=side==='shape'?mark(i):symbols[i][3]+(done?' <strong>✓ '+symbols[i][2]+'</strong>':'');
  return '<button class="card '+(side==='shape'?'symbol ':'')+(done?'done':'')+'" data-action="'+side+'" data-i="'+i+'" aria-pressed="'+(i===selected)+'" '+(done?'disabled ':'')+(side==='shape'?'aria-label="รูปสัญลักษณ์ตัวเลือก '+(left.indexOf(i)+1)+'"':'')+'>'+inner+'</button>';
 };
 game.innerHTML='<div class="bar"><h2>จับคู่สัญลักษณ์กับความหมาย</h2><span class="score">'+paired.size+' / 8 คู่ · ลอง '+tries+' ครั้ง</span></div><div class="grid"><div class="col"><h3>สัญลักษณ์</h3>'+left.map(i=>card(i,'shape')).join('')+'</div><div class="col"><h3>ความหมาย</h3>'+right.map(i=>card(i,'meaning')).join('')+'</div></div><p class="feedback" role="status">'+feedback+'</p><div class="bar"><button data-action="replay">เล่นใหม่</button><button class="primary" data-action="finish">จบเกมและดูคะแนน</button></div>';
}
function drawOrder(){
 const scenario=rounds[round];
 const good=order.reduce((n,id,i)=>n+(id===i),0);
 game.innerHTML='<div class="bar"><h2>เรียงลำดับขั้นตอน</h2><label>โจทย์ <select id="scenario">'+rounds.map(([title],i)=>'<option value="'+i+'" '+(i===round?'selected':'')+'>'+title+'</option>').join('')+'</select></label></div><ol class="steps">'+order.map((id,i)=>{
  const [symbol,label]=scenario[1][id];
  return '<li class="step '+(judged?(id===i?'check':'wrong'):'')+'"><strong>'+(i+1)+'.</strong>'+mark(symbol)+'<span class="label">'+label+'</span><div class="moves">'+['ขึ้น','ลง'].map((label,j)=>'<button data-action="'+(j?'down':'up')+'" data-i="'+i+'" aria-label="'+label+' ขั้นตอน '+(i+1)+'" '+((!j&&i===0)||(j&&i===order.length-1)?'disabled':'')+'>'+label+'</button>').join('')+'</div></li>';
 }).join('')+'</ol><p class="feedback" role="status">'+feedback+(judged?' · ถูก '+good+' / '+order.length+' ตำแหน่ง':'')+'</p><div class="bar"><button class="primary" data-action="check">ตรวจลำดับ</button><button data-action="replay">สลับใหม่</button><button data-action="finish">จบเกมและดูคะแนน</button></div>';
}
function drawSummary(){
 const matching=mode==='match';
 const total=matching?symbols.length:order.length;
 const correct=matching?paired.size:order.filter((id,index)=>id===index).length;
 const details=matching?'จับคู่ถูก '+correct+' คู่ จาก '+total+' คู่ · ลองจับคู่ '+tries+' ครั้ง':'จัดถูก '+correct+' ตำแหน่ง จาก '+total+' ตำแหน่ง · กดตรวจ '+checks+' ครั้ง';
 const percent=Math.round(100*correct/total);
 const next=matching?'เล่นอีกครั้ง':round<rounds.length-1?'เล่นโจทย์ถัดไป':'กลับไปโจทย์แรก';
 game.innerHTML='<section class="summary"><h2 id="resultTitle" tabindex="-1">จบเกม · สรุปคะแนน</h2><p>'+ (matching?'จับคู่สัญลักษณ์':rounds[round][0]) +'</p><p class="result">'+correct+' <span>/ '+total+' คะแนน</span></p><progress value="'+correct+'" max="'+total+'" aria-label="คะแนนที่ได้"></progress><p>'+percent+'% · '+details+'</p><div class="result-actions"><button class="primary" data-action="'+(matching?'replay':'next')+'">'+next+'</button>'+(matching?'':'<button data-action="replay">เล่นโจทย์เดิม</button>')+'<button data-action="switch">'+(matching?'ไปเกมเรียงลำดับ':'ไปเกมจับคู่')+'</button></div></section>';
}
function render(){
 chooseMatch.setAttribute('aria-pressed',mode==='match');
 chooseOrder.setAttribute('aria-pressed',mode==='order');
 document.querySelector('#chooseLink').setAttribute('aria-pressed',mode==='link');
 if(mode==='link') drawLink(); else if(ended[mode]) drawSummary(); else if(mode==='match') drawMatch(); else drawOrder();
}
chooseMatch.onclick=()=>{mode='match';render()};
chooseOrder.onclick=()=>{mode='order';render()};
game.addEventListener('change',e=>{
 if(e.target.id==='scenario'){round=Number(e.target.value);resetOrder();render();document.querySelector('#scenario').focus()}
});
game.addEventListener('click',e=>{
 const button=e.target.closest('button[data-action]');
 if(!button)return;
 const {action,i}=button.dataset;
 const index=Number(i);
 let focus=action==='replay'||action==='check'?'[data-action='+action+']':'';
 const wasEnded=ended[mode];
 if(action==='finish'){
  ended[mode]=true;
 }else if(action==='next'){
  round=(round+1)%rounds.length;resetOrder();
 }else if(action==='switch'){
  mode=mode==='match'?'order':'match';
  render();
  (mode==='match'?chooseMatch:chooseOrder).focus();
  return;
 }else if(action==='replay'){
  if(mode==='match')resetMatch();else resetOrder();
 }else if(action==='shape'||action==='meaning'){
  if(action==='shape')sel=sel===index?null:index;else answer=answer===index?null:index;
  feedback=sel!==null?'เลือกความหมายที่ตรงกัน':answer!==null?'เลือกรูปที่ตรงกับความหมาย':'เลือกหนึ่งช่องจากแต่ละฝั่ง';
  focus='[data-action='+action+'][data-i="'+i+'"]';
  if(sel!==null&&answer!==null){
   tries++;
   if(sel===answer){
    paired.add(sel);
    if(paired.size===symbols.length) ended.match=true;
    feedback=paired.size===8?'เยี่ยมมาก! จับคู่ครบทั้ง 8 แบบ':'ถูกต้อง! '+symbols[sel][2];
    focus='[data-action=shape]:not(:disabled), [data-action=replay]';
   }else feedback='คู่นี้ยังไม่ตรงกัน ลองใหม่ได้เลย';
   sel=null;answer=null;
  }
 }else if(action==='check'){
  judged=true; checks++;
  if(order.every((id,i)=>id===i)) ended.order=true;
  feedback=order.every((id,i)=>id===i)?'ถูกทุกขั้นตอน! ลองเลือกโจทย์ถัดไป':'ลองย้ายขั้นตอนที่อยู่ผิดตำแหน่ง';
 }else{
  const next=index+(action==='up'?-1:1);
  [order[index],order[next]]=[order[next],order[index]];
  judged=false;feedback='ย้ายขั้นตอนแล้ว';
  focus='[data-action='+action+'][data-i="'+next+'"]:not(:disabled), [data-action='+ (action==='up'?'down':'up')+'][data-i="'+next+'"]:not(:disabled)';
 }
 render();
 if(ended[mode]) game.querySelector('#resultTitle')?.focus();
 else if(wasEnded) game.querySelector('h2')?.setAttribute('tabindex','-1');
 else if(focus)game.querySelector(focus)?.focus();
 if(wasEnded&&!ended[mode]) game.querySelector('h2')?.focus();
});
round=0;resetMatch();resetOrder();