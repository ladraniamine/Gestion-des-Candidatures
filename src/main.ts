import { createApp } from "vue";
import { createPinia } from "pinia";
import { VueQueryPlugin } from "@tanstack/vue-query";
import App from "./App.vue";
import { router } from "./router";
import "./style.css";

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);
app.use(VueQueryPlugin, {
  enableDevtoolsV6Plugin: true,
});

app.config.errorHandler = (err, vm, info) => {
  console.error("Vue Error:", err);
  console.error("Component:", vm);
  console.error("Info:", info);
  return false;
};

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled rejection:", event.reason);
  event.preventDefault();
});

app.mount("#app");
