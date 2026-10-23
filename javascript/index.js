// ---------- The cities in the select ----------
// Each city has its name, its country code (for the flag) and its time zone.
const REGIONS = [
  {
    name: "Africa",
    cities: [
      { name: "Cairo", country: "EG", zone: "Africa/Cairo" },
      { name: "Johannesburg", country: "ZA", zone: "Africa/Johannesburg" },
      { name: "Lagos", country: "NG", zone: "Africa/Lagos" },
      { name: "Nairobi", country: "KE", zone: "Africa/Nairobi" },
    ],
  },
  {
    name: "Americas",
    cities: [
      { name: "Los Angeles", country: "US", zone: "America/Los_Angeles" },
      { name: "Mexico City", country: "MX", zone: "America/Mexico_City" },
      { name: "New York", country: "US", zone: "America/New_York" },
      { name: "São Paulo", country: "BR", zone: "America/Sao_Paulo" },
      { name: "Toronto", country: "CA", zone: "America/Toronto" },
    ],
  },
  {
    name: "Asia",
    cities: [
      { name: "Dubai", country: "AE", zone: "Asia/Dubai" },
      { name: "Mumbai", country: "IN", zone: "Asia/Kolkata" },
      { name: "Seoul", country: "KR", zone: "Asia/Seoul" },
      { name: "Singapore", country: "SG", zone: "Asia/Singapore" },
      { name: "Tokyo", country: "JP", zone: "Asia/Tokyo" },
    ],
  },
  {
    name: "Europe",
    cities: [
      { name: "Berlin", country: "DE", zone: "Europe/Berlin" },
      { name: "Istanbul", country: "TR", zone: "Europe/Istanbul" },
      { name: "London", country: "GB", zone: "Europe/London" },
      { name: "Paris", country: "FR", zone: "Europe/Paris" },
    ],
  },
  {
    name: "Oceania",
    cities: [
      { name: "Auckland", country: "NZ", zone: "Pacific/Auckland" },
      { name: "Honolulu", country: "US", zone: "Pacific/Honolulu" },
      { name: "Sydney", country: "AU", zone: "Australia/Sydney" },
    ],
  },
];

// The three cities shown on the homepage
const HOME_ZONES = ["America/Los_Angeles", "Europe/Paris", "Australia/Sydney"];

const PAGE_TITLE = "World Clock - Tasneem Mahomed";

// A quick way to find a city by its time zone
const CITY_BY_ZONE = {};
REGIONS.forEach(function (region) {
  region.cities.forEach(function (city) {
    CITY_BY_ZONE[city.zone] = city;
  });
});

// ---------- Page elements ----------
const select = document.querySelector("#city");
const citiesElement = document.querySelector("#cities");
const announce = document.querySelector("#announce");

// ---------- Small helpers ----------
// Create an element with a class and some text
function el(tag, className, text) {
  let element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

// "FR" -> the French flag emoji
function flagEmoji(countryCode) {
  return Array.from(countryCode.toUpperCase())
    .map(function (letter) {
      return String.fromCodePoint(0x1f1e6 + letter.charCodeAt(0) - 65);
    })
    .join("");
}

// A little map pin, drawn as an SVG, for "my current location"
const PIN_SVG =
  '<svg class="pin" viewBox="0 0 24 24" aria-hidden="true">' +
  '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>' +
  '<circle cx="12" cy="10" r="3"/></svg>';

// Some devices report older zone names. These show the modern, friendly name.
const NAME_OVERRIDES = {
  "America/Sao_Paulo": "São Paulo",
  "Asia/Calcutta": "Kolkata",
  "Asia/Saigon": "Ho Chi Minh City",
  "Asia/Katmandu": "Kathmandu",
  "Asia/Rangoon": "Yangon",
  "Europe/Kiev": "Kyiv",
};

// The name to show for a time zone. For the cities in our list we use our own name.
// For "my current location" we use the real zone name, because one time zone covers
// many places (the Asia/Kolkata zone is all of India, not just Mumbai).
// "America/Argentina/Buenos_Aires" -> "Buenos Aires".
function getCityInfo(zone, isMyLocation) {
  let known = CITY_BY_ZONE[zone];
  if (known && !isMyLocation) return known;

  let name = NAME_OVERRIDES[zone] || zone.split("/").pop().replace(/_/g, " ");
  return { name: name, country: known ? known.country : null, zone: zone };
}

// Is this text a real time zone? (It can come from the web address, so we check carefully.)
function isValidZone(zone) {
  if (!/^[A-Za-z0-9_+\-/]{1,64}$/.test(zone)) return false;

  try {
    return Boolean(moment.tz.zone(zone));
  } catch (error) {
    return false;
  }
}

// The time zone of the person using the page, read from their device
function getMyZone() {
  let fromDevice = "";

  try {
    fromDevice = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch (error) {
    fromDevice = "";
  }

  if (isValidZone(fromDevice)) return fromDevice;
  return moment.tz.guess() || "UTC";
}

// "7h ahead of you", "3h 30m behind you", "Same time as you"
function describeDifference(minutes) {
  if (minutes === 0) return "Same time as you";

  let absolute = Math.abs(minutes);
  let hours = Math.floor(absolute / 60);
  let rest = absolute % 60;
  let amount = hours ? (rest ? `${hours}h ${rest}m` : `${hours}h`) : `${rest}m`;

  return `${amount} ${minutes > 0 ? "ahead of" : "behind"} you`;
}

// "Today", "Tomorrow" or "Yesterday", compared with the date where you are
function describeDay(cityTime, myTime) {
  let days = moment(cityTime.format("YYYY-MM-DD")).diff(
    moment(myTime.format("YYYY-MM-DD")),
    "days"
  );

  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  return "Today";
}

// ---------- Building a city card ----------
function createCard(zone, isMyLocation, isLarge) {
  let info = getCityInfo(zone, isMyLocation);

  let card = el("article", "city" + (isLarge ? " city--large" : ""));
  card.dataset.zone = zone;

  let left = el("div", "city-info");

  if (isMyLocation) {
    left.append(el("p", "eyebrow", "Your current location"));
  }

  let title = el("h2");
  if (isMyLocation) {
    let pin = el("span", "title-icon");
    pin.innerHTML = PIN_SVG; // our own fixed drawing, not text from anywhere else
    title.append(pin);
  } else if (info.country) {
    title.append(el("span", "flag", flagEmoji(info.country)));
  }
  title.append(info.name);
  left.append(title);

  left.append(el("div", "date"));
  left.append(el("p", "zone", zone.replace(/_/g, " ")));

  let chips = el("ul", "chips");
  ["chip-offset", "chip-difference", "chip-day"].forEach(function (name) {
    chips.append(el("li", "chip " + name));
  });
  left.append(chips);

  let time = el("div", "time");
  time.append(el("span", "clock"), " ", el("small", "ampm"));

  card.append(left, time);
  return card;
}

// Fill in the live numbers for one card
function updateCard(card) {
  let zone = card.dataset.zone;
  let cityTime = moment().tz(zone);
  let myTime = moment();
  let hour = cityTime.hour();

  card.querySelector(".date").textContent = cityTime.format("ddd, MMMM Do YYYY");
  card.querySelector(".clock").textContent = cityTime.format("h:mm:ss");
  card.querySelector(".ampm").textContent = cityTime.format("A");

  card.querySelector(".chip-offset").textContent = `UTC${cityTime.format("Z")}`;
  card.querySelector(".chip-difference").textContent = describeDifference(
    cityTime.utcOffset() - myTime.utcOffset()
  );
  card.querySelector(".chip-day").textContent = describeDay(cityTime, myTime);

  card.dataset.mood = hour >= 6 && hour < 18 ? "day" : "night";
}

// One timer keeps every card on the page ticking
function tick() {
  document.querySelectorAll(".city").forEach(updateCard);
}

// ---------- The two views ----------
function showHome() {
  citiesElement.replaceChildren(
    ...HOME_ZONES.map(function (zone) {
      return createCard(zone, false, false);
    })
  );

  select.value = "";
  document.title = PAGE_TITLE;
  announce.textContent = "Showing all cities";
  tick();
}

function showCity(zone, isMyLocation) {
  let info = getCityInfo(zone, isMyLocation);

  // A link back to the homepage
  let backLink = el("a", "back", "All cities");
  backLink.href = "./";
  backLink.dataset.home = "";

  citiesElement.replaceChildren(createCard(zone, isMyLocation, true), backLink);

  let hasOption = Array.from(select.options).some(function (option) {
    return option.value === zone;
  });
  select.value = isMyLocation ? "current" : hasOption ? zone : "";

  document.title = `${info.name} - World Clock`;
  announce.textContent = isMyLocation
    ? `Showing the time in your current location, ${info.name}`
    : `Showing the time in ${info.name}`;
  tick();
}

// ---------- Which view to show? (the web address decides) ----------
// "#Asia/Tokyo" opens Tokyo, "#current" opens your location, no "#" shows all cities.
// That means every city has its own link you can share, and the back button works.
function getHash() {
  try {
    return decodeURIComponent(window.location.hash.slice(1));
  } catch (error) {
    return "";
  }
}

function route() {
  let hash = getHash();

  if (hash === "current") {
    showCity(getMyZone(), true);
  } else if (hash && isValidZone(hash)) {
    showCity(hash, false);
  } else {
    showHome();
  }
}

function goTo(hash) {
  let address = window.location.pathname + window.location.search + (hash ? "#" + hash : "");

  try {
    window.history.pushState(null, "", address);
  } catch (error) {
    window.location.hash = hash; // some browsers don't allow pushState on local files
  }

  route();
}

// ---------- The select ----------
function buildSelect() {
  REGIONS.forEach(function (region) {
    let group = document.createElement("optgroup");
    group.label = region.name;

    region.cities.forEach(function (city) {
      let option = document.createElement("option");
      option.value = city.zone;
      option.textContent = `${city.name} ${flagEmoji(city.country)}`;
      group.append(option);
    });

    select.append(group);
  });
}

function handleSelectChange() {
  goTo(select.value);
}

// Links to the homepage ("All cities" and the title) shouldn't reload the page
function handleClick(event) {
  let link = event.target.closest("a[data-home]");
  if (!link) return;

  event.preventDefault();
  goTo("");
}

// ---------- Start ----------
function start() {
  buildSelect();

  select.addEventListener("change", handleSelectChange);
  document.addEventListener("click", handleClick);
  window.addEventListener("popstate", route);
  window.addEventListener("hashchange", route);

  route();
  setInterval(tick, 1000);
}

// If the moment.js files couldn't load (for example, no internet), say so nicely
if (typeof moment === "undefined" || !moment.tz) {
  citiesElement.append(
    el("p", "message", "Sorry, the clock couldn't load. Please check your internet connection and refresh.")
  );
  select.disabled = true;
} else {
  start();
}
