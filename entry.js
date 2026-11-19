const form=document.querySelector('#entry-form');
const gate=document.querySelector('#entry');
const layout=document.querySelector('.layout');
const nameInput=document.querySelector('#player-input');
const nameView=document.querySelector('#player-name');
const leave=document.querySelector('#leave');
const key='krumos-player-name';

function showPlayer(name){
 nameView.textContent=name;
 gate.hidden=Boolean(name);
 layout.hidden=!name;
 if(name&&mode==='link')paintLinks();
}
let stored='';
try{stored=sessionStorage.getItem(key)||''}catch{}
showPlayer(stored.slice(0,40).trim());
form.addEventListener('submit',event=>{
 event.preventDefault();
 const name=nameInput.value.slice(0,40).trim();
 if(!name){
  nameInput.setCustomValidity('กรุณาพิมพ์ชื่อหรือชื่อเล่น');
  nameInput.reportValidity();
  return;
 }
 try{sessionStorage.setItem(key,name)}catch{}
 showPlayer(name);
 document.querySelector('#chooseLink').focus();
});
nameInput.addEventListener('input',()=>nameInput.setCustomValidity(''));
leave.addEventListener('click',()=>{
 try{sessionStorage.removeItem(key)}catch{}
 window.location.reload();
});