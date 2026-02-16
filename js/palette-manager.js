/**
 * ===== RICCIE'PALLETS - PALETTE MANAGER =====
 * Gestor completo de paletas con almacenamiento, historial, exportación y más
 */

// Elementos del DOM
const paletteContainer = document.querySelector("#palette");
const generateBtn = document.getElementById("generateBtn");
const themeToggle = document.getElementById("themeToggle");
const saveFavBtn = document.getElementById("saveFavBtn");
const exportBtn = document.getElementById("exportBtn");
const shareBtn = document.getElementById("shareBtn");
const favoritesSection = document.getElementById("favoritesSection");
const favoritesList = document.getElementById("favoritesList");
const historySection = document.getElementById("historySection");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const categoryBtns = document.querySelectorAll(".category-btn");

// Estado global
let currentPalette = [];
let selectedCategory = "all";
let darkMode = true;

// Estilos de categorías de paletas
const paletteCategories = {
  pastel: {
    name: "Pastel",
    colors: ["#FFB3BA", "#FFCAB0", "#FFFFBA", "#BAE1FF", "#BAC7FF"]
  },
  vibrante: {
    name: "Vibrante",
    colors: ["#FF006E", "#FB5607", "#FFBE0B", "#8338EC", "#3A86FF"]
  },
  minimalista: {
    name: "Minimalista",
    colors: ["#000000", "#FFFFFF", "#E5E5E5", "#808080", "#A9A9A9"]
  },
  tendencias: {
    name: "Tendencias 2026",
    colors: ["#667eea", "#764ba2", "#ffce00", "#ff6b6b", "#12c2e9"]
  }
};

/**
 * Genera un color hexadecimal aleatorio
 * @returns {string} Color en formato hexadecimal (#RRGGBB)
 */
function randomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}

/**
 * Genera una nueva paleta de 6 colores
 */
function generatePalette() {
  currentPalette = [];
  paletteContainer.innerHTML = "";

  for (let i = 0; i < 6; i++) {
    const color = randomColor();
    currentPalette.push(color);
    createColorCard(color, i);
  }

  // Guardar en historial
  savePaletteToHistory(currentPalette);
  updateUI();
}

/**
 * Crea una tarjeta de color interactiva
 */
function createColorCard(color, index) {
  const card = document.createElement("div");
  card.className = "color-card";
  card.style.background = color;
  card.style.animationDelay = `${index * 0.1}s`;
  
  // Contenedor de texto y botones
  const cardContent = document.createElement("div");
  cardContent.className = "color-card__content";
  
  const colorText = document.createElement("span");
  colorText.className = "color-text";
  colorText.textContent = color;
  
  cardContent.appendChild(colorText);
  card.appendChild(cardContent);

  // Evento: copiar color al portapapeles
  card.addEventListener("click", () => {
    navigator.clipboard.writeText(color);
    colorText.textContent = "✔ Copiado";
    setTimeout(() => colorText.textContent = color, 800);
  });

  paletteContainer.appendChild(card);
}

/**
 * Guarda la paleta actual como favorita en localStorage
 */
function savePaletteToFavorites() {
  if (currentPalette.length === 0) {
    alert("Primero genera una paleta");
    return;
  }

  let favorites = JSON.parse(localStorage.getItem("ricciePalettesFavorites")) || [];
  
  // Verificar si ya existe
  const exists = favorites.some(p => p.colors.join(",") === currentPalette.join(","));
  
  if (exists) {
    alert("Esta paleta ya está en favoritas");
    return;
  }

  const favorite = {
    id: Date.now(),
    colors: currentPalette,
    savedDate: new Date().toLocaleString("es-ES"),
    category: selectedCategory
  };

  favorites.push(favorite);
  localStorage.setItem("ricciePalettesFavorites", JSON.stringify(favorites));
  
  alert("✅ Paleta guardada como favorita");
  updateFavoritesDisplay();
}

/**
 * Muestra las paletas favoritas guardadas
 */
function updateFavoritesDisplay() {
  const favorites = JSON.parse(localStorage.getItem("ricciePalettesFavorites")) || [];

  if (favorites.length === 0) {
    favoritesList.innerHTML = '<p class="empty-message">Aún no tienes paletas favoritas. ¡Guarda una ahora!</p>';
    favoritesSection.classList.add("hidden");
    return;
  }

  favoritesSection.classList.remove("hidden");
  favoritesList.innerHTML = favorites.map((fav, index) => `
    <div class="favorite-tile">
      <div class="palette-preview">
        ${fav.colors.map(color => `<div class="color-dot" style="background: ${color};" title="${color}"></div>`).join("")}
      </div>
      <div class="favorite-info">
        <span class="category-tag">${paletteCategories[fav.category]?.name || "Personalizada"}</span>
        <small>${fav.savedDate}</small>
      </div>
      <div class="favorite-actions">
        <button class="btn-icon" onclick="loadFavoritePalette(${index})" title="Cargar">📂</button>
        <button class="btn-icon" onclick="deleteFavoritePalette(${index})" title="Eliminar">🗑️</button>
      </div>
    </div>
  `).join("");
}

/**
 * Carga una paleta favorita
 */
function loadFavoritePalette(index) {
  const favorites = JSON.parse(localStorage.getItem("ricciePalettesFavorites")) || [];
  if (favorites[index]) {
    currentPalette = favorites[index].colors;
    paletteContainer.innerHTML = "";
    currentPalette.forEach((color, i) => createColorCard(color, i));
    updateUI();
  }
}

/**
 * Elimina una paleta favorita
 */
function deleteFavoritePalette(index) {
  if (confirm("¿Eliminar esta paleta favorita?")) {
    let favorites = JSON.parse(localStorage.getItem("ricciePalettesFavorites")) || [];
    favorites.splice(index, 1);
    localStorage.setItem("ricciePalettesFavorites", JSON.stringify(favorites));
    updateFavoritesDisplay();
  }
}

/**
 * Guarda paleta en el historial
 */
function savePaletteToHistory(palette) {
  let history = JSON.parse(localStorage.getItem("ricciePalettesHistory")) || [];
  
  // Limitar a 20 registros
  if (history.length >= 20) {
    history.shift();
  }

  history.push({
    id: Date.now(),
    colors: palette,
    date: new Date().toLocaleTimeString("es-ES")
  });

  localStorage.setItem("ricciePalettesHistory", JSON.stringify(history));
  updateHistoryDisplay();
}

/**
 * Muestra el historial de paletas
 */
function updateHistoryDisplay() {
  const history = JSON.parse(localStorage.getItem("ricciePalettesHistory")) || [];

  if (history.length === 0) {
    historyList.innerHTML = '<p class="empty-message">No hay historial aún</p>';
    historySection.classList.add("hidden");
    return;
  }

  historySection.classList.remove("hidden");
  historyList.innerHTML = history.reverse().map((item, index) => `
    <div class="history-tile">
      <div class="history-preview">
        ${item.colors.map(color => `<div class="color-dot" style="background: ${color};" title="${color}"></div>`).join("")}
      </div>
      <small>${item.date}</small>
      <button class="btn-icon" onclick="loadHistoryPalette('${item.colors.join(',')}')" title="Cargar">📂</button>
    </div>
  `).join("");
}

/**
 * Carga una paleta del historial
 */
function loadHistoryPalette(colorsString) {
  currentPalette = colorsString.split(",");
  paletteContainer.innerHTML = "";
  currentPalette.forEach((color, i) => createColorCard(color, i));
  updateUI();
}

/**
 * Limpia el historial completo
 */
function clearHistory() {
  if (confirm("¿Eliminar todo el historial? Esta acción no se puede deshacer")) {
    localStorage.removeItem("ricciePalettesHistory");
    updateHistoryDisplay();
    alert("✅ Historial eliminado");
  }
}

/**
 * Exporta la paleta en formato JSON
 */
function exportAsJSON() {
  if (currentPalette.length === 0) {
    alert("Primero genera una paleta");
    return;
  }

  const data = {
    name: "Riccie'Pallets Export",
    colors: currentPalette,
    generatedDate: new Date().toISOString(),
    format: "hex"
  };

  const json = JSON.stringify(data, null, 2);
  downloadFile(json, "paleta-colores.json", "application/json");
}

/**
 * Exporta la paleta en formato SVG
 */
function exportAsSVG() {
  if (currentPalette.length === 0) {
    alert("Primero genera una paleta");
    return;
  }

  const width = 100 * currentPalette.length;
  const height = 200;
  
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <title>Riccie'Pallets - Paleta de Colores</title>
  <rect width="${width}" height="${height}" fill="#ffffff"/>
`;

  currentPalette.forEach((color, index) => {
    const x = index * 100;
    svg += `
  <rect x="${x}" y="0" width="100" height="150" fill="${color}"/>
  <text x="${x + 50}" y="180" font-family="Arial" font-size="12" text-anchor="middle">${color}</text>
`;
  });

  svg += `</svg>`;
  downloadFile(svg, "paleta-colores.svg", "image/svg+xml");
}

/**
 * Exporta la paleta en formato CSS
 */
function exportAsCSS() {
  if (currentPalette.length === 0) {
    alert("Primero genera una paleta");
    return;
  }

  let css = `:root {\n`;
  currentPalette.forEach((color, index) => {
    css += `  --color-${index + 1}: ${color};\n`;
  });
  css += `}\n`;

  downloadFile(css, "paleta-colores.css", "text/css");
}

/**
 * Descarga un archivo
 */
function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Abre menú de exportación
 */
function showExportMenu() {
  const formats = [
    { name: "JSON", action: "exportAsJSON()" },
    { name: "SVG", action: "exportAsSVG()" },
    { name: "CSS", action: "exportAsCSS()" }
  ];

  const menu = `
    <div class="export-menu">
      <h3>Selecciona un formato:</h3>
      ${formats.map(f => `<button class="export-option" onclick="${f.action}">${f.name}</button>`).join("")}
    </div>
  `;

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = menu;
  modal.addEventListener("click", () => modal.remove());
  document.body.appendChild(modal);
}

/**
 * Comparte la paleta en redes sociales
 */
function sharePalette() {
  if (currentPalette.length === 0) {
    alert("Primero genera una paleta");
    return;
  }

  const paletteText = currentPalette.join(" • ");
  const shareUrl = `https://riccie-pallets.vercel.app`; // Actualizar con tu URL real
  const text = `🎨 Mira esta increíble paleta de colores que encontré en Riccie'Pallets: ${paletteText}`;

  const platforms = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
  };

  const shareMenu = `
    <div class="share-menu">
      <h3>Compartir en:</h3>
      <a href="${platforms.twitter}" target="_blank" class="share-btn">🐦 Twitter/X</a>
      <a href="${platforms.whatsapp}" target="_blank" class="share-btn">💬 WhatsApp</a>
      <a href="${platforms.facebook}" target="_blank" class="share-btn">👥 Facebook</a>
      <button class="share-btn" onclick="copyShareLink()">📋 Copiar enlace</button>
    </div>
  `;

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = shareMenu;
  document.body.appendChild(modal);
  
  setTimeout(() => modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  }), 100);
}

/**
 * Copia el enlace compartible
 */
function copyShareLink() {
  const link = `Colores: ${currentPalette.join(", ")}`;
  navigator.clipboard.writeText(link);
  alert("✅ Colores copiados al portapapeles");
}

/**
 * Filtra por categoría
 */
function filterByCategory(category) {
  selectedCategory = category;
  categoryBtns.forEach(btn => btn.classList.remove("active"));
  event.target.classList.add("active");
  
  // Generar paleta de la categoría seleccionada
  if (category !== "all") {
    const categoryPalette = paletteCategories[category]?.colors || [];
    if (categoryPalette.length > 0) {
      currentPalette = categoryPalette.slice(0, 6);
      paletteContainer.innerHTML = "";
      currentPalette.forEach((color, i) => createColorCard(color, i));
      updateUI();
    }
  } else {
    generatePalette();
  }
}

/**
 * Actualiza la interfaz
 */
function updateUI() {
  updateFavoritesDisplay();
  updateHistoryDisplay();
}

/**
 * Toggle del modo claro/oscuro
 */
function toggleTheme() {
  darkMode = !darkMode;
  document.body.classList.toggle("light-mode");
  themeToggle.textContent = darkMode ? "🌙" : "☀️";
  localStorage.setItem("ricciePalletsTheme", darkMode ? "dark" : "light");
}

/**
 * Carga el tema guardado
 */
function loadTheme() {
  const savedTheme = localStorage.getItem("ricciePalletsTheme") || "dark";
  darkMode = savedTheme === "dark";
  
  if (!darkMode) {
    document.body.classList.add("light-mode");
    themeToggle.textContent = "☀️";
  }
}

// ===== EVENT LISTENERS =====
generateBtn.addEventListener("click", generatePalette);
themeToggle.addEventListener("click", toggleTheme);
saveFavBtn.addEventListener("click", savePaletteToFavorites);
exportBtn.addEventListener("click", showExportMenu);
shareBtn.addEventListener("click", sharePalette);
clearHistoryBtn.addEventListener("click", clearHistory);

categoryBtns.forEach(btn => {
  btn.addEventListener("click", (e) => filterByCategory(e.target.dataset.category));
});

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  loadTheme();
  generatePalette();
});
