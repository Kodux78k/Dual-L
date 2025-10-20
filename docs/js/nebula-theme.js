// Nebula Theme Tokens (Blue One, Deep Blue-1, Aurora Light)
export const NebulaTheme = {
  tokens: {
    blueone: {
      '--neb-bg0':'#050A16','--neb-bg1':'#0B1630','--neb-bg2':'#0E2142',
      '--neb-card':'#0F1E3A','--neb-card-high':'#132A54',
      '--neb-accent':'#00C2FF','--neb-accent-2':'#5B8CFF',
      '--neb-teal':'#22FFD1','--neb-purple':'#A77BFF',
      '--neb-text':'#E8F1F2','--neb-muted':'#A3B2C2',
      '--neb-good':'#7EF0A9','--neb-warn':'#FFD166','--neb-bad':'#FF6B6B',
      '--shadow':'0 8px 18px rgba(0,0,0,.45)',
      '--shadow-lg':'0 14px 36px rgba(93,225,245,.18), 0 8px 24px rgba(0,0,0,.55)',
      '--radius-lg':'20px','--radius-md':'14px','--radius-sm':'10px'
    },
    deepblue1: {
      '--neb-bg0':'#030914','--neb-bg1':'#081126','--neb-bg2':'#0a1833',
      '--neb-card':'#0C1A35','--neb-card-high':'#102247',
      '--neb-accent':'#39A7FF','--neb-accent-2':'#0FD1FF',
      '--neb-teal':'#14E1C2','--neb-purple':'#7A6BFF',
      '--neb-text':'#E3ECFF','--neb-muted':'#9CB0C8',
      '--neb-good':'#59E09F','--neb-warn':'#FFC55A','--neb-bad':'#FF5A87',
      '--shadow':'0 10px 22px rgba(0,0,0,.5)',
      '--shadow-lg':'0 18px 44px rgba(40,150,255,.16), 0 12px 28px rgba(0,0,0,.65)',
      '--radius-lg':'22px','--radius-md':'14px','--radius-sm':'10px'
    },
    aurora: {
      '--neb-bg0':'#0B1120','--neb-bg1':'#101a2e','--neb-bg2':'#16233d',
      '--neb-card':'#10203E','--neb-card-high':'#183055',
      '--neb-accent':'#FF91F5','--neb-accent-2':'#79F3FF',
      '--neb-teal':'#6DFFE4','--neb-purple':'#E5A2FF',
      '--neb-text':'#F3F7FF','--neb-muted':'#9FB6C8',
      '--neb-good':'#9AF7BE','--neb-warn':'#FFE08A','--neb-bad':'#FF7C7C',
      '--shadow':'0 8px 18px rgba(0,0,0,.45)',
      '--shadow-lg':'0 16px 40px rgba(255,145,245,.16), 0 10px 24px rgba(0,0,0,.6)',
      '--radius-lg':'20px','--radius-md':'14px','--radius-sm':'10px'
    }
  },
  apply(name){
    const k = (name||'blueone').toLowerCase();
    const tokens = this.tokens[k] || this.tokens.blueone;
    const r = document.documentElement;
    Object.entries(tokens).forEach(([v,val])=> r.style.setProperty(v, val));
    localStorage.setItem('nebula_theme', k);
    const ev = new CustomEvent('nebula:theme-applied',{detail:{theme:k}});
    document.dispatchEvent(ev);
  },
  current(){ return localStorage.getItem('nebula_theme') || 'blueone'; }
};

// Auto-apply saved theme on load
try{
  const t = NebulaTheme.current();
  NebulaTheme.apply(t);
}catch(e){ console.warn('NebulaTheme auto-apply failed', e); }