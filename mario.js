
var tiempo_actual = 0;
var JuegoTerminado = false;
var playerTimes = [];
var game = function() {
	
	var height = window.innerHeight;
	var width  = height*320/480;

   if(window.innerWidth < width){
   	width = window.innerWidth;
   	height = width*480/320;
   }

//Cargamos el modulo de quintus, con los modilos necesarios
  var Q = window.Q = Quintus({ audioSupported: [ 'mp3' ] })
   .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio")
   // Maximize permite maximizar el tamaño al de la pantalla
   .setup({ maximize: false, width: width, height: height})
   // Cargamos los controles de entrada (controls y touch) para UI y activamos el sonido
   .controls().touch().enableSound();


   //Cargamos recursos y lo necesario para el menu del titulo
   Q.load( "mainTitle.png, coin.mp3, music_die.mp3, music_level_complete.mp3, music_main.mp3", function(){
     Q.sheet("mainTitle","mainTitle.png", { tilew: 320, tileh: 480 });
     Q.clearStages();
     Q.stageScene("startGame");
   });

   //Cargamos el contenido del TMX
  Q.loadTMX("level.tmx, bg.png, mario_small.json, mario_small.png, bloopa.json, bloopa.png, coin.json, coin.png, goomba.json, goomba.png, princess.png, block.png, block.json", function() {

    //Compilamos los sprites
    Q.compileSheets("mario_small.png","mario_small.json");
    Q.compileSheets("bloopa.png","bloopa.json");
    Q.compileSheets("coin.png","coin.json");
    Q.compileSheets("goomba.png","goomba.json");
    Q.compileSheets("block.png","block.json");
    Q.sheet("princess","princess.png", { tilew: 32, tileh: 48 });
  });

//Definicion de los sprites y sus correspondientes animaciones

//Sprite y animaciones del Mario (jugador)
  Q.Sprite.extend("Mario",{
   // Init se llama al crearlo
    init: function(p) {

      //Cargamos los atributos personales principales
      this._super(p, { sprite: "mario_small", sheet: "marioR", x: 150, y: 380, direccion:1, jumpSpeed:-400, muerto: false});

      //Cargamos los componentes
      this.add('2d, platformerControls, animation, tween');

      //Definimos la accion al recibir el evento endGame"muere"
      this.on("muere",function() {
        this.destroy();
      });

    },
    step: function(dt) {

        Q.state.inc("current_time", dt);
        Q.state.inc("total_time", dt);
      //Esta condicion permite a mario morir cuando se cae por debajo del nivel del suelo
      if(!this.p.muerto){
	      if(this.p.y >= 600){
	        Q.stageScene("endGame",1, { label: "¡Has muerto!\n Te caiste" });
	        this.destroy();
	      }
        if(Q.state.get("current_time") > 10 && Q.state.get("current_time") < 20) {
            //Q.stageScene("PauseGame",1, { label: "¡Pregunta!\n  (Ingresar Var Pregunta)" });
            openModal();
            Q.state.set("current_time",20);
            Q.pauseGame();
            //this.destroy();
        }

        if(Q.state.get("current_time") == 20) {
          Q.pauseGame();
      }
	      //Esta condicion activa las animaciones de andar y parar en funcion de la direccion de Mario
	      if(this.p.vx > 0) {
	        this.play("run_right");
	        this.p.direccion = 1;
	      } else if(this.p.vx < 0) {
	        this.play("run_left");
	        this.p.direccion = -1;
	      } else {
	        if(this.p.direccion > 0){
	          this.play("stand_right");
	        }
	        else {
	          this.play("stand_left");
	        }
	      }
        //Establecemos las animaciones de salto
	      if(this.p.vy < 0) {
	      	if(this.p.direccion > 0)
	      		this.play("jump_rigth");
	      	else
	      		this.play("jump_left");
	      }
  	  }
  	  else{
  	  	this.p.ignoreControls = true;
  	  }
    }
  });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*Funciones de tabla de clasificacion*/
function finishLevel() {
  var totalTime = Q.state.get("total_time");
  playerTimes.push(totalTime);

  // Eliminar duplicados
  playerTimes = playerTimes.filter((value, index, self) => {
  return self.indexOf(value) === index;
  });

  // 3. Ordenar el registro de tiempos en orden ascendente (lo hice para nada pues se pierde el registro de tiempos de esta manera)
  // playerTimes.sort(function(a, b) {
  //     return a - b;
  // });

  // 4. Mostrar el registro de tiempos en la pantalla de clasificación
  showLeaderboard();
}

function closeModal1() {
  var modal = document.getElementById('miModal');
  modal.style.display = "none";
}

function showLeaderboard() {
  // 1. Obtener una referencia al contenedor donde quieres mostrar los tiempos
  var leaderboardContainer = document.querySelector('#miModal .modal-mario');

  // Limpiar el contenedor
  leaderboardContainer.innerHTML = '';

  // Crear el título
  var t = document.createElement('t');
  t.style.fontSize = "60px";
  t.textContent = "Tiempo";
  leaderboardContainer.appendChild(t);

  // Crear el botón de cierre
  var B = document.createElement('button');
  B.style.fontSize = '30px';
  B.style.background = 'red';
  B.style.cursor = 'pointer';
  B.style.width = '30px';
  B.style.height = '30px';
  B.style.display = 'flex';
  B.textContent = 'x';
  B.style.color = 'white';
  B.addEventListener('click', function() {
    // Cerrar todas las modales
    closeModal1();
  });
  leaderboardContainer.appendChild(B);

  // Encontrar el tiempo más bajo
  var minTime = Math.min(...playerTimes);

  // 2. Para cada tiempo en playerTimes, crear un nuevo elemento de párrafo, establecer su contenido en el tiempo (con tres decimales) y añadirlo al contenedor
  for (var i = 0; i < playerTimes.length; i++) {
    var p = document.createElement('p');

    // Si el tiempo es el más bajo, agregar la clase 'blink'
    if (playerTimes[i] === minTime) {
      p.classList.add('blink');
    }

    p.textContent = "Ronda " + (i + 1) + " - " + playerTimes[i].toFixed(3) + "s";
    leaderboardContainer.appendChild(p);
  }
}

/*function showLeaderboard() {
  // 1. Obtener una referencia al contenedor donde quieres mostrar los tiempos
  var leaderboardContainer = document.querySelector('#miModal .modal-mario');

  // Crear un array vacío para almacenar las rondas que ya se han mostrado
  var shownRounds = [];

  // 2. Para cada tiempo en playerTimes, comprobar si la ronda correspondiente ya se ha mostrado
  for (var i = 0; i < playerTimes.length; i++) {
    // Si la ronda no se ha mostrado antes
    if (!shownRounds.includes(i + 1)) {
      // 3. Crear un nuevo elemento de párrafo, establecer su contenido en el tiempo (con tres decimales) y añadirlo al contenedor
      var p = document.createElement('p');
      p.textContent = "Ronda " + (i + 1) + " - " + playerTimes[i].toFixed(3) + "s";
      leaderboardContainer.appendChild(p);

      // Añadir la ronda al array de rondas mostradas
      shownRounds.push(i + 1);
    }
  }
}*/
/*function showLeaderboard() {
  // 1. Obtener una referencia al contenedor donde quieres mostrar los tiempos
  var leaderboardContainer = document.querySelector('#miModal .modal-mario');

  // Limpiar el contenedor
  leaderboardContainer.innerHTML = '';

  // 2. Para cada tiempo en playerTimes, crear un nuevo elemento de párrafo, establecer su contenido en el tiempo (con tres decimales) y añadirlo al contenedor
  for (var i = 0; i < playerTimes.length; i++) {
    var p = document.createElement('p');
    //var t = document.createElement('t');
    var B = document.createElement('button');
    
    B.style.fontSize = '30px';
    B.style.background = 'red';
    B.style.cursor = 'pointer';
    B.style.width = '30px';
    B.style.height = '30px';
    B.style.display = 'flex';
    B.textContent = 'x';
    B.style.color = 'white';

    function closeModal1() {
      document.getElementById('miModal').style.display = 'none';
    }

   B.addEventListener('click', function() {
      // Cerrar todas las modales
      closeModal();
  });

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    t.style.fontSize = "60px";
    t.textContent = "Tiempo";
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    p.textContent = "Ronda " + (i + 1) + " - " + playerTimes[i].toFixed(3) + "s";
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    leaderboardContainer.appendChild(t);
    leaderboardContainer.appendChild(p);
    leaderboardContainer.appendChild(B);
  }
}*/

/*
Cada animacion tiene las siguientes propiedades (frame es oligatoria)
frames: matriz de números de fotogramas que componen la animación
rate: segundo por fotograma, mejor expresado como fracción
bucle: por defecto es true, que reproduce la animación una y otra vez. Establece false para que se reproduzca una vez
next: la animación que se reproducirá inmediatamente después de ésta (automáticamente se establece loop en false)
trigger: evento a disparar cuando la animación termine - útil para hacer algo (como añadir un sprite bala) cuando la animación termine de reproducirse.
*/


  Q.animations('mario_small', {
    run_right: { frames: [3,2,1], rate: 1/10},
    run_left: { frames: [17,16,15], rate: 1/10 },
    stand_right: { frames: [0], rate: 1/5 },
    stand_left: { frames: [14], rate: 1/5 },
    jump_rigth: {frames:[4], rate: 1/5, loop: false},
    jump_left: {frames:[18], rate: 1/15, loop: false},
    die: {frames:[12,12], rate: 5/15, loop: false, trigger: "muere"}
  });

  Q.animations('goomba', {
  	move: {frames: [0,1], rate: 5/15},
  	die: {frames: [2,2], rate: 7/15, loop: false, trigger: "muere"}
  });

  Q.animations('bloopa', {
  	move: {frames: [0,1], rate: 7/15},
  	die: {frames: [2,2], rate: 7/15, loop: false, trigger: "muere"}
  });




//Creamos una componente generica defaultEnemy, que se cargara en todos los enemigos y que tendra los atributos comunes de ellos.
  Q.component("defaultEnemy", {
    added:function(){

      this.entity.add("2d, aiBounce, animation");
      this.entity.p.muerto = false;
      var that = this;

      //Definimos las acciones al chocar por la izquierda, derecha y abajo con el Mario. En este caso Mario muere
      this.entity.on("bump.left,bump.right,bump.bottom",function(collision) {
        if(collision.obj.isA("Mario")) {
          Q.stageScene("endGame",1, { label: "¡Has muerto!\n te asesinó un bicho" });

          collision.obj.p.muerto = true;
          collision.obj.p.sensor = true;
          collision.obj.p.vy = -300;
          collision.obj.p.vx = 0;
          collision.obj.play("die");
        }
      });

      //Definimos las acciones al chocar por arriba con el Mario. En este caso mmuere el enemigo
      this.entity.on("bump.top",function(collision) {
        if(collision.obj.isA("Mario")) {
	        that.entity.play("die");
  	    	that.entity.p.muerto = true;
  	    	that.entity.p.vx = 0;
          //Hacemso que Mario de un pequeño saltito al matar a un enemigo
          collision.obj.p.vy = -300;
        }
      });
      this.entity.on("muere",function() {
        that.entity.destroy();
      });

    }
  });

  // El comportamiento del enemigo Goomba es que se mueva en una dirección y rebote en caso de chocar contra algo
  Q.Sprite.extend("Goomba",{

    init: function(p) {

      //Creamos el objeto en la posicion (x, y) y le damos una velocidad inicial
      this._super(p, { sprite: "goomba", sheet: "goomba", vx:100, muerto: false });

      this.add("defaultEnemy");
    },
    step: function(dt) {
      if(!this.p.muerto)
        this.play("move");
    }
  });


  //El comportamiento del enemigo Bloopa es que siempre está saltando en una determinada posición
  Q.Sprite.extend("Bloopa",{

    init: function(p) {
      //Creamos el objeto en la posicion (x, y) y le damos una velocidad inicial
      this._super(p, { sprite: "bloopa",  sheet: "bloopa", gravity:0.2, vy:-150, muerto: false});
      this.add("defaultEnemy");

      this.on("bump.bottom",function(collision) {
      	if(!collision.obj.isA("Mario")) {
          if(!this.p.muerto)
	      		this.p.vy = -150;
        }
      });
    }
    ,step: function(dt) {
      if(!this.p.muerto)
        this.play("move");
    }
  });

//El comportamiento de la princesa consiste simplemente en detectar la colision de Mario
  Q.Sprite.extend("Princess",{

    init: function(p) {

      //Creamos el objeto en la posicion (x, y) y le damos una velocidad inicial
      this._super(p, { asset: "princess.png", sensor:true});

      //El modulo aiBounce permite al sprite rebotar al colisionar con una pared
      this.add('2d');

      //Se definen las acciones al chocar con el sprite desde la izquierda, derecha o abajo. Si es Mario se acaba la partida.
      this.on("bump.left,bump.right,bump.bottom,bump.top",function(collision) {
        if(collision.obj.isA("Mario")) {
          Q.stageScene("endGame",1, { label: "¡Has ganado!\nTiempo: " + Q.state.get("total_time").toFixed(2) });
          Q.audio.play('music_level_complete.mp3');
          collision.obj.destroy();
          tiempo_actual = Q.state.get("total_time").toFixed(2);
          JuegoTerminado = true;
          finishLevel()
        }
      });
    }
  });





  Q.animations('coin', {
    move: {frames: [0,1,2], rate: 1/10}
  });

  //El comportamiento de la moneda consiste simplemente en detectar la colision de Mario y cuando se produce subir un poco
  Q.Sprite.extend("Coin",{

    init: function(p) {
      var micolision = false;
      //Creamos el objeto en la posicion (x, y) y le damos una velocidad inicial
      //Set "sensor" to true so that it gets notified when it's hit, but doesn't trigger collisions itself that cause the player to stop or change direction
      this._super(p, {sprite: "coin",  sheet: "coin", sensor:true, gravity: 0});

      //El modulo tween
      this.add('2d, animation, tween');

      this.play("move");
      //Se definen las acciones al chocar con el sprite desde la izquierda, derecha o abajo. Si es Mario se acaba la partida.
      this.on("bump.left,bump.right,bump.bottom,bump.top",function(collision) {
        if(collision.obj.isA("Mario")) {
          if(micolision === false){
            micolision = true;
            Q.audio.play('coin.mp3');
            Q.state.inc("coins_collected", 1);
      			this.animate({ x: this.p.x, y: this.p.y - 100, angle: 0 }, 0.5, Q.Easing.Quadratic.Linear, {callback: function(){	this.destroy();}});
          }
        }
        else{
          micolision === false;
        }
      });
    }
  });


  Q.animations('block', {
    change: {frames: [1], rate: 5/10}
  });

  Q.Sprite.extend("CoinBlock",{

    init: function(p) {
      var hitted = false;
      var moving = false;
      //Creamos el objeto en la posicion (x, y) y le damos una velocidad inicial
      //Set "sensor" to true so that it gets notified when it's hit, but doesn't trigger collisions itself that cause the player to stop or change direction
      this._super(p, {sprite: "block",  sheet: "block", gravity: 0});

      //El modulo tween
      this.add('2d, animation, tween');

      //Se definen las acciones al chocar con el sprite desde la izquierda, derecha o abajo. Si es Mario se acaba la partida.
      this.on("bump.bottom",function(collision) {
        if(collision.obj.isA("Mario")) {

          collision.obj.p.vy = +80;

          if(!moving && !hitted){
            moving = true;
            Q.audio.play('coin.mp3');
            Q.state.inc("coins_collected", 1);
            
            var xAntigua = this.p.x;
            var yAntigua = this.p.y;

            this.animate({ x: xAntigua, y: yAntigua - 10, angle: 0 }, 0.1, Q.Easing.Quadratic.Linear, {callback: function(){

              var coin = GLOBAL_STAGE.insert(new Q.Coin({ x: xAntigua, y: yAntigua - 34 }));
              coin.animate({ x: this.p.x, y: this.p.y - 100, angle: 0 }, 0.5, Q.Easing.Quadratic.Linear, {callback: function(){ this.destroy();}});
              this.play("change");
              hitted = true;

              this.animate({ x: xAntigua, y: yAntigua, angle: 0 }, 0.1, Q.Easing.Quadratic.Linear, {callback: function(){moving = false}});
            }});
          }
        }
      });

    }
  });

//Cargamos el png del titulo del menu
Q.Sprite.extend("mainTitle",{
  init: function(p) {
    this._super(p, { asset: "mainTitle.png"});
}});

//Creacion de las escenas


//Creamos la escena de inicio
Q.scene('startGame',function(stage) {

	Q.audio.play('music_main.mp3',{ loop: true });

	var container = stage.insert(new Q.UI.Container({
	  x: 0, y: 0, w: 500, h: 500, fill: "rgba(0,0,0,0.5)"
	}));

	//container.insert(new Q.mainTitle({ x: 0, y: 0, w:500, h: 500 }));

	var button = container.insert(new Q.UI.Button({
	  x: Q.width/2, y: Q.height/2+Q.height/10, label: "Iniciar partida", fill: "rgba(230,99,24,1)", border: 2, w:Q.width/2, h: Q.height/10, font: "400 "+Q.height/23.4+"px arial"
	}));

	// Cuando se pulsa el boton se carga el primer nivel y el HUD. Ademas se ponen las monedas recogidas a 0
	button.on("click",function() {
	  Q.clearStages();
	  Q.stageScene('level1');
	  Q.stageScene('HUD', 2);
	  Q.state.set("coins_collected", 0);
      Q.state.set("current_time", 0);
      Q.state.set("total_time", 0);
      JuegoTerminado = false;
	});
	container.fit(0);
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*Aqui van todas las funciones enfocadas en preguntas*/
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function pauseGame() {
  // Verificar si Q está disponible y si Q.pauseGame es una función
  if (typeof Q !== 'undefined' && typeof Q.pauseGame === 'function') {
      Q.pauseGame();
  } else {
      console.error('Q no está definido o Q.pauseGame no es una función');
  }
}

function unpauseGame() {
  // Verificar si Q está disponible y si Q.unpauseGame es una función
  if (typeof Q !== 'undefined' && typeof Q.unpauseGame === 'function') {
      Q.unpauseGame();
  } else {
      console.error('Q no está definido o Q.unpauseGame no es una función');
  }
}

const questionsAndAnswers = [
  { question: "1. Python es un lenguaje para diseño web?", answer: false },
  { question: "2. Javascript es igual que Java?", answer: false },
  { question: "3. SQL esta enfocado en bases de datos?", answer: true },
  { question: "4. En HTML, la etiqueta 'br' necesita ser cerrada.", answer: false },
  { question: "5. Los comentarios en HTML se crean usando <!-- Comentario -->.", answer: true },
  { question: "6. En CSS, el id de un elemento debe ser único en un documento.", answer: true },
  { question: "7. El Software es la parte fisica del Ordenador", answer: false },
  { question: "8. El Hardware es la parte fisica del ordenador", answer: true },
  { question: "9. En programacion 'For' se usa para hacer bucles", answer: true },
  { question: "10. Java admite la herencia múltiple.", answer: false },
  { question: "11. En MySQL, NULL = NULL devuelve verdadero.", answer: false },
  { question: "12. MySQL es un sistema de gestión de bases de datos relacional.", answer: true },
  { question: "13. La gestión de riesgos no corresponde al proceso de Gestión Configuración Software.", answer: false },
  { question: "14. Especificación de requisitos no es considerado como elemento en la Gestión de la Configuración de Software.", answer: false },
  { question: "15. Al ejecutar printf se incrementa solo el tiempo de usuario del proceso.", answer: false },
  { question: "16. Al ejecutar printf se incrementa solo el tiempo de sistema del proceso.", answer: false },
  { question: "17. printf es una llamada al sistema operativo.", answer: false },
  { question: "18. lseek es una llamada al sistema operativo.", answer: true },
  { question: "19. El análisis de software se centra en comprender los requisitos y objetivos del software.", answer: true },
  { question: "20. El desarrollo de software se refiere a la implementación y codificación de la solución basada en esos requisitos.", answer: true },
];

function openModal() {
  const randomIndex = Math.floor(Math.random() * questionsAndAnswers.length);
  const randomQuestion = questionsAndAnswers[randomIndex];

  correctAnswer = randomQuestion.answer;

  var modalContainer = document.createElement('div');
  modalContainer.id = 'modal-container';
  modalContainer.style.display = 'flex';

  var modalContent = document.createElement('div');
  modalContent.id = 'modal-content';
  modalContent.innerHTML =
    '<span id="close-modal" onclick="closeModal()">&times;</span>' +
    '<h2 id="question">Preguntas Programacion</h2>' +
    '<p id="question-text">' + randomQuestion.question + '</p>';

  // Crear botones en JavaScript
  var trueButton = document.createElement('button');
  trueButton.textContent = 'Verdadero';
  trueButton.onclick = function () {
    checkAnswer(true);
    console.log('respondiste "True"');
  };

  var falseButton = document.createElement('button');
  falseButton.textContent = 'Falso';
  falseButton.onclick = function () {
    checkAnswer(false);
    console.log('respondiste "False"');
  };

  // Agregar botones al modal
  modalContent.appendChild(trueButton);
  modalContent.appendChild(falseButton);

  // Agregar el contenido al modal
  modalContainer.appendChild(modalContent);

  // Agregar la modal al body
  document.body.appendChild(modalContainer);
}

function checkAnswer(userAnswer) {

  const currentQuestion = questionsAndAnswers.find(q => q.question === document.getElementById('question-text').innerText);
  if (currentQuestion) {
    //const correctAnswer = currentQuestion.answer;
    if (userAnswer === correctAnswer) {
      Q.pauseGame(); console.log('Juego pausado');
      pauseGame();
      console.log('¡Ganaste! Respuesta correcta.');
      Q.stageScene("PauseGame",1, { label: "¡Respuesta Correcta!" });
      closeModal();
    } else {
      Q.pauseGame(); console.log('Juego pausado');
      pauseGame();
      console.log('Respuesta incorrecta. Reiniciando el juego...');
        closeModal();
        Q.stageScene("endGame",1, { label: "¡Has muerto!\n Respuesta incorrecta" });   
      }
    }
  // Cierra la modal después de verificar la respuesta
  closeModal();
  Q.pauseGame();
}

function closeModal() {
  // Obtener todos los elementos que queremos ocultar
  var modalElements = document.querySelectorAll('#modal-container, #modal-content');
  // Recorrer cada elemento
  for (var i = 0; i < modalElements.length; i++) {
    // Obtener el estilo actual del elemento
    var style = window.getComputedStyle(modalElements[i]);
    // Si el elemento se está mostrando
    if (style.display !== 'none') {
      // Cambiar el estilo para ocultarlo
      modalElements[i].style.display = 'none';
      Q.pauseGame();
    }
  }
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



var GLOBAL_STAGE;
     var divisor;

  //Cargamos el primer nivel, que cargara su contenido primero del tmx y despues le insertaremos otros elementos como el Mario, los coleccionables, los enemigos...
  Q.scene("level1",function(stage) {


  	/*
  	 Q.el.style.height = 1200 + "px";
     Q.el.style.width = 800 + "px";
     Q.wrapper.style.margin = "0";
	*/


     //Cargamos el nivel
     Q.stageTMX("level.tmx",stage);
     Q.state.set("coins_collected", 0);
      Q.state.set("current_time", 0);

     // Creamos el jugador y le asociamos la camara (mario y la camara se crean en el mismo punto y luego se asigna que le siga con un offset para que Mario quede a la izquierda de la pantalla)
     var player = stage.insert(new Q.Mario());
     var camera = stage.add("viewport");

     if(Q.height>1200)
     	divisor = 1.7;
     else if(Q.height>1100)
     	divisor = 1.65;
     else if(Q.height>900)
     	divisor = 1.6;
     else if(Q.height>800)
     	divisor = 1.55;
     else if(Q.height>700)
     	divisor = 1.5;
     else if(Q.height>600)
     	divisor = 1.45;
     else if(Q.height>500)
     	divisor = 1.37;
     else if(Q.height>425)
     	divisor = 1.3;
     else
     	divisor = 1.2;

     camera.centerOn(150,Q.height/divisor);
     
     camera.follow(player,{ x: true, y: false });
     stage.viewport.scale = Q.width/320;
     stage.viewport.offsetX = -90;


     /*
		h: 1464. y: 800. sol: 1.83
		h: 600. y:450. sol: 1.43
     */

     //Añadimos a la princesa
     stage.insert(new Q.Princess({ x: 2000, y: 340 }));
    GLOBAL_STAGE = stage;
  });

  //Esta escena permite definir lo que ocurre al pausar el juego

 /* Q.scene('PauseGame',function(stage) {
    var box = stage.insert(new Q.UI.Container({
      x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
    }));
    
  //  openModal()
      
    button.on("click",function() {
      Q.unpauseGame();
      Q.state.set("current_time", 0);
      box.p.hidden = true;
      closeModal();
    });
    box.fit(20);
  });*/


  Q.scene('PauseGame',function(stage) {
  //En funcion el mensaje pasado reproduciremos una u otra cancion
    if(stage.options.label.includes("¡Respuesta Correcta!")){
      
     }
     var container = stage.insert(new Q.UI.Container({
      x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
    }));


 
     var button = container.insert(new Q.UI.Button({
       x: 0, y: 0, fill: "#CCCCCC", label: "Continuar", w:Q.width/2, h: Q.height/10, font: "400 "+Q.height/23.4+"px arial"
    }));
    

    if(stage.options.label === "¡Respuesta Correcta!"){
		var label = container.insert(new Q.UI.Text({
	      x:10, y: -30 - button.p.h - Q.height/24, label: stage.options.label, size: Q.height/24, color: "Yellow"
	    }));
    }
    else{
    	var label = container.insert(new Q.UI.Text({
	      x:10, y: -30 - button.p.h, label: stage.options.label, size: Q.height/24, color: "black"
	    }));
    }
    Q.pauseGame();
    button.on("click",function() {
      console.log('Botón "Continuar" presionado, reanudando el juego...');
      Q.unpauseGame();
      Q.state.set("current_time", 0);
      container.p.hidden = true;
    });
    // Expand the container to visibly fit it's contents (with a padding of 20 pixels)
    container.fit(20);
    });

  //Esta escena permite definir lo que ocurre al morir Mario
  Q.scene('endGame',function(stage) {
    //En funcion el mensaje pasado reproduciremos una u otra cancion
    Q.audio.stop();
    if(stage.options.label.includes("¡Has muerto!")){
      Q.audio.play('music_die.mp3');
     }


    var container = stage.insert(new Q.UI.Container({
      x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
    }));

    var button = container.insert(new Q.UI.Button({
      x: 0, y: 0, fill: "#CCCCCC", label: "Jugar de nuevo", w:Q.width/2, h: Q.height/10, font: "400 "+Q.height/23.4+"px arial"
    }));

	if(stage.options.label.includes("¡Has muerto!")){
		var label = container.insert(new Q.UI.Text({
	      x:10, y: -30 - button.p.h - Q.height/24, label: stage.options.label, size: Q.height/24, color: "yellow"
	    }));
    }
    else{
    	var label = container.insert(new Q.UI.Text({
	      x:10, y: -30 - button.p.h, label: stage.options.label, size: Q.height/24, color: "black"
	    }));
    }

    button.on("click",function() {
      Q.clearStages();
      Q.stageScene('startGame');
      Q.state.set("coins_collected", 0);
      Q.state.set("current_time", 0);
    });
    // Expand the container to visibly fit it's contents (with a padding of 20 pixels)
    container.fit(20);
  });
  
  //Definimos la etiqueta de las monedas (variable global del juego) que se actualizara en el HUD
  Q.UI.Text.extend("Coins",{
    init: function(p) {
      this._super(p,{
        label: "Monedas: "+Q.state.get("coins_collected"),
        color: "red",
        size: Q.height/30,
        x: 0,
        y: 0
      });
      Q.state.on("change.coins_collected",this,"update_coins");
    },
    update_coins: function(coin) {
      this.p.label = "Monedas: " + coin;
    }
  });

  //Definimos la etiqueta de las monedas (variable global del juego) que se actualizara en el HUD
  Q.UI.Text.extend("Time",{
    init: function(p) {
      this._super(p,{
        label: "Tiempo: "+Q.state.get("current_time"),
        color: "red",
        size: Q.height/30,
        x: 0,
        y: 0
      });
      Q.state.on("change.current_time",this,"update_time");
    },
    update_time: function(time) {
      this.p.label = "Tiempo: " + time.toFixed(2);
    }
  });

  //Esta escena permite definir un HUD que mostrara informacion del juego
  Q.scene('HUD',function(stage) {

    var container = stage.insert(new Q.UI.Container({
      x: Q.width/2,
      y: 25,
      w: Q.width,
      h: 50
    }));

    container.insert(new Q.Coins({
        x: -container.p.x/2,
        y: -20,
    }));

    container.insert(new Q.Time({
        x: container.p.x/2,
        y: -20,
    }));

    container.fit(20);
  });
 }
