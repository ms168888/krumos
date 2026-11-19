const videoList=document.querySelector('#video-list');
const videoPlayer=document.querySelector('#video-player');
videoList.addEventListener('click',event=>{
 const choice=event.target.closest('button[data-video]');
 if(!choice||choice.getAttribute('aria-pressed')==='true')return;
 for(const button of videoList.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button===choice));
 const frame=document.createElement('iframe');
 frame.title=choice.querySelector('span').textContent;
 frame.referrerPolicy='strict-origin-when-cross-origin';
 frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';
 frame.allowFullscreen=true;
 frame.src='https://www.youtube-nocookie.com/embed/'+choice.dataset.video+'?autoplay=1&playsinline=1';
 videoPlayer.replaceChildren(frame);
 if(window.innerWidth<=900)videoPlayer.scrollIntoView({block:'nearest'});
});