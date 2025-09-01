// === CONFIG ===
const API_KEY = "AIzaSyASIc1faG8LAZc4IWBzqkS9nczsNaFGlLo"; // ganti pakai API key Gemini kamu
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// === DOM ===
const chatbox = document.getElementById("chatbox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// === Manual QA rules ===
function getManualReply(raw) {
  const q = raw.toLowerCase().replace(/[?!.]/g, "").replace(/\s+/g, " ").trim();

  const isDev =
    q === "siapa pembuatnya" ||
    q === "siapa devolopernya" ||
    q === "siapa dev web ini" ||
    q.includes("dev nya siapa") ||
    q.includes("developer siapa") ||
    q.includes("siapa devoloper ini");

  const isOwnerAI =
    q === "pemilik ai siapa" ||
    q === "siapa pemilik ai" ||
    q.includes("pemilik ai nya siapa") ||
    q.includes("owner ai siapa");

  if (isDev) return "Developer saya adalah Giaza Fakusnama Maulana, seorang pengembang AI asal Indonesia, yang berdomisili di Kota Serang, Provinsi Banten.";
  if (isOwnerAI) return "Pemilik AI adalah GEZY (Giaza Fakusnama Ulana), seorang pengembang asal Indonesia, berdomisili di Kota Serang, Provinsi Banten.";
  return null;
}

// === UI Helpers ===
function appendUserMessage(text) {
  const msg = document.createElement("div");
  msg.className = "message user";
  msg.innerText = text;
  chatbox.appendChild(msg);
  chatbox.scrollTop = chatbox.scrollHeight;
}

function typeBotMessage(text, speed = 35) {
  const msg = document.createElement("div");
  msg.className = "message bot";
  msg.innerHTML = ""; // pakai innerHTML supaya bisa <br>
  chatbox.appendChild(msg);
  chatbox.scrollTop = chatbox.scrollHeight;

  let i = 0;
  function typing() {
    if (i < text.length) {
      const char = text.charAt(i);
      if (char === "\n") {
        msg.innerHTML += "<br>";
      } else {
        msg.innerHTML += char;
      }
      i++;
      chatbox.scrollTop = chatbox.scrollHeight;
      setTimeout(typing, speed);
    }
  }
  typing();
}

function showTyping() {
  const typing = document.createElement("div");
  typing.className = "typing";
  typing.innerHTML = `<span></span><span></span><span></span>`;
  chatbox.appendChild(typing);
  chatbox.scrollTop = chatbox.scrollHeight;
  return typing;
}

// === Main ===
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  appendUserMessage(text);
  userInput.value = "";

  // cek manual
  const manual = getManualReply(text);
  if (manual) {
    const typingIndicator = showTyping();
    setTimeout(() => {
      typingIndicator.remove();
      typeBotMessage(manual);
    }, 600); // delay biar natural
    return;
  }

  // fallback ke Gemini
  const typingIndicator = showTyping();
  try {
    const response = await fetch(GEMINI_ENDPOINT + "?key=" + API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
      }),
    });

    const data = await response.json();
    typingIndicator.remove();

    if (data && data.candidates && data.candidates.length > 0) {
      const reply = data.candidates[0].content.parts[0].text;
      typeBotMessage(reply && reply.trim() ? reply : "⚠️ AI tidak memberi jawaban.");
    } else {
      typeBotMessage("⚠️ Tidak ada jawaban dari AI.");
    }
  } catch (err) {
    typingIndicator.remove();
    typeBotMessage("❌ Error: " + err.message);
  }
}

// === Events ===
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
if (sendBtn) {
  sendBtn.addEventListener("click", sendMessage);
}