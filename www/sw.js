;
//asignar un nombre y versión al cache
const CACHE_NAME = 'v1.7_cache_cedula',
  urlsToCache = [
    './',
    './css/framework7.bundle.min.css',
    './css/framework7-icons.css',
    './css/index.css',
    './css/replicar.css',
    './css/about.css',
    './css/tablero.css',
    './img/icon_16.png',
    './img/Splash.png',
    './img/cedula.png',
    './img/BackGroundCedSel.jpg',
    './img/BackGroundDefault.jpg',
    './img/BackGroundConfig.jpg',
    './img/BackGroundAbout.jpg',
    './img/BackGroundGol.jpg',
    './img/BackGroundFalta.jpg',
    './img/Balon.ico',
    './img/plus-circle.jpg',
    './img/minus-circle.jpg',
    './img/tarjeta_roja.png',
    './img/tarjeta_bco.jpg',
    './img/tarjeta_amarilla.jpg',
    './js/framework7.bundle.min.js',
    './js/jspdf.min.js',
    './js/jspdf.plugin.autotable.min.js',
    './js/index.js',
    './script.js',
    './views/acerca-de.html',
    './views/cargar.html',
    './views/cedula-seleccionar.html',
    './views/goles.html',
    './views/home.html',
    './views/replicar.html',
    './views/settings.html',
    './views/show-cedula.html',
    './views/show-condiciones.html',
    './views/show-firma.html',
    './views/show-politica.html',
    './views/tablero.html',
    './views/tarjetas.html',
    './index.html',
    './fonts/DS-POINT.TTF',

  ]

//durante la fase de instalación, generalmente se almacena en caché los archivos estáticos
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("Opened cache")
        return cache.addAll(urlsToCache)
          .then(() => self.skipWaiting())
      })
      .catch(err => console.log('Falló registro de cache', err))
  )
})


//una vez que se instala el SW, se activa y busca los recursos para hacer que funcione sin conexión
self.addEventListener('activate', e => {
  const cacheWhitelist = [CACHE_NAME]

  e.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            //Eliminamos lo que ya no se necesita en cache
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName)
            }
          })
        )
      })
      // Le indica al SW activar el cache actual
      .then(() => self.clients.claim())
  )
})

//cuando el navegador recupera una url
self.addEventListener('fetch', e => {
  //Responder ya sea con el objeto en caché o continuar y buscar la url real
  e.respondWith(
    caches.match(e.request)
      .then(res => {
        if (res) {
          //recuperar del cache
          return res
        }
        //recuperar de la petición a la url
        return fetch(e.request)
      })
  )
})
