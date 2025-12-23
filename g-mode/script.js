const app = document.querySelector(".app");
const warpStatus = document.getElementById("warpStatus");
const gToggle = document.getElementById("gToggle");

const audioState = document.getElementById("audioState");
const pulseState = document.getElementById("pulseState");

const bootWav = document.getElementById("bootWav");
const pulseWav = document.getElementById("pulseWav");
const shutdownWav = document.getElementById("shutdownWav");

let isActive = false;
let bootTimers = [];
let pulseInterval = null;
let firstOnline = true;

// WebAudio fallback (works even if wav fails)
let ctx = null;
function getCtx(){
  ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}
function synth(freq=440, dur=0.12, gain=0.08, type="sine"){
  const c = getCtx();
  if(c.state==="suspended") c.resume();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.value = 0.0001;
  o.connect(g); g.connect(c.destination);
  const t = c.currentTime;
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(gain,t+0.01);
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.start(t);
  o.stop(t+dur+0.02);
}

function safePlay(el, fallbackFn){
  try{
    el.currentTime = 0;
    const p = el.play();
    if(p && typeof p.catch==="function") p.catch(()=>fallbackFn());
  }catch(e){
    fallbackFn();
  }
}

gToggle.addEventListener("click", () => {
  gToggle.classList.remove("ripple","glow");
  void gToggle.offsetWidth;
  gToggle.classList.add("ripple","glow");

  if (!isActive) startBoot();
  else shutdown();
});

function startBoot(){
  clearBoot(); clearPulse();

  isActive = false;
  app.classList.remove("active","shutting-down","standby");
  app.classList.add("booting");

  audioState.textContent = "ARMING";
  pulseState.textContent = "SYNCING";
  warpStatus.textContent = "SYSTEM INITIALIZING...";

  safePlay(bootWav, ()=>{ synth(220,0.14,0.10,"sine"); setTimeout(()=>synth(330,0.12,0.08,"triangle"),70); });

  bootTimers.push(setTimeout(()=>warpStatus.textContent="WARP CORE ONLINE",600));
  bootTimers.push(setTimeout(()=>warpStatus.textContent="SYNCING MODULES...",1200));

  bootTimers.push(setTimeout(()=>{
    warpStatus.textContent="WARP STATUS: ONLINE";
    app.classList.remove("booting");
    app.classList.add("active");
    isActive = true;
    audioState.textContent = "READY";
    pulseState.textContent = "ACTIVE";
    startPulse();

    // birthday micro-surprise: first time online only
    if(firstOnline){
      firstOnline = false;
      setTimeout(()=>{
        warpStatus.textContent = "BIRTHDAY MODE: TRANSMISSION";
        synth(440,0.10,0.06,"sine");
        setTimeout(()=>synth(554.37,0.10,0.05,"sine"),30);
        setTimeout(()=>warpStatus.textContent="WARP STATUS: ONLINE",900);
      }, 260);
    }
  },1900));
}

function clearBoot(){
  bootTimers.forEach(id=>clearTimeout(id));
  bootTimers=[];
}

function startPulse(){
  clearPulse();
  pulseInterval = setInterval(()=>{
    app.classList.add("pulse-active");
    safePlay(pulseWav, ()=>synth(880,0.05,0.04,"triangle"));
    setTimeout(()=>app.classList.remove("pulse-active"),170);
  },2400);
}

function clearPulse(){
  if(pulseInterval) clearInterval(pulseInterval);
  pulseInterval=null;
  app.classList.remove("pulse-active");
}

function shutdown(){
  clearBoot(); clearPulse();

  app.classList.add("shutting-down");
  warpStatus.textContent="WARP STATUS: OFFLINE";
  audioState.textContent = "SLEEP";
  pulseState.textContent = "IDLE";

  safePlay(shutdownWav, ()=>{ synth(180,0.10,0.06,"sine"); setTimeout(()=>synth(120,0.16,0.05,"sine"),55); });

  setTimeout(()=>{
    app.classList.remove("active","shutting-down","booting");
    app.classList.add("standby");
    warpStatus.textContent="WARP STATUS: STANDBY";
    isActive=false;
  },700);
}

app.classList.add("standby");
