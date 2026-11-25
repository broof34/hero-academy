/* Adapted from Jake Gordon v1 straight racer (MIT); see LICENSE.txt. Original graphics; no upstream image/audio assets. */
    var fps           = 60;                      // how many 'update' frames per second
    var step          = 1/fps;                   // how long is each frame (in seconds)
    var width         = 800;                    // logical canvas width
    var height        = 500;                     // logical canvas height
    var segments      = [];                      // array of road segments
    var stats         = {update:function(){}};       // mr.doobs FPS counter
    var canvas        = Dom.get('canvas');       // our canvas...
    var ctx           = canvas.getContext('2d'); // ...and its drawing context
    var background    = null;                    // our background image (loaded below)
    var sprites       = null;                    // our spritesheet (loaded below)
    var resolution    = null;                    // scaling factor to provide resolution independence (computed)
    var roadWidth     = 2000;                    // actually half the roads width, easier math if the road spans from -roadWidth to +roadWidth
    var segmentLength = 200;                     // length of a single segment
    var rumbleLength  = 3;                       // number of segments per red/white rumble strip
    var trackLength   = null;                    // z length of entire track (computed)
    var lanes         = 3;                       // number of lanes
    var fieldOfView   = 100;                     // angle (degrees) for field of view
    var cameraHeight  = 1000;                    // z height of camera
    var cameraDepth   = null;                    // z distance camera is from screen (computed)
    var drawDistance  = 160;                     // number of segments to draw
    var playerX       = 0;                       // player x offset from center of road (-1 to 1 to stay independent of roadWidth)
    var playerZ       = null;                    // player relative z distance from camera (computed)
    var fogDensity    = 5;                       // exponential fog density
    var position      = 0;                       // current camera Z position (add playerZ to get player's absolute Z position)
    var speed         = 0;                       // current speed
    var maxSpeed      = segmentLength/step;      // top speed (ensure we can't move more than 1 segment in a single frame to make collision detection easier)
    var accel         =  maxSpeed/5;             // acceleration rate - tuned until it 'felt' right
    var breaking      = -maxSpeed;               // deceleration rate when braking
    var decel         = -maxSpeed/5;             // 'natural' deceleration rate when neither accelerating, nor braking
    var offRoadDecel  = -maxSpeed/2;             // off road deceleration is somewhere in between
    var offRoadLimit  =  maxSpeed/4;             // limit when off road deceleration no longer applies (e.g. you can always go at least this speed even when off road)

    var keyLeft       = false;
    var keyRight      = false;
    var keyFaster     = false;
    var keySlower     = false;

    //=========================================================================
    // UPDATE THE GAME WORLD
    //=========================================================================

    function update(dt) {

      if(position+dt*speed>=trackLength)laps++;position = Util.increase(position, dt * speed, trackLength);

      var dx = dt * 2 * (speed/maxSpeed); // at top speed, should be able to cross from left to right (-1 to 1) in 1 second

      if (keyLeft)
        playerX = playerX - dx;
      else if (keyRight)
        playerX = playerX + dx;

      if (keyFaster)
        speed = Util.accelerate(speed, accel, dt);
      else if (keySlower)
        speed = Util.accelerate(speed, breaking, dt);
      else
        speed = Util.accelerate(speed, decel, dt);

      if (((playerX < -1) || (playerX > 1)) && (speed > offRoadLimit))
        speed = Util.accelerate(speed, offRoadDecel, dt);

      playerX = Util.limit(playerX, -2, 2);     // dont ever let player go too far out of bounds
      speed   = Util.limit(speed, 0, maxSpeed); // or exceed maxSpeed

    }

    //=========================================================================
    // RENDER THE GAME WORLD
    //=========================================================================

    function render() {

      var baseSegment = findSegment(position);
      var maxy        = height;

      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle='#18284b';ctx.fillRect(0,0,width,height);ctx.fillStyle='#b4a1f5';ctx.beginPath();ctx.arc(650,90,44,0,Math.PI*2);ctx.fill();



      var n, segment;

      for(n = 0 ; n < drawDistance ; n++) {

        segment        = segments[(baseSegment.index + n) % segments.length];
        segment.looped = segment.index < baseSegment.index;
        segment.fog    = Util.exponentialFog(n/drawDistance, fogDensity);

        Util.project(segment.p1, (playerX * roadWidth), cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);
        Util.project(segment.p2, (playerX * roadWidth), cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);

        if ((segment.p1.camera.z <= cameraDepth) || // behind us
            (segment.p2.screen.y >= maxy))          // clip by (already rendered) segment
          continue;

        Render.segment(ctx, width, lanes,
                       segment.p1.screen.x,
                       segment.p1.screen.y,
                       segment.p1.screen.w,
                       segment.p2.screen.x,
                       segment.p2.screen.y,
                       segment.p2.screen.w,
                       segment.fog,
                       segment.color);

        maxy = segment.p2.screen.y;
      }

      var carX=width/2;ctx.fillStyle='#101529';ctx.fillRect(carX-48,height-88,20,68);ctx.fillRect(carX+28,height-88,20,68);ctx.fillStyle='#8b77f6';ctx.beginPath();ctx.roundRect(carX-36,height-112,72,100,12);ctx.fill();ctx.fillStyle='#b8e7ef';ctx.fillRect(carX-25,height-95,50,30);ctx.fillStyle='#ffe190';ctx.fillRect(carX-28,height-36,15,8);ctx.fillRect(carX+13,height-36,15,8);
      document.querySelector('small').textContent='Speed '+Math.round(speed/maxSpeed*160)+' · Laps '+laps;
    }

    //=========================================================================
    // BUILD ROAD GEOMETRY
    //=========================================================================

    function resetRoad() {
      segments = [];
      for(var n = 0 ; n < 500 ; n++) {
        segments.push({
           index: n,
           p1: { world: { z:  n   *segmentLength }, camera: {}, screen: {} },
           p2: { world: { z: (n+1)*segmentLength }, camera: {}, screen: {} },
           color: Math.floor(n/rumbleLength)%2 ? COLORS.DARK : COLORS.LIGHT
        });
      }

      segments[findSegment(playerZ).index + 2].color = COLORS.START;
      segments[findSegment(playerZ).index + 3].color = COLORS.START;
      for(var n = 0 ; n < rumbleLength ; n++)
        segments[segments.length-1-n].color = COLORS.FINISH;

      trackLength = segments.length * segmentLength;
    }

    function findSegment(z) {
      return segments[Math.floor(z/segmentLength) % segments.length];
    }


var laps=0;canvas.width=width;canvas.height=height;cameraDepth=1/Math.tan((fieldOfView/2)*Math.PI/180);playerZ=cameraHeight*cameraDepth;resolution=height/480;
COLORS.LIGHT={road:'#414b70',grass:'#233e50',rumble:'#bda5ff',lane:'#e3def8'};COLORS.DARK={road:'#3b4569',grass:'#203949',rumble:'#7262b8'};COLORS.FOG='#18284b';resetRoad();
function key(k,on){if(k===37||k===65)keyLeft=on;if(k===39||k===68)keyRight=on;if(k===38||k===87)keyFaster=on;if(k===40||k===83)keySlower=on;}
onkeydown=e=>{if([37,38,39,40,65,68,87,83].includes(e.keyCode)){e.preventDefault();key(e.keyCode,true)}};onkeyup=e=>key(e.keyCode,false);onblur=()=>{keyLeft=keyRight=keyFaster=keySlower=false;};
document.querySelectorAll('[data-key]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);key(+b.dataset.key,true)};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>key(+b.dataset.key,false);});
var last=performance.now(),frameId;function frame(now){update(Math.min((now-last)/1000,.05));render();last=now;frameId=requestAnimationFrame(frame)}frameId=requestAnimationFrame(frame);onpagehide=()=>cancelAnimationFrame(frameId);
