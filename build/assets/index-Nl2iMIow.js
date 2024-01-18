var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _baseUrl, _getUrl, _client;
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity)
      fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy)
      fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
class Client {
  constructor(baseUrl) {
    __privateAdd(this, _baseUrl, void 0);
    __privateAdd(this, _getUrl, void 0);
    __privateSet(this, _getUrl, (path) => new URL(path, __privateGet(this, _baseUrl)));
    this.getState = () => fetch(__privateGet(this, _getUrl).call(this, "api/state"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*"
      }
    });
    this.startHardware = (min, max) => fetch(__privateGet(this, _getUrl).call(this, "api/hardware/start"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        keyPadMin: min,
        keyPadMax: max
      })
    });
    this.stopHardware = () => fetch(__privateGet(this, _getUrl).call(this, "api/hardware/stop"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    });
    this.startQuestion = (answersCount) => fetch(__privateGet(this, _getUrl).call(this, "api/question/start"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        items: answersCount
      })
    });
    this.stopQuestion = () => fetch(__privateGet(this, _getUrl).call(this, "api/question/stop"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    });
    this.getResults = () => fetch(__privateGet(this, _getUrl).call(this, "api/question/results"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    });
    __privateSet(this, _baseUrl, new URL(baseUrl));
  }
}
_baseUrl = new WeakMap();
_getUrl = new WeakMap();
const key = "FIGHT_NIGHT";
const apiUrl = "https://ontroerend-goed.eventsight.eu/api";
const getStatistics = (votes) => {
  const buckets = votes.reduce(
    (acc, { keypadId, options: [vote = -1] }) => {
      if (acc == null ? void 0 : acc[vote]) {
        acc[vote].push(keypadId);
      } else {
        acc[vote] = [keypadId];
      }
      return acc;
    },
    {}
  );
  const statistics = Object.entries(buckets).reduce(
    (acc, [vote, keypadIds]) => ({
      ...acc,
      [vote]: {
        keypadIds,
        count: keypadIds.length,
        percentage: keypadIds.length / votes.length * 100
      }
    }),
    {}
  );
  return statistics;
};
class App {
  constructor(render2) {
    __privateAdd(this, _client, void 0);
    this.systemIsActive = false;
    this.questionIsActive = false;
    this.initialize = async () => {
      await this.getState();
      if (!this.systemIsActive) {
        await __privateGet(this, _client).startHardware(0, this.count);
      }
      this.render();
    };
    this.getState = async () => {
      const response = await __privateGet(this, _client).getState();
      if (response.ok) {
        const json = await response.json();
        this.systemIsActive = Boolean(json.result["hardware_state"]);
        this.questionIsActive = Boolean(json.result["active_question"]);
      }
    };
    this.startQuestion = async (count) => {
      await __privateGet(this, _client).startQuestion(count);
    };
    this.getResults = async () => {
      const response = await __privateGet(this, _client).getResults();
      if (response.ok) {
        const json = await response.json();
        const statistics = getStatistics(json.result);
        console.log(statistics);
      }
    };
    this.showResults = async () => {
      const response = await __privateGet(this, _client).stopQuestion();
      if (response.ok) {
        const json = await response.json();
        console.log(json);
      }
    };
    this.loadLocalStorage = () => {
      const state = localStorage.getItem(key);
      if (state) {
        this.systemIsActive = JSON.parse(state).systemIsActive;
        this.questionIsActive = JSON.parse(state).questionIsActive;
      }
    };
    this.saveLocalStorage = () => {
      localStorage.setItem(
        key,
        JSON.stringify({
          systemIsActive: this.systemIsActive,
          questionIsActive: this.questionIsActive
        })
      );
    };
    this.resetLocalStorage = () => {
      localStorage.removeItem(key);
    };
    __privateSet(this, _client, new Client(apiUrl));
    this.id = 1;
    this.count = 10;
    this.render = render2.bind(this);
    this.initialize();
  }
}
_client = new WeakMap();
const app = new App(render);
const openButton = document.getElementById("open");
const showButton = document.getElementById("show");
let interval;
openButton.addEventListener("click", () => {
  openButton.disabled = true;
  showButton.disabled = false;
  interval = setInterval(() => {
    app.getResults();
  }, 1e3);
});
showButton.addEventListener("click", () => {
  openButton.disabled = false;
  showButton.disabled = true;
  window.clearInterval(interval);
});
function render() {
  const app2 = this;
  console.log(app2.count);
}
window.app = app;
//# sourceMappingURL=index-Nl2iMIow.js.map
