// Infodose Bridge — escuta picos simbólicos e aplica tema/arquetipo
(function(){
  const map = {
    Atlas:  {hue: 160, color:'#7EF0A9', toast:'Atlas foca e organiza.'},
    RIA:    {hue: 230, color:'#5B8CFF', toast:'RIA intui o próximo passo.'},
    Solos:  {hue: 50,  color:'#FFD166', toast:'Solos ilumina o caminho.'},
    Quan:   {hue: 175, color:'#22FFD1', toast:'Quan sincroniza satélites.'},
    Coblux: {hue: 280, color:'#A77BFF', toast:'Coblux amplifica o pulso.'},
  };
  function toast(msg){
    let el = document.getElementById('infodose-toast');
    if(!el){
      el = document.createElement('div');
      el.id='infodose-toast';
      Object.assign(el.style, {position:'fixed', left:'50%', bottom:'calc(env(safe-area-inset-bottom,0) + 18px)',
        transform:'translateX(-50%)', background:'rgba(10,22,48,.85)', color:'#e8f1f2', border:'1px solid #ffffff33',
        padding:'10px 14px', borderRadius:'12px', font:'600 14px/1.2 system-ui,-apple-system,Segoe UI,Roboto',
        boxShadow:'0 10px 24px rgba(0,0,0,.45), 0 6px 18px rgba(94,220,255,.18)', zIndex:9999, opacity:'0', transition:'opacity .25s'});
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity='1';
    setTimeout(()=>{ el.style.opacity='0'; }, 1800);
  }
  document.addEventListener('infodose:pico', ({detail})=>{
    const a = detail.archetype;
    const m = map[a.id] || {hue: 210, color:'#5B8CFF', toast:(a.id + ' vibra no campo.')};
    document.documentElement.style.setProperty('--orb-hue', m.hue);
    document.documentElement.style.setProperty('--uno-accent', m.color);
    toast(`${a.emoji} ${a.id} · ${m.toast}`);
  });
  document.addEventListener('planet:tick', ({detail})=>{
    document.documentElement.style.setProperty('--energy', (detail.energy||0).toFixed(2));
  });
})();