// Starfield + hidden "Birthday Transmission"
const canvas = document.getElementById("stars");
const ctx2d = canvas.getContext("2d");
const statusEl = document.getElementById("status");
const brand = document.getElementById("brand");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("close");

let w=0,h=0,stars=[];
function resize(){
  w = canvas.width = window.innerWidth * devicePixelRatio;
  h = canvas.height = window.innerHeight * devicePixelRatio;
  stars = Array.from({length: Math.min(240, Math.floor(window.innerWidth/3))}, () => ({
    x: Math.random()*w, y: Math.random()*h, z: Math.random()*1+0.2, r: Math.random()*1.4+0.2
  }));
}
window.addEventListener("resize", resize);
resize();

function tick(){
  ctx2d.clearRect(0,0,w,h);
  for(const s of stars){
    s.y += (0.25 + s.z*0.9) * devicePixelRatio;
    if(s.y>h){ s.y=0; s.x=Math.random()*w; }
    ctx2d.globalAlpha = 0.25 + s.z*0.45;
    ctx2d.beginPath();
    ctx2d.arc(s.x,s.y,s.r*devicePixelRatio,0,Math.PI*2);
    ctx2d.fillStyle = "#a8d8ff";
    ctx2d.fill();
  }
  requestAnimationFrame(tick);
}
tick();

// tiny synth for the surprise
let audioCtx=null;
function beep(freq=440, dur=0.12, gain=0.08, type="sine"){
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.value = 0;
  o.connect(g); g.connect(audioCtx.destination);
  const t = audioCtx.currentTime;
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(gain,t+0.01);
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.start(t);
  o.stop(t+dur+0.02);
}
function birthdayChord(){
  beep(220,0.18,0.10,"sine");
  setTimeout(()=>beep(277.18,0.18,0.08,"sine"),30);
  setTimeout(()=>beep(329.63,0.18,0.08,"sine"),60);
  setTimeout(()=>beep(440,0.25,0.06,"triangle"),120);
}

let taps=0, tapTimer=null;
brand.addEventListener("click", ()=>{
  taps++;
  statusEl.textContent = "STATUS: SYNC " + "•".repeat(Math.min(taps,6));
  clearTimeout(tapTimer);
  tapTimer = setTimeout(()=>{ taps=0; statusEl.textContent="STATUS: STANDBY"; }, 1100);
  if(taps>=5){
    taps=0;
    overlay.hidden = false;
    statusEl.textContent = "STATUS: TRANSMISSION";
    birthdayChord();
  }
});
closeBtn.addEventListener("click", ()=>{
  overlay.hidden = true;
  statusEl.textContent = "STATUS: ONLINE";
  beep(110,0.08,0.06,"sine");
});
document.addEventListener("keydown",(e)=>{
  if(e.key.toLowerCase()==="b"){
    overlay.hidden = false;
    statusEl.textContent = "STATUS: TRANSMISSION";
    birthdayChord();
  }
});
