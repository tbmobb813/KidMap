// app.config.js
module.exports = {
  expo: {
    android: {
      config: {
        googleMaps: {
          apiKey: "AIzaSyBguszAGXJZpLfraquYx-RcHjas4UjrWcg"
        }
      }
    },
    ios: {
      config: {
        googleMapsApiKey: "AIzaSyBguszAGXJZpLfraquYx-RcHjas4UjrWcg"
      }
    },
    extra: {
      googleMapsApiKey: "AIzaSyBguszAGXJZpLfraquYx-RcHjas4UjrWcg" // Optional, for easier access
    }
  }
};