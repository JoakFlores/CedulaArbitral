var $$ = Dom7;

var db = openDatabase('futcho','1.0',"Base de Datos para el uso de la cédula",2 * 1021 * 1024);

/*
var gcuenta = localStorage.getItem("cuenta");
var gcliente = Number(gcuenta.substring(0,2));
var gsucursal= Number(gcuenta.substring(2,4));
*/

var gcuenta = "";
var gcliente = 0
var gsucursal= 0

var calendarInline;

var gestatus_juego;
var gidTorneo = "";
var gidEquipoVisita = "";
var gidEquipoLocal = "";
var gidJuego = "";
var gidJornada = "";
var glocvis = "";



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
        path: '/cargar-confirma/',
        url: 'views/cargar_confirma.html',
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
        path: '/goles/:locVis/:nomEquiLocal',
        url: 'views/goles.html',
        name: 'goles',
      },
    ],
    // ... other parameters
  });
  var mainView = app7.views.create('.view-main');


$$(document).on('page:init', '.page[data-name="home"]', function (e){
 // console.log("Iniciada Página Ejemplo");
 //var db = openDatabase('futcho','1.0',"Base de Datos para el uso de la cédula",2 * 1021 * 1024);
 ChecaCuenta();
});

$$(document).on('page:init', '.page[data-name="settings"]', function (e){
  // console.log("Iniciada Página Ejemplo");
  ChecaSettings();
 });

 $$(document).on('page:init', '.page[data-name="cargar"]', function (e){
  // console.log("Iniciada Página Ejemplo");
  SetCalendar();
 });

 $$(document).on('page:init', '.page[data-name="cedula-seleccionar"]', function (e){
 //alert("Iniciada Página Ejemplo");
  getJuegos();
 });

 $$(document).on('page:init', '.page[data-name="tablero"]', function (e){
  //En el objeto e, se guardaron los parámetros
  var fecha_formatted = "";
  var dia = "";
  var mes = "";
  var yy = "";
  var horas = ""
  var posDia = 0;
  var posMes = 0;
  //var id_equipo_visita = "";
  const page = e.detail;

  var fecha = page.route.params.fechaJuego;
  //Se formatea el String de la fecha en yyyy-mm-dd hh:mm
  posDia = fecha.indexOf("-");
  dia = fecha.substring(0,posDia);
  if (parseInt(dia) < 10){
    dia = '0'+dia;
  }
  posMes = fecha.indexOf("-",posDia+1);
  mes = fecha.substring(posDia+1,posMes);
  if (parseInt(mes) < 10){
    mes = '0'+mes;
  }
  yy = fecha.substring(posMes+1,posMes+5);
  horas = fecha.substring(posMes+6,30)+":00";
  fecha_formatted = yy+"-"+mes+"-"+dia+" "+horas;

  var torneo = page.route.params.nomTorneo;
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
      gidEquipoVisita = arr[2];
      nom_equipo_visita = arr[3];
      gidJuego = arr[4];
      //Escribe el nombre de los equipos
      $$('#tab-nom-equ-local').text(nom_equipo_local);
      $$('#tab-nom-equ-visita').text(nom_equipo_visita);
      //Obtiene Marcador Local
      getMarcadores(gcliente,gsucursal,gidTorneo,gidJornada,gidJuego,"L","","","",0, function(golesL){
        arr = golesL.split("|");
        marcador = parseInt(arr[0]);
        if (marcador == 99){
            marcador_string = "0";
        }else{
          marcador_string = String(marcador);
        }
        $$('#tab-goles-local').text(marcador_string);
        //Obtiene Marcador Visita
        getMarcadores(gcliente,gsucursal,gidTorneo,gidJornada,gidJuego,"V","","","",0, function(golesV){
          arr = golesV.split("|");
          marcador = parseInt(arr[0]);
          if (marcador == 99){
            marcador_string = "0";
          }else{
            marcador_string = String(marcador);
          }
          $$('#tab-goles-visita').text(marcador_string);
          //Obtiene T.Amarillas Local
          getTarjetas(gcliente,gsucursal,gidTorneo,gidJornada,gidJuego,"L", function(tarjetasL){
            //arr = tarjetasL.split("|");
            //faltas = parseInt(arr[0]);
            faltas = tarjetasL;
            $$('#tab-faltas-local').text(String(faltas));
            //Obtiene T.Amarillas Visita
            getTarjetas(gcliente,gsucursal,gidTorneo,gidJornada,gidJuego,"V", function(tarjetasV){
              //arr = tarjetasL.split("|");
              //faltas = parseInt(arr[0]);
              faltas = tarjetasV;
              $$('#tab-faltas-visita').text(String(faltas));
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
  var lnombre_local = page.route.params.nomEquiLocal;
  if(locvis == 'L'){
    posicion = '(LOCAL): ';
  }else{
    posicion = '(VISITA): ';
  }
  getMarcadores(gcliente,gsucursal,gidTorneo,gidJornada,gidJuego,glocvis,"","","", 0, function(resultado){
    arr = resultado.split("|");
    marcador = parseInt(arr[0]);
    if (marcador == 99){
        marcador_string = "0";
    }else{
      marcador_string = String(marcador);
    }
    $$('#total-goles').text("Total de goles para el equipo "+lnombre_local+" "+posicion+marcador_string);
    getJugadores(locvis);
    });
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
    //console.log("no existe cuenta");
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
    console.log("Num.Periodos son "+localStorage.getItem("periodos"));
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
    if (checkNetWork()){
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
            app7.dialog.alert(nomCliente+" sede: "+nomSucursal+", la configuración fue exitosa", "AVISO");
            }else{
              app7.dialog.alert("La cuenta no existe, revise si hay un error, caso contrario... favor de reportarlo en la oficina de la cancha", "AVISO");
            }
            console.log(objson);
          },
            error:function(error){
          }
      });
      app7.preloader.hide();
    } else{
      /* Si no hay red */
    }
  }else{
    /* No cambió la cuenta, solo se actualizan los valores de minutos,periodos en los localStorage */
    localStorage.setItem("minutos",minutos);
    localStorage.setItem("periodos",periodos);
    app7.dialog.alert("Actualización exitosa", "AVISO");
  }
}

function cargaDatos(fecha){
  /* OJO, DeleteTables se tiene que eliminar de aqui una vez terminado el desarrollo */
    DeleteTables();
    if (checkNetWork()){
      /* La cuenta, se divide por el valor correspondiente a cliente/sucursal */
      var cuentastring = localStorage.getItem("cuenta");
      var cliente = Number(cuentastring.substring(0,2));
      var sucursal= Number(cuentastring.substring(2,4));
      var numjuegos = 0;
      varfecha = fecha; //"2020/07/13";
      app7.preloader.show("hola");
      app7.request({
        url: 'http://futcho7.com.mx/Cedula/WebService/getrecords.php',
        data:{id_cliente:cliente,id_sucursal:sucursal,fecha:varfecha},
        method: 'POST',
        crossDomain: true,
        success:function(data){
          var objson = JSON.parse(data);
          if (objson.status == 0){
            numjuegos = BarreJson(objson,numjuegos);
          
            console.log("número de juegos:"+String(numjuegos));
            //alert(numjuegos);
            app7.preloader.hide();
            app7.dialog.alert("El proceso ha concluido, el dispositivo cuenta con "+String(numjuegos)+" juegos, puedes continuar con la elaboración de la cédula arbitral para cada uno de ellos", "Carga de Datos");
            }else{
              app7.preloader.hide();
              app7.dialog.alert("No existen juegos con la fecha proporcionada, revise si hay un error, caso contrario... favor de reportarlo en la oficina de la cancha", "AVISO");
            }
            /*console.log(objson);*/
          },
            error:function(error){
          }
      });
      app7.preloader.hide();
    } else{
      /* Si no hay red */
    }
}

function BarreJson(objson,numjuegos){
  app7.preloader.show();
  var cliente = Number(localStorage.getItem("cuenta").substring(0,2));
  var sucursal= Number(localStorage.getItem("cuenta").substring(2,4));
  /*var db = openDatabase('futcho','1.0',"Base de Datos para el uso de la cédula",2 * 1021 * 1024);*/
  var cedula = objson['Cedula'];
  console.log(cedula);
  for (var i=0; i < cedula.length; i++) {
    
    /* Se barren los torneos involucrados */
    var id_torneo = cedula[i].id_torneo;
    var nombre_torneo = cedula[i].nom_torneo;
    var cadena = "insert into torneo(id_cliente,id_sucursal,id_torneo,tor_nombre) values('"+String(cliente)+"','"+String(sucursal)+"','"+String(id_torneo)+"','"+nombre_torneo+"')"
    console.log("Contador cedula "+String(i)+" nombre torneo "+nombre_torneo)
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
      var id_arbitro    = juegos[a].id_arbitro;
      var cal_estatus   = juegos[a].cal_estatus;
      var cal_penales   = juegos[a].cal_penales;
      console.log("fecha del juego "+String(a)+" "+String(fecha_partido));
      /* Se inserta en calendario */
      cadena = "insert into calendario(id_cliente,id_sucursal,id_torneo,id_jornada,id_juego,cal_fecha_hora,id_arbitro,cal_estatus,cal_default,cal_penales) values('"+String(cliente)+"','"+String(sucursal)+"','"+String(id_torneo)+"','"+String(id_jornada)+"','"+String(id_juego)+"','"+String(fecha_partido)+"','"+String(id_arbitro)+"','"+String(cal_estatus)+"','"+String(cal_default)+"','"+String(cal_penales)+"')";
      insertaReg(cadena,db,function(resultado){
        //alert(resultado);
      });
      var equipos = juegos[a].Equipos;
      /* Se barren los equipos por juego, torneo */
      for (var b=0; b < equipos.length; b++){
        var id_equipo   = equipos[b].id_equipo;
        var equ_nombre  = equipos[b].nom_equipo;
        var locvis      = equipos[b].locvis;
        cadena = "insert into equipo(id_cliente,id_sucursal,id_torneo,id_equipo,equ_nombre) values('"+String(cliente)+"','"+String(sucursal)+"','"+String(id_torneo)+"','"+String(id_equipo)+"','"+String(equ_nombre)+"')";
        insertaReg(cadena,db,function(resultado){
          //alert(resultado);
        });
        /* Se crea cadena para grabar en la tabla encuentro */
        cadena = "insert into encuentro(id_cliente,id_sucursal,id_torneo,id_jornada,id_juego,id_equipo,enc_locvis) values('"+String(cliente)+"','"+String(sucursal)+"','"+String(id_torneo)+"','"+String(id_jornada)+"','"+String(id_juego)+"','"+String(id_equipo)+"','"+String(locvis)+"')";
        insertaReg(cadena,db,function(resultado){
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
  app7.preloader.hide();
  return numjuegos;
}

function goTo(ruta){
  console.log("si ingresa a goTo "+ruta);
  //mainView.router.navigate(ruta,{animate:true});
  mainView.router.navigate(ruta,{transition: 'f7-flip'});
  router.navigate('/some-page/', {  })
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
  const months = ["Ene", "Feb", "Mar","Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  fecha_seleccionada = new Date(calendarInline.getValue());
  date_to_pass = fecha_seleccionada.getFullYear() + "/" + (fecha_seleccionada.getMonth() + 1) + "/" + fecha_seleccionada.getDate();
  date_to_question = fecha_seleccionada.getDate() + "-" + months[fecha_seleccionada.getMonth()] + "-" + fecha_seleccionada.getFullYear();
  app7.dialog.confirm('¿ Deseas continuar con la carga de datos para la fecha '+date_to_question+' ?','CONFIRMA', function () {
    cargaDatos(date_to_pass);
  });
  
 //cargaDatos("2020/07/13");
 }

function getJuegos(){
  //Borra contenido de lista-juegos
  $$('#lista-juegos').html("");
  db.transaction(function (tx){
    var select  = "SELECT encuentro.id_torneo,encuentro.id_equipo,equipo.equ_nombre,torneo.tor_nombre,encuentro.id_jornada,encuentro.enc_locvis,calendario.cal_fecha_hora,calendario.cal_estatus,calendario.id_juego ";
    var from    = 'FROM equipo, calendario, encuentro,torneo ';
    var where   = "WHERE encuentro.id_sucursal = calendario.id_sucursal and encuentro.id_cliente = calendario.id_cliente and encuentro.id_torneo = calendario.id_torneo and encuentro.id_jornada = calendario.id_jornada and encuentro.id_juego = calendario.id_juego and equipo.id_sucursal = encuentro.id_sucursal and equipo.id_cliente = encuentro.id_cliente and equipo.id_torneo = encuentro.id_torneo and equipo.id_equipo = encuentro.id_equipo and equipo.id_cliente = torneo.id_cliente and torneo.id_sucursal = equipo.id_sucursal and torneo.id_torneo = equipo.id_torneo and calendario.id_cliente = '"+String(gcliente)+"' AND calendario.id_sucursal = '"+String(gsucursal)+"' ";
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
      for(i=0; i<registros; i++){
        // Determinar si el contador es impar o no, si es par, el recordSet corresponde a un equipo LOCAL, caso contrario es Visita y
        // solo tomar el registro de nombre de quipo
        //if(i%2 != 0)
        if(i%2 != 0){
          //Es número impar
          //Se termina de crear la cadena para mostar el marcador de ambos equipos
          nombre_visitante =  results.rows.item(i).equ_nombre;
          getMarcadores(gcliente,gsucursal,results.rows.item(i).id_torneo,results.rows.item(i).id_jornada,results.rows.item(i).id_juego,results.rows.item(i).enc_locvis,nombre_visitante,'','',0, function(resultado){
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
          getMarcadores(gcliente,gsucursal,results.rows.item(i).id_torneo,results.rows.item(i).id_jornada,results.rows.item(i).id_juego,results.rows.item(i).enc_locvis,nombre_local,formatted_date,nombre_torneo, i, function(resultado){
          arr = resultado.split("|");
          marcador = parseInt(arr[0]);
          equipo = arr[1];
          jornada = arr[2];
          fecha_juego = arr[3];
          nombre_torneo = arr[4];
          contador = arr[5];
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

function getMarcadores(cliente,sucursal,torneo,jornada,juego,locvis,nombre_equipo,fecha_juego,nom_torneo,contador,callBack){
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
      callBack(goles+"|"+nombre_equipo+"|"+jornada+"|"+fecha_juego+"|"+nom_torneo+"|"+contador);
    },function(err){
      console.log(err);
      notificacion("AVISO","No fue posible obtener marcador,favor de avisar a la oficina");
      })
  });
}

function getTarjetas(cliente,sucursal,torneo,jornada,juego,locvis,callBack){
  //Obtiene número de faltas según los parámetros recibidos
  db.transaction(function (tx){
    var select= 'SELECT SUM(detalle_encuentro.denc_amarilla) as tar_amarilla ';
    var from  = 'FROM detalle_encuentro, encuentro ';
    var where = 'WHERE detalle_encuentro.id_cliente = encuentro.id_cliente and detalle_encuentro.id_sucursal = encuentro.id_sucursal and detalle_encuentro.id_torneo   = encuentro.id_torneo and detalle_encuentro.id_jornada = encuentro.id_jornada and detalle_encuentro.id_juego = encuentro.id_juego and detalle_encuentro.id_equipo = encuentro.id_equipo and '
    var where2= '( ( encuentro.id_cliente = '+String(cliente)+' ) AND ( encuentro.id_sucursal = '+String(sucursal)+' ) AND ( encuentro.id_torneo = '+String(torneo)+' ) AND ( encuentro.id_jornada = '+String(jornada)+' ) AND ( encuentro.id_juego = '+String(juego)+' ) ) and encuentro.enc_locvis = '+"'"+locvis+"'";
    var sql   = select+from+where+where2;
    tx.executeSql(sql,[],function callback(tx,results){
      var registros = results.rows.length, i;
      for(w=0; w<registros; w++){
        amarillas = results.rows.item(w).tar_amarilla;
        if (amarillas == null){
          amarillas = 0;
        }
      }
      callBack(amarillas);
    },function(err){
      console.log(err);
      notificacion("AVISO","No fue posible obtener tar. amarillas,favor de avisar a la oficina");
      })
  });
}

function getDatosJuego(contador){
  /* Obtiene nombre del Torneo y la fecha/hora del juego que se le dió click(tap) al momento de seleccionar un juego */
  var fecha = $$('#fecha-hora-juego-'+String(contador)).text();
  var torneo = $$('#nombre-torneo-'+String(contador)).text();
  var jornada = $$('#id_jornada-'+String(contador)).text();
  gestatus_juego = $$('#estatus-juego-'+String(contador)).text();
  //mainView.router.navigate(`/tablero/${String(fecha)}/`,{animate:true});
  mainView.router.navigate(`/tablero/${fecha}/${torneo}/${jornada}/`,{animate:true});
}

/* Cuando se le da tap(click) en el Tablero a los goles LOCALES */
function golLocal(){
  var locVis = 'L'
  var nomEquiLocal = "";
  glocvis = 'L';
  nomEquiLocal = $$("#tab-nom-equ-local").text(); 
  //mainView.router.navigate(`/goles/${locVis}/`,{animate:true});
  mainView.router.navigate(`/goles/${locVis}/${nomEquiLocal}/`,{animate:true});
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
       console.log(err);
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
    tx.executeSql(sql,[],function callback(tx,results){
      var registros = results.rows.length, i;
      for(z=0; z<registros; z++){
        if (results.rows.item(z).enc_locvis == 'L'){
          idEquipo_local = results.rows.item(z).id_equipo;
          nomEquipo_local = results.rows.item(z).equ_nombre;
        }else{
          idEquipo_vista = results.rows.item(z).id_equipo;
          nomEquipo_visita = results.rows.item(z).equ_nombre;
        }
        idJuego = results.rows.item(z).id_juego;
      }
      callBack(idEquipo_local+"|"+nomEquipo_local+"|"+idEquipo_visita+"|"+nomEquipo_visita+"|"+idJuego);
    },function(err){
      console.log(err);
      notificacion("AVISO","No fue posible obtener los datos de los equipo involucrados,favor de avisar a la oficina");
      })
  });
}

function getJugadores(locvis){
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
      for(ii=0; ii<regjugador; ii++){
        id_jugador = results.rows.item(ii).id_jugador;
        jugador = "# "+results.rows.item(ii).jug_playera+" "+results.rows.item(ii).jug_nombre;
        goles = results.rows.item(ii).goles
        if (goles == null){
          goles = 0;
        }
        cadena = '<div class="block block-jugador-gol"><div class="row"><div class="col col-jugador-datos-gol" id="jugador-id-'+id_jugador+'">'+jugador+'</div></div><div class="row"><div class="col" id="jugador-foto"><img src="data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==" width="60"/></div><div class="col col-icon-suma-gol" id="suma-gol" onclick = "insertaGol('+id_jugador+')"><img src="../img/plus-circle.png"/></div><div class="col col-icon-balon-gol" id="ico-balon"><img src="../img/Balon.ico" width="60"/></div><div class="col col-numgoles-gol" id="goles-'+id_jugador+'">'+String(goles)+'</div><div class="col col-icon-suma-gol" id="resta-gol" onclick = "eliminaGol('+id_jugador+')"><img src="../img/minus-circle.png"/></div></div></div>';
        $$('#lista-jugadores').append(cadena);
        //alert(cadena);
      }
      
    });
  });
}

function insertaGol(idJugador){
  var totGoles = 0;
  if (glocvis == 'L'){
    equipo = gidEquipoLocal;
  }else{
    equipo = gidEquipoVisita;
  }
  /* Se obtiene el total de registros en detalle_encuentro para asignarlo en la columna denc_minuto */
  cadena = "SELECT COUNT(*)+1 tot_registros FROM detalle_encuentro";
  ejecutaQuery(cadena,db,"numRegistros",function(totRegistros){
    /* Se inserta el jugador en la tabla detalle_encuentro */
    cadena = "insert into detalle_encuentro(id_cliente,id_sucursal,id_torneo,id_jornada,id_juego,id_equipo,enc_locvis,id_jugador,denc_minuto,denc_gol,denc_roja,denc_amarilla) values('"+String(gcliente)+"','"+String(gsucursal)+"','"+gidTorneo+"','"+gidJornada+"','"+gidJuego+"','"+equipo+"','"+glocvis+"','"+idJugador+"',"+totRegistros+",1,0,0)";
    //alert(cadena);
    insertaReg(cadena,db,function(resultado){
      if(resultado == 'INSERTADO'){
        totGoles = $$('#goles-'+idJugador).text();
        totGoles++;
        $$('#goles-'+String(idJugador)).text(String(totGoles));
      }
    });
  });
}

function eliminaGol(idJugador){
  var totGoles = 0;
  if (glocvis == 'L'){
    equipo = gidEquipoLocal;
  }else{
    equipo = gidEquipoVisita;
  }
  /* Se obtiene el max(denc_minuto) del jugador en question, esto para poder eliminar SOLO 1 registro */
  cadena = "SELECT MAX(CAST(denc_minuto AS INTEGER)) maximo FROM detalle_encuentro WHERE id_cliente = '"+String(gcliente)+"' AND id_sucursal = '"+String(gsucursal)+"' AND id_torneo = '"+gidTorneo+"' AND id_jornada = '"+gidJornada+"' AND id_juego = '"+gidJuego+"' AND id_equipo = '"+equipo+"' AND enc_locvis = '"+glocvis+"' AND id_jugador = '"+idJugador+"' AND denc_gol = 1";
  //alert(cadena);
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
      }
    });
  });
}





/*
function numJuegos(){
  var i = 0;
  console.log("Validando tabla");
  db.transaction(function (tx){
    var sql = 'SELECT * FROM calendario';
    tx.executeSql(sql,[],function(tx,results){
      var registros = results.rows.length, i;
      for(i=0; i<registros; i++){
        console.log(results.rows.item(i).cal_fecha_hora);
      }
    });
  },function(err){
    console.log(err);
    notificacion("AVISO","La tabla de torneo no pudo ser creada,favor de avisar a la oficina");
  });
  return i;
}
*/


 function CreaDb(){
   console.log("Entró a crear BD");
   /*var db = openDatabase('futcho','1.0',"Base de Datos para el uso de la cédula",2 * 1021 * 1024);*/

   db.transaction(function (tx){
     tx.executeSql('CREATE TABLE IF NOT EXISTS torneo (id_cliente,id_sucursal,id_torneo,tor_nombre)');
    },function(err){
      console.log(err);
      notificacion("AVISO","La tabla de torneo no pudo ser creada,favor de avisar a la oficina");
    });

    db.transaction(function (tx){
      tx.executeSql('CREATE TABLE IF NOT EXISTS equipo (id_cliente,id_sucursal,id_torneo,id_equipo,equ_nombre)');
     },function(err){
       console.log(err);
       notificacion("AVISO","La tabla de equipo no pudo ser creada,favor de avisar a la oficina");
     });

     db.transaction(function (tx){
      tx.executeSql('CREATE TABLE IF NOT EXISTS jugador (id_cliente,id_sucursal,id_torneo,id_equipo,id_jugador,jug_nombre,jug_representante,jug_playera,jug_foto)');
     },function(err){
       console.log(err);
       notificacion("AVISO","La tabla de jugador no pudo ser creada,favor de avisar a la oficina");
     });

     db.transaction(function (tx){
      tx.executeSql('CREATE TABLE IF NOT EXISTS arbitro (id_cliente,id_sucursal,id_arbitro,arb_nombre,arb_foto)');
     },function(err){
       console.log(err);
       notificacion("AVISO","La tabla de árbitro no pudo ser creada,favor de avisar a la oficina");
     });

     db.transaction(function (tx){
      tx.executeSql('CREATE TABLE IF NOT EXISTS calendario (id_cliente,id_sucursal,id_torneo,id_jornada,id_juego,cal_fecha_hora,id_arbitro,cal_estatus,cal_default,cal_penales)');
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
      tx.executeSql('CREATE TABLE IF NOT EXISTS detalle_encuentro (id_cliente,id_sucursal,id_torneo,id_jornada,id_juego,id_equipo,enc_locvis,id_jugador,denc_minuto,denc_gol,denc_roja,denc_amarilla)');
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
    tx.executeSql('DELETE FROM arbitro');
  },function (err){
    console.log(err);
    notificacion("AVISO","La tabla árbitro no pudo ser borrada,favor de avisar a la oficina");
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

 function insertaReg(cadena,db,callBack){
   var accion = ""
   console.log(cadena);
   db.transaction(function (tx){
     tx.executeSql(cadena);
     callBack("INSERTADO");
    },function (err){
       console.log(err);
       notificacion("AVISO","No fue posible insertar en la BD,favor de avisar a la oficina");
  });
}

function eliminaReg(cadena,db,callBack){
  console.log(cadena);
  db.transaction(function (tx){
    tx.executeSql(cadena);
    callBack("ELIMINADO");
   },function (err){
      console.log(err);
      notificacion("AVISO","No fue posible eliminar en la BD,favor de avisar a la oficina");
 });
}

function ejecutaQuery(cadena,db,resultado,callBack){
  /* Generalmente está function es invocada para regresar un valor invocado por un COUNT,SUM MAX etc */
  console.log(cadena);
  db.transaction(function (tx){
    tx.executeSql(cadena,[],function callback(tx,results){
      var registros = results.rows.length, i;
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
      console.log(err);
      notificacion("AVISO","No fue posible obtener "+resultado+" en detalle_encuentro,favor de avisar a la oficina");
    })
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