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

function updateTime() {
   const now = new Date();
   document.getElementById("result-time").textContent =
      now.toLocaleTimeString("ru-RU");
}

// Фиксируем флаг ДО очистки URL — это и есть исправление
const isSuccess = window.location.search.includes("success");

if (isSuccess) {
   showScreen("result");
   updateTime();
   window.history.replaceState({}, document.title, window.location.pathname);
}

setInterval(() => {
   if (screens.result.classList.contains("active")) {
      updateTime();
   }
}, 1000);

// это оставить блок с релкмой
if (!isSuccess) {
   startAd();
}
