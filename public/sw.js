var CACHE_NAME = "saibGeoMovel";

var urlsToCache = [
  "/",
  "/styles/icofont/MaterialIcons-Regular.ttf",
  "/styles/icofont/Roboto-Bold.ttf",
  "/styles/icofont/Roboto-Medium.ttf",
  "/styles/icofont/Roboto-Thin.ttf",
  "/styles/globals.css",
  "/styles/materializecss.min.css",
  "/index.html",
  "/offline.html",
  "/img/offline.png",
  "/img/voltar.png",
  "/static/js/bundle.js",
  "/static/js/main.chunk.js",
  "/static/js/1.chunk.js",
  "/static/js/0.chunk.js",
  "/static/js/2.f28909d6.chunk.js",
  "/static/js/main.4b9a8566.chunk.js",
  "/static/js/runtime-main.929cd0af.js",
  "/static/css/2.f347a83d.chunk.css",
  "/static/css/main.a78f066c.chunk.css",
  "/favicon.ico",
  "/TradeAdmin",
  "/TradeRoute",
  "/Trade",
  "/EnviarEmail",
  "/SchedulePhotos",
  "/TradeMktDashboard",
  "/StartSearchGrouped",
  "/StartSearch",
  "/ServiceSearchs",
  "/StartWorkDay",
  "/Flow",
  "/Flows",
  "/Schedules",
  "/Schedule",
  "/Searchs",
  "/Search",
  "/ProductDashboard",
  "/SalesAndTeamGoals",
  "/ApprovalOfBusinessRules",
  "/SupervisorBudget",
  "/FinancialStatement",
  "/HistoryFlexibleDiscountBalance",
  "/ApprovalOfVendorFunds",
  "/MarketingDashboard",
  "/KpiDashboard",
  "/TradesMktTeam",
  "/TradeMktTeam",
  "/CustomerDashboard",
  "/Interruption",
  "/Interruptions",
  "/Justifications",
  "/Justification",
  "/Users",
  "/UsersMenu",
  "/ProfessionalSchedule",
  "/approvalofvendorfunds",
  "/Conference",
  "/Order",
  "/NewOrder",
  "/EditOrder",
  "/CreateOrder",
  "/FindProduct",
  "/AdminModule",
  "/InventoryModule",
  "/FinancialModule",
];

let self = this;

// Install SW
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      //console.log('Opened cache');

      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.match(event.request).then(function (response) {
        return fetch(event.request)
          .then(function (response) {
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => response || caches.match("offline.html"));
      });
    })
  );
});

// Activate the SW
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [];
  cacheWhitelist.push(CACHE_NAME);

  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});
