// Selector #palette es un ID, se usa con #
const paletteContainer = document.querySelector("#palette");
const generateBtn = document.getElementById("generateBtn");
const themeToggle = document.getElementById("themeToggle");

/**
 * Genera un color hexadecimal aleatorio
 * @returns {string} Color en formato hexadecimal (#RRGGBB)
 */
function randomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}

/**
 * Genera una nueva paleta de 6 colores
 * Limpia el contenedor y crea tarjetas de color interactivas
 */
function generatePalette() {
  paletteContainer.innerHTML = "";

  for (let i = 0; i < 6; i++) {
    const color = randomColor();
    const card = document.createElement("div");
    card.className = "color-card";
    card.style.background = color;
    card.textContent = color;

    // Delay animación escalonada (stagger effect)
    card.style.animationDelay = `${i * 0.1}s`;

    // Evento: copiar color al portapapeles
    card.addEventListener("click", () => {
      navigator.clipboard.writeText(color);
      card.textContent = "✔ Copiado";
      setTimeout(() => card.textContent = color, 800);
    });

    paletteContainer.appendChild(card);
  }
}

// Evento: generar paleta al hacer clic en el botón
generateBtn.addEventListener("click", generatePalette);
// Generar paleta inicial al cargar la página
generatePalette();

/**
 * Toggle del modo claro/oscuro
 * Alterna la clase 'light-mode' del body
 */
let darkMode = true;

themeToggle.addEventListener("click", () => {
  darkMode = !darkMode;
  document.body.classList.toggle("light-mode");

  themeToggle.textContent = darkMode ? "🌙" : "☀️";
});
