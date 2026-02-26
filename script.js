const paletteContainer = document.querySelector("palette");
const generateBtn = document.getElementById("generateBtn");

function randomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}

function generatePalette() {
  paletteContainer.innerHTML = "";

  for (let i = 0; i < 6; i++) {
    const color = randomColor();
    const card = document.createElement("div");
    card.className = "color-card";
    card.style.background = color;
    card.textContent = color;
    card.style.animationDelay = `${i
      
    }s`;

    // Delay animación escalonada (stagger effect)
    card.style.animationDelay = `${i * 0.1}s`;

    card.addEventListener("click", () => {
      navigator.clipboard.writeText(color);
      card.textContent = "✔ Copiado";
      setTimeout(() => card.textContent = color, 800);
    });

    paletteContainer.appendChild(card);
  }
}

generateBtn.addEventListener("click", generatePalette);
generatePalette();

const themeToggle = document.getElementById("themeToggle");
let darkMode = true;

themeToggle.addEventListener("click", () => {
  darkMode = !darkMode;
  document.body.classList.toggle("light-mode");

  themeToggle.textContent = darkMode ? "🌙" : "☀️";
});

