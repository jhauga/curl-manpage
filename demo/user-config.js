// A personal convenience, not part of the proposal: opened with
// ?user-config=true, the page starts with "Keep Expanded" checked.
document.addEventListener("DOMContentLoaded", () => {
  const pin = document.getElementById("pinoptions");
  const optsearchId = document.getElementById("optsearch");
  if (pin && location.search === "?user-config=true") pin.checked = true;
  setTimeout(()=>{optsearchId.focus();}, 500);
});
