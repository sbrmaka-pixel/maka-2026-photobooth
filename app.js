const canvas = document.getElementById('photoCanvas');
const ctx = canvas.getContext('2d');
const input = document.getElementById('photoInput');
const chooseBtn = document.getElementById('choosePhotoBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const zoomRange = document.getElementById('zoomRange');
const emptyState = document.getElementById('emptyState');
const formatButtons = [...document.querySelectorAll('.segment')];

let format = 'portrait';
let userImage = null;
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let dragging = false;
let startX = 0;
let startY = 0;

const frameFiles = {
  portrait: 'assets/frame-portrait.png',
  landscape: 'assets/frame-landscape.png'
};

let frameImage = new Image();
frameImage.onload = draw;

function setFormat(nextFormat) {
  format = nextFormat;
  formatButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.format === format));

  if (format === 'portrait') {
    canvas.width = 1080;
    canvas.height = 1350;
  } else {
    canvas.width = 1600;
    canvas.height = 1000;
  }

  frameImage = new Image();
  frameImage.onload = draw;
  frameImage.src = frameFiles[format];
  offsetX = 0;
  offsetY = 0;
  scale = Number(zoomRange.value);
  draw();
}

formatButtons.forEach(btn => btn.addEventListener('click', () => setFormat(btn.dataset.format)));
chooseBtn.addEventListener('click', () => input.click());

input.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      userImage = img;
      scale = 1;
      zoomRange.value = 1;
      offsetX = 0;
      offsetY = 0;
      emptyState.style.display = 'none';
      downloadBtn.disabled = false;
      draw();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

zoomRange.addEventListener('input', () => {
  scale = Number(zoomRange.value);
  draw();
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#23142d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (userImage) {
    const base = Math.max(canvas.width / userImage.width, canvas.height / userImage.height);
    const drawW = userImage.width * base * scale;
    const drawH = userImage.height * base * scale;
    const x = (canvas.width - drawW) / 2 + offsetX;
    const y = (canvas.height - drawH) / 2 + offsetY;
    ctx.drawImage(userImage, x, y, drawW, drawH);
  }

  // Temporary decorative border, so the app works even before custom PNG frames are added.
  if (!frameImage.complete || !frameImage.naturalWidth) {
    drawFallbackFrame();
  } else {
    ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
  }
}

function drawFallbackFrame() {
  const pad = Math.round(canvas.width * 0.035);
  ctx.save();
  ctx.lineWidth = Math.max(14, canvas.width * 0.014);
  ctx.strokeStyle = '#d6b7ef';
  ctx.strokeRect(pad, pad, canvas.width - pad * 2, canvas.height - pad * 2);
  ctx.lineWidth = Math.max(5, canvas.width * 0.005);
  ctx.strokeStyle = '#f7e6a6';
  ctx.strokeRect(pad * 1.65, pad * 1.65, canvas.width - pad * 3.3, canvas.height - pad * 3.3);

  const titleSize = Math.round(canvas.width * 0.055);
  ctx.fillStyle = 'rgba(63,22,95,.88)';
  ctx.fillRect(0, 0, canvas.width, titleSize * 2.1);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff8d6';
  ctx.font = `700 ${titleSize}px Georgia`;
  ctx.fillText('MAKA 2026', canvas.width / 2, titleSize * 1.35);

  const footerH = titleSize * 1.5;
  ctx.fillStyle = 'rgba(63,22,95,.9)';
  ctx.fillRect(0, canvas.height - footerH, canvas.width, footerH);
  ctx.fillStyle = '#ffffff';
  ctx.font = `600 ${Math.round(titleSize * .36)}px -apple-system, sans-serif`;
  ctx.fillText('SEKOLAH RENDAH SETIABUDI  ·  #setiabudiunggul', canvas.width / 2, canvas.height - footerH * .42);
  ctx.restore();
}

function pointerPos(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top) * (canvas.height / rect.height)
  };
}

function startDrag(e) {
  if (!userImage) return;
  e.preventDefault();
  dragging = true;
  const p = pointerPos(e);
  startX = p.x - offsetX;
  startY = p.y - offsetY;
}
function moveDrag(e) {
  if (!dragging) return;
  e.preventDefault();
  const p = pointerPos(e);
  offsetX = p.x - startX;
  offsetY = p.y - startY;
  draw();
}
function endDrag() { dragging = false; }

canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mousemove', moveDrag);
window.addEventListener('mouseup', endDrag);
canvas.addEventListener('touchstart', startDrag, { passive: false });
canvas.addEventListener('touchmove', moveDrag, { passive: false });
window.addEventListener('touchend', endDrag);

resetBtn.addEventListener('click', () => {
  userImage = null;
  input.value = '';
  zoomRange.value = 1;
  scale = 1;
  offsetX = 0;
  offsetY = 0;
  emptyState.style.display = 'grid';
  downloadBtn.disabled = true;
  draw();
});

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `MAKA-2026-${format}-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
});

setFormat('portrait');
