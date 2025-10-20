// Nebula Dashboard Web Component — Sincronia Planetária
// Standalone, no deps. Emits: `infodose:pico`, `planet:tick`.
class NebulaDashboard extends HTMLElement{
  static get observedAttributes(){ return ['data-theme']; }
  constructor(){
    super();
    this.attachShadow({mode:'open'});
    this.state = {
      audioOn:false, ctx:null, osc:null, gain:null,
      energy:.35, pingMs:80, downMbps:null, dbm:-65, lat:null, lon:null,
      lastArch:'—', dpr: Math.max(1, Math.min(2, window.devicePixelRatio||1)),
    };
  }
  
  attributeChangedCallback(name, oldV, newV){
    if(name==='data-theme' && newV && oldV!==newV){
      this.applyTheme(newV);
    }
  }

  connectedCallback(){
    const compact = this.hasAttribute('data-compact');
    this.shadowRoot.innerHTML = `
      <style>
        :host{display:block; font: 400 14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial;
          color:var(--neb-text, #E8F1F2);}
        .card{
          background: linear-gradient(180deg, rgba(19,42,84,.75), rgba(15,30,58,.85));
          border:1px solid #ffffff1a; border-radius: var(--radius-lg,20px);
          padding:12px; box-shadow: var(--shadow, 0 8px 18px rgba(0,0,0,.45));
        }
        h3{margin:0 0 8px 0; font-size:${compact? '14px':'16px'}}
        .hint{font-size:12px; color:var(--neb-muted,#A3B2C2)}
        .row{display:flex; gap:8px; flex-wrap:wrap; margin-top:8px}
        .pill{flex:1 1 auto; min-width:calc(50% - 4px); background:linear-gradient(180deg,#0c1e3e,#0b1731);
              border:1px solid #ffffff1a; border-radius:12px; padding:8px 10px; display:flex; justify-content:space-between}
        .k{font-size:12px; color:var(--neb-muted,#A3B2C2)}
        .v{font-weight:700}
        #orbWrap{position:relative; height:${compact? '180px':'220px'}; border-radius:16px; border:1px solid #ffffff1a; overflow:hidden;
                 background: radial-gradient(800px 400px at 50% 0%, rgba(167,123,255,.18), transparent 60%),
                 linear-gradient(180deg, rgba(11,22,48,.5), rgba(11,22,48,.2)); margin-bottom:8px}
        #orb{width:100%; height:100%; display:block}
        #line{height:84px; border:1px solid #ffffff1a; border-radius:12px; overflow:hidden; position:relative;
              background:linear-gradient(180deg,#0c1e3e,#0b1731); margin-top:8px}
        .log{font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size:12px; color:#d5e8ff;
             max-height:${compact? '140px':'220px'}; overflow:auto; background:#0a1630; border-radius:10px; border:1px solid #ffffff1a; padding:8px}
        small{color:var(--neb-muted,#A3B2C2)}
      </style>
      <div class="card">
        <h3>Rede Viva <span class="hint">• batimento global</span></h3>
        <div id="orbWrap"><canvas id="orb"></canvas></div>
        <div class="row">
          <div class="pill"><span class="k">Ping</span><span class="v" id="pPing">—</span></div>
          <div class="pill"><span class="k">Downlink</span><span class="v" id="pDown">—</span></div>
          <div class="pill"><span class="k">Sinal (dBm)</span><span class="v" id="pDbm">—</span></div>
          <div class="pill"><span class="k">Lat/Lon</span><span class="v" id="pGeo">—</span></div>
        </div>
        <div id="line"></div>
        <small>ORB pulsa com latência simulada; cor segue energia do sinal.</small>
        <div class="log" id="log" style="${compact?'display:none':''}"></div>
      </div>
    `;
    this.$ = {
      canvas: this.shadowRoot.querySelector('#orb'),
      line: this.shadowRoot.querySelector('#line'),
      log: this.shadowRoot.querySelector('#log'),
      pPing: this.shadowRoot.querySelector('#pPing'),
      pDown: this.shadowRoot.querySelector('#pDown'),
      pDbm: this.shadowRoot.querySelector('#pDbm'),
      pGeo: this.shadowRoot.querySelector('#pGeo'),
    };
    this.ctx = this.$.canvas.getContext('2d', {alpha:true});
    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);
    window.addEventListener('resize', this.resize, {passive:true});
    this.resize();

    this.readNetwork();
    this.readGeo();
    this.log('init: NebulaDashboard pronto');
    this._t0 = performance.now();
    this._peakTimer = setInterval(()=>this.pushPeak(), 4200);
    const th = this.getAttribute('data-theme'); if(th) this.applyTheme(th);
    requestAnimationFrame(this.loop);
  }
  dis
  attributeChangedCallback(name, oldV, newV){
    if(name==='data-theme' && newV && oldV!==newV){
      this.applyTheme(newV);
    }
  }

  connectedCallback(){
    window.removeEventListener('resize', this.resize);
    clearInterval(this._peakTimer);
  }
  log(m){
    const t = new Date().toLocaleTimeString();
    if(this.$.log) this.$.log.textContent = `[${t}] ${m}\n` + this.$.log.textContent;
  }
  readNetwork(){
    const c = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
    if(c){ this.state.downMbps = c.downlink || c.downlinkMax || null; this.log(`connection: ${c.effectiveType||'—'} ${this.state.downMbps||'—'}Mb`); }
    else  { this.log('connection: API não disponível'); }
  }
  readGeo(){
    if(!navigator.geolocation){ this.log('geo: indisponível'); return; }
    navigator.geolocation.getCurrentPosition(pos=>{
      this.state.lat = pos.coords.latitude.toFixed(4);
      this.state.lon = pos.coords.longitude.toFixed(4);
      this.$.pGeo.textContent = `${this.state.lat}, ${this.state.lon}`;
      this.log(`geo: ${this.state.lat}, ${this.state.lon}`);
    }, _=>{ this.log('geo: sem permissão'); }, {enableHighAccuracy:false, maximumAge:6e4, timeout:3500});
  }
  ease(a,b,k=.06){ return a + (b-a)*k; }
  mapDbm(dbm){ const cl = Math.max(-110, Math.min(-40, dbm)); return (cl+110)/70; }
  resize(){
    const r = this.$.canvas.getBoundingClientRect();
    this.$.canvas.width = Math.floor(r.width * this.state.dpr);
    this.$.canvas.height = Math.floor(r.height * this.state.dpr);
  }
  simTick(now){
    const t = (now - this._t0)/1000;
    const base = 0.5 + 0.5*Math.sin(t*0.25) * Math.cos(t*0.11);
    const jitter = 0.08*Math.sin(t*2.7) + 0.05*Math.cos(t*1.6);
    const targetEnergy = Math.max(0, Math.min(1, base + jitter));
    this.state.energy = this.ease(this.state.energy, targetEnergy, 0.04);
    const targetDbm = -85 + (this.state.energy*45); // -85..-40
    this.state.dbm = this.ease(this.state.dbm, targetDbm, 0.04);
    const targetPing = 50 + (1 - this.state.energy) * 220; // 50..270ms
    this.state.pingMs = this.ease(this.state.pingMs, targetPing, 0.06);

    document.documentElement.style.setProperty('--energy', this.state.energy.toFixed(2));
    const hue = 200 + Math.round(120*this.state.energy);
    document.documentElement.style.setProperty('--orb-hue', hue);
    document.documentElement.style.setProperty('--signal-dbm', this.state.dbm.toFixed(0));

    this.$.pPing.textContent = `${this.state.pingMs.toFixed(0)} ms`;
    this.$.pDown.textContent = this.state.downMbps ? `${this.state.downMbps.toFixed(1)} Mb` : '—';
    this.$.pDbm.textContent  = `${this.state.dbm.toFixed(0)} dBm`;

    // Bubble a planet:tick
    const ev = new CustomEvent('planet:tick',{detail:{energy:this.state.energy, dbm:this.state.dbm, ping:this.state.pingMs}});
    document.dispatchEvent(ev);
  }
  drawOrb(now){
    const ctx = this.ctx, canvas=this.$.canvas;
    const w=canvas.width, h=canvas.height, cx=w/2, cy=h/2;
    ctx.clearRect(0,0,w,h);
    ctx.save(); ctx.translate(cx,cy);
    const R = Math.min(w,h)*0.32;
    const hue = getComputedStyle(document.documentElement).getPropertyValue('--orb-hue') || '220';
    const pulse = 1 + 0.05*Math.sin(now*0.002 + this.state.energy*5);

    const grad = ctx.createRadialGradient(0,0, R*0.3, 0,0, R*1.25);
    grad.addColorStop(0, `hsla(${hue} 95% 64% / ${0.35+this.state.energy*0.25})`);
    grad.addColorStop(1, `hsla(${hue} 95% 20% / 0)`);
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(0,0,R*1.2,0,Math.PI*2); ctx.fill();

    const orbGrad = ctx.createRadialGradient(-R*0.3,-R*0.3, R*0.2, 0,0, R*pulse);
    orbGrad.addColorStop(0, `hsla(${hue} 90% 80% / .9)`);
    orbGrad.addColorStop(1, `hsla(${hue} 90% 35% / .85)`);
    ctx.fillStyle = orbGrad; ctx.beginPath(); ctx.arc(0,0,R*pulse,0,Math.PI*2); ctx.fill();

    ctx.strokeStyle = `hsla(${hue} 100% 85% / .5)`; ctx.lineWidth = 2*this.state.dpr;
    ctx.beginPath(); ctx.arc(0,0,R*pulse*1.01,0,Math.PI*2); ctx.stroke();

    if(!this._particles){
      this._particles = Array.from({length:64}, ()=>({a:Math.random()*Math.PI*2, r:0.28+Math.random()*0.35, s:0.15+Math.random()*0.5}));
    }
    for(const p of this._particles){
      p.a += 0.002 + p.s*0.0012 + this.state.energy*0.002;
      const rr = R * p.r * (0.95 + 0.1*Math.sin(now*0.001 + p.r*6));
      const x = Math.cos(p.a)*rr, y = Math.sin(p.a)*rr*0.75;
      const size = (1.5 + 2.5*p.s) * this.state.dpr;
      ctx.fillStyle = `hsla(${hue} 95% 92% / ${0.35 + 0.55*this.state.energy})`;
      ctx.beginPath(); ctx.arc(x,y,size,0,Math.PI*2); ctx.fill();
    }

    const bars = [7.83, 14.3, 20.8, 27.3, 33.8];
    const Rb = R*1.05, barW = R*1.6 / bars.length;
    bars.forEach((f, i)=>{
      const amp = 6 + 26 * (0.5 + 0.5*Math.sin(now*0.002 + f*0.13));
      ctx.fillStyle = `hsla(${hue} 90% 70% / .35)`;
      const x = -R*0.8 + i*barW;
      ctx.fillRect(x, Rb, barW*0.7, amp);
    });
    ctx.restore();
  }
  loop(now){
    this.simTick(now);
    this.drawOrb(now);
    requestAnimationFrame(this.loop);
  }
  pushPeak(){
    const picks = [
      {id:'Atlas',  color:'#7EF0A9', emoji:'🧠'},
      {id:'RIA',    color:'#5B8CFF', emoji:'🔮'},
      {id:'Solos',  color:'#FFD166', emoji:'☀️'},
      {id:'Quan',   color:'#22FFD1', emoji:'🛰️'},
      {id:'Coblux', color:'#A77BFF', emoji:'⚡️'}
    ];
    const pick = picks[Math.floor(Math.random()*picks.length)];
    const stripe = document.createElement('div');
    Object.assign(stripe.style, {position:'absolute', bottom:'0', top:'0', left:'100%', width:'3px',
       background:pick.color, opacity:'0.9', boxShadow:'0 0 18px rgba(255,255,255,.18)'});
    this.$.line.appendChild(stripe);

    const ev = new CustomEvent('infodose:pico',{detail:{archetype: pick}});
    document.dispatchEvent(ev);

    const ttl = 12000; const tStart = performance.now();
    const anim = (now)=>{
      const k = Math.min(1, (now - tStart)/ttl);
      stripe.style.left = (100 - 100*k) + '%';
      stripe.style.opacity = (1 - 0.6*k).toFixed(2);
      if(k<1) requestAnimationFrame(anim); else stripe.remove();
    };
    requestAnimationFrame(anim);

    const root = document.documentElement; root.style.transition='filter 1.6s ease';
    root.style.filter='saturate(1.15) brightness(1.05)'; setTimeout(()=>{ root.style.filter='none'; }, 1600);
  }
}
customElements.define('nebula-dashboard', NebulaDashboard);