
/* Galactic Dimensional Engine - WebAudio-only, iPhone friendly.
   - No external samples: pads are synthetic (filtered noise + oscillators + reverb)
   - STS is an LFO that modulates reverb & amplitude to create 'dimensional pulse'
*/

let ctx, masterGain, reverbNode, reverbGain, lfoOsc, lfoGain, running=false;

async function initAudio(){
  if(ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = ctx.createGain(); masterGain.gain.value = 0.85;
  masterGain.connect(ctx.destination);

  // Reverb: simple feedback delay network (small convolver-like)
  const delay = ctx.createDelay(5.0);
  delay.delayTime.value = 0.25;
  const fb = ctx.createGain(); fb.gain.value = 0.45;
  delay.connect(fb); fb.connect(delay);
  reverbGain = ctx.createGain(); reverbGain.gain.value = 0.4;
  delay.connect(reverbGain); reverbGain.connect(masterGain);

  // LFO (STS-like) - low frequency oscillator used to modulate reverb & master gain
  lfoOsc = ctx.createOscillator();
  lfoOsc.type = 'sine';
  lfoOsc.frequency.value = 7.83; // starting
  lfoGain = ctx.createGain(); lfoGain.gain.value = 0.08;
  lfoOsc.connect(lfoGain);
  // LFO targets: reverbGain.gain and masterGain.gain via gain nodes
  const lfoToMaster = ctx.createGain(); lfoToMaster.gain.value = 0.02;
  lfoGain.connect(lfoToMaster);
  lfoToMaster.connect(masterGain.gain);
  lfoGain.connect(reverbGain.gain);
  lfoOsc.start();

  // Noise buffer for pad
  const buf = ctx.createBuffer(1, ctx.sampleRate*4, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for(let i=0;i<data.length;i++){ data[i] = (Math.random()*2-1) * 0.2; }
  window._padBuffer = buf;
}

function playPad(brightness=0.5){
  if(!ctx) return;
  // create noise-based pad with filter envelope
  const src = ctx.createBufferSource();
  src.buffer = window._padBuffer;
  src.loop = true;
  const filt = ctx.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.value = 800 + brightness*4000;
  const gain = ctx.createGain(); gain.gain.value = 0.0001;
  src.connect(filt); filt.connect(gain); gain.connect(reverbGain); gain.connect(masterGain);
  src.start();
  // fade-in to smooth
  gain.gain.linearRampToValueAtTime(0.35 + brightness*0.6, ctx.currentTime + 6.0);
  // return nodes to control later
  return {src, filt, gain};
}

let padNodes = null;

function startEngine(){
  if(running) return;
  running = true;
  if(ctx && ctx.state === 'suspended') ctx.resume();
  if(!ctx) initAudio().then(()=>{ padNodes = playPad(parseFloat(document.getElementById('bright').value)); engineLoop(); });
  else { padNodes = playPad(parseFloat(document.getElementById('bright').value)); engineLoop(); }
}

function stopEngine(){
  running = false;
  if(padNodes && padNodes.src) {
    try{ padNodes.gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 2.0); padNodes.src.stop(ctx.currentTime + 2.1); } catch(e){}
    padNodes = null;
  }
}

async function engineLoop(){
  while(running){
    const dens = parseFloat(document.getElementById('dens').value);
    const stsVal = parseFloat(document.getElementById('sts').value);
    // STS controls LFO frequency and depth
    lfoOsc.frequency.value = 0.5 + 30 * stsVal; // 0.5 - 30 Hz
    lfoGain.gain.value = 0.02 + 0.18 * stsVal;

    // Reverb amount controlled by slider
    reverbGain.gain.setTargetAtTime(parseFloat(document.getElementById('rev').value), ctx.currentTime, 0.5);

    // Small cosmic events: brief higher-pitched blips (galactic pings)
    if(Math.random() < 0.25 * dens){
      playPing(200 + Math.random()*1500, 0.05 + Math.random()*0.25);
    }
    // Change pad brightness slowly if slider moved
    if(padNodes && padNodes.filt){
      const bright = parseFloat(document.getElementById('bright').value);
      padNodes.filt.frequency.linearRampToValueAtTime(800 + bright*4000, ctx.currentTime + 1.2);
      padNodes.gain.gain.linearRampToValueAtTime(0.35 + bright*0.6, ctx.currentTime + 1.2);
    }
    // wait time influenced by density
    const waitMs = 1200 + Math.random() * (4000 - dens*3000);
    await new Promise(r => setTimeout(r, waitMs));
  }
}

function playPing(freq=600, vol=0.15){
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.value = freq;
  g.gain.value = vol;
  const bp = ctx.createBiquadFilter();
  bp.type = 'highpass'; bp.frequency.value = 300;
  o.connect(g); g.connect(bp); bp.connect(reverbGain); bp.connect(masterGain);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);
  o.stop(ctx.currentTime + 1.6);
}

// UI wiring
document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('start').addEventListener('click', async ()=>{
    if(!ctx) await initAudio();
    await ctx.resume();
    startEngine();
  });
  document.getElementById('stop').addEventListener('click', stopEngine);
  document.getElementById('sts').addEventListener('input', e => {
    if(lfoOsc) lfoOsc.frequency.value = 0.5 + 30 * parseFloat(e.target.value);
  });
  document.getElementById('rev').addEventListener('input', e => {
    if(reverbGain) reverbGain.gain.value = parseFloat(e.target.value);
  });
  document.getElementById('dens').addEventListener('input', () => {});
  document.getElementById('bright').addEventListener('input', () => {});
});
