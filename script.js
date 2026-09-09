const screens = {
   ad: document.getElementById("screen-ad"),
   pay: document.getElementById("screen-pay"),
   result: document.getElementById("screen-result"),
};

function showScreen(name) {
   Object.values(screens).forEach((s) => s.classList.remove("active"));
   screens[name].classList.add("active");
}

// Реклама 3 секунды
function startAd() {
   let count = 3;
   const countEl = document.getElementById("ad-count");
   countEl.textContent = count;
   const timer = setInterval(() => {
      count--;
      if (count <= 0) {
         clearInterval(timer);
         showScreen("pay");
      } else {
         countEl.textContent = count;
      }
   }, 1000);
}

// ===== Электронные часы (сегментный дисплей) =====

const SEGMENT_MAP = {
   0: [1, 1, 1, 1, 1, 1, 0],
   1: [0, 1, 1, 0, 0, 0, 0],
   2: [1, 1, 0, 1, 1, 0, 1],
   3: [1, 1, 1, 1, 0, 0, 1],
   4: [0, 1, 1, 0, 0, 1, 1],
   5: [1, 0, 1, 1, 0, 1, 1],
   6: [1, 0, 1, 1, 1, 1, 1],
   7: [1, 1, 1, 0, 0, 0, 0],
   8: [1, 1, 1, 1, 1, 1, 1],
   9: [1, 1, 1, 1, 0, 1, 1],
};

const SEGMENT_COORDS = [
   "6,4 26,4 22,9 10,9",
   "27,6 27,27 22,30 22,11",
   "27,32 27,53 22,50 22,29",
   "6,55 26,55 22,50 10,50",
   "5,32 5,53 10,50 10,29",
   "5,6 5,27 10,30 10,11",
   "6,29 10,26 22,26 26,29 22,32 10,32",
];

const NS = "http://www.w3.org/2000/svg";

function makeDigit(uid) {
   const svg = document.createElementNS(NS, "svg");
   svg.setAttribute("viewBox", "0 0 34 60");

   const defs = document.createElementNS(NS, "defs");
   const filter = document.createElementNS(NS, "filter");
   const fid = "glow-" + uid;
   filter.setAttribute("id", fid);
   filter.setAttribute("x", "-60%");
   filter.setAttribute("y", "-60%");
   filter.setAttribute("width", "220%");
   filter.setAttribute("height", "220%");
   const blur = document.createElementNS(NS, "feGaussianBlur");
   blur.setAttribute("stdDeviation", "1.6");
   blur.setAttribute("result", "blur");
   const merge = document.createElementNS(NS, "feMerge");
   const m1 = document.createElementNS(NS, "feMergeNode");
   m1.setAttribute("in", "blur");
   const m2 = document.createElementNS(NS, "feMergeNode");
   m2.setAttribute("in", "SourceGraphic");
   merge.appendChild(m1);
   merge.appendChild(m2);
   filter.appendChild(blur);
   filter.appendChild(merge);
   defs.appendChild(filter);
   svg.appendChild(defs);

   const segs = [];
   for (let i = 0; i < 7; i++) {
      const p = document.createElementNS(NS, "polygon");
      p.setAttribute("points", SEGMENT_COORDS[i]);
      p.setAttribute("class", "seg");
      p.setAttribute("opacity", "0.08");
      p.setAttribute("filter", "url(#" + fid + ")");
      svg.appendChild(p);
      segs.push(p);
   }
   return { svg, segs };
}

function setDigit(digit, val) {
   const on = SEGMENT_MAP[val];
   digit.segs.forEach((s, i) => {
      s.setAttribute("opacity", on[i] ? "1" : "0.08");
   });
}

function pad(n) {
   return n.toString().padStart(2, "0");
}

let clockDigits = [];

function buildClock() {
   const container = document.getElementById("clock-digits");
   container.innerHTML = "";
   clockDigits = [];

   for (let i = 0; i < 6; i++) {
      if (i === 2 || i === 4) {
         const sepCol = document.createElement("div");
         sepCol.className = "clock-sep-col";
         const dot1 = document.createElement("div");
         dot1.className = "clock-sep";
         const dot2 = document.createElement("div");
         dot2.className = "clock-sep";
         sepCol.appendChild(dot1);
         sepCol.appendChild(dot2);
         container.appendChild(sepCol);
      }
      const digit = makeDigit(i);
      container.appendChild(digit.svg);
      setDigit(digit, "0");
      clockDigits.push({ digit, val: "0" });
   }
}

function updateClock() {
   const now = new Date();
   const vals = [
      pad(now.getHours())[0],
      pad(now.getHours())[1],
      pad(now.getMinutes())[0],
      pad(now.getMinutes())[1],
      pad(now.getSeconds())[0],
      pad(now.getSeconds())[1],
   ];
   clockDigits.forEach((item, i) => {
      if (item.val !== vals[i]) {
         setDigit(item.digit, vals[i]);
         item.val = vals[i];
      }
   });
}

// ===== Фон "Матрица" =====

let matrixInterval = null;

function startMatrix() {
   const canvas = document.getElementById("matrix-canvas");
   const ctx = canvas.getContext("2d");

   function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
   }
   resize();
   window.addEventListener("resize", resize);

   const chars = "01アイウエオカキクケコサシスセソ";
   const fontSize = 16;
   let columns = Math.floor(canvas.width / fontSize);
   let drops = [];
   for (let i = 0; i < columns; i++) drops[i] = Math.random() * -50;

   if (matrixInterval) clearInterval(matrixInterval);
   matrixInterval = setInterval(() => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ff66";
      ctx.font = fontSize + "px monospace";
      for (let i = 0; i < drops.length; i++) {
         const text = chars[Math.floor(Math.random() * chars.length)];
         ctx.fillText(text, i * fontSize, drops[i] * fontSize);
         if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
         }
         drops[i]++;
      }
   }, 60);
}

// Фиксируем флаг ДО очистки URL
const isSuccess = window.location.search.includes("success");

if (isSuccess) {
   showScreen("result");
   buildClock();
   updateClock();
   startMatrix();
   window.history.replaceState({}, document.title, window.location.pathname);
}

setInterval(() => {
   if (screens.result.classList.contains("active")) {
      updateClock();
   }
}, 1000);

// вызов рекламы 3 сек
if (!isSuccess) {
   // startAd();
   showScreen("pay");
}
