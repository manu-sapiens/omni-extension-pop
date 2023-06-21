const DEFAULT_CORS_PROXY = (url) => `/api/v1/mercenaries/fetch?url=${encodeURIComponent(url)}`;
const pluginsUrl = "http://127.0.0.1:8009";

const loading = document.querySelector("#loading"); 
const menu = document.querySelector("#menu"); 
const title = document.querySelector("#title"); 
const settings = document.querySelector("#settings"); 
const plugins = document.querySelector("#plugins");

const pluginItem = document.querySelector("#settings-plugin-item");

// State = {plugins: Array<Plugin>} 
// Plugin = {name: String, status: String}
const state = {
  plugins: [],
};

function save() {
  localStorage.setItem("state-v1", JSON.stringify(state));
}

async function fetchPlugins() {
  try {
    const res = await fetch(DEFAULT_CORS_PROXY(`${pluginsUrl}/plugins/available`));//fetch(DEFAULT_CORS_PROXY(`${pluginsUrl}/plugins/available`));
    const json = await res.json();
    state.plugins = json;
    save();
    renderSettings();
  } catch (e) {
    console.error(e);
  } finally {
    // Hide loading indicator
    loading.classList.add("hidden");
  }
}

function renderSettings() {
  plugins.innerHTML = "";
  state.plugins.forEach((p) => {
    const el = document.importNode(pluginItem.content, true).querySelector("li");
    el.querySelector("span").innerText = p.name;
    el.querySelector(".installed-status").classList.add(p.status.toLowerCase());
    if (p.status.toLowerCase() === "installed") {
      // If plugin is installed configure the UI accordingly
      el.querySelector(".install-button").style.display = "none";
      el.querySelector(".update-button").style.display = "inline-block";
      el.querySelector(".delete-button").style.display = "inline-block";
    } else {
      // If plugin is available configure the UI accordingly
      el.querySelector(".install-button").style.display = "inline-block";
      el.querySelector(".update-button").style.display = "none";
      el.querySelector(".delete-button").style.display = "none";
      el.querySelector(".install-button").onclick = async () => {
        try {
          const res = await fetch(`${pluginsUrl}/plugins/install`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              plugin_name: p.name,
            }),
          });
          const json = await res.json();
          console.log(json);
          // Fetch available plugins again
          fetchPlugins();
        } catch (e) {
          console.error(e);
        }
      };
    }
    el.querySelector(".update-button").onclick = async () => {
      alert("Not implemented yet");
    };
    el.querySelector(".delete-button").onclick = async () => {
      if (confirm(`Are you sure you want to delete ${p.name}?`)) {
        try {
          const res = await fetch(`${pluginsUrl}/plugins/uninstall`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              plugin_name: p.name,
            }),
          });
          const json = await res.json();
          console.log(json);
          // Fetch available plugins again
          fetchPlugins();
        } catch (e) {
          console.error(e);
        }
      }
    };
    plugins.appendChild(el);
  });
}

function onMenuClicked() {
  if (menu.classList.contains("close")) {
    title.innerText = "";
    menu.classList.remove("close");
    settings.classList.remove("shown");
  } else {
    title.innerText = "Settings";
    menu.classList.add("close");
    settings.classList.add("shown");
  }
}

(async () => {
  // Fetch plugins
  fetchPlugins();

  // Register service worker for PWA
  navigator.serviceWorker.register("serviceworker.js");
})();