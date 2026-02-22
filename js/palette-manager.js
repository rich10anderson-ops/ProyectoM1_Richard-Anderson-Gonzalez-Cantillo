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
const clearHistoryBtn = document.getElementById("clearHistoryNavBtn") || document.getElementById("clearHistoryBtn");
const categoryBtns = document.querySelectorAll(".category-btn");

// Estado global
let currentPalette = [];
let selectedCategory = "all";
let darkMode = true;
let paletteSize = 6;

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
 * Genera una nueva paleta con el tamaño seleccionado
 */
function generatePalette() {
  currentPalette = [];
  paletteContainer.innerHTML = "";

  for (let i = 0; i < paletteSize; i++) {
    const color = randomColor();
    currentPalette.push(color);
    createColorCard(color, i);
  }
 alert(`✅ Paleta lista con ${currentPalette.length} colores`);
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
  
  // Guardar hex original para re-render y acciones
  card.dataset.hex = color;
  
  const colorText = document.createElement("span");
  colorText.className = "color-text";
  // Mostrar el valor según el selector de formato (HSL / RGBA)
  colorText.textContent = formatColorForDisplay(color);
  
  cardContent.appendChild(colorText);
  card.appendChild(cardContent);

  // Evento: copiar color al portapapeles
  card.addEventListener("click", () => {
    const formatted = formatColorForDisplay(card.dataset.hex);
    navigator.clipboard.writeText(formatted);
    const previous = colorText.textContent;
    colorText.textContent = "✔ Copiado";
    setTimeout(() => colorText.textContent = previous, 800);
    alert(`✅ Color copiado: ${formatted}`);
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
 * Convierte un color hex a HSL
 */
function hexToHsl(hex) {
  const bigint = parseInt(hex.replace('#',''), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
      case gNorm: h = (bNorm - rNorm) / d + 2; break;
      case bNorm: h = (rNorm - gNorm) / d + 4; break;
    }
    h = Math.round(h * 60);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
  }

  return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * Convierte hex a rgba (alpha opcional)
 */
function hexToRgba(hex, alpha = 1) {
  const bigint = parseInt(hex.replace('#',''), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Genera un thumbnail SVG en forma de rombo a partir de una lista de colores
 * Devuelve markup SVG como string
 */
function renderHistoryThumbnail(colors, format = 'hsl') {
  const size = 72;
  const slice = Math.max(1, Math.floor(size / colors.length));
  const center = size / 2;
  let rects = '';

  colors.forEach((c, i) => {
    const x = i * slice;
    const value = format === 'rgba' ? hexToRgba(c, 1) : hexToHsl(c);
    rects += `<rect x="${x}" y="0" width="${slice + 1}" height="${size}" fill="${c}"><title>${value}</title></rect>`;
  });

  const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Miniatura de paleta">
  <g transform="rotate(45 ${center} ${center})">
    ${rects}
  </g>
</svg>`;

  return svg;
}

/** Devuelve el valor formateado segun el selector global */
function formatColorForDisplay(hex) {
  const selector = document.getElementById('historyFormatSelect');
  const format = selector ? selector.value : 'hsl';
  return format === 'rgba' ? hexToRgba(hex, 1) : hexToHsl(hex);
}

/** Re-renderiza las tarjetas actuales del generador con el formato seleccionado */
function updatePaletteCardsFormat() {
  const cards = document.querySelectorAll('#palette .color-card');
  cards.forEach(card => {
    const hex = card.dataset.hex;
    if (!hex) return;
    const txt = card.querySelector('.color-text');
    if (txt) txt.textContent = formatColorForDisplay(hex);
  });
}

/**
 * Muestra el historial de paletas
 */
function updateHistoryDisplay() {
  const history = JSON.parse(localStorage.getItem("ricciePalettesHistory")) || [];
  const formatSelect = document.getElementById('historyFormatSelect');
  const format = formatSelect ? formatSelect.value : 'hsl';

  if (history.length === 0) {
    historyList.innerHTML = '<p class="empty-message">No hay historial aún</p>';
    historySection.classList.add("hidden");
    return;
  }

  historySection.classList.remove("hidden");
  // Mostrar más reciente primero
  const items = history.slice().reverse().slice(0, 3); // mostrar solo las 3 más recientes

  historyList.innerHTML = items.map((item, index) => {
    const svg = renderHistoryThumbnail(item.colors, format);
    return `
    <div class="history-tile">
      <div class="history-thumb">${svg}</div>
      <div class="history-overlay">
        <button class="btn-small" onclick="downloadHistoryPaletteSVG('${item.colors.join(',')}', 'hsl')">Descargar SVG (HSL)</button>
        <button class="btn-small" onclick="downloadHistoryPaletteSVG('${item.colors.join(',')}', 'rgba')">Descargar SVG (RGBA)</button>
        <button class="btn-small" onclick="copyHistoryColors('${item.colors.join(',')}', '${format}')">Copiar (${format.toUpperCase()})</button>
        <button class="btn-small" onclick="loadHistoryPalette('${item.colors.join(',')}')">Cargar</button>
        <button class="btn-small" onclick="saveColorsAsFavorite('${item.colors.join(',')}')">❤️ Favorito</button>
      </div>
      <small>${item.date}</small>
      <button class="btn-icon" onclick="loadHistoryPalette('${item.colors.join(',')}')" title="Cargar">📂</button>
    </div>
  `;
  }).join("");
}

/**
 * Descargar una paleta del historial como SVG usando HSL o RGBA
 * colorsString: '#aa00ff,#00ff88,...'
 */
function downloadHistoryPaletteSVG(colorsString, format = 'hsl') {
  const colors = colorsString.split(',');
  const width = 100 * colors.length;
  const height = 220;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  svg += `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">\n`;
  svg += `<rect width="100%" height="100%" fill="#ffffff"/>\n`;

  colors.forEach((c, i) => {
    const x = i * 100;
    const fill = format === 'rgba' ? hexToRgba(c, 1) : hexToHsl(c);
    svg += `<rect x="${x}" y="0" width="100" height="160" fill="${fill}"/>\n`;
    svg += `<text x="${x + 50}" y="190" font-family="Arial" font-size="12" text-anchor="middle" fill="#333">${fill}</text>\n`;
  });

  svg += `</svg>`;

  const filename = `paleta-historial-${Date.now()}.svg`;
  downloadFile(svg, filename, 'image/svg+xml');
}

/** Copia los colores formateados al portapapeles */
function copyHistoryColors(colorsString, format = 'hsl') {
  const colors = colorsString.split(',');
  const mapped = colors.map(c => format === 'rgba' ? hexToRgba(c,1) : hexToHsl(c));
  const text = mapped.join(', ');
  navigator.clipboard.writeText(text);
  alert('✅ Colores copiados: ' + text);
}

/** Guarda una paleta (pasada como string) en favoritos */
function saveColorsAsFavorite(colorsString) {
  const colors = colorsString.split(',');
  let favorites = JSON.parse(localStorage.getItem("ricciePalettesFavorites")) || [];
  const exists = favorites.some(p => p.colors.join(',') === colors.join(','));
  if (exists) { alert('Esta paleta ya está en favoritas'); return; }
  const favorite = { id: Date.now(), colors: colors, savedDate: new Date().toLocaleString('es-ES'), category: 'personal' };
  favorites.push(favorite);
  localStorage.setItem('ricciePalettesFavorites', JSON.stringify(favorites));
  updateFavoritesDisplay();
  alert('✅ Paleta guardada en favoritas');
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
  alert("👌 Colores copiados al portapapeles");
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
if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener('click', clearHistory);
  // hover preview: mostrar la última paleta generada en pequeño
  clearHistoryBtn.addEventListener('mouseenter', (e) => {
    const btn = e.currentTarget;
    // evitar duplicados
    if (btn.querySelector('.nav-history-preview')) return;
    let colors = currentPalette && currentPalette.length ? currentPalette : (JSON.parse(localStorage.getItem('ricciePalettesHistory') || '[]').slice(-1)[0]?.colors || []);
    const preview = document.createElement('div');
    preview.className = 'nav-history-preview';
    colors.forEach(c => {
      const sw = document.createElement('div');
      sw.className = 'nav-history-swatch';
      sw.style.background = c;
      preview.appendChild(sw);
    });
    btn.appendChild(preview);
  });
  clearHistoryBtn.addEventListener('mouseleave', (e) => {
    const btn = e.currentTarget;
    const p = btn.querySelector('.nav-history-preview');
    if (p) p.remove();
  });
} else {
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('clearHistoryNavBtn') || document.getElementById('clearHistoryBtn');
    if (btn) btn.addEventListener('click', clearHistory);
  });
}

// Botón para refrescar el render del historial manualmente (navbar)
const refreshHistoryNavBtn = document.getElementById('refreshHistoryNavBtn') || document.getElementById('refreshHistoryBtn');
if (refreshHistoryNavBtn) {
  refreshHistoryNavBtn.addEventListener('click', () => {
    updateHistoryDisplay();
    const section = document.getElementById('historySection');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
} else {
  document.addEventListener('DOMContentLoaded', () => {
    const b = document.getElementById('refreshHistoryNavBtn') || document.getElementById('refreshHistoryBtn');
    if (b) b.addEventListener('click', () => { updateHistoryDisplay(); const s = document.getElementById('historySection'); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
  });
}

// Listener para selector de formato en historial (HSL / RGBA)
const historyFormatSelect = document.getElementById('historyFormatSelect');
if (historyFormatSelect) {
  historyFormatSelect.addEventListener('change', () => { updateHistoryDisplay(); updatePaletteCardsFormat(); });
} else {
  document.addEventListener('DOMContentLoaded', () => {
    const s = document.getElementById('historyFormatSelect');
    if (s) s.addEventListener('change', () => { updateHistoryDisplay(); updatePaletteCardsFormat(); });
  });
}

categoryBtns.forEach(btn => {
  btn.addEventListener("click", (e) => filterByCategory(e.target.dataset.category));
});

// Event listeners para tamaño de paleta
document.querySelectorAll(".size-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
    paletteSize = parseInt(e.target.dataset.size);
    generatePalette();
  });
});

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  loadTheme();
  generatePalette();
});
