// crew-sprites.ts — Canvas pixel-art draw functions for all 4 crew members.
// Ported from space-crew-sprites-v2. No OKLCH — all hex / rgba.

export type SpritePose = "idle" | "thinking" | "working" | "sleep" | "walk" | "collab";

const PW = 5, PH = 4;
const GW = 40, GH = 56;
const SPRITE_W = GW * PW;
const SPRITE_H = GH * PH;
const FRAME_W = 320, FRAME_H = 240;
export { FRAME_W, FRAME_H };
const OX = Math.floor((FRAME_W - SPRITE_W) / 2);
const OY = Math.floor((FRAME_H - SPRITE_H) / 2);

function makeDraw(ctx: CanvasRenderingContext2D, fox: number, foy: number) {
  const px = (c: number, r: number, color: string | undefined, cw = 1, ch = 1) => {
    if (!color || color === ".") return;
    ctx.fillStyle = color;
    ctx.fillRect(fox + OX + c * PW, foy + OY + r * PH, cw * PW, ch * PH);
  };
  const line = (c: number, r: number, len: number, color: string | undefined, vert = false) => {
    for (let i = 0; i < len; i++) vert ? px(c, r + i, color) : px(c + i, r, color);
  };
  const rect = (c: number, r: number, w: number, h: number, color: string | undefined) => {
    if (!color) return;
    for (let row = 0; row < h; row++) line(c, r + row, w, color);
  };
  const glow = (c: number, r: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(fox + OX + c * PW, foy + OY + r * PH, w * PW, h * PH);
  };
  return { px, line, rect, glow };
}

function dimHex(col: string, f: number): string {
  if (!col || col[0] !== "#" || col.length < 7) return col;
  const r = parseInt(col.slice(1, 3), 16), g = parseInt(col.slice(3, 5), 16), b = parseInt(col.slice(5, 7), 16);
  return `rgb(${Math.round(r * f)},${Math.round(g * f)},${Math.round(b * f)})`;
}

// ── PALETTES ─────────────────────────────────────────────────────────────────

const PM = {
  fur0:"#5C3A1E",fur1:"#8B5E3C",fur2:"#A0724A",fur3:"#C4956A",
  s0:"#2A1260",s1:"#4C2A8A",s2:"#6B3FBF",s3:"#9B6FE8",sLt:"#C4A0FF",
  g0:"#7A5810",g1:"#B08020",g2:"#D4A830",g3:"#FFD060",gLt:"#FFE898",
  e:"#0A0408",eW:"#F0E8E0",eH:"#FFD4B0",
  sk:"#D4A87A",skD:"#A87850",
  h0:"#1A0C48",h1:"#3A2880",hm:"#60CC60",
  ch0:"#12102A",ch1:"#20183C",ch2:"#2C2250",
  kb0:"#221880",kb1:"#4040B0",kbG:"#8090FF",
  t0:"#3C1C0C",t1:"#5C2C10",t2:"#7C3C18",
  p0:"#7A2828",p1:"#A83A3A",pG:"#CC7020",
  tab0:"#141E30",tab1:"#1E3048",tabG:"#4080CC",
  con0:"#0E0C20",con1:"#1A1638",conG:"#6050D0",
  zz:"#8080C0",
};
const PN = {
  s0:"#080410",s1:"#100820",s2:"#1C1030",s3:"#2C1848",
  tp0:"#2A1440",tp1:"#3C2060",
  pk0:"#660044",pk1:"#AA1077",pk2:"#EE20AA",pk3:"#FF80D0",pkLt:"#FFB8E8",
  sk:"#C49060",skD:"#8C6030",
  e:"#0A0408",eW:"#E8E0F0",
  v0:"#440022",v1:"#880044",v2:"#CC1166",v3:"#FF3399",
  sc0:"#8070A0",sc1:"#C0B0D8",sc2:"#E8E0F8",
  bt0:"#080410",bt1:"#140C24",
  con0:"#080414",con1:"#100820",conP:"#EE20AA",
  hl0:"#1A0028",hl1:"#EE20AA",hl2:"#FF80D0",
  zz:"#906090",
  bl0:"#0C0818",bl1:"#180C28",blP:"#AA1077",
};
const PE = {
  c0:"#0E1A20",c1:"#1C2C38",c2:"#2A4050",c3:"#3A5868",
  cy0:"#005060",cy1:"#008090",cy2:"#00B8C8",cy3:"#30E0F0",cyLt:"#90FFFF",
  og0:"#602C08",og1:"#904010",og2:"#C86020",og3:"#F09840",ogG:"#FFD090",
  sk:"#D0906A",skD:"#A06840",
  e:"#0A0408",eW:"#F0E8E0",
  bt0:"#101818",bt1:"#202828",
  cr0:"#1E2816",cr1:"#2E3C22",cr2:"#3E5030",crL:"#506040",
  mg0:"#3C2418",mg1:"#5C3820",mgH:"#B06030",
  bh0:"#181E1C",bh1:"#283030",
  wr0:"#484840",wr1:"#686860",wrH:"#9090A0",
  sp0:"#FF6000",sp1:"#FFAA00",sp2:"#FFFFFF",
  bl0:"#101418",bl1:"#182028",blG:"#00B8C8",
  rl0:"#3C2C1C",rl1:"#5C4428",
  gr:"#1C2428",
  hl0:"#001018",hl1:"#00B8C8",hl2:"#80F0FF",
  zz:"#5080A0",
  tb0:"#0E1828",tb1:"#162238",tbG:"#30D8F0",
  blt:"#281C08",blt2:"#403010",pch:"#362210",
};
const PA = {
  r0:"#180C04",r1:"#2C1808",r2:"#4A2C10",r3:"#6A4018",rLt:"#8A5820",
  am0:"#5C3808",am1:"#8A5810",am2:"#C08020",am3:"#E8AA30",amLt:"#FFD060",
  cr0:"#F0E4C0",cr1:"#F8F0DC",
  sk:"#D4B896",skD:"#A48060",
  e:"#0A0408",eW:"#F0ECD8",
  gl0:"#4A2C0C",gl1:"#7A4C18",glL:"#C09040",
  bk0:"#100808",bk1:"#201010",bkP:"#F0E8D0",bkT:"#C0A060",
  ch0:"#100804",ch1:"#1C1008",ch2:"#281808",
  cx0:"#E09020",cx1:"#FFB830",cx2:"#FFF0A0",
  cxB:"#FF6010",cxC:"#60A0FF",
  dt0:"#C08020",dt1:"#E8A820",dtG:"#FFF080",
  tm0:"#100804",tm1:"#201008",tmG:"#C08020",
  zz:"#C0A050",
  tc:"#FFB830",
  hl0:"#180C00",hl1:"#C08020",hl2:"#FFD060",
};

// ── 🐒 SPACE MONKEY ────────────────────────────────────────────────────────

export function drawMonkey(ctx: CanvasRenderingContext2D, pose: SpritePose, fox: number, foy: number, t: number) {
  const { px, line, rect, glow } = makeDraw(ctx, fox, foy);
  const sl = pose === "sleep";
  const f = sl ? 0.45 : 1;
  const c = (col: string) => sl ? dimHex(col, f) : col;
  const bob = pose === "idle" ? Math.round(Math.sin(t * 0.08) * 0.8) : 0;
  const seated = pose === "idle" || pose === "sleep" || pose === "working";
  const bY = seated ? 26 + bob : 22;
  const hY = seated ? 13 + bob : 9;

  if (seated) {
    rect(4, hY+14, 5, 28, c(PM.ch1)); rect(5, hY+15, 3, 26, c(PM.ch0));
    rect(31, hY+14, 5, 28, c(PM.ch1)); rect(32, hY+15, 3, 26, c(PM.ch0));
    line(4, hY+14, 32, c(PM.ch2));
    rect(4, 40+bob, 32, 5, c(PM.ch1)); rect(6, 41+bob, 28, 3, c(PM.ch0));
    rect(6, 44+bob, 3, 10, c(PM.ch1)); rect(31, 44+bob, 3, 10, c(PM.ch1));
    rect(0, 35+bob, 10, 4, c(PM.con1)); rect(1, 33+bob, 8, 4, c(PM.con0));
    rect(30, 35+bob, 10, 4, c(PM.con1)); rect(31, 33+bob, 8, 4, c(PM.con0));
    if (!sl) { line(1, 32+bob, 6, PM.conG); line(33, 32+bob, 6, PM.conG); }
  }

  if (pose === "idle") {
    for (let i=0;i<5;i++) { px(34+i, 33+i+bob, c(PM.t2)); px(35+i, 33+i+bob, c(PM.t1)); }
    rect(35, 38+bob, 3, 3, c(PM.t0));
  } else if (pose === "thinking") {
    line(27, 17, 6, PM.t2); px(27, 18, PM.t1); px(26, 19, PM.t2); px(26, 20, PM.t1);
    px(27, 21, PM.t2); px(28, 21, PM.t1); px(29, 20, PM.t2); px(30, 19, PM.t1);
    px(31, 18, PM.t2); px(31, 17, PM.t1); px(30, 16, PM.t2);
    rect(28, 23, 2, 2, PM.t0);
  } else if (pose === "working") {
    px(33, 28+bob, c(PM.t2)); px(34, 30+bob, c(PM.t1)); px(35, 31+bob, c(PM.t2));
    px(36, 30+bob, c(PM.t1)); px(37, 28+bob, c(PM.t2)); px(38, 26+bob, c(PM.t1));
    px(38, 24+bob, c(PM.t2));
  } else if (pose === "sleep") {
    for (let i=0;i<6;i++) px(33+Math.round(i*0.5), 34+i, c(PM.t1));
    px(34, 40, c(PM.t0));
  } else if (pose === "walk") {
    px(32,28,PM.t2); px(33,27,PM.t1); px(34,26,PM.t2); px(35,25,PM.t1);
    px(36,24,PM.t2); px(37,23,PM.t1); px(38,22,PM.t0);
  } else {
    px(31,24,PM.t2); px(32,23,PM.t1); px(33,22,PM.t2); px(34,21,PM.t1);
    px(35,20,PM.t2); px(36,19,PM.t1); px(37,18,PM.t0);
  }

  rect(14, bY, 12, 14, c(PM.s1)); rect(15, bY+1, 10, 12, c(PM.s0));
  line(14, bY, 12, c(PM.s2)); line(15, bY+1, 3, c(PM.s3));
  line(14, bY, 12, c(PM.g2));
  line(14, bY+13, 12, c(PM.g1)); line(15, bY+14, 10, c(PM.g2));
  rect(16, bY+3, 4, 4, c(PM.p0)); rect(17, bY+4, 2, 2, c(PM.pG));
  rect(23, bY+3, 3, 4, c(PM.s2));

  if (pose === "idle") {
    rect(10, bY+2, 5, 9, c(PM.s1)); rect(11, bY+3, 3, 7, c(PM.s0));
    rect(10, bY+10, 4, 4, c(PM.fur2));
    rect(25, bY+2, 5, 8, c(PM.s1)); rect(26, bY+3, 3, 6, c(PM.s0));
    rect(25, bY+9, 4, 4, c(PM.fur2));
  } else if (pose === "thinking") {
    rect(10, bY+2, 5, 11, PM.s1); rect(11, bY+3, 3, 9, PM.s0);
    rect(10, bY+12, 5, 4, PM.fur2);
    rect(25, bY+2, 5, 8, PM.s1); rect(26, bY+3, 3, 6, PM.s0);
    rect(25, bY+9, 4, 4, PM.fur2);
  } else if (pose === "working") {
    rect(9, bY+4, 6, 9, c(PM.s1)); rect(10, bY+5, 4, 7, c(PM.s0));
    rect(9, bY+12, 5, 4, c(PM.fur2));
    rect(25, bY+4, 6, 9, c(PM.s1)); rect(26, bY+5, 4, 7, c(PM.s0));
    rect(25, bY+12, 5, 4, c(PM.fur2));
  } else if (pose === "sleep") {
    rect(9, bY+3, 6, 12, c(PM.s1)); rect(25, bY+3, 6, 12, c(PM.s1));
  } else if (pose === "walk") {
    rect(9, bY+2, 5, 10, PM.s1); rect(10, bY+3, 3, 8, PM.s0);
    rect(9, bY+11, 4, 4, PM.fur2);
    rect(4, bY+4, 6, 8, PM.tab0); rect(5, bY+5, 4, 6, PM.tab1);
    line(5, bY+6, 4, PM.tabG); line(5, bY+8, 4, PM.tabG);
    rect(25, bY+4, 5, 9, PM.s1); rect(26, bY+5, 3, 7, PM.s0);
    rect(25, bY+12, 4, 4, PM.fur2);
  } else {
    rect(8, bY+2, 5, 8, PM.s1);
    line(5, bY+8, 6, PM.s1); rect(4, bY+7, 4, 4, PM.fur2);
    rect(25, bY+2, 5, 9, PM.s1); rect(26, bY+3, 3, 7, PM.s0);
    rect(25, bY+10, 4, 4, PM.fur2);
  }

  if (seated) {
    rect(15, bY+15, 4, 5, c(PM.s1)); rect(16, bY+16, 2, 3, c(PM.s0));
    rect(21, bY+15, 4, 5, c(PM.s1)); rect(22, bY+16, 2, 3, c(PM.s0));
    rect(15, bY+19, 4, 4, c(PM.s0)); line(15, bY+22, 4, c(PM.g1));
    rect(21, bY+19, 4, 4, c(PM.s0)); line(21, bY+22, 4, c(PM.g1));
  } else if (pose === "walk") {
    rect(15, bY+15, 4, 12, PM.s1); rect(16, bY+16, 2, 10, PM.s0);
    rect(15, bY+26, 5, 4, PM.s0); line(15, bY+29, 5, PM.g1);
    rect(21, bY+15, 4, 10, PM.s1); rect(22, bY+16, 2, 8, PM.s0);
    rect(21, bY+24, 5, 4, PM.s0); line(21, bY+27, 5, PM.g1);
  } else {
    rect(15, bY+15, 4, 13, PM.s1); rect(16, bY+16, 2, 11, PM.s0);
    rect(21, bY+15, 4, 13, PM.s1); rect(22, bY+16, 2, 11, PM.s0);
    rect(15, bY+27, 5, 4, PM.s0); line(15, bY+30, 5, PM.g1);
    rect(21, bY+27, 5, 4, PM.s0); line(21, bY+30, 5, PM.g1);
  }

  if (pose === "working") {
    rect(8, bY+16, 24, 4, c(PM.kb0)); rect(9, bY+15, 22, 4, c(PM.kb1));
    for (let i=0;i<7;i++) { px(10+i*3, bY+15, c(PM.kbG)); }
    glow(14, bY, 12, 7, "rgba(120,80,255,0.22)");
    glow(15, bY-3, 10, 4, "rgba(120,80,255,0.16)");
    px(12, bY-2, c(PM.hm));
  }
  if (pose === "collab") {
    rect(0, 14, 9, 18, PM.con1); rect(1, 15, 7, 16, PM.con0);
    for (let i=0;i<3;i++) line(2, 16+i*5, 5, PM.conG);
    px(4, 28, PM.g2); px(3, 30, PM.g1); px(5, 30, PM.g1);
    rect(0, 31, 9, 2, PM.ch2);
  }

  rect(14, hY, 12, 12, c(PM.fur2));
  rect(13, hY+1, 14, 10, c(PM.fur2));
  rect(14, hY-1, 12, 2, c(PM.fur1));
  rect(15, hY+3, 10, 6, c(PM.fur3));
  rect(12, hY+3, 3, 5, c(PM.fur2)); px(13, hY+4, c(PM.fur3)); px(13, hY+5, c(PM.fur3));
  rect(25, hY+3, 3, 5, c(PM.fur2)); px(26, hY+4, c(PM.fur3)); px(26, hY+5, c(PM.fur3));
  if (sl) {
    line(15, hY+5, 4, c(PM.fur0)); px(16, hY+6, c(PM.fur0));
    line(21, hY+5, 4, c(PM.fur0)); px(22, hY+6, c(PM.fur0));
  } else {
    rect(15, hY+4, 4, 4, c(PM.eW)); rect(21, hY+4, 4, 4, c(PM.eW));
    const pOff = pose==="thinking" ? 1 : 0;
    rect(16+pOff, hY+5, 2, 2, c(PM.e)); rect(22+pOff, hY+5, 2, 2, c(PM.e));
    px(16+pOff, hY+5, c(PM.eH));
    line(15, hY+3, 4, c(PM.fur0)); line(21, hY+3, 4, c(PM.fur0));
    if (pose==="thinking") { px(18, hY+3, c(PM.fur0)); px(24, hY+3, c(PM.fur0)); }
  }
  rect(16, hY+8, 8, 4, c(PM.fur3)); rect(17, hY+9, 6, 3, c(PM.sk));
  px(18, hY+8, c(PM.fur0)); px(19, hY+8, c(PM.fur0));
  if (pose==="collab") {
    rect(17, hY+11, 6, 2, c(PM.fur0)); rect(18, hY+11, 4, 2, c(PM.e));
  } else if (!sl) {
    line(17, hY+11, 6, c(PM.fur0));
  }

  line(14, hY, 12, c(PM.h0));
  rect(12, hY+2, 3, 4, c(PM.h0)); rect(25, hY+2, 3, 4, c(PM.h0));
  rect(13, hY+3, 2, 3, c(PM.h1)); rect(26, hY+3, 2, 3, c(PM.h1));
  rect(11, hY+5, 2, 4, c(PM.h0));
  rect(10, hY+8, 3, 2, c(PM.h0));
  if (!sl) px(10, hY+9, PM.hm);
  glow(26, hY+3, 3, 4, "rgba(160,120,255,0.55)");
  glow(26, hY+3, 3, 2, "rgba(190,160,255,0.35)");

  if (sl) {
    px(22, hY-3, c(PM.zz)); line(23, hY-5, 3, c(PM.zz)); px(23, hY-4, c(PM.zz)); px(25, hY-4, c(PM.zz));
    rect(26, hY-8, 4, 2, c(PM.zz)); px(26, hY-7, c(PM.zz)); px(29, hY-7, c(PM.zz));
  }
}

// ── 🥷 LIFE SUPPORT NINJA ─────────────────────────────────────────────────

export function drawNinja(ctx: CanvasRenderingContext2D, pose: SpritePose, fox: number, foy: number, t: number) {
  const { px, line, rect, glow } = makeDraw(ctx, fox, foy);
  const sl = pose === "sleep";
  const f = sl ? 0.45 : 1;
  const c = (col: string) => sl ? dimHex(col, f) : col;
  const bob = pose === "idle" ? Math.round(Math.sin(t * 0.07) * 0.6) : 0;
  const visorOn = !sl && (pose !== "idle");
  const visorCol = sl ? PN.v0 : visorOn ? PN.v3 : PN.v1;
  const bY = 22;
  const hY = 11;

  if (pose === "idle") {
    rect(1, 10+bob, 6, 30, c(PN.bl1)); rect(2, 11+bob, 4, 28, c(PN.bl0));
    for (let i=0;i<4;i++) line(2, 13+bob+i*6, 4, c(PN.blP));
    if (!sl) glow(1, 12+bob, 4, 20, "rgba(200,20,100,0.12)");
  }

  const sf = pose === "walk" ? Math.round(Math.sin(t*0.1)*1.5) : 0;
  if (pose === "idle" || pose === "sleep") {
    rect(20, 20+bob, 4, 16, c(PN.sc2)); rect(21, 21+bob, 2, 14, c(PN.sc1)); rect(19, 22+bob, 2, 10, c(PN.sc1));
  } else if (pose === "walk") {
    rect(22, 18, 3, 8, PN.sc2); rect(23, 19+sf, 4, 6, PN.sc1); rect(25, 17-sf, 5, 5, PN.sc0);
  } else if (pose === "working") {
    rect(21, 18, 3, 10, c(PN.sc2)); rect(22, 19, 2, 8, c(PN.sc1));
    rect(18, 22, 3, 6, c(PN.sc0));
  } else {
    rect(21, 18, 4, 10, PN.sc2); rect(22, 19, 2, 8, PN.sc1);
  }

  rect(14, bY, 12, 18, c(PN.s2)); rect(15, bY+1, 10, 16, c(PN.s1));
  line(15, bY+2, 10, c(PN.pk1));
  rect(16, bY+5, 8, 2, c(PN.pk0));
  rect(19, bY+1, 2, 14, c(PN.tp1));

  if (pose === "idle") {
    rect(10, bY+4, 5, 8, c(PN.s2)); rect(25, bY+4, 5, 8, c(PN.s2));
    rect(11, bY+10, 14, 4, c(PN.s1)); rect(12, bY+11, 12, 2, c(PN.tp0));
    rect(10, bY+11, 4, 4, c(PN.s1)); rect(25, bY+11, 4, 4, c(PN.s1));
  } else if (pose === "thinking") {
    rect(9, bY+2, 5, 14, PN.s2); rect(10, bY+3, 3, 12, PN.s1);
    rect(9, bY+15, 5, 4, PN.s1);
    rect(0, bY+2, 9, 13, PN.hl0);
    glow(0, bY+2, 9, 13, "rgba(200,20,100,0.18)");
    line(1, bY+7, 7, PN.hl2);
    px(2, bY+6, PN.hl1); px(4, bY+5, PN.hl1); px(5, bY+7, PN.hl1);
    line(1, bY+12, 7, PN.hl1); px(4, bY+11, PN.pk3);
    rect(25, bY+4, 5, 12, PN.s2); rect(26, bY+5, 3, 10, PN.s1); rect(25, bY+15, 4, 4, PN.s1);
  } else if (pose === "working") {
    rect(8, bY+6, 6, 10, c(PN.s2)); rect(9, bY+7, 4, 8, c(PN.s1)); rect(8, bY+15, 5, 4, c(PN.s1));
    rect(26, bY+6, 6, 10, c(PN.s2)); rect(27, bY+7, 4, 8, c(PN.s1)); rect(26, bY+15, 5, 4, c(PN.s1));
  } else if (pose === "walk") {
    rect(9, bY+2, 5, 12, PN.s2); rect(10, bY+3, 3, 10, PN.s1); rect(9, bY+13, 4, 4, PN.s1);
    rect(25, bY+4, 5, 10, PN.s2); rect(26, bY+5, 3, 8, PN.s1); rect(25, bY+13, 4, 4, PN.s1);
  } else if (pose === "collab") {
    line(6, bY+8, 8, PN.s2); rect(4, bY+7, 5, 4, PN.s1);
    rect(25, bY+4, 5, 10, PN.s2); rect(26, bY+5, 3, 8, PN.s1); rect(25, bY+13, 4, 4, PN.s1);
  } else {
    rect(10, bY+4, 5, 8, c(PN.s2)); rect(25, bY+4, 5, 8, c(PN.s2));
    rect(11, bY+10, 14, 4, c(PN.s1));
    rect(10, bY+11, 4, 4, c(PN.s1)); rect(25, bY+11, 4, 4, c(PN.s1));
  }

  rect(14, bY+18, 12, 3, c(PN.bl0)); line(15, bY+19, 10, c(PN.bl1));
  rect(15, bY+18, 3, 5, c(PN.tp0)); px(16, bY+19, c(PN.tp1));
  rect(22, bY+18, 3, 5, c(PN.tp0)); px(23, bY+19, c(PN.tp1));

  if (pose === "walk") {
    rect(15, bY+21, 4, 13, PN.s2); rect(16, bY+22, 2, 11, PN.s1);
    rect(15, bY+33, 5, 4, PN.bt0); line(15, bY+36, 5, PN.bt1);
    rect(21, bY+21, 4, 10, PN.s2); rect(22, bY+22, 2, 8, PN.s1);
    rect(21, bY+30, 5, 4, PN.bt0); line(21, bY+33, 5, PN.bt1);
  } else {
    rect(15, bY+21, 4, 14, c(PN.s2)); rect(16, bY+22, 2, 12, c(PN.s1));
    rect(21, bY+21, 4, 14, c(PN.s2)); rect(22, bY+22, 2, 12, c(PN.s1));
    rect(15, bY+34, 5, 4, c(PN.bt0)); rect(21, bY+34, 5, 4, c(PN.bt0));
  }

  if (pose === "working") {
    rect(7, bY+20, 26, 5, c(PN.bl0)); rect(8, bY+18, 24, 5, c(PN.bl1));
    for (let i=0;i<6;i++) { px(9+i*4, bY+17, c(PN.pk2)); rect(10+i*4, bY+18, 2, 2, c(PN.pk0)); }
    if (!sl) {
      glow(14, bY+13, 12, 6, "rgba(220,30,120,0.2)");
      glow(15, bY+7, 10, 8, "rgba(200,20,100,0.12)");
    }
  }
  if (pose === "collab") {
    rect(0, 12, 10, 24, PN.bl1); rect(1, 13, 8, 22, PN.bl0);
    for (let i=0;i<5;i++) line(2, 14+i*4, 6, PN.blP);
    rect(0, 35, 10, 3, PN.bt0);
  }

  rect(14, hY, 12, 11, c(PN.sk));
  rect(13, hY+1, 14, 9, c(PN.sk));
  rect(14, hY-1, 12, 2, c(PN.sk));
  rect(13, hY-1, 14, 7, c(PN.s1)); rect(14, hY-2, 12, 7, c(PN.s2));
  rect(15, hY-3, 10, 6, c(PN.s1)); rect(16, hY-4, 8, 5, c(PN.tp0));
  rect(12, hY+4, 3, 7, c(PN.s1)); rect(25, hY+4, 3, 7, c(PN.s1));
  rect(14, hY+4, 12, 3, c(visorCol));
  line(15, hY+4, 10, c(sl ? PN.v0 : visorOn ? PN.pk3 : PN.v2));
  if (visorOn) glow(13, hY+3, 14, 5, "rgba(220,30,120,0.22)");
  if (pose === "walk") glow(13, hY+3, 14, 5, `rgba(220,30,120,${0.12+0.1*Math.sin(t*0.15)})`);
  if (sl) {
    line(16, hY+3, 4, c(PN.s0)); line(21, hY+3, 4, c(PN.s0));
  } else {
    rect(16, hY+2, 4, 3, c(PN.eW)); rect(21, hY+2, 4, 3, c(PN.eW));
    rect(17, hY+3, 2, 2, c(PN.e)); rect(22, hY+3, 2, 2, c(PN.e));
    line(16, hY+2, 4, c(PN.s0)); line(21, hY+2, 4, c(PN.s0));
  }
  rect(14, hY+7, 12, 5, c(PN.s2)); rect(15, hY+8, 10, 3, c(PN.s1));
  line(16, hY+9, 8, c(PN.tp0));

  if (sl) {
    px(22, hY-4, c(PN.zz)); line(23, hY-6, 3, c(PN.zz)); px(23, hY-5, c(PN.zz)); px(25, hY-5, c(PN.zz));
    rect(26, hY-9, 4, 2, c(PN.zz)); px(26, hY-8, c(PN.zz)); px(29, hY-8, c(PN.zz));
  }
}

// ── 🔧 SYSTEMS ENGINEER ──────────────────────────────────────────────────

export function drawEngineer(ctx: CanvasRenderingContext2D, pose: SpritePose, fox: number, foy: number, t: number) {
  const { px, line, rect, glow } = makeDraw(ctx, fox, foy);
  const sl = pose === "sleep";
  const f = sl ? 0.45 : 1;
  const c = (col: string) => sl ? dimHex(col, f) : col;
  const gogDown = pose === "working";
  const seated = pose === "idle" || pose === "sleep";
  const bY = seated ? 29 : 22;
  const hY = seated ? 16 : 9;

  if (seated) {
    rect(9, 38, 22, 13, c(PE.cr1)); rect(10, 39, 20, 11, c(PE.cr0));
    line(10, 45, 20, c(PE.cr2)); px(19, 45, c(PE.crL));
    line(9, 38, 22, c(PE.cr1));
    px(11, 40, c(PE.crL)); px(28, 40, c(PE.crL)); px(11, 49, c(PE.crL)); px(28, 49, c(PE.crL));
  }
  if (pose === "working") {
    rect(2, 39, 36, 5, c(PE.bh1)); rect(3, 37, 34, 5, c(PE.bh0));
    if (!sl) glow(3, 36, 34, 3, "rgba(0,184,200,0.2)");
    rect(25, 34, 5, 4, c(PE.mg0)); rect(26, 33, 3, 2, c(PE.mg1)); rect(29, 36, 2, 2, c(PE.mg0));
  }
  if (sl) {
    rect(3, 39, 34, 5, c(PE.bh1)); rect(4, 37, 32, 5, c(PE.bh0));
    rect(26, 36, 4, 3, c(PE.mg0)); rect(27, 35, 2, 2, c(PE.mg1));
    glow(22, 39, 8, 2, "rgba(100,60,30,0.35)");
  }

  rect(13, bY, 14, 16, c(PE.c2)); rect(14, bY+1, 12, 14, c(PE.c1));
  line(14, bY, 12, c(PE.c3));
  line(14, bY+1, 4, c(PE.cy2));
  rect(12, bY+3, 2, 4, c(PE.c3)); rect(26, bY+3, 2, 4, c(PE.c3));
  line(14, bY+2, 12, c(PE.cy1));
  px(17, bY+6, c(PE.gr)); px(21, bY+4, c(PE.gr)); px(23, bY+9, c(PE.gr));

  if (pose === "idle") {
    rect(9, bY+2, 5, 9, c(PE.c2)); rect(10, bY+3, 3, 7, c(PE.c1));
    rect(9, bY+10, 5, 4, c(PE.sk));
    rect(5, bY+12, 5, 3, c(PE.rl0)); rect(6, bY+13, 3, 2, c(PE.rl1));
    rect(26, bY+2, 5, 9, c(PE.c2)); rect(27, bY+3, 3, 7, c(PE.c1)); rect(26, bY+10, 5, 4, c(PE.sk));
    rect(30, bY+8, 4, 6, c(PE.mg0)); rect(31, bY+7, 2, 2, c(PE.mg1)); rect(33, bY+10, 2, 3, c(PE.mg0));
    if (!sl) { px(31, bY+5, "rgba(200,200,200,0.5)"); px(33, bY+4, "rgba(200,200,200,0.4)"); }
  } else if (pose === "thinking") {
    rect(9, bY+2, 5, 11, PE.c2); rect(10, bY+3, 3, 9, PE.c1);
    rect(9, bY+12, 5, 4, PE.sk);
    rect(26, bY+2, 5, 8, PE.c2); rect(27, bY+3, 3, 6, PE.c1); rect(26, bY+9, 4, 4, PE.sk);
    rect(0, bY-6, 12, 18, PE.hl0);
    glow(0, bY-6, 12, 18, "rgba(0,184,200,0.14)");
    for (let i=0;i<4;i++) line(1, bY-4+i*4, 10, PE.hl2);
    rect(1, bY-4, 5, 4, "rgba(0,184,200,0.35)"); rect(6, bY+4, 4, 4, "rgba(0,184,200,0.35)");
    glow(14, bY-6, 12, 8, "rgba(0,184,200,0.14)");
  } else if (pose === "working") {
    rect(8, bY+4, 6, 10, c(PE.c2)); rect(9, bY+5, 4, 8, c(PE.c1)); rect(8, bY+13, 5, 4, c(PE.sk));
    rect(26, bY+4, 6, 10, c(PE.c2)); rect(27, bY+5, 4, 8, c(PE.c1)); rect(26, bY+13, 5, 4, c(PE.sk));
    const sparks = [PE.sp0, PE.sp1, PE.sp2];
    for (let i=0;i<7;i++) {
      const sx = 14+Math.round(Math.sin(t*0.25+i*0.9)*5);
      const sy = bY+14+Math.round(Math.cos(t*0.3+i)*2);
      px(sx, sy, c(sparks[i%3]));
    }
    glow(14, bY, 12, 7, "rgba(0,184,200,0.18)");
  } else if (pose === "walk") {
    rect(9, bY+2, 5, 10, PE.c2); rect(10, bY+3, 3, 8, PE.c1); rect(9, bY+11, 4, 4, PE.sk);
    rect(4, bY+5, 3, 14, PE.wr1); rect(3, bY+5, 5, 4, PE.wrH); rect(3, bY+6, 2, 2, PE.c1);
    rect(26, bY+4, 5, 9, PE.c2); rect(27, bY+5, 3, 7, PE.c1); rect(26, bY+12, 4, 4, PE.sk);
    rect(30, bY+7, 6, 8, PE.tb0); rect(31, bY+8, 4, 6, PE.tb1); line(31, bY+10, 4, PE.tbG);
  } else if (pose === "collab") {
    rect(8, bY+2, 5, 8, PE.c2);
    line(3, bY+8, 7, PE.c2); rect(2, bY+7, 4, 4, PE.sk);
    rect(0, bY+2, 3, 14, PE.wr1); rect(0, bY+2, 5, 4, PE.wrH);
    rect(26, bY+2, 5, 9, PE.c2); rect(27, bY+3, 3, 7, PE.c1); rect(26, bY+10, 4, 4, PE.sk);
  } else {
    rect(9, bY+4, 6, 10, c(PE.c2)); rect(26, bY+4, 6, 10, c(PE.c2));
    rect(9, bY+13, 20, 5, c(PE.c2));
  }

  rect(13, bY+16, 14, 3, c(PE.blt)); line(14, bY+17, 12, c(PE.blt2));
  for (let i=0;i<4;i++) { rect(14+i*3, bY+15, 2, 5, c(PE.pch)); px(15+i*3, bY+16, c(PE.cy0)); }
  rect(23, bY+15, 2, 5, c(PE.wr1)); rect(23, bY+14, 2, 2, c(PE.wr0));

  if (seated) {
    rect(15, bY+19, 4, 7, c(PE.c2)); rect(16, bY+20, 2, 5, c(PE.c1));
    rect(21, bY+19, 4, 7, c(PE.c2)); rect(22, bY+20, 2, 5, c(PE.c1));
    rect(15, bY+25, 5, 4, c(PE.bt0)); rect(21, bY+25, 5, 4, c(PE.bt0));
  } else if (pose === "walk") {
    rect(15, bY+19, 4, 13, PE.c2); rect(16, bY+20, 2, 11, PE.c1);
    rect(15, bY+31, 5, 4, PE.bt0);
    rect(21, bY+19, 4, 10, PE.c2); rect(22, bY+20, 2, 8, PE.c1);
    rect(21, bY+28, 5, 4, PE.bt0);
  } else {
    rect(15, bY+19, 4, 13, PE.c2); rect(16, bY+20, 2, 11, PE.c1);
    rect(21, bY+19, 4, 13, PE.c2); rect(22, bY+20, 2, 11, PE.c1);
    rect(15, bY+31, 5, 4, PE.bt0); rect(21, bY+31, 5, 4, PE.bt0);
  }

  rect(13, hY, 14, 12, c(PE.sk)); rect(14, hY-1, 12, 14, c(PE.sk));
  rect(15, hY-2, 10, 16, c(PE.sk));
  rect(14, hY-2, 12, 3, c(PE.c1)); rect(15, hY-3, 10, 3, c(PE.c2)); px(13, hY-1, c(PE.c1));
  if (sl) {
    line(15, hY+5, 5, c(PE.skD)); px(16, hY+6, c(PE.skD));
    line(22, hY+5, 5, c(PE.skD)); px(23, hY+6, c(PE.skD));
  } else {
    rect(15, hY+4, 5, 4, c(PE.eW)); rect(22, hY+4, 5, 4, c(PE.eW));
    rect(16, hY+5, 2, 2, c(PE.e)); rect(23, hY+5, 2, 2, c(PE.e));
    px(16, hY+5, c(PE.og3));
    if (pose==="working") { line(15, hY+4, 5, c(PE.skD)); line(22, hY+4, 5, c(PE.skD)); }
  }
  px(18, hY+8, c(PE.skD)); px(19, hY+8, c(PE.skD));
  if (pose==="collab") { line(16, hY+10, 7, c(PE.skD)); px(17, hY+11, c(PE.skD)); px(21, hY+11, c(PE.skD)); }
  else if (!sl) line(17, hY+10, 5, c(PE.skD));

  const gY = gogDown ? hY+4 : hY-1;
  line(12, gY, 17, c(PE.og0));
  rect(14, gY, 5, 5, c(PE.og1)); rect(23, gY, 5, 5, c(PE.og1));
  rect(15, gY+1, 3, 3, c(PE.og3)); rect(24, gY+1, 3, 3, c(PE.og3));
  px(25, gY+1, c(PE.og0)); px(26, gY+2, c(PE.og0));
  line(19, gY+2, 4, c(PE.og0));
  if (gogDown && !sl) {
    glow(15, gY+1, 3, 3, "rgba(0,184,200,0.55)");
    glow(24, gY+1, 3, 3, "rgba(0,184,200,0.5)");
    glow(14, gY, 14, 6, "rgba(0,184,200,0.15)");
  }

  if (pose === "collab") {
    rect(0, 8, 12, 22, PE.hl0);
    glow(0, 8, 12, 22, "rgba(0,184,200,0.12)");
    for (let i=0;i<5;i++) line(1, 9+i*4, 10, PE.hl2);
    rect(1, 9, 5, 4, "rgba(0,184,200,0.35)"); rect(6, 21, 4, 4, "rgba(0,184,200,0.35)");
    rect(0, 29, 12, 2, PE.bh1);
  }

  if (sl) {
    px(22, hY-4, c(PE.zz)); line(23, hY-7, 3, c(PE.zz)); px(23, hY-6, c(PE.zz)); px(25, hY-6, c(PE.zz));
    rect(26, hY-10, 4, 2, c(PE.zz)); px(26, hY-9, c(PE.zz)); px(29, hY-9, c(PE.zz));
  }
}

// ── 📚 STATION ARCHIVIST ─────────────────────────────────────────────────

export function drawArchivist(ctx: CanvasRenderingContext2D, pose: SpritePose, fox: number, foy: number, t: number) {
  const { px, line, rect, glow } = makeDraw(ctx, fox, foy);
  const sl = pose === "sleep";
  const f = sl ? 0.42 : 1;
  const c = (col: string) => sl ? dimHex(col, f) : col;
  const bob = pose === "idle" ? Math.round(Math.sin(t * 0.05) * 0.7) : 0;
  const seated = pose === "idle" || pose === "sleep";
  const bY = seated ? 24 + bob : (pose === "working" ? 20 : 20);
  const hY = seated ? 12 + bob : 8;
  const glassGlow = (pose==="working"||pose==="collab") ? PA.am3 : PA.cxC;

  function crystal(cx: number, cy: number, col: string, bright: string) {
    rect(cx, cy, 2, 2, c(col)); if (!sl) px(cx, cy, bright);
  }
  if (pose === "idle") {
    const a = t * 0.04;
    const offsets: [number,number][] = [[Math.cos(a)*8, Math.sin(a)*4],[Math.cos(a+1.57)*8, Math.sin(a+1.57)*4],
     [Math.cos(a+3.14)*8, Math.sin(a+3.14)*4],[Math.cos(a+4.71)*8, Math.sin(a+4.71)*4]];
    const cols = [PA.cx0,PA.cx1,PA.cxB,PA.cxC];
    offsets.forEach(([dx,dy],i) => crystal(Math.round(20+dx), Math.round(22+dy+bob), cols[i], PA.cx2));
  } else if (pose === "working") {
    const a = t * 0.12;
    for (let i=0;i<5;i++) {
      const angle = a + i*1.26;
      crystal(Math.round(20+Math.cos(angle)*10), Math.round(20+Math.sin(angle)*5), PA.cx0, PA.cx2);
    }
  } else if (sl) {
    const slOff: [number,number][] = [[-7,1],[7,-2],[-4,6],[9,3]];
    const cols = [PA.cx0,PA.cx1,PA.cxB,PA.cxC];
    slOff.forEach(([dx,dy],i) => crystal(20+dx, 22+dy, cols[i], PA.cx2));
  }

  if (seated) {
    rect(8, hY+12, 24, 40, c(PA.ch2)); rect(9, hY+13, 22, 38, c(PA.ch1));
    rect(10, hY+14, 20, 36, c(PA.r1));
    line(8, hY+12, 24, c(PA.am1)); line(8, hY+51, 24, c(PA.am1));
    rect(8, hY+13, 2, 38, c(PA.am0)); rect(30, hY+13, 2, 38, c(PA.am0));
    rect(10, hY+51, 3, 5, c(PA.ch2)); rect(27, hY+51, 3, 5, c(PA.ch2));
  }

  if (pose === "working") {
    rect(1, 34, 38, 8, PA.tm1); rect(2, 32, 36, 6, PA.tm0);
    glow(3, 31, 34, 4, "rgba(192,128,32,0.18)");
    rect(4, 28, 32, 4, PA.hl0); line(4, 29, 32, PA.tmG);
  }

  rect(12, bY, 16, 20, c(PA.r2)); rect(13, bY+1, 14, 18, c(PA.r1));
  rect(14, bY+2, 12, 16, c(PA.r3));
  rect(12, bY+2, 2, 18, c(PA.am1)); rect(26, bY+2, 2, 18, c(PA.am1));
  rect(16, bY+3, 8, 2, c(PA.am2)); rect(17, bY+5, 6, 2, c(PA.am1)); px(19, bY+7, c(PA.amLt));
  rect(14, bY+4, 12, 12, c(PA.r3));
  rect(15, bY+5, 10, 10, c(PA.cr0));
  line(15, bY+6, 10, c(PA.am0)); line(15, bY+9, 10, c(PA.am0)); line(15, bY+12, 10, c(PA.am0));

  if (pose === "idle") {
    rect(10, bY+2, 5, 13, c(PA.r1)); rect(11, bY+3, 3, 11, c(PA.r0)); rect(10, bY+14, 4, 4, c(PA.sk));
    rect(26, bY+2, 5, 12, c(PA.r1)); rect(27, bY+3, 3, 10, c(PA.r0)); rect(26, bY+13, 4, 4, c(PA.sk));
    rect(28, bY-12+bob, 12, 14, c(PA.bk0)); rect(29, bY-11+bob, 10, 12, c(PA.bk1));
    rect(30, bY-10+bob, 8, 10, c(PA.bkP));
    for (let i=0;i<3;i++) line(31, bY-8+bob+i*3, 6, c(PA.am0));
    rect(28, bY-12+bob, 12, 14, c("rgba(192,128,32,0.12)"));
    rect(28, bY-11+bob, 2, 12, c(PA.bkT));
  } else if (pose === "thinking") {
    rect(10, bY+2, 5, 12, PA.r1); rect(11, bY+3, 3, 10, PA.r0); rect(10, bY+13, 4, 4, PA.sk);
    rect(26, bY+2, 5, 8, PA.r1); rect(26, bY+9, 5, 5, PA.sk);
    const cOff: [number,number][] = [[-5,-5],[-3,-7],[1,-6],[3,-4],[-2,-3],[4,-7]];
    const cols = [PA.cx0,PA.cx1,PA.cxB,PA.cx2,PA.cxC,PA.cx0];
    cOff.forEach(([dx,dy],i) => rect(19+dx, bY-2+dy, 2, 2, cols[i]));
  } else if (pose === "working") {
    rect(9, bY+4, 5, 11, PA.r1); rect(10, bY+5, 3, 9, PA.r0); rect(9, bY+14, 4, 4, PA.sk);
    rect(26, bY+4, 5, 11, PA.r1); rect(27, bY+5, 3, 9, PA.r0); rect(26, bY+14, 4, 4, PA.sk);
    for (let i=0;i<6;i++) {
      const a = t*0.1+i*1.05;
      const dx = Math.round(Math.cos(a)*6), dy = Math.round(Math.sin(a)*3);
      px(20+dx, bY+6+dy, PA.dt0); px(20+dx+1, bY+7+dy, PA.dt1);
    }
    glow(13, bY, 14, 16, "rgba(192,128,32,0.14)");
    glow(14, bY-4, 12, 6, "rgba(192,128,32,0.12)");
  } else if (pose === "walk") {
    rect(10, bY+2, 5, 11, PA.r1); rect(11, bY+3, 3, 9, PA.r0); rect(10, bY+12, 4, 4, PA.sk);
    const tr = Math.sin(t*0.08)*1.5;
    const trOff: [number,number][] = [[-6,-1],[-9,1],[-12,-2],[-15,0],[-18,-3]];
    trOff.forEach(([dx,dy],i) => {
      const cy = Math.round(bY+13+dy+tr*(i+1)*0.3);
      rect(20+dx, cy, 4, 3, PA.tc); rect(21+dx, cy+1, 2, 1, PA.amLt); px(20+dx, cy, PA.amLt);
    });
    rect(26, bY+2, 5, 11, PA.r1); rect(27, bY+3, 3, 9, PA.r0); rect(26, bY+12, 4, 4, PA.sk);
  } else if (pose === "collab") {
    rect(10, bY+2, 5, 10, PA.r1); rect(11, bY+3, 3, 8, PA.r0); rect(10, bY+11, 4, 4, PA.sk);
    rect(26, bY-7, 14, 18, PA.bk0); rect(27, bY-6, 12, 16, PA.bk1);
    rect(28, bY-5, 10, 14, PA.bkP);
    for (let i=0;i<4;i++) line(29, bY-3+i*3, 8, PA.am0);
    rect(28, bY+4, 4, 3, PA.sk); px(32, bY+5, PA.sk);
    const tfOff: [number,number][] = [[2,-2],[4,2],[-2,4]];
    tfOff.forEach(([dx,dy]) => { rect(20+dx, bY+dy, 3, 2, PA.tc); px(20+dx, bY+dy, PA.amLt); });
    rect(26, bY+2, 5, 9, PA.r1); rect(27, bY+3, 3, 7, PA.r0); rect(26, bY+10, 4, 4, PA.sk);
  } else {
    rect(10, bY+4, 5, 10, c(PA.r1)); rect(26, bY+4, 5, 10, c(PA.r1));
    rect(14, bY+14, 12, 8, c(PA.bk0)); rect(15, bY+15, 10, 6, c(PA.bkP));
    line(16, bY+17, 8, c(PA.am0));
  }

  if (seated) {
    rect(11, bY+20, 18, 14, c(PA.r2)); rect(12, bY+21, 16, 12, c(PA.r1));
    rect(12, bY+22, 16, 12, c(PA.r3));
    line(11, bY+20, 18, c(PA.am1)); line(11, bY+33, 18, c(PA.am1));
    rect(15, bY+31, 4, 4, c(PA.r1)); rect(21, bY+31, 4, 4, c(PA.r1));
  } else if (pose === "walk") {
    rect(11, bY+20, 18, 16, PA.r2); rect(12, bY+21, 16, 14, PA.r1);
    rect(12, bY+22, 16, 14, PA.r3); line(11, bY+35, 18, PA.am1);
    rect(14, bY+33, 4, 4, PA.r1); rect(20, bY+31, 4, 4, PA.r1);
  } else {
    rect(11, bY+20, 18, 16, PA.r2); rect(12, bY+21, 16, 14, PA.r1);
    rect(12, bY+22, 16, 14, PA.r3); line(11, bY+35, 18, PA.am1);
    rect(14, bY+33, 4, 4, PA.r1); rect(20, bY+33, 4, 4, PA.r1);
  }

  rect(15, hY, 10, 12, c(PA.sk));
  rect(14, hY+1, 12, 10, c(PA.sk));
  rect(15, hY-1, 10, 14, c(PA.sk));
  rect(15, hY-1, 10, 3, c(PA.r1)); rect(16, hY-2, 8, 3, c(PA.r2));
  rect(17, hY-3, 6, 2, c(PA.rLt));
  if (sl) {
    line(15, hY+5, 4, c(PA.skD)); px(16, hY+6, c(PA.skD));
    line(21, hY+5, 4, c(PA.skD)); px(22, hY+6, c(PA.skD));
  } else {
    rect(15, hY+4, 4, 4, c(PA.eW)); rect(21, hY+4, 4, 4, c(PA.eW));
    rect(16, hY+5, 2, 2, c(PA.e)); rect(22, hY+5, 2, 2, c(PA.e));
    if (pose==="thinking") { rect(16, hY+4, 2, 2, c(PA.e)); rect(22, hY+4, 2, 2, c(PA.e)); }
    glow(15, hY+4, 4, 2, glassGlow + "66"); glow(21, hY+4, 4, 2, glassGlow + "66");
  }
  px(18, hY+8, c(PA.skD)); px(19, hY+8, c(PA.skD));
  if (!sl) { line(16, hY+10, 7, c(PA.skD)); px(16, hY+11, c(PA.skD)); px(22, hY+11, c(PA.skD)); }

  line(14, hY+3, 6, c(PA.gl0)); line(14, hY+7, 6, c(PA.gl1));
  line(14, hY+3, 1, c(PA.gl0), true); line(19, hY+3, 1, c(PA.gl1), true);
  line(21, hY+3, 6, c(PA.gl0)); line(21, hY+7, 6, c(PA.gl1));
  line(21, hY+3, 1, c(PA.gl0), true); line(26, hY+3, 1, c(PA.gl1), true);
  px(20, hY+5, c(PA.gl0));
  px(13, hY+5, c(PA.glL)); px(27, hY+5, c(PA.glL));
  if (sl) { px(15, hY+3, c(PA.gl0)); px(16, hY+2, c(PA.gl0)); }
  if ((pose==="working"||pose==="collab") && !sl) {
    glow(15, hY+4, 4, 3, "rgba(200,144,32,0.5)");
    glow(22, hY+4, 4, 3, "rgba(200,144,32,0.5)");
  }

  if (sl) {
    px(23, hY-4, c(PA.zz)); line(24, hY-7, 3, c(PA.zz)); px(24, hY-6, c(PA.zz)); px(26, hY-6, c(PA.zz));
    rect(27, hY-10, 4, 2, c(PA.zz)); px(27, hY-9, c(PA.zz)); px(30, hY-9, c(PA.zz));
  }
}

// ── DISPATCH ────────────────────────────────────────────────────────────────

type DrawFn = (ctx: CanvasRenderingContext2D, pose: SpritePose, fox: number, foy: number, t: number) => void;

const DRAW_FNS: Record<string, DrawFn> = {
  monkey:      drawMonkey,
  lifesupport: drawNinja,
  engineer:    drawEngineer,
  archivist:   drawArchivist,
};

export function drawCrew(agentId: string, ctx: CanvasRenderingContext2D, pose: SpritePose, fox: number, foy: number, t: number) {
  const fn = DRAW_FNS[agentId];
  if (fn) fn(ctx, pose, fox, foy, t);
}
