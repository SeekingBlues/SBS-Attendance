import Vue from "vue";
import App from "./App.vue";
import VueGoogleApi from "vue-google-api";

const config = {
  apiKey: "AIzaSyDt2VxRLzdi8qL2Tl_SVTlOV5XVhTvTt94",
  clientId:
    "954999908134-m0bcfcjvukvlbh6hosk4uj8mhqfm7p3o.apps.googleusercontent.com",
  scope: "https://www.googleapis.com/auth/spreadsheets",
  discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"]
};

Vue.use(VueGoogleApi, config);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
