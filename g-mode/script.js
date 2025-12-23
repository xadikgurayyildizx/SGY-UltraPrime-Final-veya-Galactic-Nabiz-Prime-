const words = Array.from(document.querySelectorAll('.highlight'));
const cycleBtn = document.getElementById('cycle');

function randomAccent() {
  const i = Math.floor(Math.random() * words.length);
  words.forEach(w=> w.style.boxShadow = '');
  words[i].style.boxShadow = '0 6px 30px rgba(137,194,255,0.18)';
}

cycleBtn.addEventListener('click', randomAccent);

// initial
randomAccent();
