const form=document.querySelector('#entry-form');
const gate=document.querySelector('#entry');
const notice=document.querySelector('#access-message');
const layout=document.querySelector('.layout');
const nameInput=document.querySelector('#player-input');
const nameView=document.querySelector('#player-name');
const leave=document.querySelector('#leave');
const nameKey='krumos-player-name';
const accessKey='krumos-qr-grant-v1';
const expectedHash='9f3eac08f91bfa33f663235949f11abab9dd27337886921e2ce4fc77c2d804c2';
let allowed=false;

function getSession(key){try{return sessionStorage.getItem(key)||''}catch{return ''}}
function putSession(key,value){try{sessionStorage.setItem(key,value)}catch{}}
function showPlayer(name){
 nameView.textContent=name;
 notice.hidden=allowed;
 gate.hidden=!allowed||Boolean(name);
 layout.hidden=!allowed||!name;
 if(allowed&&name&&mode==='link')paintLinks();
}
async function grantFromLink(){
 const token=new URLSearchParams(location.hash.slice(1)).get('access');
 if(!token)return getSession(accessKey)===expectedHash;
 if(!/^[a-f0-9]{48}$/.test(token)||!globalThis.crypto?.subtle)return false;
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
 const hash=Array.from(new Uint8Array(bytes),byte=>byte.toString(16).padStart(2,'0')).join('');
 if(hash!==expectedHash)return false;
 putSession(accessKey,expectedHash);
 try{history.replaceState(null,'',location.pathname+location.search)}catch{}
 return true;
}
grantFromLink().then(granted=>{
 allowed=granted;
 showPlayer(granted?getSession(nameKey).slice(0,40).trim():'');
}).catch(()=>showPlayer(''));
form.addEventListener('submit',event=>{
 event.preventDefault();
 if(!allowed)return;
 const name=nameInput.value.slice(0,40).trim();
 if(!name){
  nameInput.setCustomValidity('กรุณาพิมพ์ชื่อหรือชื่อเล่น');
  nameInput.reportValidity();
  return;
 }
 putSession(nameKey,name);
 showPlayer(name);
 document.querySelector('#chooseLink').focus();
});
nameInput.addEventListener('input',()=>nameInput.setCustomValidity(''));
leave.addEventListener('click',()=>{
 try{sessionStorage.removeItem(nameKey);sessionStorage.removeItem(accessKey)}catch{}
 location.reload();
});