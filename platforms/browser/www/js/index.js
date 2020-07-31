var $$ = Dom7;

var app = {
    /*
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }*/
};

var app7 = new Framework7({
    // App root element
    root: '#app',
    // App Name
    name: 'Team',
    // App id
    id: 'com.team.app',
    // Enable swipe panel
    panel: {
      swipe: 'left',
    },
    calendar: {
      url: 'calendar/',
      dateFormat: 'dd.mm.yyyy',
    },
    // Add default routes
    routes: [
      {
        path: '/about/',
        url: 'about.html',
      },
      {
        path: '/home/',
        url: 'views/home.html',
      },
      {
        path: '/cargar/',
        url: 'views/cargar.html',
      },
      {
        path: '/settings/',
        url: 'views/settings.html',
      },
    ],
    // ... other parameters
  });
  var mainView = app7.views.create('.view-main');

// Calendario
var calendarDefault = app7.calendar.create({
  inputEl: '#demo-calendar-default',
});

// Termina Calendario

$$(document).on('page:init', '.page[data-name="home"]', function (e){
 // console.log("Iniciada Página Ejemplo");
 ChecaCuenta();
});

$$(document).on('page:init', '.page[data-name="settings"]', function (e){
  // console.log("Iniciada Página Ejemplo");
  ChecaSettings();
 });


  // Se llama a la página home, después de desplegar Splash por una espera de 3 segundos
  function WaitSplashScreen(){
    setTimeout(function(){mainView.router.navigate('/home/',{animate:true}); },3000);
  }

  function ChecaCuenta(){
    if (localStorage.getItem("cuenta") == null){
      //console.log("no existe cuenta");
      app7.dialog.alert("Falta configurar la cuenta, favor ir al menú y selecciona la opción de 'Configuración'", "AVISO");
    }
  }

  function ChecaSettings(){
    if (localStorage.getItem("cuenta") !== null){
      $$('#cuenta').html("5555");
      //$$('#num-cuenta').html(localStorage.getItem("cuenta"));
      

      //console.log("no existe cuenta");
      //app7.dialog.alert("Ya está configurada", "AVISO");
    }
  }

  function notificacion(titulo,mensaje){
    // Create notification with close button
    var notificationWithButton = app7.notification.create({
        icon: '<i class="icon demo-icon">7</i>',
        title: titulo,
        subtitle: mensaje,
        text: '',
        closeButton: true,
    });
    notificationWithButton.open();
  }

  function configuraCuenta(){
    if (checkNetWork()){
      var cuenta  = $$('#num-cuenta').val();
      var cuentastring = cuenta.toString();
      var cliente = Number(cuentastring.substring(0,2));
      var sucursal= Number(cuentastring.substring(2,4));
      app7.preloader.show();
      app7.request({
        url: 'http://localhost/cedula/api/configcuenta.php',
        data:{id_cliente:cliente,id_sucursal:sucursal},
        method: 'POST',
        crossDomain: true,
        success:function(data){
          app7.preloader.hide();
          var objson = JSON.parse(data);
          if (objson.mensaje = "EXITOSO"){
            localStorage.setItem("cuenta",cuentastring);
            
            var nomCliente  = objson.datos[0].cli_nombre;
            var nomSucursal = objson.datos[0].suc_nombre;
            console.log(nomCliente);
            console.log(nomSucursal);
            /*
            document.getElementById('nombre-sede').innerHTML = nomSucursal;*/
            /*
            var tituloSucursal = app7.p.get('.nombre-sede');
            tituloSucursal = nomSucursal;*/
            $$('#nombre-sede').text(nomSucursal);
            app7.dialog.alert("Configuración exitosa", "AVISO");
          }
          console.log(objson);
        },
          error:function(error){
        }
      });
      app7.preloader.hide();
    } else{

      }
  }

  function checkNetWork() {
    if(navigator.offline){
      console.log("No hay internet");
      return false;
    } else {
      console.log("Si hay internet");
      return true;
    }
  }

