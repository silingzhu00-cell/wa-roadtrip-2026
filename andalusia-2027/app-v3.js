const data = window.ANDALUSIA_DATA;
const $ = (selector) => document.querySelector(selector);

function renderCities() {
  $("#city-grid").innerHTML = data.cities.map((city, index) => `
    <article class="city-item"><span class="num">0${index + 1}</span><h3>${city.name}</h3><small>${city.era}</small><p>${city.text}</p></article>
  `).join("");
}

function renderTabs() {
  ["day-tabs", "day-tabs-bottom"].forEach((containerId, groupIndex) => {
    $(`#${containerId}`).innerHTML = data.days.map((day, index) => `
      <button class="day-tab" role="tab" id="tab-${groupIndex ? "bottom" : "top"}-${day.id}" aria-controls="day-panel" aria-selected="${index === 0}" data-day="${index}" data-position="${groupIndex ? "bottom" : "top"}" title="查看 ${day.date} 行程">${day.date}<span>${day.city.split(" → ")[0]}</span><small>点击查看</small></button>
    `).join("");
  });
  document.querySelectorAll(".day-tab").forEach(button => button.addEventListener("click", () => {
    selectDay(Number(button.dataset.day), button.dataset.position === "bottom");
  }));
  document.querySelectorAll(".day-tabs-shell").forEach(setupScrollCue);
}

function setupScrollCue(shell) {
  const tabs = shell.querySelector(".day-tabs");
  const update = () => shell.classList.toggle("is-end", tabs.scrollLeft + tabs.clientWidth >= tabs.scrollWidth - 4);
  tabs.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  requestAnimationFrame(update);
}

function selectDay(index, scrollToPanel = false) {
  const day = data.days[index];
  document.querySelectorAll(".day-tab").forEach(tab => tab.setAttribute("aria-selected", Number(tab.dataset.day) === index));
  const panel = $("#day-panel");
  panel.setAttribute("aria-labelledby", `tab-top-${day.id}`);
  panel.innerHTML = `
    <div class="day-kicker"><span>DAY ${String(index + 1).padStart(2,"0")} · ${day.date} ${day.weekday}</span><span>${day.theme}</span></div>
    <div class="day-title"><h3>${day.city}</h3><p>${day.focus}</p></div>
    ${day.pitch ? `<p class="day-pitch">${day.pitch}</p>` : ""}
    ${day.photos ? `<div class="photo-story">${day.photos.map(photo => `
      <figure><a href="https://commons.wikimedia.org/wiki/File:${encodeURIComponent(photo.file)}" target="_blank" rel="noreferrer"><img src="https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(photo.file)}?width=1200" alt="${photo.title}"></a><figcaption><b>${photo.title}</b><span>${photo.caption}</span><small>图：${photo.credit} ↗</small></figcaption></figure>
    `).join("")}</div>` : ""}
    <div class="status-strip">
      <div><b>住宿</b>${day.stay}</div><div><b>交通</b>${day.transit}</div><div><b>历史气候均值</b>${day.weather}</div>
    </div>
    <div class="timeline">${day.events.map(event => `<div class="event"><time>${event.time}</time><div><h4>${event.title}</h4><p>${event.note}</p></div></div>`).join("")}</div>
    <div class="day-footer"><div class="note-block"><b>动态状态</b>${day.status}</div><div class="note-block"><b>预订优先级</b>${day.reserve}</div></div>
    <div class="official-links">${day.links.map(link => `<a href="${link.url}" target="_blank" rel="noreferrer">${link.label} ↗</a>`).join("")}</div>
  `;
  history.replaceState(null, "", `#day-${day.id}`);
  document.querySelectorAll(`.day-tab[data-day="${index}"]`).forEach(tab => {
    const tabs = tab.closest(".day-tabs");
    tabs.scrollTo({ left: Math.max(0, tab.offsetLeft - (tabs.clientWidth - tab.offsetWidth) / 2), behavior: "smooth" });
  });
  if (scrollToPanel) requestAnimationFrame(() => panel.scrollIntoView({ behavior: "smooth", block: "start" }));
}

function renderPlanning() {
  $("#reservation-list").innerHTML = data.reservations.map((item,index) => `
    <label class="check-row"><input type="checkbox" data-check="booking-${index}"><span class="priority">${item.priority}</span><span><b>${item.item}</b><p>${item.detail}</p></span></label>
  `).join("");
  $("#transport-list").innerHTML = data.transportChecks.map(item => `
    <article class="transport-card"><header><h4>${item.leg}</h4><span class="state">${item.state}</span></header><p>${item.check}</p><small>${item.target}</small></article>
  `).join("");
  document.querySelectorAll("[data-check]").forEach(input => {
    input.checked = localStorage.getItem(input.dataset.check) === "1";
    input.addEventListener("change", () => localStorage.setItem(input.dataset.check, input.checked ? "1" : "0"));
  });
}

function renderReadingAndSources() {
  $("#reading-zh").innerHTML = data.reading.zh.map(item => `<li>${item}</li>`).join("");
  $("#reading-en").innerHTML = data.reading.en.map(item => `<li>${item}</li>`).join("");
  $("#source-list").innerHTML = data.sources.map(([label,url]) => `<a class="source-link" href="${url}" target="_blank" rel="noreferrer">${label}<span>↗</span></a>`).join("");
}

renderCities(); renderTabs(); renderPlanning(); renderReadingAndSources();
const hashDay = data.days.findIndex(day => location.hash === `#day-${day.id}`);
selectDay(hashDay >= 0 ? hashDay : 0);
