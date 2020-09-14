var $$ = Dom7;

var db = openDatabase('futcho','1.0',"Base de Datos para el uso de la cédula",2 * 1021 * 1024);
/*
const fs = require('fs')
const request = require('request')

const download = (url, path, callback) => {
  request.head(url, (err, res, body) => {
    request(url)
      .pipe(fs.createWriteStream(path))
      .on('close', callback)
  })
}
*/


var gcuenta           = "";
var gcliente          = 0;
var gsucursal         = 0;

var calendarInline;

var gestatus_juego;
var gidTorneo         = "";
var gidEquipoVisita   = "";
var gidEquipoLocal    = "";
var gnomEquipoAfectado= "";
var gidJuego          = "";
var gidJornada        = "";
var glocvis           = "";
var gfechaHoraJuego   = "";
var gnomTorneo        = "";
var gnomEquipoLocal   = "";
var gnomEquipoVisita  = "";
var gnomArbitro       = "";

//var gcedula           = [];
var gbandera          = 0; //Bandera para identificar si el cronómetro está pausado o en start, 0=Pausado, 1=Start
var gsiHayDatos       = 0; //Para el botón de continuar dentro de "Replicar", se valia si se están presentando datos o no hay
var gjuegosCargados   = 0; //Total de juegos insertados, en la tabla calendario, cada registro representa 1 juego

var growPdf           = []; //Array individual Filas correspondientes a la cédula árbitral para ser exportadas a PDF
var gtotRowPdfLocal   = []; // Array involucrando todos los mvtos. del equipo Local para exportar a PDF
var gtotRowPdfVisita  = []; // Array involucrando todos los mvtos. del equipo Visita para exportar a PDF
var grenPdf           = 0;
/* Variable para guardar el contenido de la cédula impresa y ser exportado a formato PDF */
var gPdf = new jsPDF({
  unit: "mm",
  format: [110, 76]
});


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
    name: 'Cédula',
    // App id
    id: 'com.cedula.app',
    // Enable swipe panel
    panel: {
      swipe: 'left',
    },/*
    touch: {
      tapHold: true //enable tap hold events
    },*/
    calendar: {
      url: 'calendar/',
      dateFormat: 'dd.mm.yyyy',
    },
    // Add default routes
    routes: [
      {
        path: '/about/',
        url: 'views/acerca-de.html',
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
      {
        path: '/cedula/',
        url: 'views/cedula-seleccionar.html',
      },
      {
        path: '/tablero/:fechaJuego/:nomTorneo/:idJornada',
        url: 'views/tablero.html',
        name: 'tablero',
      },
      {
        path: '/goles/:locVis/:nomEquipo',
        url: 'views/goles.html',
        name: 'goles',
        options:{
          transition: 'f7-flip', 
        },
      },
      {
        path: '/tarjetas/:locVis/:nomEquipo',
        url: 'views/tarjetas.html',
        name: 'tarjetas',
        options:{
          transition: 'f7-flip', 
        },
      },
      {
        path: '/show-cedula/',
        url: 'views/show-cedula.html',
        options:{
          transition: 'f7-flip', 
        },
      },
      {
        path: '/replicar/',
        url: 'views/replicar.html',
      },
      {
        path: '/show-condiciones/',
        url: 'views/show-condiciones.html',
        //url: `http://futcho7.com.mx/Cedula/CondicionesUso.htm`,
      },
      {
        path: '/show-politica/',
        url: 'views/show-politica.html',
      },
      {
        path: '/show-firma/',
        url: 'views/show-firma.html',
      },
    ],
    // ... other parameters
  });
  var mainView = app7.views.create('.view-main');

$$(document).on('page:init', '.page[data-name="home"]', function (e){
 ChecaCuenta();
});

$$(document).on('page:init', '.page[data-name="settings"]', function (e){
  ChecaSettings();
 });

 $$(document).on('page:init', '.page[data-name="cargar"]', function (e){
  SetCalendar();
 });

 $$(document).on('page:init', '.page[data-name="cedula-seleccionar"]', function (e){
  getJuegos();
 });

 $$(document).on('page:reinit', '.page[data-name="tablero"]', function (e){
  refreshTablero();
  });

 $$(document).on('page:init', '.page[data-name="tablero"]', function (e){
  //En el objeto e, se guardaron los parámetros
  var fecha_formatted = "";
  var dia             = "";
  var mes             = "";
  var yy              = "";
  var horas           = "";
  var posDia          = 0;
  var posMes          = 0;

  const page = e.detail;

  var fecha = page.route.params.fechaJuego;
  gfechaHoraJuego = fecha;
  //Se formatea el String de la fecha en yyyy-mm-dd hh:mm
  posDia  = fecha.indexOf("-");
  dia     = fecha.substring(0,posDia);
  if (parseInt(dia) < 10){
    dia = '0'+dia;
  }
  posMes  = fecha.indexOf("-",posDia+1);
  mes     = fecha.substring(posDia+1,posMes);
  if (parseInt(mes) < 10){
    mes = '0'+mes;
  }
  yy    = fecha.substring(posMes+1,posMes+5);
  horas = fecha.substring(posMes+6,30)+":00";
  //Si la hora es menor que las 10, debemos de poner uin cero antes para que el horario sea 09:00:00
  if ( parseInt(horas.substring(0,horas.indexOf(":"))) < 10){
    horas = '0'+horas;
  }
  fecha_formatted = yy+"-"+mes+"-"+dia+" "+horas;
  //El cronómetro se iguala según el valor de lo especificado en la configuración
  $$('#tab-cronometro').text(localStorage.getItem("minutos"));

  var torneo = page.route.params.nomTorneo;
  gnomTorneo = torneo;
  var jornada = page.route.params.idJornada;
  gidJornada = jornada.substring(jornada.indexOf("-")+1,10);
  var nom_equipo_local = "";
  var nom_equipo_visita = "";
  //Obtiene ID del torneo en cuestión
  getIdtorneo(torneo,function(idTorneo){
    gidTorneo = idTorneo;
    //Obtiene los datos de los equipos involucrados en el juego
    getEquipos(fecha_formatted,gidJornada,gidTorneo,function(infoEquipos){
      arr = infoEquipos.split("|");
      gidEquipoLocal = arr[0];
      nom_equipo_local = arr[1];
      gnomEquipoLocal = nom_equipo_local;
      gidEquipoVisita = arr[2];
      nom_equipo_visita = arr[3];
      gnomEquipoVisita = nom_equipo_visita;
      gidJuego = arr[4];
      //Escribe el nombre de los equipos
      $$('#tab-nom-equ-local').text(nom_equipo_local);
      $$('#tab-nom-equ-visita').text(nom_equipo_visita);
      //Obtiene Marcador Local
      getMarcadores(gcliente,gsucursal,gidTorneo,gidJornada,gidJuego,"L","","","",0,"", function(golesL){
        arr = golesL.split("|");
        marcador = parseInt(arr[0]);
        if (marcador == 99){
            marcador_string = "0";
        }else{
          marcador_string = String(marcador);
        }
        $$('#tab-goles-local').text(marcador_string);
        //Obtiene Marcador Visita
        getMarcadores(gcliente,gsucursal,gidTorneo,gidJornada,gidJuego,"V","","","",0,"", function(golesV){
          arr = golesV.split("|");
          marcador = parseInt(arr[0]);
          if (marcador == 99){
            marcador_string = "0";
          }else{
            marcador_string = String(marcador);
          }
          $$('#tab-goles-visita').text(marcador_string);
          //Obtiene T.Amarillas Local
          getTarjetas(gcliente,gsucursal,gidTorneo,gidJornada,gidJuego,"L","", function(tarjetasL){
            arr = tarjetasL.split("|");
            faltas = parseInt(arr[0]);
            //faltas = tarjetasL;
            $$('#tab-faltas-local').text(String(faltas));
            //Obtiene T.Amarillas Visita
            getTarjetas(gcliente,gsucursal,gidTorneo,gidJornada,gidJuego,"V","", function(tarjetasV){
              arr = tarjetasV.split("|");
              faltas = parseInt(arr[0]);
              //faltas = tarjetasV;
              $$('#tab-faltas-visita').text(String(faltas));
              //Obtiene el árbitro del encuentro
              getArbitro(gcliente,gsucursal,gidTorneo,gidJornada,gidJuego, function(arbitro){
                gnomArbitro = arbitro;
              });
            });
          });
        });
      });
    });
  });
 });


 $$(document).on('page:init', '.page[data-name="goles"]', function (f){
   //En el objeto e, se guardaron los parámetros
   const page = f.detail;
   var locvis = page.route.params.locVis;
   gnomEquipoAfectado = page.route.params.nomEquipo;
   if(locvis == 'L'){
     posicion = 'LOCAL';
    }else{
      posicion = 'VISITA';
    }
    $$('#titulo-cedula-gol').text("Cédula Arbitral (GOLES "+posicion+")");
    getMarcadores(gcliente,gsucursal,gidTorneo,gidJornada,gidJuego,glocvis,gnomEquipoAfectado,"","", 0,"", function(resultado){
      arr = resultado.split("|");
      marcador = parseInt(arr[0]);
      if (marcador == 99){
          marcador_string = "0";
      }else{
        marcador_string = String(marcador);
      }
      $$('#total-goles').text("TOTAL GOLES "+gnomEquipoAfectado+" "+marcador_string);
      getJugadoresGoles(locvis);
    });
});

$$(document).on('page:init', '.page[data-name="tarjetas"]', function (f){
  //En el objeto e, se guardaron los parámetros
  const page = f.detail;
  var locvis = page.route.params.locVis;
  gnomEquipoAfectado = page.route.params.nomEquipo;
  if(locvis == 'L'){
    posicion = 'LOCAL';
   }else{
     posicion = 'VISITA';
   }
   $$('#titulo-cedula-tarjeta').text("Cédula Arbitral (TARJETAS "+posicion+")");
   //Obtiene T.Amarillas
   getTarjetas(gcliente,gsucursal,gidTorneo,gidJornada,gidJuego,glocvis,gnomEquipoAfectado, function(tarjetas){
     arr = tarjetas.split("|");
     numTarjetas = parseInt(arr[0]);
     if (numTarjetas == 99){
         tarjetas_string = "0";
     }else{
       tarjetas_string = String(numTarjetas);
     }
     getTarjetasRojas(gcliente,gsucursal,gidTorneo,gidJornada,gidJuego,glocvis, function(tarjetasr){

      $$('#total-tarjetas').text("TOTAL TARJETAS "+gnomEquipoAfectado+" "+tarjetas_string+", rojas("+String(tarjetasr)+")");
      getJugadoresTarjetas(locvis);

     });
   });
});

$$(document).on('page:init', '.page[data-name="show-cedula"]', function (f){
  /* Se inicializa nuevamente dicha variable GLOBAL para exportar a PDF */
  gPdf = new jsPDF({
    unit: "mm",
    format: [110, 76]
  });
  gPdf.setFontSize(7);
  growPdf           = []; //Array individual Filas correspondientes a la cédula árbitral para ser exportadas a PDF
  gtotRowPdfLocal   = []; // Array involucrando todos los mvtos. del equipo Local para exportar a PDF
  gtotRowPdfVisita  = []; // Array involucrando todos los mvtos. del equipo Visita para exportar a PDF
  grenPdf           = 0;
  
  getDatosJuegoCedula(function(d){
    getJugadoresCedula('L', function (f){
      getJugadoresCedula('V', function(e){
        showIconCierre(); // Muestra el ico correspondiente según el estatus del juego
  
      });
    });
  });
});

$$(document).on('page:init', '.page[data-name="replicar"]', function (e){
  getJuegosReplicar();
});

$$(document).on('page:init', '.page[data-name="acerca-de"]', function (e){

});

$$(document).on('page:reinit', '.page[data-name="show-politica"]', function (e){
  
});

$$(document).on('page:reinit', '.page[data-name="show-firma"]', function (e){
  
});
 

/*
 // Confirm
$$('.confirma-carga').on('click', function () {
  app7.dialog.confirm('Are you feel good today?', function () {
    app7.dialog.alert('Great!');
  });
});
*/

// Se llama a la página home, después de desplegar Splash por una espera de 3 segundos
function WaitSplashScreen(){
  setTimeout(function(){mainView.router.navigate('/home/',{animate:true}); },3000);
}

function ChecaCuenta(){
  /*localStorage.removeItem("cuenta");*/
  if (localStorage.getItem("cuenta") == null){
    /* La app no está configurada */
    CreaDb();
    app7.dialog.alert("Falta configurar la cuenta, favor ir al menú y selecciona la opción de 'Configuración'", "AVISO");
  }else{
    gcuenta = localStorage.getItem("cuenta");
    gcliente = Number(gcuenta.substring(0,2));
    gsucursal= Number(gcuenta.substring(2,4));
    var nomSucursal = localStorage.getItem("nomSucursal");
    $$('#nomSede').text(nomSucursal);
  }
}

function ChecaSettings(){
  if (localStorage.getItem("cuenta") !== null){
    /* La cuenta ya está configurada, se muestran los valores */
    $$('#num-cuenta').val(localStorage.getItem("cuenta"));
    $$('#minutos-periodo').val(localStorage.getItem("minutos"));
    $$('#num-periodos').val(localStorage.getItem("periodos"));
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
  /* Se valida si hay cambio en el número de cuenta, si es verdadero, se llama a la API */
  var cuenta  = $$('#num-cuenta').val();
  var cuentastring = cuenta.toString();
  var minutos = $$('#minutos-periodo').val();
  var periodos = $$('#num-periodos').val();
  if (cuentastring !== localStorage.getItem("cuenta")){
    /* La cuenta cambió, se debe de invocar a la API */
    //if (checkNetWork()){
      app7.preloader.show();
      /* En caso de que la cuenta cambió, se borran todos los registros de la BD */
      DeleteTables();
      /* La cuenta, se divide por el valor correspondiente a cliente/sucursal */
      var cliente = Number(cuentastring.substring(0,2));
      var sucursal= Number(cuentastring.substring(2,4));
      app7.request({
        url: 'http://futcho7.com.mx/Cedula/WebService/configcuenta.php',
        data:{id_cliente:cliente,id_sucursal:sucursal},
        method: 'POST',
        crossDomain: true,
        success:function(data){
          app7.preloader.hide();
          var objson = JSON.parse(data);
          if (objson.mensaje == "EXITOSO"){
            /* Se asignan a variables los valores correspondientes al nombre del cliente y sucursal */
            /* Se almacenan en variables nombre del cliente y de la sucursal */
            var nomCliente  = objson.datos[0].cli_nombre;
            var nomSucursal = objson.datos[0].suc_nombre;
            /* Se almacenan en localStorage: cuenta,nombre de cliente, nombre de sucursal, minutos y periodos */
            localStorage.setItem("cuenta",cuentastring);
            localStorage.setItem("nomCliente",nomCliente);
            localStorage.setItem("nomSucursal",nomSucursal);
            localStorage.setItem("minutos",minutos);
            localStorage.setItem("periodos",periodos);

            /*
            var url = 'http://futcho7.com.mx/Cedula/Imagenes/logocte'+String(cliente)+'.jpg'
            var path = '../img/logocte'+String(cliente)+'.jpg'
            download(url, path, () => {
              console.log('✅ Done!')

              
            })
            */
            app7.dialog.alert(nomCliente+" sede: "+nomSucursal+", la configuración fue exitosa", "AVISO");
          }else{
            app7.dialog.alert("La cuenta no existe, revise si hay un error, caso contrario... favor de reportarlo en la oficina de la cancha", "AVISO");
          }
        },
          error:function(error){
          }
      });
      app7.preloader.hide();
    /*} else{
      // Si no hay red 
    }*/
  }else{
    /* No cambió la cuenta, solo se actualizan los valores de minutos,periodos en los localStorage */
    localStorage.setItem("minutos",minutos);
    localStorage.setItem("periodos",periodos);
    app7.dialog.alert("Actualización exitosa", "AVISO");
  }
}

function cargaDatos(fecha){
  gjuegosCargados = 0;
  /* OJO, DeleteTables se tiene que eliminar de aqui una vez terminado el desarrollo */
  DeleteTables();
  if (checkNetWork()){
    /* La cuenta, se divide por el valor correspondiente a cliente/sucursal */
    var cuentastring = localStorage.getItem("cuenta");
    var cliente = Number(cuentastring.substring(0,2));
    var sucursal= Number(cuentastring.substring(2,4));
    var numjuegos = 0;
    varfecha = fecha; 
    app7.preloader.show();
    app7.request({
      url: 'http://futcho7.com.mx/Cedula/WebService/getrecords.php',
      data:{id_cliente:cliente,id_sucursal:sucursal,fecha:varfecha},
      method: 'POST',
      crossDomain: true,
      success:function(data){
        var objson = JSON.parse(data);
        if (objson.status == 0){
          BarreJson(objson,function(f){
            app7.preloader.hide();
            app7.dialog.alert("El proceso ha concluido, el dispositivo cuenta con "+String(gjuegosCargados)+" juegos, puedes continuar con la elaboración de la cédula arbitral para cada uno de ellos.", "Carga de Datos");
          });
        }else{
          app7.preloader.hide();
          if(objson.status == 1){
            app7.dialog.alert("Existe un error, favor de reportarlo con el proveedor del servicio ("+objson.mensaje+' '+objson.error+").", "AVISO");
          }else{
            app7.dialog.alert("No existen encuentros con la fecha proporcionada, revise si hay un error, caso contrario... favor de reportarlo en la oficina de la cancha.", "AVISO");
          }
        }
      },
      error:function(error){
      }
    });
    //app7.preloader.hide();
  }else{
    /* Si no hay red */
  }
}

  function BarreJson(objson,callBack){
    var cliente = Number(localStorage.getItem("cuenta").substring(0,2));
    var sucursal= Number(localStorage.getItem("cuenta").substring(2,4));
    var numeroJuegos = 0;
    var cedula = objson['Cedula'];
    for (var i=0; i < cedula.length; i++) {
      /* Se barren los torneos involucrados */
      var id_torneo = cedula[i].id_torneo;
      var nombre_torneo = cedula[i].nom_torneo;
      var cadena = "insert into torneo(id_cliente,id_sucursal,id_torneo,tor_nombre) values('"+String(cliente)+"','"+String(sucursal)+"','"+String(id_torneo)+"','"+nombre_torneo+"')"
      insertaReg(cadena,db,function(resultado){
        //alert(resultado);
      });
      var juegos = cedula[i].Partidos;
      /* Se barren los juegos por torneo */
      for (var a=0; a < juegos.length; a++){
        var id_jornada    = juegos[a].id_jornada;
        var fecha_partido = juegos[a].fecha_partido;
        var cal_default   = juegos[a].cal_default;
        var id_juego      = juegos[a].id_juego;
        var arbitro       = juegos[a].arbitro;
        var cal_estatus   = juegos[a].cal_estatus;
        var cal_penales   = juegos[a].cal_penales;
        /* Se inserta en calendario */
        cadena = "insert into calendario(id_cliente,id_sucursal,id_torneo,id_jornada,id_juego,cal_fecha_hora,arbitro,cal_estatus,cal_default,cal_penales) values('"+String(cliente)+"','"+String(sucursal)+"','"+String(id_torneo)+"','"+String(id_jornada)+"','"+String(id_juego)+"','"+String(fecha_partido)+"','"+arbitro+"','"+String(cal_estatus)+"','"+String(cal_default)+"','"+String(cal_penales)+"')";
        gjuegosCargados++;
        insertaReg(cadena,db,function(resultado){
          numeroJuegos++;
          //alert(resultado);
        });
        var equipos = juegos[a].Equipos;
        /* Se barren los equipos por juego, torneo */
        for (var b=0; b < equipos.length; b++){
          var id_equipo   = equipos[b].id_equipo;
          var equ_nombre  = equipos[b].nom_equipo;
          var locvis      = equipos[b].locvis;
          cadena = "insert into equipo(id_cliente,id_sucursal,id_torneo,id_equipo,equ_nombre) values('"+String(cliente)+"','"+String(sucursal)+"','"+String(id_torneo)+"','"+String(id_equipo)+"','"+String(equ_nombre)+"')";
          insertaReg(cadena,db,function(resultado1){
            //alert(resultado);
          });
          /* Se crea cadena para grabar en la tabla encuentro */
          cadena = "insert into encuentro(id_cliente,id_sucursal,id_torneo,id_jornada,id_juego,id_equipo,enc_locvis) values('"+String(cliente)+"','"+String(sucursal)+"','"+String(id_torneo)+"','"+String(id_jornada)+"','"+String(id_juego)+"','"+String(id_equipo)+"','"+String(locvis)+"')";
          insertaReg(cadena,db,function(resultado2){
            //alert(resultado);
          });
          var jugadores = equipos[b].Jugadores;
          /* Se barren los jugadores por equipo, juego, torneo */
          for (var c=0; c < jugadores.length; c++){
            var id_jugador  = jugadores[c].id_jugador;
            var jug_nombre  =  jugadores[c].jugador_nom+' '+jugadores[c].jugador_pat+' '+jugadores[c].jugador_mat;
            var jug_capitan =  jugadores[c].jug_repre;
            var jug_playera = jugadores[c].jug_playera;
            var jug_foto    =  jugadores[c].jug_foto;
            cadena = "insert into jugador(id_cliente,id_sucursal,id_torneo,id_equipo,id_jugador,jug_nombre,jug_representante,jug_playera,jug_foto) values('"+String(cliente)+"','"+String(sucursal)+"','"+String(id_torneo)+"','"+String(id_equipo)+"','"+String(id_jugador)+"','"+jug_nombre+"','"+jug_capitan+"','"+String(jug_playera)+"','"+jug_foto+"')";
            insertaReg(cadena,db,function(resultado3){
              //alert(resultado);
            });
          }
        }
      }
    }
    //app7.preloader.hide();
    callBack(numeroJuegos);
  }

function SetCalendar(){
  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August' , 'September' , 'October', 'November', 'December'];
  calendarInline = app7.calendar.create({
    containerEl: '#demo-calendar-inline-container',
    value: [new Date()],
    weekHeader: true,
    dateFormat: { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' },
    /*dateFormat: 'dd-mm-yyyy',*/
    renderToolbar: function () {
      return '<div class="toolbar calendar-custom-toolbar no-shadow">' +
      '<div class="toolbar-inner">' +
        '<div class="left">' +
          '<a href="#" class="link icon-only"><i class="icon icon-back ' + (app.theme === 'md' ? 'color-black' : '') + '"></i></a>' +
        '</div>' +
        '<div class="center"></div>' +
        '<div class="right">' +
          '<a href="#" class="link icon-only"><i class="icon icon-forward ' + (app.theme === 'md' ? 'color-black' : '') + '"></i></a>' +
        '</div>' +
      '</div>' +
    '</div>';
    },
    on: {
      init: function (c) {
      $$('.calendar-custom-toolbar .center').text(monthNames[c.currentMonth] +', ' + c.currentYear);
      $$('.calendar-custom-toolbar .left .link').on('click', function () {
        calendarInline.prevMonth();
      });
      $$('.calendar-custom-toolbar .right .link').on('click', function () {
        calendarInline.nextMonth();
      });
    },
    monthYearChangeStart: function (c) {
      $$('.calendar-custom-toolbar .center').text(monthNames[c.currentMonth] +', ' + c.currentYear);
    }
  }
  });
}

function confirma_fecha() {
  /* Se valida que ya exista configurada la cuenta, cosa contraria no podrá realizar nada */
  if (localStorage.getItem("cuenta") != null){
    const months = ["Ene", "Feb", "Mar","Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    fecha_seleccionada = new Date(calendarInline.getValue());
    date_to_pass = fecha_seleccionada.getFullYear() + "/" + (fecha_seleccionada.getMonth() + 1) + "/" + fecha_seleccionada.getDate();
    date_to_question = fecha_seleccionada.getDate() + "-" + months[fecha_seleccionada.getMonth()] + "-" + fecha_seleccionada.getFullYear();
    app7.dialog.confirm('¿ Deseas continuar con la carga de datos para la fecha '+date_to_question+' ?','CONFIRMA', function () {
      cargaDatos(date_to_pass);
    });
  }else{
    app7.dialog.alert("Falta configurar la cuenta, favor ir al menú y selecciona la opción de 'Configuración'", "AVISO");
  }
  
 //cargaDatos("2020/07/13");
 }

function getJuegos(){
  //Borra contenido de lista-juegos
  $$('#lista-juegos').html("");
  db.transaction(function (tx){
    var select  = "SELECT encuentro.id_torneo,encuentro.id_equipo,equipo.equ_nombre,torneo.tor_nombre,encuentro.id_jornada,encuentro.enc_locvis,calendario.cal_fecha_hora,calendario.cal_estatus,calendario.id_juego ";
    var from    = 'FROM equipo, calendario, encuentro,torneo ';
    var where   = "WHERE encuentro.id_sucursal = calendario.id_sucursal and encuentro.id_cliente = calendario.id_cliente and encuentro.id_torneo = calendario.id_torneo and encuentro.id_jornada = calendario.id_jornada and encuentro.id_juego = calendario.id_juego and equipo.id_sucursal = encuentro.id_sucursal and equipo.id_cliente = encuentro.id_cliente and equipo.id_torneo = encuentro.id_torneo and equipo.id_equipo = encuentro.id_equipo and torneo.id_cliente = equipo.id_cliente and torneo.id_sucursal = equipo.id_sucursal and torneo.id_torneo = equipo.id_torneo and calendario.id_cliente = '"+String(gcliente)+"' AND calendario.id_sucursal = '"+String(gsucursal)+"' ";
    var order   = 'ORDER BY calendario.cal_fecha_hora ASC, encuentro.enc_locvis';   
    var sql     = select + from + where + order;
    
    var estatus_juego = "";
    var marcador = 0;
    var fecha_juego = "";
    var formatted_date = "";
    //var nombre_equipo = "";
    var jornada = "";
    var estatus_juego = "";
    var nombre_torneo  = "";
    var marcador_string = "";
    var nombre_visitante = "";
    var nombre_local = "";
    //var juego   = "";
   
    tx.executeSql(sql,[],function callback(tx,results){
      var registros = results.rows.length, i;
      if(registros == 0){
        app7.dialog.alert("No existen encuentros en el dispositivo, favor ir al menú y seleccionar la opción de 'Cargar Juegos'", "AVISO");
      }
      for(i=0; i<registros; i++){
        // Determinar si el contador es impar o no, si es par, el recordSet corresponde a un equipo LOCAL, caso contrario es Visita y
        // solo tomar el registro de nombre de quipo
        //if(i%2 != 0)
        if(i%2 != 0){
          //Es número impar
          //Se termina de crear la cadena para mostar el marcador de ambos equipos
          
          nombre_visitante =  results.rows.item(i).equ_nombre;
          getMarcadores(gcliente,gsucursal,results.rows.item(i).id_torneo,results.rows.item(i).id_jornada,results.rows.item(i).id_juego,results.rows.item(i).enc_locvis,nombre_visitante,'','',0,'', function(resultado){
            //En el arreglo de "resultado", se estiene los datos del marcador, equipo y jornada
            arr = resultado.split("|");
            marcador = parseInt(arr[0]);
            equipo = arr[1];
            jornada = arr[2];
            if (marcador == 99){
              marcador_string += "- ?";
            }else{
              marcador_string +='- '+String(marcador);
            }
            //La sig. function, termina de concatenar la cadena para mostrar en el List, incluso también muestra el List
            setMarcadorVisitante(marcador_string,equipo);
          });
        }else{
          // Es número par
          // Número par, se obtiene fecha, torneo, estatus del juego, equipo local y su marcador
          switch(results.rows.item(i).cal_estatus){
            case '2':
              estatus_juego = 'Ya Replicado';
              break;
            case '1':
              estatus_juego = 'Jugado';
              break;
            case '0':
              estatus_juego = 'Por Jugar';
              break;
          }
          fecha_juego = new Date(results.rows.item(i).cal_fecha_hora);
          if(fecha_juego.getMinutes() == 0){
            /* Si los minutos son igual a 0 (cero), se concatena "00", ya que sólo concatenaba "0" */
            formatted_date = fecha_juego.getDate() + "-" + (fecha_juego.getMonth() + 1) + "-" + fecha_juego.getFullYear() + " " + fecha_juego.getHours() + ":00";

          }else{
            formatted_date = fecha_juego.getDate() + "-" + (fecha_juego.getMonth() + 1) + "-" + fecha_juego.getFullYear() + " " + fecha_juego.getHours() + ":" + fecha_juego.getMinutes();
          }
          nombre_local = results.rows.item(i).equ_nombre;
          jornada = results.rows.item(i).id_jornada;
          nombre_torneo =results.rows.item(i).tor_nombre;
          getMarcadores(gcliente,gsucursal,results.rows.item(i).id_torneo,results.rows.item(i).id_jornada,results.rows.item(i).id_juego,results.rows.item(i).enc_locvis,nombre_local,formatted_date,nombre_torneo, i, estatus_juego, function(resultado){
            arr = resultado.split("|");
            marcador = parseInt(arr[0]);
            equipo = arr[1];
            jornada = arr[2];
            fecha_juego = arr[3];
            nombre_torneo = arr[4];
            contador = arr[5];
            estatus_juego = arr[6];
            if (marcador == 99){
                marcador_string = "¿ ";
            }else{
              marcador_string = String(marcador) + " ";
            }
            setMarcadorLocal(fecha_juego,nombre_torneo,jornada,estatus_juego,equipo,contador);
            });
          //console.log('el marcador es '+marcador_string);
          //Si yo pongo el console.log aqui, no imprime el valor de marcador_string, que diferencia hay? la valiable está 
        }
      }
    });
  });
}

function setMarcadorLocal(formatted_date,nombre_torneo,jornada,estatus_juego,nombre_equipo,contador){
  /* Asigna a "juego" la cadena para mostar posteriormente en la function setMarcadorVisitante el elemento del componente List */
  var color_columna = "";
  if(estatus_juego == 'Por Jugar'){
    color_columna = 'row-cedula-sel-text2-2';
  }
  else{
    color_columna = 'row-cedula-sel-text2';
  }
  juego = '<div class="block block-cedula-sel0" onclick = "getDatosJuego('+String(contador)+')"><div class="block block-cedula-sel1"><div class="row row-cedula-sel-text1"><div class="col" id="fecha-hora-juego-'+String(contador)+'">'+formatted_date+'</div><div class="col" id="nombre-torneo-'+String(contador)+'">'+nombre_torneo+'</div><div class="col" id="id_jornada-'+String(contador)+'">J-'+jornada+'</div></div><div class="row '+color_columna+'"><div class="col" id="estatus-juego-'+String(contador)+'">'+estatus_juego+'</div></div></div><div class="block block-cedula-sel2"><div class="row row-cedula-sel-text3"><div class="col" id="equipo-local">'+nombre_equipo+'</div>';
}

function setMarcadorVisitante(marcador_string,nombre_visitante){
  /* Termina de concatenar la cadena "juego" para enseguida mostrarla como un elemento del componente List */
  juego += '<div class="col row-marcadores" id="marcadores">'+marcador_string+'</div><div class="col" id="equipo-visita">'+nombre_visitante+'</div></div></div></div>';
  // Se agrega al componente LIST el juego en cuestión
  $$('#lista-juegos').append(juego);
}

function getMarcadores(cliente,sucursal,torneo,jornada,juego,locvis,nombre_equipo,fecha_juego,nom_torneo,contador,estatus, callBack){
  //Obtiene el marcador según los parámetros recibidos
  //var goles = 5;
  db.transaction(function (tx){
    var select= 'SELECT SUM(CAST(detalle_encuentro.denc_gol AS INTEGER)) goles_anotados ';
    var from  = 'FROM detalle_encuentro, encuentro ';
    var where = 'WHERE detalle_encuentro.id_cliente = encuentro.id_cliente and detalle_encuentro.id_sucursal = encuentro.id_sucursal and detalle_encuentro.id_torneo   = encuentro.id_torneo and detalle_encuentro.id_jornada = encuentro.id_jornada and detalle_encuentro.id_juego = encuentro.id_juego and detalle_encuentro.id_equipo = encuentro.id_equipo and '
    var where2= "( ( encuentro.id_cliente = '"+String(cliente)+"' ) AND ( encuentro.id_sucursal = '"+String(sucursal)+"' ) AND ( encuentro.id_torneo = '"+String(torneo)+"' ) AND ( encuentro.id_jornada = '"+String(jornada)+"' ) AND ( encuentro.id_juego = '"+String(juego)+"' ) ) and encuentro.enc_locvis = '"+locvis+"'";
    var sql   = select+from+where+where2;
    tx.executeSql(sql,[],function callback(tx,results){
      var registros = results.rows.length, i;
      for(z=0; z<registros; z++){
        goles = results.rows.item(z).goles_anotados;
        if (goles == null){
          goles = 99;
        }
      }
      callBack(goles+"|"+nombre_equipo+"|"+jornada+"|"+fecha_juego+"|"+nom_torneo+"|"+contador+"|"+estatus);
    },function(err){
      notificacion("AVISO","No fue posible obtener marcador,favor de avisar a la oficina");
      })
  });
}

function getTarjetas(cliente,sucursal,torneo,jornada,juego,locvis,nomEquipoAfectado,callBack){
  //Obtiene número de faltas según los parámetros recibidos
  db.transaction(function (tx){
    var select= 'SELECT SUM(CAST(detalle_encuentro.denc_amarilla AS INTEGER)) tar_amarilla ';
    var from  = 'FROM detalle_encuentro, encuentro ';
    var where = 'WHERE detalle_encuentro.id_cliente = encuentro.id_cliente and detalle_encuentro.id_sucursal = encuentro.id_sucursal and detalle_encuentro.id_torneo   = encuentro.id_torneo and detalle_encuentro.id_jornada = encuentro.id_jornada and detalle_encuentro.id_juego = encuentro.id_juego and detalle_encuentro.id_equipo = encuentro.id_equipo and '
    var where2= "( ( encuentro.id_cliente = '"+String(cliente)+"' ) AND ( encuentro.id_sucursal = '"+String(sucursal)+"' ) AND ( encuentro.id_torneo = '"+String(torneo)+"' ) AND ( encuentro.id_jornada = '"+String(jornada)+"' ) AND ( encuentro.id_juego = '"+String(juego)+"' ) ) and encuentro.enc_locvis = '"+locvis+"'";
    var sql   = select+from+where+where2;

    tx.executeSql(sql,[],function callback(tx,results){
      var registros2 = results.rows.length, i;
      for(w=0; w<registros2; w++){
        amarillas = results.rows.item(w).tar_amarilla;
        if (amarillas == null){
          amarillas = 0;
        }
      }
      callBack(amarillas+"|"+nomEquipoAfectado);
    },function(err){
      notificacion("AVISO","No fue posible obtener tar. amarillas,favor de avisar a la oficina");
      })
  });
}

function getArbitro(cliente,sucursal,torneo,jornada,juego,callBack){
  //Obtiene el árbitro del encuentro
  db.transaction(function (tx){
    var select= 'SELECT arbitro ';
    var from  = 'FROM calendario ';
    var where = "WHERE id_cliente = '"+String(cliente)+"' AND id_sucursal = '"+String(sucursal)+"' AND id_torneo = '"+String(torneo)+"' AND id_jornada = '"+String(jornada)+"' AND id_juego = '"+String(juego)+"'";
    var sql   = select+from+where;

    tx.executeSql(sql,[],function callback(tx,results2){
      var registros3 = results2.rows.length, i;
      for(ww=0; ww<registros3; ww++){
        var arbitro = results2.rows.item(ww).arbitro;
      }
      callBack(arbitro);
    },function(err){
      notificacion("AVISO","No fue posible obtener arbitro,favor de avisar a la oficina");
      })
  });

}

function getDatosJuego(contador){
  /* Obtiene nombre del Torneo y la fecha/hora del juego que se le dió click(tap) al momento de seleccionar un juego */
  var fecha = $$('#fecha-hora-juego-'+String(contador)).text();
  var torneo = $$('#nombre-torneo-'+String(contador)).text();
  var jornada = $$('#id_jornada-'+String(contador)).text();
  gestatus_juego = $$('#estatus-juego-'+String(contador)).text();
  mainView.router.navigate(`/tablero/${fecha}/${torneo}/${jornada}/`,{animate:true});
}

/* Cuando se le da tap(click) en el Tablero a los goles*/
function gol(tipo){
  var locVis = tipo;
  var nomEquipo = "";
  glocvis = tipo;
  if(tipo == 'L'){
    nomEquipo = $$("#tab-nom-equ-local").text(); 
  }else{
    nomEquipo = $$("#tab-nom-equ-visita").text(); 
  }
  mainView.router.navigate(`/goles/${locVis}/${nomEquipo}/`,{animate:true});
}

function getIdtorneo(nomTorneo, callBack){
  //Obtenemos id_torneo, según el nombre del torneo recibido
   var idTorneo = "";
   db.transaction(function (tx){
     var sql= "SELECT id_torneo FROM torneo WHERE tor_nombre =  '"+nomTorneo+"'";
     tx.executeSql(sql,[],function callback(tx,results){
       var registros = results.rows.length, i;
       for(z=0; z<registros; z++){
         idTorneo = results.rows.item(z).id_torneo;
        }
       callBack(idTorneo);
     },function(err){
       notificacion("AVISO","No fue posible obtener ID del Torneo,favor de avisar a la oficina");
       })
   });
}

function getEquipos(fecha,jornada,id_torneo,callBack){
  //Obtenemos datos de los equipos involucrados en los parámetros recibidos (id y nombre)
  var idEquipo_local = "";
  var idEquipo_visita = "";
  var nomEquipo_local = "";
  var nomEquipo_visita = "";
  var idJuego = "";
  db.transaction(function (tx){
    var select= "SELECT equipo.id_equipo,equipo.equ_nombre, encuentro.enc_locvis, encuentro.id_juego ";
    var from = "FROM calendario, encuentro, equipo ";
    var where = "WHERE calendario.cal_fecha_hora = '"+fecha+"' and calendario.id_torneo = '"+id_torneo+"' and calendario.id_jornada = '"+jornada+"' and encuentro.id_juego = calendario.id_juego and encuentro.id_torneo = calendario.id_torneo and encuentro.id_jornada = calendario.id_jornada and equipo.id_equipo = encuentro.id_equipo and equipo.id_torneo = encuentro.id_torneo order by 3";
    sql = select+from+where;
    tx.executeSql(sql,[],function callback(tx,results2){
      var registros = results2.rows.length, i;
      for(z=0; z<registros; z++){
        if (results2.rows.item(z).enc_locvis == 'L'){
          idEquipo_local  = results2.rows.item(z).id_equipo;
          nomEquipo_local = results2.rows.item(z).equ_nombre;
        }else{
          idEquipo_visita    = results2.rows.item(z).id_equipo;
          a = results2.rows.item(z).id_equipo;
          nomEquipo_visita  = results2.rows.item(z).equ_nombre;
        }
        idJuego = results2.rows.item(z).id_juego;
      }
     
      //callBack(idEquipo_local+"|"+nomEquipo_local+"|"+a+"|"+nomEquipo_visita+"|"+idJuego);
      callBack(idEquipo_local+"|"+nomEquipo_local+"|"+idEquipo_visita+"|"+nomEquipo_visita+"|"+idJuego);
    },function(err){
      notificacion("AVISO","No fue posible obtener los datos de los equipo involucrados,favor de avisar a la oficina");
      })
  });
}

function getJugadoresGoles(locvis){
  if(locvis == 'L'){
    idEquipo = gidEquipoLocal;
  }else{
    idEquipo = gidEquipoVisita;
  }
  //Borra contenido de lista-jugadores
  $$('#lista-jugadores').html("");
  db.transaction(function (tx){
    var select  = "SELECT jugador.id_jugador,jugador.jug_playera, jugador.jug_nombre, jugador.jug_representante, jugador.jug_foto, (SELECT SUM(detalle_encuentro.denc_gol) FROM detalle_encuentro WHERE detalle_encuentro.id_cliente = jugador.id_cliente and detalle_encuentro.id_sucursal = jugador.id_sucursal and detalle_encuentro.id_torneo = jugador.id_torneo and detalle_encuentro.id_jornada = '"+gidJornada+"' and detalle_encuentro.id_juego = '"+gidJuego+"' and detalle_encuentro.id_equipo = jugador.id_equipo and detalle_encuentro.enc_locvis = '"+locvis+"' and detalle_encuentro.id_jugador = jugador.id_jugador) as goles ";
    var from    = 'FROM jugador ';
    var where   = "WHERE jugador.id_cliente = '"+gcliente+"' and jugador.id_sucursal = '"+gsucursal+"' and jugador.id_torneo = '"+gidTorneo+"' and jugador.id_equipo = '"+idEquipo+"' ";
    var order   = 'ORDER BY CAST(jugador.jug_playera AS INTEGER)';   
    var sql     = select + from + where + order;
    tx.executeSql(sql,[],function callback(tx,results){
      var regjugador = results.rows.length, i;
      var id_jugador = "";
      var jugador = "";
      var goles = 0;
      var foto = "";
      for(ii=0; ii<regjugador; ii++){
        id_jugador = results.rows.item(ii).id_jugador;
        jugador = "# "+results.rows.item(ii).jug_playera+" "+results.rows.item(ii).jug_nombre;
        foto = results.rows.item(ii).jug_foto;
        goles = results.rows.item(ii).goles
        if (goles == null){
          goles = 0;
        }
        cadena = '<div class="block block-jugador-gol"><div class="row"><div class="col col-jugador-datos-gol" id="jugador-id-'+id_jugador+'">'+jugador+'</div></div><div class="row"><div class="col" id="jugador-foto"><img src="data:image/png;base64, '+foto+'" width="60"/></div><div class="col col-icon-suma-gol" id="suma-gol" onclick = "insertaGol('+id_jugador+')"><img src="../img/plus-circle.png"/></div><div class="col col-icon-balon-gol" id="ico-balon"><img src="../img/Balon.ico" width="60"/></div><div class="col col-numgoles-gol" id="goles-'+id_jugador+'">'+String(goles)+'</div><div class="col col-icon-suma-gol" id="resta-gol" onclick = "eliminaGol('+id_jugador+')"><img src="../img/minus-circle.png"/></div></div></div>';
        $$('#lista-jugadores').append(cadena);
      }
      
    });
  });
}

function insertaGol(idJugador){
  if(gestatus_juego == 'Por Jugar'){
    var totGoles = 0;
    if (glocvis == 'L'){
      equipo = gidEquipoLocal;
    }else{
      equipo = gidEquipoVisita;
    }
    /* Se inserta el jugador en la tabla detalle_encuentro */
    //cadena = "insert into detalle_encuentro(id_cliente,id_sucursal,id_torneo,id_jornada,id_juego,id_equipo,enc_locvis,id_jugador,denc_minuto,denc_gol,denc_roja,denc_amarilla) values('"+String(gcliente)+"','"+String(gsucursal)+"','"+gidTorneo+"','"+gidJornada+"','"+gidJuego+"','"+equipo+"','"+glocvis+"','"+idJugador+"',"+totRegistros+",1,0,0)";
    cadena = "insert into detalle_encuentro(id_cliente,id_sucursal,id_torneo,id_jornada,id_juego,id_equipo,enc_locvis,id_jugador,denc_gol,denc_roja,denc_amarilla) values('"+String(gcliente)+"','"+String(gsucursal)+"','"+gidTorneo+"','"+gidJornada+"','"+gidJuego+"','"+equipo+"','"+glocvis+"','"+idJugador+"',1,0,0)";
    insertaReg(cadena,db,function(resultado){
      if(resultado == 'INSERTADO'){
        totGoles = $$('#goles-'+idJugador).text();
        totGoles++;
        $$('#goles-'+String(idJugador)).text(String(totGoles));
        // Actualiza el titúlo con el total de goles
        refreshTotGoles(glocvis);
      }
    });
  }else{
    app7.dialog.alert("El estatus del encuentro ("+gestatus_juego+") no permite realizar ningún cambio en el marcador", "AVISO");
  }
}

function eliminaGol(idJugador){
  if(gestatus_juego == 'Por Jugar'){
    var totGoles = 0;
    if (glocvis == 'L'){
      equipo = gidEquipoLocal;
    }else{
      equipo = gidEquipoVisita;
    }
    /* Se obtiene el max(denc_minuto) del jugador en question, esto para poder eliminar SOLO 1 registro */
    cadena = "SELECT MAX(CAST(denc_minuto AS INTEGER)) maximo FROM detalle_encuentro WHERE id_cliente = '"+String(gcliente)+"' AND id_sucursal = '"+String(gsucursal)+"' AND id_torneo = '"+gidTorneo+"' AND id_jornada = '"+gidJornada+"' AND id_juego = '"+gidJuego+"' AND id_equipo = '"+equipo+"' AND enc_locvis = '"+glocvis+"' AND id_jugador = '"+idJugador+"' AND denc_gol = 1";
    ejecutaQuery(cadena,db,"maxMinuto",function(maxMinuto){
      /* Se elimina el jugador en la tabla detalle_encuentro */
      cadena = "DELETE FROM detalle_encuentro WHERE id_cliente = '"+String(gcliente)+"' AND id_sucursal = '"+String(gsucursal)+"' AND id_torneo = '"+gidTorneo+"' AND id_jornada = '"+gidJornada+"' AND id_juego = '"+gidJuego+"' AND id_equipo = '"+equipo+"' AND enc_locvis = '"+glocvis+"' AND id_jugador = '"+idJugador+"' AND denc_minuto = "+String(maxMinuto)+" AND denc_gol = 1";
      eliminaReg(cadena,db,function(resultado){
        if(resultado == 'ELIMINADO'){
          totGoles = $$('#goles-'+idJugador).text();
          totGoles--;
          if (totGoles < 0){
            totGoles = 0;
          }
          $$('#goles-'+String(idJugador)).text(String(totGoles));
          // Actualiza el titúlo con el total de goles
          refreshTotGoles(glocvis);
        }
      });
    });
  }else{
    app7.dialog.alert("El estatus del encuentro ("+gestatus_juego+") no permite realizar ningún cambio en el marcador", "AVISO");
  }
}

function refreshTablero(){
   //Obtiene Marcador Local
   getMarcadores(gcliente,gsucursal,gidTorneo,gidJornada,gidJuego,"L","","","",0,"", function(golesL){
    arr = golesL.split("|");
    marcador = parseInt(arr[0]);
    if (marcador == 99){
        marcador_string = "0";
    }else{
      marcador_string = String(marcador);
    }
    $$('#tab-goles-local').text(marcador_string);
    //Obtiene Marcador Visita
    getMarcadores(gcliente,gsucursal,gidTorneo,gidJornada,gidJuego,"V","","","",0,"", function(golesV){
      arr = golesV.split("|");
      marcador = parseInt(arr[0]);
      if (marcador == 99){
        marcador_string = "0";
      }else{
        marcador_string = String(marcador);
      }
      $$('#tab-goles-visita').text(marcador_string);
      //Obtiene T.Amarillas Local
      getTarjetas(gcliente,gsucursal,gidTorneo,gidJornada,gidJuego,"L","", function(tarjetasL){
        arr = tarjetasL.split("|");
        faltas = parseInt(arr[0]);
        //faltas = tarjetasL;
        $$('#tab-faltas-local').text(String(faltas));
        //Obtiene T.Amarillas Visita
        getTarjetas(gcliente,gsucursal,gidTorneo,gidJornada,gidJuego,"V","", function(tarjetasV){
          arr = tarjetasV.split("|");
          faltas = parseInt(arr[0]);
          //faltas = tarjetasV;
          $$('#tab-faltas-visita').text(String(faltas));
        });
      });
    });
  });
}

function refreshTotGoles(enclocvis){
  getMarcadores(gcliente,gsucursal,gidTorneo,gidJornada,gidJuego,enclocvis,"","","",0,"", function(golesR){
    arr = golesR.split("|");
    marcador = parseInt(arr[0]);
    if (marcador == 99){
        marcador_string = "0";
    }else{
      marcador_string = String(marcador);
    }
    $$('#total-goles').text("TOTAL GOLES "+gnomEquipoAfectado+" "+marcador_string);
  });
}

/* Cuando se le da tap(click) en el Tablero a las tarjetas LOCALES */
function tarjeta(tipo){
  var locVis = tipo;
  var nomEquipo = "";
  glocvis = tipo;
  if(tipo == 'L'){
    nomEquipo = $$("#tab-nom-equ-local").text(); 
  }else{
    nomEquipo = $$("#tab-nom-equ-visita").text(); 
  }
  mainView.router.navigate(`/tarjetas/${locVis}/${nomEquipo}/`,{animate:true});
}

/* Obtiene total de tarjetas amarillas/rojas */
function getJugadoresTarjetas(locvis){
  if(locvis == 'L'){
    idEquipo = gidEquipoLocal;
  }else{
    idEquipo = gidEquipoVisita;
  }
  //Borra contenido de lista-jugadores
  $$('#lista-jugadores-tarjetas').html("");
  db.transaction(function (tx){
    var select  = "SELECT jugador.id_jugador,jugador.jug_playera, jugador.jug_nombre, jugador.jug_representante, jugador.jug_foto, (SELECT SUM(detalle_encuentro.denc_amarilla) FROM detalle_encuentro WHERE detalle_encuentro.id_cliente = jugador.id_cliente and detalle_encuentro.id_sucursal = jugador.id_sucursal and detalle_encuentro.id_torneo = jugador.id_torneo and detalle_encuentro.id_jornada = '"+gidJornada+"' and detalle_encuentro.id_juego = '"+gidJuego+"' and detalle_encuentro.id_equipo = jugador.id_equipo and detalle_encuentro.enc_locvis = '"+locvis+"' and detalle_encuentro.id_jugador = jugador.id_jugador) as amarillas, ";
    var select2 = "(SELECT SUM(detalle_encuentro.denc_roja) FROM detalle_encuentro WHERE detalle_encuentro.id_cliente = jugador.id_cliente and detalle_encuentro.id_sucursal = jugador.id_sucursal and detalle_encuentro.id_torneo = jugador.id_torneo and detalle_encuentro.id_jornada = '"+gidJornada+"' and detalle_encuentro.id_juego = '"+gidJuego+"' and detalle_encuentro.id_equipo = jugador.id_equipo and detalle_encuentro.enc_locvis = '"+locvis+"' and detalle_encuentro.id_jugador = jugador.id_jugador) as rojas "
    var from    = 'FROM jugador ';
    var where   = "WHERE jugador.id_cliente = '"+gcliente+"' and jugador.id_sucursal = '"+gsucursal+"' and jugador.id_torneo = '"+gidTorneo+"' and jugador.id_equipo = '"+idEquipo+"' ";
    var order   = 'ORDER BY CAST(jugador.jug_playera AS INTEGER)';   
    var sql     = select + select2 + from + where + order;

    tx.executeSql(sql,[],function callback(tx,results){
      var regjugador = results.rows.length, i;
      var id_jugador = "";
      var jugador = "";
      var amarillas = 0;
      var foto2 = "";
      var rojas = 0;
      var cadena_tarjetas = "";
      for(ii=0; ii<regjugador; ii++){
        id_jugador = results.rows.item(ii).id_jugador;
        jugador = "# "+results.rows.item(ii).jug_playera+" "+results.rows.item(ii).jug_nombre;
        amarillas = results.rows.item(ii).amarillas;
        rojas = results.rows.item(ii).rojas;
        foto2 =  results.rows.item(ii).jug_foto;
        if (amarillas == null){
          amarillas = 0;
        }
        if (rojas == null){
          rojas = 0;
        }
        if (rojas > 0){
          //El jugador tiene tarjeta roja, se muestra el ico correspondiente a la tarjeta roja
          cadena_tarjetas = '<div class="block block-jugador-tarjeta"><div class="row"><div class="col col-jugador-datos-tarjeta" id="jugador-id-tarjeta-'+id_jugador+'">'+jugador+'</div></div><div class="row"><div class="col" id="jugador-foto-tarjeta"><img src="data:image/png;base64, '+foto2+'" width="60"/></div><div class="col col-icon-tarjeta-amarilla" id="ico-tarjeta-amarilla"><img src="../img/tarjeta_amarilla.png" width="60"/></div><div class="col col-numtarjeta-amarilla" id="tarjetas-amarillas-'+id_jugador+'">'+String(amarillas)+'</div><div class="col col-icon-suma-tarjeta" id="suma-tarjeta" onclick = "insertaTarjeta('+id_jugador+')"><img src="../img/plus-circle.png"/></div><div class="col col-icon-suma-tarjeta" id="resta-amarilla" onclick = "eliminaTarjeta('+id_jugador+')"><img src="../img/minus-circle.png"/></div><div class="col col-icon-tarjeta-roja" id="ico-tarjeta-roja-'+id_jugador+'" onclick = "tarjetaRoja('+id_jugador+')"><img src="../img/tarjeta_roja.png" width="55"/></div></div></div>';
        }else{
          //El jugador no tiene rojas, se muestra el ico correspondiente a la tarjeta bca.
          cadena_tarjetas = '<div class="block block-jugador-tarjeta"><div class="row"><div class="col col-jugador-datos-tarjeta" id="jugador-id-tarjeta-'+id_jugador+'">'+jugador+'</div></div><div class="row"><div class="col" id="jugador-foto-tarjeta"><img src="data:image/png;base64, '+foto2+'" width="60"/></div><div class="col col-icon-tarjeta-amarilla" id="ico-tarjeta-amarilla"><img src="../img/tarjeta_amarilla.png" width="60"/></div><div class="col col-numtarjeta-amarilla" id="tarjetas-amarillas-'+id_jugador+'">'+String(amarillas)+'</div><div class="col col-icon-suma-tarjeta" id="suma-tarjeta" onclick = "insertaTarjeta('+id_jugador+')"><img src="../img/plus-circle.png"/></div><div class="col col-icon-suma-tarjeta" id="resta-amarilla" onclick = "eliminaTarjeta('+id_jugador+')"><img src="../img/minus-circle.png"/></div><div class="col col-icon-tarjeta-roja" id="ico-tarjeta-roja-'+id_jugador+'" onclick = "tarjetaRoja('+id_jugador+')"><img src="../img/tarjeta_bco.png" width="55"/></div></div></div>';
        }
        $$('#lista-jugadores-tarjetas').append(cadena_tarjetas);
      }
    });
  });
}

function insertaTarjeta(idJugador){
  if(gestatus_juego == 'Por Jugar'){
    var totTarjetas = 0;
    if (glocvis == 'L'){
      equipo = gidEquipoLocal;
    }else{
      equipo = gidEquipoVisita;
    }
    /* Se inserta el jugador en la tabla detalle_encuentro */
    cadena = "insert into detalle_encuentro(id_cliente,id_sucursal,id_torneo,id_jornada,id_juego,id_equipo,enc_locvis,id_jugador,denc_gol,denc_roja,denc_amarilla) values('"+String(gcliente)+"','"+String(gsucursal)+"','"+gidTorneo+"','"+gidJornada+"','"+gidJuego+"','"+equipo+"','"+glocvis+"','"+idJugador+"',0,0,1)";
    insertaReg(cadena,db,function(resultado){
      if(resultado == 'INSERTADO'){
        totTarjetas = $$('#tarjetas-amarillas-'+idJugador).text();
        totTarjetas++;
        $$('#tarjetas-amarillas-'+String(idJugador)).text(String(totTarjetas));
        // Actualiza el titúlo con el total de goles
        refreshTotTarjetas(glocvis);
      }
    });
  }else{
    app7.dialog.alert("El estatus del encuentro ("+gestatus_juego+") no permite realizar ningún cambio en tarjetas", "AVISO");
  }
}

function refreshTotTarjetas(enclocvis){
  getTarjetas(gcliente,gsucursal,gidTorneo,gidJornada,gidJuego,enclocvis,"", function(tarjetasR){
    arr = tarjetasR.split("|");
    marcador = parseInt(arr[0]);
    if (marcador == 99){
        marcador_string = "0";
    }else{
      marcador_string = String(marcador);
    }
    getTarjetasRojas(gcliente,gsucursal,gidTorneo,gidJornada,gidJuego,glocvis, function(tarjetasr){
      $$('#total-tarjetas').text("TOTAL TARJETAS "+gnomEquipoAfectado+" "+marcador_string+", rojas("+String(tarjetasr)+")");
    });
  });
}

function eliminaTarjeta(idJugador){
  if(gestatus_juego == 'Por Jugar'){
    var totTarjetas = 0;
    if (glocvis == 'L'){
      equipo = gidEquipoLocal;
    }else{
      equipo = gidEquipoVisita;
    }
    /* Se obtiene el max(denc_minuto) del jugador en question, esto para poder eliminar SOLO 1 registro */
    cadena = "SELECT MAX(CAST(denc_minuto AS INTEGER)) maximo FROM detalle_encuentro WHERE id_cliente = '"+String(gcliente)+"' AND id_sucursal = '"+String(gsucursal)+"' AND id_torneo = '"+gidTorneo+"' AND id_jornada = '"+gidJornada+"' AND id_juego = '"+gidJuego+"' AND id_equipo = '"+equipo+"' AND enc_locvis = '"+glocvis+"' AND id_jugador = '"+idJugador+"' AND denc_amarilla = 1";
    ejecutaQuery(cadena,db,"maxMinuto",function(maxMinuto){
      /* Se elimina el jugador en la tabla detalle_encuentro */
      cadena = "DELETE FROM detalle_encuentro WHERE id_cliente = '"+String(gcliente)+"' AND id_sucursal = '"+String(gsucursal)+"' AND id_torneo = '"+gidTorneo+"' AND id_jornada = '"+gidJornada+"' AND id_juego = '"+gidJuego+"' AND id_equipo = '"+equipo+"' AND enc_locvis = '"+glocvis+"' AND id_jugador = '"+idJugador+"' AND denc_minuto = "+String(maxMinuto)+" AND denc_amarilla = 1";
  
      eliminaReg(cadena,db,function(resultado){
        if(resultado == 'ELIMINADO'){
          /* Se actualiza en la vista la cantidad de tarjetas del jugador*/
          totAmarillas = $$('#tarjetas-amarillas-'+idJugador).text();
          totAmarillas--;
          if (totAmarillas < 0){
            totAmarillas = 0;
          }
          $$('#tarjetas-amarillas-'+String(idJugador)).text(String(totAmarillas));
          // Actualiza el titúlo con el total de goles
          refreshTotTarjetas(glocvis);
        }
      });
    });
  }else{
    app7.dialog.alert("El estatus del encuentro ("+gestatus_juego+") no permite realizar ningún cambio en tarjetas", "AVISO");
  }
}

function tarjetaRoja(idJugador){
  if(gestatus_juego == 'Por Jugar'){
    /* Se obtiene el total de tarjetas rojas que tiene el jugador en cuestio, si el jugador tiene tarjeta roja
      se procede a eliminar dicha tarjeta y cambia el ico por tarjeta bco, caso contrario que el jugador no tenga
      tarjeta roja, se inserta roja y se cambia el ico a roja */
      if (glocvis == 'L'){
        idequipoinvo = gidEquipoLocal;
      }else{
        idequipoinvo = gidEquipoVisita;
      }
    cadena = "SELECT COUNT(*) tot_registros FROM detalle_encuentro WHERE id_cliente = '"+String(gcliente)+"' AND id_sucursal = '"+String(gsucursal)+"' AND id_torneo = '"+String(gidTorneo)+"' AND id_jornada = '"+gidJornada+"' AND id_juego = '"+gidJuego+"' AND id_equipo = '"+idequipoinvo+"' AND enc_locvis = '"+glocvis+"' AND id_jugador = '"+idJugador+"' AND denc_roja = 1";
    //Se valida si el jugador tiene tarjeta roja o no */
    ejecutaQuery(cadena,db,"numRegistros",function(totRegistros){
      if(totRegistros > 0){
        /* Si hay roja, se procede a eliminar y cambiar el ico por bco. */
        cadena = "DELETE FROM detalle_encuentro WHERE id_cliente = '"+String(gcliente)+"' AND id_sucursal = '"+String(gsucursal)+"' AND id_torneo = '"+gidTorneo+"' AND id_jornada = '"+gidJornada+"' AND id_juego = '"+gidJuego+"' AND id_equipo = '"+idequipoinvo+"' AND enc_locvis = '"+glocvis+"' AND id_jugador = '"+idJugador+"' AND denc_roja = 1";
        eliminaReg(cadena,db,function(resultado){
          if(resultado == 'ELIMINADO'){
            /* Se cambia el ico por bco.*/
            $$('#ico-tarjeta-roja-'+String(idJugador)).html('<img src="../img/tarjeta_bco.png" width="55"/>');
          }
        });
      }else{
        /* No existe tarjeta roja para el jugador en cuestión, se inserta una y se cambia el ico por tarjeta roja */
        cadena = "insert into detalle_encuentro(id_cliente,id_sucursal,id_torneo,id_jornada,id_juego,id_equipo,enc_locvis,id_jugador,denc_gol,denc_roja,denc_amarilla) values('"+String(gcliente)+"','"+String(gsucursal)+"','"+gidTorneo+"','"+gidJornada+"','"+gidJuego+"','"+idequipoinvo+"','"+glocvis+"','"+idJugador+"',0,1,0)";
        insertaReg(cadena,db,function(resultado2){
          if(resultado2 == 'INSERTADO'){
              /* Se cambia el ico por roja*/
            $$('#ico-tarjeta-roja-'+String(idJugador)).html('<img src="../img/tarjeta_roja.png" width="55"/>');
          }
        });
      }
      refreshTotTarjetas(glocvis);
    });
  }else{
    app7.dialog.alert("El estatus del encuentro ("+gestatus_juego+") no permite realizar ningún cambio en tarjetas", "AVISO");
  }
}

function getTarjetasRojas(gcliente,gsucursal,gidTorneo,gidJornada,gidJuego,glocvis, callBack){
  /* Se obtiene total de tarjetas rojas por equipo */
  if(glocvis == 'L'){
    idequipoinvo = gidEquipoLocal;
  }else{
    idequipoinvo = gidEquipoVisita;
  }
  cadena = "SELECT COUNT(*) tot_registros FROM detalle_encuentro WHERE id_cliente = '"+String(gcliente)+"' AND id_sucursal = '"+String(gsucursal)+"' AND id_torneo = '"+String(gidTorneo)+"' AND id_jornada = '"+gidJornada+"' AND id_juego = '"+gidJuego+"' AND id_equipo = '"+idequipoinvo+"' AND enc_locvis = '"+glocvis+"' AND denc_roja = 1";
  //Se valida si el equipo tiene tarjetas roja o no */
  ejecutaQuery(cadena,db,"numRegistros",function(totRegistros){
    callBack(totRegistros);
  });
}

function cedula(){
  mainView.router.navigate('/show-cedula/',{animate:true}); 
}

function getDatosJuegoCedula(callBack){
   //Borra contenido del Block
   $$('#show-cedula-datgen').html("");
   var datgenerales = ' <div class="row"><div class="col" id="show-cedula-logo"><img src="../img/LogoCte1.jpg" width="70"/></div></div><div class="row"><div class="col" id="show-cedula-jornada">Jornada # '+gidJornada+'</div><div class="col" id="show-cedula-torneo">Torneo: '+gnomTorneo+'</div></div><div class="row"><div class="col" id="show-cedula-fecha">Fecha/Hora del partido: '+gfechaHoraJuego+'</div> <div class="col" id="show-cedula-arbitro">Árbitro del partido: '+gnomArbitro+'</div></div><div class="row"><div class="col col-show-cedula-equipo-local" id="show-cedula-equipo-local">Equipo Local: '+gnomEquipoLocal+'</div><div class="col" id="show-cedula">&nbsp</div></div>';
   $$('#show-cedula-datgen').append(datgenerales);
   /* Las sig. líneas, inicia a llenar archivo PDF */
   gPdf.text(12,5,"Jornada # "+gidJornada);
   gPdf.text(35,5,"Torneo: "+gnomTorneo);
   gPdf.text(12,8,"Fecha/Hora del partido: "+gfechaHoraJuego);
   gPdf.text(12,11,"Árbitro del partido: "+gnomArbitro);
   gPdf.text(5,15,"Equipo Local: "+gnomEquipoLocal);
   grenPdf = 15; // número de renglón apartir del cual debe de incrementar según número de filas en tablas para exportar al PDF
   callBack("YA");
  }

function getJugadoresCedula(locvisced, callBack){
  if(locvisced == 'L'){
    idEquipo = gidEquipoLocal;
  }else{
    idEquipo = gidEquipoVisita;
  }
  //Borra contenido de lista-jugadores
  $$('#show-cedula-jugadores').html("");
  growPdf = []; // Inicializa el array
  db.transaction(function (tx){
    var select1 = "SELECT jugador.id_jugador,jugador.jug_playera, jugador.jug_nombre, jugador.jug_representante, jugador.jug_foto, (SELECT SUM(detalle_encuentro.denc_gol) FROM detalle_encuentro WHERE detalle_encuentro.id_cliente = jugador.id_cliente and detalle_encuentro.id_sucursal = jugador.id_sucursal and detalle_encuentro.id_torneo = jugador.id_torneo and detalle_encuentro.id_jornada = '"+gidJornada+"' and detalle_encuentro.id_juego = '"+gidJuego+"' and detalle_encuentro.id_equipo = jugador.id_equipo and detalle_encuentro.enc_locvis = '"+locvisced+"' and detalle_encuentro.id_jugador = jugador.id_jugador) as goles, ";
    var select2 = "(SELECT SUM(detalle_encuentro.denc_amarilla) FROM detalle_encuentro WHERE detalle_encuentro.id_cliente = jugador.id_cliente and detalle_encuentro.id_sucursal = jugador.id_sucursal and detalle_encuentro.id_torneo = jugador.id_torneo and detalle_encuentro.id_jornada = '"+gidJornada+"' and detalle_encuentro.id_juego = '"+gidJuego+"' and detalle_encuentro.id_equipo = jugador.id_equipo and detalle_encuentro.enc_locvis = '"+locvisced+"' and detalle_encuentro.id_jugador = jugador.id_jugador) as amarillas, ";
    var select3 = "(SELECT SUM(detalle_encuentro.denc_roja) FROM detalle_encuentro WHERE detalle_encuentro.id_cliente = jugador.id_cliente and detalle_encuentro.id_sucursal = jugador.id_sucursal and detalle_encuentro.id_torneo = jugador.id_torneo and detalle_encuentro.id_jornada = '"+gidJornada+"' and detalle_encuentro.id_juego = '"+gidJuego+"' and detalle_encuentro.id_equipo = jugador.id_equipo and detalle_encuentro.enc_locvis = '"+locvisced+"' and detalle_encuentro.id_jugador = jugador.id_jugador) as rojas ";
    var from    = 'FROM jugador ';
    var where   = "WHERE jugador.id_cliente = '"+gcliente+"' and jugador.id_sucursal = '"+gsucursal+"' and jugador.id_torneo = '"+gidTorneo+"' and jugador.id_equipo = '"+idEquipo+"' ";
    var order   = 'ORDER BY CAST(jugador.jug_playera AS INTEGER)';   
    var sql     = select1 + select2+ select3+ from + where + order;
    tx.executeSql(sql,[],function callback(tx,results){
      var regjugador = results.rows.length, i;
      var id_jugador = "";
      var jugador = "";
      var goles = 0;
      var amarillas = 0;
      var rojas = 0;
      var encabezados = '<table><thead class="col-encabezados-tabla"><tr><th class="label-cell col-titulo-tabla">Nombre Jugador</th><th class="numeric-cell">Gol</th><th class="numeric-cell">Tarjeta Amarilla</th><th class="numeric-cell">Tarjeta Roja</th></tr></thead>';
      var aviso = 0;
      var totgoles = 0;
      var totamarillas = 0;
      var totrojas = 0;
      var cuantos = 0;
      var cadena_cedula = "";
      var records = 0;
      var rowPdf = [];
      for(iii=0; iii<regjugador; iii++){
        id_jugador = results.rows.item(iii).id_jugador;
        jugador = "# "+results.rows.item(iii).jug_playera+" "+results.rows.item(iii).jug_nombre;
        goles = results.rows.item(iii).goles
        amarillas = results.rows.item(iii).amarillas;
        rojas = results.rows.item(iii).rojas;
        if (goles == null || goles == 0){
          goles = 0;
          strgoles = '&nbsp';
        }else{
          totgoles = totgoles + goles;
          strgoles = String(goles);
        }
        if (amarillas == null || amarillas == 0){
          amarillas = 0;
          stramarillas = '&nbsp';
        }else{
          totamarillas = totamarillas + amarillas;
          stramarillas = String(amarillas);
        }
        if (rojas == null || rojas == 0){
          rojas = 0;
          strrojas = '&nbsp';
        }else{
          totrojas = totrojas + rojas;
          strrojas = String(rojas);
        }
        if(goles != 0 || amarillas != 0 || rojas !=0){
          records = 1;
          /* Si el jugador tiene alguno de los tres conceptos (goles,amarillas,rojas) diferente a 0 se imprime */
          if(aviso == 0){
            /* El encabezado aún no se imprime */
            cadena_cedula = encabezados + '<tbody><tr><td class="label-cell">'+jugador+'</td><td class="numeric-cell">'+strgoles+'</td><td class="numeric-cell">'+stramarillas+'</td><td class="numeric-cell">'+strrojas+'</td></tr></tbody>';
            aviso = 1;
          }else{
            cadena_cedula = cadena_cedula + '<tbody><tr><td class="label-cell">'+jugador+'</td><td class="numeric-cell">'+strgoles+'</td><td class="numeric-cell">'+stramarillas+'</td><td class="numeric-cell">'+strrojas+'</td></tr></tbody>';
          }
          if(jugador.length > 26){
            var jugadorPdf = jugador.substr(0,26);
          }else{
            var jugadorPdf = jugador;
          }
          /* Evaluamos de los 3 posibles valores (goles,amarillas,rojas) cual tiene un valor <> 0 para agregar al array  y exportar a PDF*/
          for(var yx=0; yx<3; yx++){
            switch(yx){
              case 0:
                if(goles == 0){
                  strgoles = '';
                }else{
                  strgoles = String(goles);
                }
                break;
              case 1:
                if(amarillas == 0){
                  stramarillas = '';
                }else{
                  stramarillas = String(amarillas);
                }
                break;
              case 2:
                if(rojas == 0){
                  strrojas = '';
                }else{
                  strrojas = String(rojas);
                }
                break;
            }
          }
          growPdf.push(jugadorPdf,strgoles,stramarillas,strrojas);
          if(locvisced == 'L'){
            gtotRowPdfLocal.push(growPdf);
          }else{
            gtotRowPdfVisita.push(growPdf);
          }
          growPdf = []; //Se inicializa el array "individual"
          grenPdf = grenPdf + 8; // Se le suman 8 unidades a esta variable, y funciona para identificar en dónde se ponrá el texto "Equipo Visita:" en el archivo a exportar PDF
        }
        if(++cuantos == regjugador){
          callBack("YA");
        }
      }
      if (records == 0){
        //No exisitieron registros, se visualiza la cédula vacia
        cadena_cedula = encabezados;
      }
      var totales = '<tbody><tr><td class="label-cell">TOTALES</td><td class="numeric-cell">'+String(totgoles)+'</td><td class="numeric-cell">'+String(totamarillas)+'</td><td class="numeric-cell">'+String(totrojas)+'</td></tr></tbody>';
      
      if(locvisced == 'L'){
        // Se agrega la fila de totales LOCAL para ser mostrada en el archivo PDF
        growPdf.push('T O T A L E S',String(totgoles),String(totamarillas),String(totrojas));
        gtotRowPdfLocal.push(growPdf);
        growPdf = [];

        cadena2 = '<div class="block block-show-cedula" id="show-cedula-datgen"><div class="row"><div class="col col-show-cedula-equipo-local" id="show-cedula-equipo-visita">Equipo Visita: '+gnomEquipoVisita+'</div><div class="col" id="show-cedula">&nbsp</div></div></div>';
        cadena_cedula = cadena_cedula + totales + '</table>' + cadena2;
      }else{
        // Se agrega la fila de totales VISITA para ser mostrada en el archivo PDF
        growPdf.push('T O T A L E S',String(totgoles),String(totamarillas),String(totrojas));
        gtotRowPdfVisita.push(growPdf);
        growPdf = [];
        cadena_cedula = cadena_cedula + totales + '</table>';

      }
      $$('#show-cedula-jugadores').append(cadena_cedula);
    });
  });
}

function imprimir(){
  /*
  var logo_url = "../img/LogoCte1.jpeg";
  getImgFromUrl(logo_url, function (img) {
    gPdf.addImage(img, 'JPEG', 3, 3, 20, 20);
  });
*/

//var img = image();
//img.src = "../img/tarjeta_roja.png";
//var imgData = btoa(img);
//console.log(imgData);
var imgData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAB6FJREFUeJztm1tsVNcVhr99xuMZe2xsbLDBKWAMNuC0JNQDCTQkERepgTS0CMTFQcVuFUWKikQvqapKqFUrtUrpQ0ujkkQKhtgFQkWTNGloqVIaygPUw82Yi23aMQZjbr4w9nhmzsxZfRibq009M+doJgr/4zl7/Wud33vtvdfaY3iIzzeUFaRV7nXPIMZTohidKJcSZaAZVyJhY/+OY7tOmhHfXfxmkq13r5qgqbRdoOahwOF0JuxBDCEUCCIiAuzUQ+ql2pO1faYEDKSZRVQ97YVsIe3vGa7MslUbK5mz+EkcGQ4AJByGSDhubl+3j0/e3a8+rN23Nj3dGAV8zaSwzZsBVe7KTUpTP/3h1h9TNms6IkK4/hChg39DrnWY4uOfF8LsbdaJGPL8dk/dR2ZwamaQRKG+McP9KGWzpgMQ2reX4N4dpn08wPwJNlx20JDlZnGaKIBMeqTkEQAi7W3on/7VPOoBaEpRmKmhUBNN4zSLSCBNs9kAiJw+ZhbtfdAUiFKmrV0mzoDbkEC/FbSWwBIBUNbQWoHPTqQW4aEAyQ4g2XgoQLIDSDZSUgARIRgWRKz3ZdqBwgz0h4X3m3XqOyLoBuSkw7JSOxXjrAszZQQIG8LW4yEu+jXmL19E/rh8juw/zM4zXmaOtWG3WdK6SB0B/nEhTOtNYcNrLzHzmbkAjC7I461Nv+dSr1CcY40AKbMGHLoU4ctzSyidNubWs8nlJQC03jQs85sSAvh1oSsglM4owgj5bz0vmFBIVm42zV0Ry3ynRArYB/4MEcMg7O/BCPWjRxTv/LKGvp5eWmyCIYKmzE+DlJgBdpvCZYfuzj4QA9/5w1w/9SkXz55j0tSx9IehzWfNnpgSAgDkOlRUgAFkZaWz8SfLePHlZwFo6rQmDVJGgNFORU/n/c3evDHZ5Bdk09xlzUKYMgLcOwPuRGl5Ef/pNtCNwTSQsjUVa8YMOThGpI4AzqgAMsT5t7S8CN0Ab3d0FiilipxK272SlbZE/aaOAA5FKBim3x+6713pjPEANA2kQbojDaXUgiy347VE/aaOAM7oFjdUGmSNyqBoQh5NnVEBCsbnUDFvCiAb11esXZuI39QRwDG8ABBNgws+g0AkmiLzF5czaUqBUkq99c3Zax+P1+9nSIDxGAKXBs4DmqaxdKWb/IJRmZqovetmfz0/Hr8pI8DgYWiorRCgZNo4NE1x5xKZkZlO9YZFOBz2yWni2hnPomiaAAolkNhp7UFboTMjnYklY+97XjQxj1Xfno9SanFWheMXsfo082qsu+dGT0IMg1vhcCgtLwLA4bQDMFgazHqihAVLZ4KS71e7K1+IxaeJV2Ny6OShE/T2+G5HFiOiM6B32PeDAthsGh2XusjMct56t2RFBZNLC5XAZmK49TZNAA3jV/7ePv31V39LL/aY7UXgZlAI9OvDjimeWoAzw05TYzt7th0iJzfztn9NY8HSmSilSte5V494VzC1vqxyv1iFkjecaTZ72WjIso+c3q8LJ64ZrP7WfOY8XTbsuO7OPnw9/biyHeSNyb7rXdeNXn723d2IISu3eer+OBK/pvYDttXXbqt2rz4e0Pm44ZoqVArUCNJBJNoBfuLpsgd+PEBunovcPNeQ7wZPkaKM4EhjtqohUjDTXcyzz32RtLQH70zBgE7t1gO4sp0sXzc3IadNje2IiBh6+OhIbSwQwDZXKaWWrKjAZtOGLG7uxJ93HyEY0HnlR0uxpycWToPHC+DZcWLPpZHamC6AgXRoKK5f9VH+2IQHjj24v5Hm05ep2rCQMYWjEvJ7s8ePt/kKCv4Ui53pAnR0d340Pjf/7I7XP5k+68kSnBnpAIT1+zs6Rw428dSicr5UUZyw31NHLyACekRLrgD7WvYFq2etXhgIyObDB849h1K5MFjC3h4XCkZwZTtYssJtit+Gei8icvadY7VnYrGzZBF8+9iudmBtlbvyPZfLsezlV7/KF4pvN3BCQZ1N3/kDX1k4A2dG7GeGe9HfF6TlzGWQ2KY/WFwMKZj32JzJd308QMuZy4SCYR6fU2KKn8YTbUQiBqJSTACBjvYLNzCMuxuabd7rZLocFIzPMcVPQ70XMaStpr7u37HaWnoxIsKvW89fq9ny8w8pnlp469zZ1NjO6PysER2S/h9CwTBnGy6CkvfisbdUgBpP3fb1FZV4W65+z3v+6kRkYMYpnJOmFCSe/MDZhovooQiGqL3x2Ft+NVbjqdsObL/z2fqKyt/5e4OvmMHf4PEiItf9ntDBeOyT0xFSNHde8xEMDl/5jQThcITTx9tA5IM97Inr6ig5AggHDUNoamxPiKblzOVoARTH9jeIpAhQ46k7KiIthw+cS4inwdOKiPiybnbuj5cjaU1REfWb0yfa+G/TlbjsDUM4dbQVhfp4S8u+EZe/9yJpAqST+QbC6Xe3/Ssue2/LFXw9/USIxD39IYkCvOl5U0eMLVfau+OyjxY/ErT5+hL6z5Gk3gtENOK+9O/p6gNoffvcB75EYkiZi5Fk4aEAyQ4g2Ujqr8SUoaLVgciBWG0D/tB0lEr4l1NJFSBgRP7iVGk/yH10weZYbatnr5krhppsRVwP8XnC/wBuFtx1FF1G5QAAAABJRU5ErkJggg==';
gPdf.addImage(imgData,"JPG", 1 ,2 ,10,10, undefined, 'FAST', 0);

//img.src = $$('#show-cedula-logo');


/*
var file    = "../img/LogoCte1.jpg";
var reader  = new FileReader();
reader.onloadend = function () {
  imgData = reader.result;
}
if (file) {
  reader.readAsDataURL(file);
} else {
  alert("no hay");
}

gPdf.addImage(imgData, 'JPEG', 5, 5, 12, 15);
*/

gPdf.autoTable({
  columnStyles: {  0: { halign: 'left', fontSize:7, cellWidth: 36} , 1: { halign: 'center', fontSize:7, cellWidth: 8}, 2: { halign: 'center', fontSize:7, cellWidth: 14}, 3: { halign: 'center', fontSize:7, cellWidth: 10} },  
  head: [['Nombre Jugador', 'Gol', 'Amarilla', 'Roja']],
  body: gtotRowPdfLocal,
  theme:'grid',
  tableWidth: 68,
  margin:2,
  startY:17,
  headStyles: { halign: 'center', fontSize: 6, fillColor: [215,215,215], textColor: [0,0,0]},
});

gPdf.text(5,gPdf.lastAutoTable.finalY + 5,"Equipo Visita: "+gnomEquipoVisita);


gPdf.autoTable({
  columnStyles: {  0: { halign: 'left', fontSize:7, cellWidth: 36} , 1: { halign: 'center', fontSize:7, cellWidth: 8}, 2: { halign: 'center', fontSize:7, cellWidth: 14}, 3: { halign: 'center', fontSize:7, cellWidth: 10} },  
  head: [['Nombre Jugador', 'Gol', 'Amarilla', 'Roja']],
  body: gtotRowPdfVisita,
  theme:'grid',
  tableWidth: 68,
  margin:2,
  startY: gPdf.lastAutoTable.finalY + 7,
  headStyles: { halign: 'center', fontSize: 6, fillColor: [215,215,215], textColor: [0,0,0]},
});

gPdf.text(3,gPdf.lastAutoTable.finalY + 10,"_____________________");
gPdf.text(40,gPdf.lastAutoTable.finalY + 10,"_____________________");

gPdf.text(7,gPdf.lastAutoTable.finalY + 13,"CAPITÁN LOCAL");
gPdf.text(44,gPdf.lastAutoTable.finalY + 13,"CAPITÁN VISITA");

//console.log(gPdf.output().length);
gPdf.save("prueba.pdf");


}

function getImgFromUrl(logo_url, callback) {
  var img = new Image();
  img.src = logo_url;
  img.onload = function () {
      callback(img);
  };
} 




function cerrar(){
  if(gestatus_juego == 'Por Jugar'){
    app7.dialog.confirm('¿ Estás seguro en cambiar el estatus del juego entre '+gnomEquipoLocal+' y '+gnomEquipoVisita+' ?','CONFIRMA', function () {
      cambiarEstatus();
    });
  }else{
    app7.dialog.alert("El encuentro ya se encuentra con el estatus ("+gestatus_juego+"), no procede cambiar el estatus", "AVISO");
  }
}

function cambiarEstatus(){
  cadena = "UPDATE calendario SET cal_estatus = '1' WHERE id_cliente = '"+gcliente+"' AND id_sucursal = '"+gsucursal+"' AND id_torneo = '"+gidTorneo+"' AND id_jornada = '"+gidJornada+"' AND id_juego = '"+gidJuego+"'";
  actualizaReg(cadena,db,function(resultado){
    if(resultado == 'ACTUALIZADO'){
      app7.dialog.alert("Cambio de estatus satisfactorio", "AVISO");
      gestatus_juego = 'Jugado';
      $$('#ico_show_cedula_status').html('<i class="f7-icons">lock_fill</i>');
      }
  });
}

function showIconCierre(){
  if(gestatus_juego == 'Por Jugar'){
    //El estatus correspponde a "Por Jugar", se muestra el ico con el candado abierto
    $$('#ico_show_cedula_status').html('<i class="f7-icons">lock_open_fill</i>');
    //$("#my_password_icon").html('<i class="f7-icons">lock_open_fill</i>')
  }
}


function periodo(){
  /* El usuario da tap al número de périodo, se obtiene el localStorage correspondiente al número de périodo */
  var periodo  = parseInt($$('#tab-periodo').text());
  var periodoConfig = parseInt(localStorage.getItem("periodos"));
  /* Se evalua si el número de pérido pintado en el tablero es menor que el almacenado en la configuración */
  if(periodo < periodoConfig){
    /* El número pintado en el tablero es menor, se puede incrementar */
    periodo++;
  }else{
    periodo = 1;
  }
  $$('#tab-periodo').text(periodo);

}

function cronometro(){
  
  if(gbandera == 0){
    gbandera = 1;
    //El cronómetro está pausdado, se echa andar
    startCronometro();
    id = setInterval(startCronometro,1000);
  }else{
    gbandera = 0;
    stopCronometro();
  }
}

function startCronometro(parMinuto,parSegundo){
  var stringCronometro = "";
  var hAux = "";
  var mAux = "";
  var sAux = "";
  var minutos = "";

  //Se obtiene el número pintado en el tablero para el valor del cronómetro
  stringCronometro = $$('#tab-cronometro').text();
  //Separamos los minutos de los segundos
  var m  = parseInt(stringCronometro.substring(0,stringCronometro.indexOf(":")));
  var s = parseInt(stringCronometro.substring(stringCronometro.indexOf(":")+1));
  var h = 0;

  s--;
  if (s<0){m--;s=59;}
  //if (m<0){h--;m=59;}
  if (m<0){
    gbandera = 0;
    stopCronometro();
    periodo();
    //El cronómetro se iguala según el valor de lo especificado en la configuración
    stringCronometro = localStorage.getItem("minutos");
    m  = parseInt(stringCronometro.substring(0,stringCronometro.indexOf(":")));
    s = parseInt(stringCronometro.substring(stringCronometro.indexOf(":")+1));
    h = 0;
  }
  if (h>24){h=0;}

  if (s<10){sAux="0"+String(s);}else{sAux=String(s);}
  if (m<10){mAux="0"+String(m);}else{mAux=String(m);}
  if (h<10){hAux="0"+String(h);}else{hAux=String(h);}
  minutos = mAux + ":" + sAux; 
  $$('#tab-cronometro').text(minutos);
}

function stopCronometro(){
  clearInterval(id);
}

function getJuegosReplicar(){
  //Borra contenido de lista-juegos-replicar
  $$('#lista-juegos-replicar').html("");
  db.transaction(function (tx){
    var select  = "SELECT encuentro.id_torneo,encuentro.id_equipo,equipo.equ_nombre,torneo.tor_nombre,encuentro.id_jornada,encuentro.enc_locvis,calendario.cal_fecha_hora,calendario.cal_estatus,calendario.id_juego ";
    var from    = 'FROM equipo, calendario, encuentro,torneo ';
    var where   = "WHERE encuentro.id_sucursal = calendario.id_sucursal and encuentro.id_cliente = calendario.id_cliente and encuentro.id_torneo = calendario.id_torneo and encuentro.id_jornada = calendario.id_jornada and encuentro.id_juego = calendario.id_juego and equipo.id_sucursal = encuentro.id_sucursal and equipo.id_cliente = encuentro.id_cliente and equipo.id_torneo = encuentro.id_torneo and equipo.id_equipo = encuentro.id_equipo and equipo.id_cliente = torneo.id_cliente and torneo.id_sucursal = equipo.id_sucursal and torneo.id_torneo = equipo.id_torneo and calendario.id_cliente = '"+String(gcliente)+"' AND calendario.id_sucursal = '"+String(gsucursal)+"' AND calendario.cal_estatus = '1' ";
    var order   = 'ORDER BY calendario.cal_fecha_hora ASC, encuentro.enc_locvis';   
    var sql     = select + from + where + order;
    
    var estatus_juego = "";
    var marcador = 0;
    var fecha_juego = "";
    var formatted_date = "";
    //var nombre_equipo = "";
    var jornada = "";
    var estatus_juego = "";
    var nombre_torneo  = "";
    var marcador_string = "";
    var nombre_visitante = "";
    var nombre_local = "";
    //var juego   = "";
   
    tx.executeSql(sql,[],function callback(tx,results){
      var registros = results.rows.length, i;
      if(registros == 0){
        gsiHayDatos = 0;
        app7.dialog.alert("No existen encuentros con el estatus 'Jugado', favor de cambiar el estatus de los encuentros ya concluidos", "AVISO");
      }else{
        gsiHayDatos = 1;
        for(i=0; i<registros; i++){
          // Determinar si el contador es impar o no, si es par, el recordSet corresponde a un equipo LOCAL, caso contrario es Visita y
          // solo tomar el registro de nombre de quipo
          //if(i%2 != 0)
          if(i%2 != 0){
            //Es número impar
            //Se termina de crear la cadena para mostar el marcador de ambos equipos
            nombre_visitante =  results.rows.item(i).equ_nombre;
            getMarcadores(gcliente,gsucursal,results.rows.item(i).id_torneo,results.rows.item(i).id_jornada,results.rows.item(i).id_juego,results.rows.item(i).enc_locvis,nombre_visitante,'','',0,'', function(resultado){
              //En el arreglo de "resultado", se estiene los datos del marcador, equipo y jornada
              arr = resultado.split("|");
              marcador = parseInt(arr[0]);
              equipo = arr[1];
              jornada = arr[2];
              if (marcador == 99){
                marcador_string += "- ?";
              }else{
                marcador_string +='- '+String(marcador);
              }
              //La sig. function, termina de concatenar la cadena para mostrar en el List, incluso también muestra el List
              setMarcadorVisitanteReplicar(marcador_string,equipo);
            });
          }else{
            // Es número par
            // Número par, se obtiene fecha, torneo, estatus del juego, equipo local y su marcador
            switch(results.rows.item(i).cal_estatus){
              case '2':
                estatus_juego = 'Ya Replicado';
              case '1':
                estatus_juego = 'Jugado';
                break;
              case '0':
                estatus_juego = 'Por Jugar';
                break;
            }
            fecha_juego = new Date(results.rows.item(i).cal_fecha_hora);
            formatted_date = fecha_juego.getDate() + "-" + (fecha_juego.getMonth() + 1) + "-" + fecha_juego.getFullYear() + " " + fecha_juego.getHours() + ":" + fecha_juego.getMinutes();
            nombre_local = results.rows.item(i).equ_nombre;
            jornada = results.rows.item(i).id_jornada;
            nombre_torneo =results.rows.item(i).tor_nombre;
            getMarcadores(gcliente,gsucursal,results.rows.item(i).id_torneo,results.rows.item(i).id_jornada,results.rows.item(i).id_juego,results.rows.item(i).enc_locvis,nombre_local,formatted_date,nombre_torneo, i, estatus_juego, function(resultado){
              arr = resultado.split("|");
              marcador = parseInt(arr[0]);
              equipo = arr[1];
              jornada = arr[2];
              fecha_juego = arr[3];
              nombre_torneo = arr[4];
              contador = arr[5];
              estatus_juego = arr[6];
              if (marcador == 99){
                  marcador_string = "¿ ";
              }else{
                marcador_string = String(marcador) + " ";
              }
              setMarcadorLocal(fecha_juego,nombre_torneo,jornada,estatus_juego,equipo,contador);
              });
            //console.log('el marcador es '+marcador_string);
            //Si yo pongo el console.log aqui, no imprime el valor de marcador_string, que diferencia hay? la valiable está 
          }
        }
      }
    });
  });
}

function setMarcadorVisitanteReplicar(marcador_string,nombre_visitante){
  /* Termina de concatenar la cadena "juego" para enseguida mostrarla como un elemento del componente List */
  juego += '<div class="col row-marcadores" id="marcadoresr">'+marcador_string+'</div><div class="col" id="equipo-visitar">'+nombre_visitante+'</div></div></div></div>';
  // Se agrega al componente LIST el juego en cuestión
  $$('#lista-juegos-replicar').append(juego);
}

function setMarcadorLocalReplicar(formatted_date,nombre_torneo,jornada,estatus_juego,nombre_equipo,contador){
  /* Asigna a "juego" la cadena para mostar posteriormente en la function setMarcadorVisitante el elemento del componente List */
  var color_columna = "";
  if(estatus_juego == 'Por Jugar'){
    color_columna = 'row-replicar-sel-text2-2';
  }
  else{
    color_columna = 'row-replicar-sel-text2';
  }
  juego = '<div class="block block-replicar-sel0"><div class="block block-replicar-sel1"><div class="row row-replicar-sel-text1"><div class="col" id="fecha-hora-juegor-'+String(contador)+'">'+formatted_date+'</div><div class="col" id="nombre-torneor-'+String(contador)+'">'+nombre_torneo+'</div><div class="col" id="id_jornadar-'+String(contador)+'">J-'+jornada+'</div></div><div class="row '+color_columna+'"><div class="col" id="estatus-juegor-'+String(contador)+'">'+estatus_juego+'</div></div></div><div class="block block-replicar-sel2"><div class="row row-replicar-sel-text3"><div class="col" id="equipo-localr">'+nombre_equipo+'</div>';
}

function confirma_replicar(){
  /* Se valida si existen registros(encuentros) para replicar */
  if(gsiHayDatos != 0 ){
    app7.dialog.confirm('¿ Deseas continuar con el proceso de replicar datos ?','CONFIRMA', function () {
      db.transaction(function (tx){
        var cadenaSelect  = 'SELECT detalle_encuentro.id_cliente,detalle_encuentro.id_sucursal,detalle_encuentro.id_torneo,detalle_encuentro.id_jornada,detalle_encuentro.id_juego,detalle_encuentro.id_equipo,detalle_encuentro.enc_locvis,detalle_encuentro.id_jugador,detalle_encuentro.denc_minuto,detalle_encuentro.denc_gol,detalle_encuentro.denc_roja,detalle_encuentro.denc_amarilla ';
        var cadenaFrom    = 'FROM detalle_encuentro, calendario ';
        var cadenaWhere   = "WHERE detalle_encuentro.id_torneo = calendario.id_torneo AND detalle_encuentro.id_jornada = calendario.id_jornada AND detalle_encuentro.id_juego = calendario.id_juego AND calendario.cal_estatus = '1'";  
        var cadenaReplicar = cadenaSelect+cadenaFrom+cadenaWhere;
        tx.executeSql(cadenaReplicar,[],function callback(tx,results){
          var cuantosx = 0;
          var varArray = []; //{};
          var registros = results.rows.length, i;
          if(registros == 0){
            app7.dialog.alert("No existen encuentros con el estatus 'JUGADO'", "AVISO");
          }else{
            for(w=0; w<registros; w++){
              varArray[w] = results.rows.item(w);
            }
          }
          var parvarJson = JSON.stringify(varArray);
          //console.log(varJson);

          app7.preloader.show();
          app7.request({
            url: 'http://futcho7.com.mx/Cedula/WebService/setrecords.php',
            data:{varJson:parvarJson},
            method: 'POST',
            crossDomain: true,
            success:function(data){
              console.log(data);
              var objson = JSON.parse(data);
              if (objson.status == 0){
                cambiarEstatusTodos(function(regreso){
                  if(regreso=='OK'){
                    app7.preloader.hide();
                    app7.dialog.alert("Replica de datos exitoso", "AVISO");
                    $$('#lista-juegos-replicar').html("");
                    gsiHayDatos = 0;
                  }else{
                    alert("Existe un error");
                  }
                
                });
                

              }else{
                //app7.preloader.hide();
                app7.dialog.alert("Se recibió el sig. mensaje al tratar de replicar los datos ..."+objson.mensaje, "AVISO");
              }
            },
            error:function(error){
            }
          });
          //app7.preloader.hide();
        });
      });
    });
  }
}

function cambiarEstatusTodos(callBack){
  /* Este function se ejecuta una vez sea satisfactorio el proceso de replica, y lo que hace es cambiar el estatus
     del juego a '2', para que no se repita el proceso más de 1 vez */
  cadena = "UPDATE calendario SET cal_estatus = '2' WHERE cal_estatus = '1'";
  actualizaReg(cadena,db,function(resultado){
    if(resultado == 'ACTUALIZADO'){
      callBack("OK");
      }
  });
}

function condicionesUso(){
  mainView.router.navigate('/show-condiciones/',{animate:true});
}

function showPolitica(){
  mainView.router.navigate('/show-politica/',{animate:true});
}

function showFirma(){
  mainView.router.navigate('/show-firma/',{animate:true});
}

 function CreaDb(){
   console.log("Entró a crear BD");
   /*var db = openDatabase('futcho','1.0',"Base de Datos para el uso de la cédula",2 * 1021 * 1024);*/

   /* Elimina Tablas */
   db.transaction(function (tx){
    tx.executeSql('DROP TABLE torneo');
   },function(err){
     console.log(err);
     notificacion("AVISO","La tabla torneo no pudo ser eliminada,favor de avisar a la oficina");
   });

   db.transaction(function (tx){
    tx.executeSql('DROP TABLE equipo');
   },function(err){
     console.log(err);
     notificacion("AVISO","La tabla equipo no pudo ser eliminada,favor de avisar a la oficina");
   });

   db.transaction(function (tx){
    tx.executeSql('DROP TABLE jugador');
   },function(err){
     console.log(err);
     notificacion("AVISO","La tabla jugador no pudo ser eliminada,favor de avisar a la oficina");
   });

   db.transaction(function (tx){
    tx.executeSql('DROP TABLE calendario');
   },function(err){
     console.log(err);
     notificacion("AVISO","La tabla calendario no pudo ser eliminada,favor de avisar a la oficina");
   });

   db.transaction(function (tx){
    tx.executeSql('DROP TABLE encuentro');
   },function(err){
     console.log(err);
     notificacion("AVISO","La tabla encuentro no pudo ser eliminada,favor de avisar a la oficina");
   });

   db.transaction(function (tx){
    tx.executeSql('DROP TABLE detalle_encuentro');
   },function(err){
     console.log(err);
     notificacion("AVISO","La tabla detalle_encuentro no pudo ser eliminada,favor de avisar a la oficina");
   });


   db.transaction(function (tx){
     tx.executeSql('CREATE TABLE IF NOT EXISTS torneo (id_cliente,id_sucursal,id_torneo,tor_nombre)');
    },function(err){
      console.log(err);
      notificacion("AVISO","La tabla de torneo no pudo ser creada,favor de avisar a la oficina");
    });

    db.transaction(function (tx){
      tx.executeSql('CREATE TABLE IF NOT EXISTS equipo (id_cliente,id_sucursal,id_torneo,id_equipo,equ_nombre, PRIMARY KEY(id_cliente,id_sucursal,id_torneo,id_equipo))');
     },function(err){
       console.log(err);
       notificacion("AVISO","La tabla de equipo no pudo ser creada,favor de avisar a la oficina");
     });

     db.transaction(function (tx){
      tx.executeSql('CREATE TABLE IF NOT EXISTS jugador (id_cliente,id_sucursal,id_torneo,id_equipo,id_jugador,jug_nombre,jug_representante,jug_playera,jug_foto, PRIMARY KEY(id_cliente,id_sucursal,id_torneo,id_equipo))');
     },function(err){
       console.log(err);
       notificacion("AVISO","La tabla de jugador no pudo ser creada,favor de avisar a la oficina");
     });

     db.transaction(function (tx){
      tx.executeSql('CREATE TABLE IF NOT EXISTS calendario (id_cliente,id_sucursal,id_torneo,id_jornada,id_juego,cal_fecha_hora,arbitro,cal_estatus,cal_default,cal_penales)');
     },function(err){
       console.log(err);
       notificacion("AVISO","La tabla de calendario no pudo ser creada,favor de avisar a la oficina");
     });

     db.transaction(function (tx){
      tx.executeSql('CREATE TABLE IF NOT EXISTS encuentro (id_cliente,id_sucursal,id_torneo,id_jornada,id_juego,id_equipo,enc_locvis)');
     },function(err){
       console.log(err);
       notificacion("AVISO","La tabla de encuentro no pudo ser creada,favor de avisar a la oficina");
     });

     db.transaction(function (tx){
      tx.executeSql('CREATE TABLE IF NOT EXISTS detalle_encuentro (id_cliente,id_sucursal,id_torneo,id_jornada,id_juego,id_equipo,enc_locvis,id_jugador,denc_minuto INTEGER PRIMARY KEY AUTOINCREMENT,denc_gol,denc_roja,denc_amarilla)');
     },function(err){
       console.log(err);
       notificacion("AVISO","La tabla detalle_encuentro no pudo ser creada,favor de avisar a la oficina");
     });
 }

 function DeleteTables(){
  /*var db = openDatabase('futcho','1.0',"Base de Datos para el uso de la cédula",2 * 1021 * 1024);*/

  db.transaction(function (tx){
    tx.executeSql('DELETE FROM torneo');
  },function (err){
    console.log(err);
    notificacion("AVISO","La tabla torneo no pudo ser borrada,favor de avisar a la oficina");
  });

  db.transaction(function (tx){
    tx.executeSql('DELETE FROM equipo');
  },function (err){
    console.log(err);
    notificacion("AVISO","La tabla equipo no pudo ser borrada,favor de avisar a la oficina");
  });

  db.transaction(function (tx){
    tx.executeSql('DELETE FROM jugador');
  },function (err){
    console.log(err);
    notificacion("AVISO","La tabla jugador no pudo ser borrada,favor de avisar a la oficina");
  });

  db.transaction(function (tx){
    tx.executeSql('DELETE FROM calendario');
  },function (err){
    console.log(err);
    notificacion("AVISO","La tabla calendario no pudo ser borrada,favor de avisar a la oficina");
  });

  db.transaction(function (tx){
    tx.executeSql('DELETE FROM encuentro');
  },function (err){
    console.log(err);
    notificacion("AVISO","La tabla encuentro no pudo ser borrada,favor de avisar a la oficina");
  });

  db.transaction(function (tx){
    tx.executeSql('DELETE FROM detalle_encuentro');
  },function (err){
    console.log(err);
    notificacion("AVISO","La tabla detalle_encuentro no pudo ser borrada,favor de avisar a la oficina");
  });
 }

 function insertaRegJson(parCadena,parDb,parContadorI,parContadorA,parContadorB,parContadorC,parIdTorneo,parIdEquipo,parArregloJuegos,parArregloEquipos,parArregloJugadores, callBack){
  parDb.transaction(function (tx){
    tx.executeSql(parCadena);
    callBack(parContadorI+"|"+parContadorA+"|"+parContadorB+"|"+parContadorC+"|"+parIdTorneo+"|"+parIdEquipo+"|"+parArregloJuegos+"|"+parArregloEquipos+"|"+parArregloJugadores);
   },function (err){
      notificacion("AVISO","No fue posible insertar en la BD cuando se bare Json,favor de avisar a la oficina");
 });
}

 function insertaReg(cadena,db,callBack){
   db.transaction(function (tx){
     tx.executeSql(cadena);
     callBack("INSERTADO");
    },function (err){
      //Si el código de error es diferente a 6(UNIQUE constrait failed), se mostrará dicho mensaje al usuario, caso contrario
      //no ya que puede existir que en la tabla de equipos y jugadores se quiera insertar doble eso
      //debido a que un equipo, puede estar jugando más de 1 encuentro en la misma jornada
      if(err.code != 6){
        notificacion("AVISO","No fue posible insertar en la BD "+err.message+",favor de avisar a la oficina");
      }
  });
}

function eliminaReg(cadena,db,callBack){
  db.transaction(function (tx){
    tx.executeSql(cadena);
    callBack("ELIMINADO");
   },function (err){
      notificacion("AVISO","No fue posible eliminar en la BD,favor de avisar a la oficina");
 });
}

function ejecutaQuery(cadena,db,resultado,callBack){
  /* Generalmente está function es invocada para regresar un valor invocado por un COUNT,SUM MAX etc */
  db.transaction(function (tx){
    tx.executeSql(cadena,[],function callback(tx,results){
      var registros = results.rows.length, i;
      cuantosRegistros = 0;
      for(z=0; z<registros; z++){
        switch(resultado){
          case 'maxMinuto':
            cuantosRegistros = results.rows.item(z).maximo;
            break;
          case 'numRegistros':
            cuantosRegistros = results.rows.item(z).tot_registros;
            break;
        }
        if (cuantosRegistros == null){
          cuantosRegistros = 0;
        }
      }
      callBack(cuantosRegistros);
    },function(err){
      notificacion("AVISO","No fue posible obtener "+resultado+" en detalle_encuentro,favor de avisar a la oficina");
    })
  });
}

function actualizaReg(cadena,db,callBack){
  db.transaction(function (tx){
    tx.executeSql(cadena);
    callBack("ACTUALIZADO");
   },function (err){
      notificacion("AVISO","No fue posible actualizar en la BD,favor de avisar a la oficina");
 });
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

function checkConnection() {
  var networkState = navigator.connection.type;

  var states = {};
  states[Connection.UNKNOWN]  = 'Unknown connection';
  states[Connection.ETHERNET] = 'Ethernet connection';
  states[Connection.WIFI]     = 'WiFi connection';
  states[Connection.CELL_2G]  = 'Cell 2G connection';
  states[Connection.CELL_3G]  = 'Cell 3G connection';
  states[Connection.CELL_4G]  = 'Cell 4G connection';
  states[Connection.CELL]     = 'Cell generic connection';
  states[Connection.NONE]     = 'No network connection';

  alert('Connection type: ' + states[networkState]);
}
