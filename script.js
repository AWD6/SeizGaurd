function takeMed() {
  localStorage.setItem("medStatus", "taken");
  alert("บันทึกว่ากินยาแล้ว");
}

function missMed() {
  localStorage.setItem("medStatus", "missed");
  alert("กรุณากินยาให้ครบตามแพทย์สั่ง");
}

function showPage(id) {
  document.querySelector(".app").classList.add("hidden");
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

function goHome() {
  document.querySelector(".app").classList.remove("hidden");
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
}

function saveLog() {
  const text = document.getElementById("symptom").value;
  if (!text) return;

  const logList = document.getElementById("logList");
  const p = document.createElement("p");
  p.textContent = new Date().toLocaleString() + " : " + text;
  logList.appendChild(p);

  document.getElementById("symptom").value = "";
}
