// Shared by the phone compass and the computer viewer

const DIRECTIONS = ["צפון", "צפון־מזרח", "מזרח", "דרום־מזרח", "דרום", "דרום־מערב", "מערב", "צפון־מערב"];
const CARDINALS = { 0: "צ", 90: "מז", 180: "ד", 270: "מע" };

// Live link between phone and computer: a free public MQTT server (no key needed).
// The phone publishes to a topic named after the pairing code; the computer subscribes to it.
const MQTT_URL = "wss://broker.hivemq.com:8884/mqtt";
const topicFor = (code) => `ai-homework-ronenkla/compass/${code}`;

function connectMqtt() {
  return mqtt.connect(MQTT_URL, {
    clientId: "aihw_" + Math.random().toString(16).slice(2, 10),
    reconnectPeriod: 2000,
    connectTimeout: 8000,
  });
}

// Draw the dial into an <svg> and return a function that turns it to a heading.
// The dial keeps a running angle so it never spins the long way around 0°/360°.
function createDial(svg) {
  const ns = "http://www.w3.org/2000/svg";
  const add = (tag, attrs, text) => {
    const el = document.createElementNS(ns, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (text) el.textContent = text;
    svg.appendChild(el);
    return el;
  };
  const css = getComputedStyle(document.documentElement);
  const color = (name) => css.getPropertyValue(name).trim();

  add("circle", { r: 98, fill: color("--dial"), stroke: color("--line"), "stroke-width": 2 });

  for (let a = 0; a < 360; a += 5) {
    const major = a % 30 === 0;
    const rad = (a - 90) * Math.PI / 180;
    const r1 = 94, r2 = major ? 82 : 88;
    add("line", {
      x1: r1 * Math.cos(rad), y1: r1 * Math.sin(rad),
      x2: r2 * Math.cos(rad), y2: r2 * Math.sin(rad),
      stroke: a === 0 ? color("--north") : major ? color("--text") : color("--muted"),
      "stroke-width": major ? 2 : 1,
    });
    const label = CARDINALS[a] ?? (major ? String(a) : null);
    if (label) {
      const big = a in CARDINALS;
      const rl = big ? 66 : 72;
      const x = rl * Math.cos(rad), y = rl * Math.sin(rad);
      add("text", {
        x, y,
        fill: a === 0 ? color("--north") : big ? color("--text") : color("--muted"),
        "font-size": big ? 15 : 8,
        "font-weight": big ? 700 : 400,
        "text-anchor": "middle",
        "dominant-baseline": "central",
        transform: `rotate(${a} ${x} ${y})`,
      }, label);
    }
  }

  // Needle: red half points north, white half south
  add("polygon", { points: "0,-50 7,0 -7,0", fill: color("--north") });
  add("polygon", { points: "0,50 7,0 -7,0", fill: color("--text") });
  add("circle", { r: 4, fill: color("--bg") });

  let rotation = 0;
  let last = null;
  return function setHeading(heading) {
    heading = (heading % 360 + 360) % 360;
    if (last === null) rotation = heading;
    else rotation += ((heading - last + 540) % 360) - 180;
    last = heading;
    svg.style.transform = `rotate(${-rotation}deg)`;
    return { degrees: Math.round(heading) % 360, name: DIRECTIONS[Math.round(heading / 45) % 8] };
  };
}
