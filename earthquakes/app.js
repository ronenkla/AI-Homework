// USGS earthquake feed: free GeoJSON, no key needed
// https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
const FEED_URL = (level, period) =>
  `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${level}_${period}.geojson`;

const $ = (id) => document.getElementById(id);

const map = L.map("map", { worldCopyJump: true }).setView([25, 20], 2);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 18,
  className: "dark-tiles",
}).addTo(map);
const layer = L.layerGroup().addTo(map);

// Color by magnitude: green (weak) -> red (strong)
function magColor(m) {
  if (m >= 6) return "#d7191c";
  if (m >= 5) return "#f46d43";
  if (m >= 4) return "#fdae61";
  if (m >= 3) return "#fee08b";
  if (m >= 2) return "#d9ef8b";
  return "#a6d96a";
}

const fmtTime = (ms) =>
  new Date(ms).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" });

function timeAgo(ms) {
  const min = Math.round((Date.now() - ms) / 60000);
  if (min < 60) return `לפני ${min} דק׳`;
  const h = Math.round(min / 60);
  if (h < 48) return `לפני ${h} שע׳`;
  return `לפני ${Math.round(h / 24)} ימים`;
}

function setStatus(msg) { $("status").textContent = msg; }

async function load() {
  setStatus("טוען נתונים...");
  try {
    const res = await fetch(FEED_URL($("level").value, $("period").value));
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const quakes = data.features
      .filter((f) => f.properties.mag !== null)
      .sort((a, b) => b.properties.time - a.properties.time);
    render(quakes);
    setStatus(`עודכן: ${fmtTime(data.metadata.generated)}`);
  } catch (err) {
    setStatus("שגיאה בטעינת הנתונים: " + err.message);
  }
}

function render(quakes) {
  layer.clearLayers();
  const list = $("list");
  list.innerHTML = "";

  if (quakes.length === 0) {
    list.innerHTML = '<li>לא נמצאו רעידות בטווח הזה 🙂</li>';
  }

  for (const q of quakes) {
    const p = q.properties;
    const [lon, lat, depth] = q.geometry.coordinates;
    const color = magColor(p.mag);

    const popup = `
      <b>עוצמה ${p.mag.toFixed(1)}</b><br>
      <span dir="ltr">${p.place ?? ""}</span><br>
      ${fmtTime(p.time)}<br>
      עומק: ${depth.toFixed(0)} ק״מ
      ${p.tsunami ? "<br>🌊 אזהרת צונאמי" : ""}<br>
      <a href="${p.url}" target="_blank" rel="noopener">פרטים ב־USGS</a>`;

    const marker = L.circleMarker([lat, lon], {
      radius: Math.max(3, p.mag * 3),
      color,
      fillColor: color,
      fillOpacity: 0.6,
      weight: 1,
    }).bindPopup(popup).addTo(layer);

    const li = document.createElement("li");
    li.innerHTML = `
      <div class="mag" style="background:${color}">${p.mag.toFixed(1)}</div>
      <div>
        <div class="place">${p.place ?? "מיקום לא ידוע"}</div>
        <div class="time">${timeAgo(p.time)} · עומק ${depth.toFixed(0)} ק״מ</div>
        ${p.tsunami ? '<div class="tsunami">🌊 אזהרת צונאמי</div>' : ""}
      </div>`;
    li.onclick = () => {
      map.flyTo([lat, lon], 6);
      marker.openPopup();
    };
    list.appendChild(li);
  }

  renderStats(quakes);
}

function renderStats(quakes) {
  const mags = quakes.map((q) => q.properties.mag);
  const strongest = quakes.reduce((a, b) => (b.properties.mag > (a?.properties.mag ?? -Infinity) ? b : a), null);
  const avg = mags.length ? mags.reduce((s, m) => s + m, 0) / mags.length : 0;
  $("stats").innerHTML = `
    <div class="stat"><b>${quakes.length}</b><span>רעידות</span></div>
    <div class="stat"><b>${strongest ? strongest.properties.mag.toFixed(1) : "—"}</b><span>החזקה ביותר</span></div>
    <div class="stat"><b>${avg.toFixed(1)}</b><span>עוצמה ממוצעת</span></div>
    <div class="stat"><b>${mags.filter((m) => m >= 5).length}</b><span>בעוצמה 5+</span></div>`;
}

$("period").addEventListener("change", load);
$("level").addEventListener("change", load);
$("refresh").addEventListener("click", load);

load();
setInterval(load, 5 * 60 * 1000); // auto-refresh every 5 minutes
