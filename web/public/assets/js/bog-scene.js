/* bog-scene.js — the shared bog canvas atmosphere, mounted once site-wide by
   the chrome (web/components/Layout.js) so every page whose html carries the
   #bog-stage divs animates over the same living ground (issue #141).
   Extracted verbatim from the front door's inline IIFE; behavior preserved:
   - exits silently when the page carries no #bog-scene element
   - guards double-init with the window.__bogSceneMounted flag
   - ~30 fps throttle (FRAME_MS 33.4); pauses on visibilitychange
   - prefers-reduced-motion renders ONE static frame and starts no rAF loop
   - the canvas sky paints NO moon (the one-moon law, decree 2026-11-04)
   - DPR clamped at 1.75; the painted buffer caps just past one viewport
     (+120px) so the fixed stage never shows an unpainted seam */
(function(){
  var REDUCE = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var canvas = document.getElementById('bog-scene');
  if (!canvas) return;
  var ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;
  window.__bogSceneMounted = true;
  var CW = 0, CH = 0, DPR = 1, waterY = 0, landY = 0;
  var grainTile = null;
  var STARS = [], MIST = [], WISPS = [], MOTHS = [], GRASS = [], MOTES = [], STREAKS = [];
  var tabHidden = false;
  var lastPaint = 0;
  var FRAME_MS = 33.4;
  var rafId = null;

  var rnd = function(a,b){ return a + Math.random()*(b-a); };
  var clamp = function(v,a,b){ return Math.min(b,Math.max(a,v)); };

  function makeGrain(){
    var s=140, g=document.createElement('canvas'); g.width=g.height=s;
    var gc=g.getContext('2d'), img=gc.createImageData(s,s);
    for(var i=0;i<img.data.length;i+=4){
      var v=(Math.random()*255)|0;
      img.data[i]=img.data[i+1]=img.data[i+2]=v; img.data[i+3]=22;
    }
    gc.putImageData(img,0,0); grainTile=g;
  }

  function paintPageGrain(){
    var host=document.getElementById('bog-grainfx'); if(!host) return;
    var s=180, g=document.createElement('canvas'); g.width=g.height=s;
    var gc=g.getContext('2d'), img=gc.createImageData(s,s);
    for(var i=0;i<img.data.length;i+=4){
      var v=(Math.random()*255)|0;
      img.data[i]=img.data[i+1]=img.data[i+2]=v; img.data[i+3]=16;
    }
    gc.putImageData(img,0,0);
    var url=g.toDataURL(); if(url) host.style.backgroundImage='url('+url+')';
  }

  function buildScene(){
    STARS.length=MIST.length=WISPS.length=MOTHS.length=GRASS.length=MOTES.length=STREAKS.length=0;
    var i;
    for(i=0;i<Math.round((CW*waterY)/8200)+8;i++)
      STARS.push({x:Math.random()*CW,y:Math.random()*waterY*0.9,r:rnd(0.4,1.5),ph:rnd(0,6.283),sp:rnd(0.4,1.6)});
    for(i=0;i<8;i++)
      MIST.push({y:waterY*rnd(0.28,1.02),x:rnd(-0.2,1.2)*CW,w:CW*rnd(0.5,1.35),h:CH*rnd(0.03,0.1),sp:rnd(0.12,0.5)*(i%2?1:-1),a:rnd(0.03,0.09)});
    var clear=[[0.22,0.62],[0.42,0.72],[0.60,0.86],[0.12,0.82],[0.30,0.46]];
    clear.forEach(function(fc){ WISPS.push({bx:fc[0]*CW,by:fc[1]*CH,r:rnd(6,11),ph:rnd(0,6.283),sp:rnd(0.35,0.9),driftR:rnd(16,46),driftS:rnd(0.06,0.2),spin:rnd(-0.5,0.5)}); });
    for(i=0;i<Math.round(clamp(CW/190,5,11));i++){
      var host=WISPS[(Math.random()*WISPS.length)|0]||{bx:CW*0.5,by:CH*0.62};
      MOTHS.push({host:host,orb:rnd(24,84),sp:rnd(0.28,0.85)*(Math.random()<0.5?1:-1),ph:rnd(0,6.283),tilt:rnd(-0.5,0.5),size:rnd(4.5,9),flap:rnd(6,12),wob:rnd(0.4,1.1)});
    }
    var clumpRow=function(count,baseFn,hR,wR,aR,spread,pc){
      for(var c=0;c<count;c++){
        var cx=rnd(-0.03,1.03)*CW, base=baseFn(), n=Math.round(rnd(pc[0],pc[1]));
        for(var j=0;j<n;j++){
          var off=rnd(-spread,spread);
          GRASS.push({x:cx+off,base:base+rnd(-6,6),h:rnd(hR[0],hR[1])*(1-Math.min(0.4,(Math.abs(off)/(spread*1.7))*0.4)),lean:(off/spread)*0.5+rnd(-0.16,0.16),w:rnd(wR[0],wR[1]),ph:rnd(0,6.283),sp:rnd(0.5,1.3),a:rnd(aR[0],aR[1])});
        }
      }
    };
    clumpRow(Math.round(clamp(CW/30,12,40)),function(){return waterY+rnd(-6,10);},[CH*0.045,CH*0.1],[0.6,1.1],[0.1,0.24],34,[4,7]);
    clumpRow(Math.round(clamp(CW/70,6,18)),function(){return landY-rnd(0,CH*0.05);},[CH*0.09,CH*0.17],[0.9,1.6],[0.18,0.38],48,[5,8]);
    clumpRow(Math.round(clamp(CW/120,4,11)),function(){return CH+rnd(0,CH*0.06);},[CH*0.12,CH*0.24],[1.3,2.4],[0.3,0.58],64,[4,7]);
    for(i=0;i<Math.round(clamp(CW/30,26,80));i++)
      MOTES.push({x:Math.random()*CW,y:Math.random()*CH,r:rnd(0.5,1.9),ph:rnd(0,6.283),sp:rnd(0.15,0.6),vy:rnd(-0.26,0.15)});
    for(i=0;i<22;i++)
      STREAKS.push({y:waterY+rnd(4,(landY-waterY)*0.94),ph:rnd(0,6.283),sp:rnd(0.5,1.6),w:rnd(0.25,1),a:rnd(0.05,0.2)});
  }

  function resize(){
    var box=canvas.parentElement.getBoundingClientRect();
    CW=Math.max(320,Math.round(box.width));
    /* the stage is a FIXED one-viewport backdrop (decree 2026-11-04
       round 2: the top image floats behind the entire page content all
       the way while scrolling), so the painted buffer only needs to
       cover the viewport — capped a hair past it so the fixed stage
       never shows an unpainted seam at the bottom edge */
    CH=clamp(Math.round(box.height),220,Math.round(window.innerHeight*1.04)+120);
    DPR=Math.min(window.devicePixelRatio||1,1.75);
    canvas.width=Math.round(CW*DPR); canvas.height=Math.round(CH*DPR);
    canvas.style.width=CW+'px'; canvas.style.height=CH+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
    waterY=CH*(300/560); landY=CH*(420/560);
    /* decree 2026-11-04: "there are 2 moons now, we can't have that,
       remove the moon from the background" — the canvas sky carries NO
       moon; the garden painting's own moon is the one moon of the page */
    buildScene(); paint(REDUCE?140:performance.now()/1000);
  }

  function drawWater(t){
    var g=ctx.createLinearGradient(0,waterY,0,landY+2);
    g.addColorStop(0,'#07140e'); g.addColorStop(0.45,'#040c08'); g.addColorStop(1,'#020604');
    ctx.fillStyle=g; ctx.fillRect(0,waterY,CW,(landY-waterY)+2);
    /* moon reflection + pool struck with the moon (decree 2026-11-04):
       only the ambient streaks remain, anchored on the pool's mid axis */
    var ax=CW*0.62;
    ctx.save(); ctx.globalCompositeOperation='screen';
    STREAKS.forEach(function(s){
      var off=Math.sin(t*s.sp+s.ph)*CW*0.06, len=CW*(0.24+0.5*s.w);
      var cx=clamp(ax+off*2.2,-len,CW+len);
      var lg=ctx.createLinearGradient(cx-len,0,cx+len,0);
      lg.addColorStop(0,'rgba(200,235,216,0)'); lg.addColorStop(0.5,'rgba(200,235,216,'+(s.a*0.9).toFixed(3)+')'); lg.addColorStop(1,'rgba(200,235,216,0)');
      ctx.fillStyle=lg; ctx.fillRect(cx-len,s.y,len*2,Math.max(0.8,s.w*1.6));
    }); ctx.restore();
  }

  function drawLand(){
    var seed=7, rand=function(){ seed=(seed*9301+49297)%233280; return seed/233280; }, n=16;
    ctx.save(); ctx.beginPath(); ctx.moveTo(0,landY+10);
    for(var i=0;i<=n;i++){ var xi=(i/n)*CW, yi=landY+(i%3===0?rand()*CH*0.03:0)-rand()*CH*0.012; ctx.lineTo(xi,yi); }
    ctx.lineTo(CW,CH); ctx.lineTo(0,CH); ctx.closePath();
    var g=ctx.createLinearGradient(0,landY-CH*0.02,0,CH);
    g.addColorStop(0,'#081410'); g.addColorStop(0.35,'#050d09'); g.addColorStop(1,'#020604');
    ctx.fillStyle=g; ctx.fill(); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation='screen';
    var rim=ctx.createLinearGradient(0,landY-6,0,landY+26);
    rim.addColorStop(0,'rgba(169,230,195,0.09)'); rim.addColorStop(1,'rgba(169,230,195,0)');
    ctx.fillStyle=rim; ctx.fillRect(0,landY-6,CW,32); ctx.restore();
  }

  function drawGrass(t){
    ctx.save(); ctx.lineCap='round';
    GRASS.forEach(function(b){
      var sway=Math.sin(t*b.sp+b.ph)*(8+b.h*0.14);
      var tipX=b.x+b.lean*b.h*0.55+sway, tipY=b.base-b.h;
      var ctrlX=b.x+b.lean*b.h*0.16+sway*0.35, ctrlY=b.base-b.h*0.58;
      var g=ctx.createLinearGradient(b.x,b.base,tipX,tipY);
      g.addColorStop(0,'rgba(28,63,44,'+(b.a*0.55).toFixed(3)+')'); g.addColorStop(0.55,'rgba(140,195,165,'+(b.a*0.85).toFixed(3)+')'); g.addColorStop(1,'rgba(232,248,238,'+b.a.toFixed(3)+')');
      ctx.strokeStyle=g; ctx.lineWidth=b.w;
      ctx.beginPath(); ctx.moveTo(b.x,b.base); ctx.quadraticCurveTo(ctrlX,ctrlY,tipX,tipY); ctx.stroke();
      if(b.a>0.38){ ctx.beginPath(); ctx.arc(tipX,tipY,b.w*0.85,0,6.283); ctx.fillStyle='rgba(214,240,224,'+(b.a*0.45).toFixed(3)+')'; ctx.fill(); }
    }); ctx.restore();
  }

  function drawCage(x,y,cr,rot,a){
    var V=[[0,-1,0],[1,0,0],[0,0,1],[-1,0,0],[0,0,-1],[0,1,0]];
    var E=[[0,1],[0,2],[0,3],[0,4],[5,1],[5,2],[5,3],[5,4],[1,2],[2,3],[3,4],[4,1]];
    var cosr=Math.cos(rot),sinr=Math.sin(rot),tilt=0.42,ct=Math.cos(tilt),st=Math.sin(tilt);
    var P=V.map(function(v){
      var X=v[0]*cosr-v[2]*sinr, Z=v[0]*sinr+v[2]*cosr;
      var Y=v[1]*ct-Z*st; Z=v[1]*st+Z*ct;
      var s=1/(1+Z*0.28); return {x:x+X*cr*s,y:y+Y*cr*s,s:s};
    });
    ctx.save(); ctx.lineWidth=0.9; ctx.strokeStyle='rgba(214,228,216,'+(0.4*a).toFixed(3)+')';
    E.forEach(function(e){ ctx.beginPath(); ctx.moveTo(P[e[0]].x,P[e[0]].y); ctx.lineTo(P[e[1]].x,P[e[1]].y); ctx.stroke(); });
    P.forEach(function(p){
      ctx.beginPath(); ctx.arc(p.x,p.y,1.5*p.s,0,6.283);
      ctx.fillStyle='rgba(226,244,232,'+(0.75*a).toFixed(3)+')';
      ctx.shadowColor='rgba(169,230,195,0.9)'; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0;
    }); ctx.restore();
  }

  function wispPos(w,t){ return {x:w.bx+Math.cos(t*w.driftS+w.ph)*w.driftR,y:w.by+Math.sin(t*w.driftS*1.3+w.ph*1.7)*w.driftR*0.6}; }

  function drawWisps(t){
    ctx.save(); ctx.globalCompositeOperation='screen';
    WISPS.forEach(function(w){
      var p=wispPos(w,t), pulse=0.55+0.45*Math.sin(t*w.sp*2+w.ph), R=w.r*(1+0.06*pulse);
      var hg=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,R*6.5);
      hg.addColorStop(0,'rgba(169,230,195,'+(0.3*pulse).toFixed(3)+')'); hg.addColorStop(0.25,'rgba(169,230,195,'+(0.11*pulse).toFixed(3)+')'); hg.addColorStop(1,'rgba(169,230,195,0)');
      ctx.fillStyle=hg; ctx.beginPath(); ctx.arc(p.x,p.y,R*6.5,0,6.283); ctx.fill();
      var cg=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,R);
      cg.addColorStop(0,'rgba(245,251,245,'+(0.85*pulse).toFixed(3)+')'); cg.addColorStop(0.5,'rgba(169,230,195,0.5)'); cg.addColorStop(1,'rgba(169,230,195,0)');
      ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(p.x,p.y,R,0,6.283); ctx.fill();
      drawCage(p.x,p.y,R*2.4,t*w.spin+w.ph,0.4+0.5*pulse);
    }); ctx.restore();
  }

  function drawMoths(t){
    ctx.save(); ctx.globalCompositeOperation='screen';
    MOTHS.forEach(function(m){
      var hp=wispPos(m.host,t), a2=t*m.sp+m.ph;
      var x=hp.x+Math.cos(a2)*m.orb, y=hp.y+Math.sin(a2)*m.orb*m.tilt+Math.sin(t*m.wob+m.ph)*6;
      var flap=Math.abs(Math.sin(t*m.flap+m.ph)), wing=m.size*(0.28+0.72*flap);
      ctx.save(); ctx.translate(x,y); ctx.rotate(a2+Math.PI/2);
      ctx.beginPath(); ctx.arc(0,0,m.size*1.5,0,6.283); ctx.fillStyle='rgba(216,214,190,0.05)'; ctx.fill();
      ctx.fillStyle='rgba(226,244,232,0.42)';
      ctx.beginPath(); ctx.ellipse(0,-wing*0.5,m.size*0.42,wing,-0.4,0,6.283); ctx.fill();
      ctx.beginPath(); ctx.ellipse(0,wing*0.5,m.size*0.42,wing,0.4,0,6.283); ctx.fill();
      ctx.fillStyle='rgba(245,251,245,0.85)';
      ctx.beginPath(); ctx.ellipse(0,0,m.size*0.2,m.size*0.62,0,0,6.283); ctx.fill();
      ctx.restore();
    }); ctx.restore();
  }

  function drawMist(t){
    ctx.save();
    MIST.forEach(function(m){
      var x=m.x+t*m.sp*26; x=((x%(CW+m.w))+(CW+m.w))%(CW+m.w)-m.w*0.5;
      var cx=x+m.w/2, rx=m.w*0.62, ry=m.h;
      ctx.save(); ctx.translate(cx,m.y); ctx.scale(rx,ry);
      var g=ctx.createRadialGradient(0,0,0.04,0,0,1);
      g.addColorStop(0,'rgba(150,200,175,'+m.a.toFixed(3)+')'); g.addColorStop(0.5,'rgba(150,200,175,'+(m.a*0.5).toFixed(3)+')'); g.addColorStop(1,'rgba(150,200,175,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,0,1,0,6.283); ctx.fill(); ctx.restore();
    }); ctx.restore();
  }

  function drawMotes(t){
    ctx.save(); ctx.globalCompositeOperation='screen';
    MOTES.forEach(function(d){
      var y=(d.y+t*d.vy*20)%CH; if(y<0) y+=CH;
      var x=d.x+Math.sin(t*d.sp+d.ph)*18, tw=0.4+0.6*Math.abs(Math.sin(t*d.sp*1.7+d.ph));
      ctx.beginPath(); ctx.arc(x,y,d.r,0,6.283); ctx.fillStyle='rgba(226,244,232,'+(0.32*tw).toFixed(3)+')'; ctx.fill();
    }); ctx.restore();
  }

  function drawStars(t){
    ctx.save(); ctx.globalCompositeOperation='screen';
    STARS.forEach(function(s){
      var tw=0.35+0.65*Math.abs(Math.sin(t*s.sp+s.ph));
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,6.283); ctx.fillStyle='rgba(214,232,220,'+(0.5*tw).toFixed(3)+')'; ctx.fill();
    }); ctx.restore();
  }

  function drawGrain(){
    if(!grainTile) return;
    ctx.save(); ctx.globalCompositeOperation='overlay'; ctx.globalAlpha=0.45;
    ctx.fillStyle=ctx.createPattern(grainTile,'repeat'); ctx.fillRect(0,0,CW,CH); ctx.restore();
  }

  function paint(t){
    ctx.fillStyle='#040a07'; ctx.fillRect(0,0,CW,CH);
    var sky=ctx.createLinearGradient(0,0,0,waterY+2);
    sky.addColorStop(0,'#050b09'); sky.addColorStop(0.5,'#08140f'); sky.addColorStop(1,'#0e2318');
    ctx.fillStyle=sky; ctx.fillRect(0,0,CW,waterY+2);
    drawStars(t); drawMist(t); drawWater(t);
    drawLand(); drawWisps(t); drawMoths(t); drawGrass(t); drawMotes(t);
    ctx.save(); ctx.globalAlpha=0.5;
    for(var i=0;i<3;i++){
      var y=waterY+(i+1)*(CH-waterY)*0.24;
      var g=ctx.createLinearGradient(0,y-60,0,y+60);
      g.addColorStop(0,'rgba(150,200,175,0)'); g.addColorStop(0.5,'rgba(150,200,175,'+(0.05-i*0.01).toFixed(3)+')'); g.addColorStop(1,'rgba(150,200,175,0)');
      ctx.fillStyle=g; ctx.fillRect(0,y-60,CW,120);
    } ctx.restore();
    drawGrain();
  }

  function loop(t0){
    rafId=requestAnimationFrame(loop);
    if(tabHidden) return;
    if(t0-lastPaint>=FRAME_MS){ lastPaint=t0; paint(t0/1000); }
  }

  document.addEventListener('visibilitychange',function(){ tabHidden=document.hidden; });

  var rt=null;
  window.addEventListener('resize',function(){ clearTimeout(rt); rt=setTimeout(function(){ resize(); paintPageGrain(); },150); },{passive:true});

  makeGrain(); paintPageGrain(); resize();
  if(!REDUCE){ rafId=requestAnimationFrame(loop); }
})();
