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



var marcador_string = "";
var nombre_visitante = "";
var juego   = "";
var fecha_juego = "";
var formatted_date = "";
var nombre_equipo = "";
var jornada = "";
var estatus_juego = "";
var nombre_torneo  = "";



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
        //path: '/tablero/:numJornada/',
        path: '/tablero/:fechaJuego/:nomTorneo/:idJornada',
        url: 'views/tablero.html',
        name: 'tablero',
      },
      {
        path: '/goles/',
        url: 'views/goles.html',
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

 /* Esto lo tengo que después cambiar, pero para avanzar asi lo dejo */
 $$(document).on('page:init', '.page[data-name="cargar-confirma"]', function (e){
  // console.log("Iniciada Página Ejemplo");
  cargaDatos();
 });

 $$(document).on('page:init', '.page[data-name="cedula-seleccionar"]', function (e){
 alert("Iniciada Página Ejemplo");
  getJuegos();
 });

 $$(document).on('page:init', '.page[data-name="tablero"]', function (e){
  //alert(app.view.main.router.currentRoute.params.userName)
  const page = e.detail;
  //var jornada = page.route.params.numJornada;
  var fecha = page.route.params.fechaJuego;
  var torneo = page.route.params.nomTorneo;
  var jornada = page.route.params.idJornada;
  getIdtorneo(torneo);
  alert("La fecha del juego es "+fecha+" del torneo "+torneo+", jornada "+jornada);
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
          app7.preloader.hide();
          var objson = JSON.parse(data);
          if (objson.status == 0){
            numjuegos = BarreJson(objson,numjuegos);
          
            console.log("número de juegos:"+String(numjuegos));
            alert(numjuegos);
            app7.dialog.alert("El proceso ha concluido, el dispositivo cuenta con "+String(numjuegos)+" juegos, puedes continuar con la elaboración de la cédula arbitral para cada uno de ellos", "Carga de Datos");
            }else{
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
    numjuegos = insertaReg(cadena,db,"torneo",0);
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
      numjuegos = insertaReg(cadena,db,"calendario",numjuegos);
      var equipos = juegos[a].Equipos;
      /* Se barren los equipos por juego, torneo */
      for (var b=0; b < equipos.length; b++){
        var id_equipo   = equipos[b].id_equipo;
        var equ_nombre  = equipos[b].nom_equipo;
        var locvis      = equipos[b].locvis;
        cadena = "insert into equipo(id_cliente,id_sucursal,id_torneo,id_equipo,equ_nombre) values('"+String(cliente)+"','"+String(sucursal)+"','"+String(id_torneo)+"','"+String(id_equipo)+"','"+String(equ_nombre)+"')";
        numjuegos = insertaReg(cadena,db);
        /* Se crea cadena para grabar en la tabla encuentro */
        cadena = "insert into encuentro(id_cliente,id_sucursal,id_torneo,id_jornada,id_juego,id_equipo,enc_locvis) values('"+String(cliente)+"','"+String(sucursal)+"','"+String(id_torneo)+"','"+String(id_jornada)+"','"+String(id_juego)+"','"+String(id_equipo)+"','"+String(locvis)+"')";
        numjuegos = insertaReg(cadena,db,"encuentro",0);
        var jugadores = equipos[b].Jugadores;
        /* Se barren los jugadores por equipo, juego, torneo */
        for (var c=0; c < jugadores.length; c++){
          var id_jugador  = jugadores[c].id_jugador;
          var jug_nombre  =  jugadores[c].jugador_nom+' '+jugadores[c].jugador_pat+' '+jugadores[c].jugador_mat;
          var jug_capitan =  jugadores[c].jug_repre;
          var jug_playera = jugadores[c].jug_playera;
          var jug_foto    =  jugadores[c].jug_foto;
          cadena = "insert into jugador(id_cliente,id_sucursal,id_torneo,id_equipo,jug_nombre,jug_representante,jug_playera,jug_foto) values('"+String(cliente)+"','"+String(sucursal)+"','"+String(id_torneo)+"','"+String(id_equipo)+"','"+jug_nombre+"','"+jug_capitan+"','"+String(jug_playera)+"','"+jug_foto+"')";
          insertaReg(cadena,db,"jugador",0);
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
    
   
    tx.executeSql(sql,[],function callback(tx,results){
      var registros = results.rows.length, i;
      //console.log("Se ejecutó SQL "+String(registros));
      for(i=0; i<registros; i++){
        //console.log("First result, Procesando Juego "+results.rows.item(i).tor_nombre+" "+results.rows.item(i).equ_nombre+" "+results.rows.item(i).enc_locvis+" valor de (i) "+String(i));
        //alert("Procesando Juego "+results.rows.item(i).tor_nombre+" "+results.rows.item(i).equ_nombre+" "+results.rows.item(i).enc_locvis+" valor de (i) "+String(i))
        // Determinar si el contador es impar o no, si es par, el recordSet corresponde a un equipo LOCAL, caso contrario es Visita y
        // solo tomar el registro de nombre de quipo
        //if(i%2 != 0)
        if(i%2 != 0){
          //alert("Aqui es impar");
          //Es número impar
          //Se termina de crear la cadena para mostar el marcador de ambos equipos

          nombre_visitante =  results.rows.item(i).equ_nombre;
          
          //console.log(nombre_visitante);

          getMarcadores(gcliente,gsucursal,results.rows.item(i).id_torneo,results.rows.item(i).id_jornada,results.rows.item(i).id_juego,results.rows.item(i).enc_locvis,nombre_visitante, function(resultado){
            
            arr = resultado.split("|");
            marcador = parseInt(arr[0]);
            
            equipo = arr[1];

            alert(equipo);
            
            if (marcador == 99){
              marcador_string += "- ?";
            }else{
              marcador_string +='- '+String(marcador);
            }

            
            setMarcadorVisitante(marcador_string,equipo);
            // Aqui truena por el valor de i alert("Este es el marcador para el Equipo "+results.rows.item(i).equ_nombre+" "+marcador_string);
          });
          //console.log("Third result");
          //juego = juego+'<div class="col row-marcadores" id="marcadores">'+marcador_string+'</div><div class="col" id="equipo-visita">'+results.rows.item(i).equ_nombre+'</div></div></div></div>';

          // Se agrega al componente LIST el juego en cuestión
          //$$('#lista-juegos').append(juego);
        }else{
          //alert("Aqui es par");
          //alert("estatus del juego (número)"+results.rows.item(i).cal_estatus);
          // Número par, se obtiene fecha, torneo, estatus del juego, equipo local y su marcador
          switch(results.rows.item(i).cal_estatus){
            case '1':
              estatus_juego = 'Jugado';
              break;
            case '0':
              estatus_juego = 'Por Jugar';
              break;
          }
          
          //alert("Estatus "+estatus_juego);
          fecha_juego = new Date(results.rows.item(i).cal_fecha_hora);
          formatted_date = fecha_juego.getDate() + "-" + (fecha_juego.getMonth() + 1) + "-" + fecha_juego.getFullYear() + " " + fecha_juego.getHours() + ":" + fecha_juego.getMinutes();
          nombre_local = results.rows.item(i).equ_nombre;
          console.log(nombre_equipo);
          jornada = results.rows.item(i).id_jornada;
          nombre_torneo =results.rows.item(i).tor_nombre;


          alert("For->"+nombre_equipo);
         
          getMarcadores(gcliente,gsucursal,results.rows.item(i).id_torneo,results.rows.item(i).id_jornada,results.rows.item(i).id_juego,results.rows.item(i).enc_locvis,nombre_local, function(resultado){
           
            arr = resultado.split("|");
            marcador = parseInt(arr[0]);
            
            equipo = arr[1];

            jornada = arr[2];

            alert(equipo);
           
            if (marcador == 99){
              marcador_string = "¿ ";
          }else{
            
            marcador_string = String(marcador) + " ";
          }
          setMarcadorLocal(formatted_date,nombre_torneo,jornada,estatus_juego,equipo);
       
          });
          //console.log('el marcador es '+marcador_string);
          //Si yo pongo el console.log aqui, no imprime el valor de marcador_string, que diferencia hay? la valiable está 
      
          
          
        }
      }
    });
  });
}



function setMarcadorLocal(formatted_date,nombre_torneo,jornada,estatus_juego,nombre_equipo){
  console.log("Aqui el local "+nombre_equipo);
  juego = '<div class="block block-cedula-sel0" onclick = "getDatosJuego()"><div class="block block-cedula-sel1"><div class="row row-cedula-sel-text1"><div class="col" id="fecha-hora-juego">'+formatted_date+'</div><div class="col" id="nombre-torneo">'+nombre_torneo+'</div><div class="col" id="id_jornada">J-'+jornada+'</div></div><div class="row row-cedula-sel-text2"><div class="col" id="estatus-juego">'+estatus_juego+'</div></div></div><div class="block block-cedula-sel2"><div class="row row-cedula-sel-text3"><div class="col" id="equipo-local">'+nombre_equipo+'</div>';  

}


function setMarcadorVisitante(marcador_string,nombre_visitante){
    console.log("Aqui el visitante "+nombre_visitante)

    juego += '<div class="col row-marcadores" id="marcadores">'+marcador_string+'</div><div class="col" id="equipo-visita">'+nombre_visitante+'</div></div></div></div>';

      // Se agrega al componente LIST el juego en cuestión
    $$('#lista-juegos').append(juego);
  
}

function getMarcadores(cliente,sucursal,torneo,jornada,juego,locvis,nombre_equipo, callBack){
  //alert("datos recibidos "+torneo+" "+jornada+" "+juego+" "+locvis);
  //Obtiene el marcador según los parámetros recibidos
  var goles = 5;
  db.transaction(function (tx){
    var select= 'SELECT SUM(detalle_encuentro.denc_gol) as goles_anotados ';
    var from  = 'FROM detalle_encuentro, encuentro ';
    var where = 'WHERE detalle_encuentro.id_cliente = encuentro.id_cliente and detalle_encuentro.id_sucursal = encuentro.id_sucursal and detalle_encuentro.id_torneo   = encuentro.id_torneo and detalle_encuentro.id_jornada = encuentro.id_jornada and detalle_encuentro.id_juego = encuentro.id_juego and detalle_encuentro.id_equipo = encuentro.id_equipo and '
    var where2= '( ( encuentro.id_cliente = '+String(cliente)+' ) AND ( encuentro.id_sucursal = '+String(sucursal)+' ) AND ( encuentro.id_torneo = '+String(torneo)+' ) AND ( encuentro.id_jornada = '+String(jornada)+' ) AND ( encuentro.id_juego = '+String(juego)+' ) ) and encuentro.enc_locvis = '+"'"+locvis+"'";
    var sql   = select+from+where+where2;
    tx.executeSql(sql,[],function callback(tx,results){
      var registros = results.rows.length, i;
      for(z=0; z<registros; z++){
        goles = results.rows.item(z).goles_anotados;
        if (goles == null){
          goles = 99;
        }
      }
      callBack(goles+"|"+nombre_equipo+"|"+jornada);
    },function(err){
      console.log(err);
      notificacion("AVISO","No fue posible obtener marcador,favor de avisar a la oficina");
      })
  });
}

function getDatosJuego(){
  /* Obtiene nombre del Torneo y la fecha/hora del juego que se le dió click(tap) al momento de seleccionar un juego */
  var fecha = $$('#fecha-hora-juego').text();
  var torneo = $$('#nombre-torneo').text();
  var jornada = $$('#id_jornada').text();
  //mainView.router.navigate(`/tablero/${String(fecha)}/`,{animate:true});
  mainView.router.navigate(`/tablero/${fecha}/${torneo}/${jornada}/`,{animate:true});
}

/* Cuando se le da tap(click) en el Tablero a los goles LOCALES */
function golLocal(){
  mainView.router.navigate('/goles/',{animate:true});
}

/*
 Obtenemos id_torneo, según el nombre del torneo recibiso 
getIdtorneo(nomTorneo){

}
*/

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

 function insertaReg(cadena,db,tabla,numjuegos){
   console.log(cadena);
   db.transaction(function (tx){
     tx.executeSql(cadena);

    },function (err){
       console.log(err);
       notificacion("AVISO","No fue posible insertar en la BD,favor de avisar a la oficina");
  });
  if (tabla=="calendario"){
    numjuegos++
  }
  return numjuegos
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
