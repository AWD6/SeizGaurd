function showDetail() {
  document.querySelector(".phone").classList.add("hidden");
  document.getElementById("detail").classList.remove("hidden");
}

function back() {
  document.querySelector(".phone").classList.remove("hidden");
  document.getElementById("detail").classList.add("hidden");
}
