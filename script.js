/* ═══════════════════════════════════════════════
   ExBeef — script.js
   Semua logika, data simulasi, dan chart
═══════════════════════════════════════════════ */

/* ─── UTILITIES ─── */
const rand = (min, max) => Math.round(Math.random() * (max - min) + min);
const randF = (min, max, dec = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(dec));
const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];

function fmtNum(n) { return n.toLocaleString('id-ID'); }
function fmtRp(n)  { return 'Rp ' + (n/1e9).toFixed(1) + ' M'; }

/* ─── CLOCK ─── */
function updateClock() {
  const now = new Date();
  const el = document.getElementById('clock');
  if (el) el.textContent =
    now.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}) + ' ' +
    now.toLocaleTimeString('id-ID');
}
setInterval(updateClock, 1000);
updateClock();

/* ─── DEFAULT CHART.JS THEME ─── */
Chart.defaults.color = '#4e6080';
Chart.defaults.borderColor = '#1a2e50';
Chart.defaults.font.family = "'DM Sans', sans-serif";
Chart.defaults.font.size = 11;

/* ═══════════════════════════
   DATA GENERATORS
═══════════════════════════ */
function genMonthlyPerformance() {
  return months.map((b,i) => ({
    bulan: b,
    produksi: rand(42000, 58000),
    penjualan: rand(40000, 56000),
    waste: randF(1.5, 6.0),
    efisiensi: randF(82, 96)
  }));
}

function genInventory() {
  const locs = [
    { nama:'Cold Storage Cilincing, Jakarta', kapasitas:50000 },
    { nama:'Gudang Distribusi Bekasi',         kapasitas:30000 },
    { nama:'Cold Storage Tangerang',           kapasitas:35000 },
    { nama:'Depo Depok',                       kapasitas:20000 },
    { nama:'Cold Storage Bogor',               kapasitas:25000 },
  ];
  return locs.map(l => {
    const stok = rand(Math.floor(l.kapasitas*0.2), Math.floor(l.kapasitas*0.9));
    const pct  = Math.round(stok/l.kapasitas*100);
    return { ...l, stok, pct, status: pct > 60 ? 'Aman' : pct > 30 ? 'Perhatian' : 'Kritis' };
  });
}

function genBatches() {
  const farms   = ['Farm Sukamaju - Bogor','Farm Ciawi - Bogor','Farm Cibinong - Depok','Farm Jonggol - Bekasi'];
  const statuses = ['Di Farm','Dalam Proses','Cold Storage','Distribusi','Retailer','Terjual'];
  return Array.from({length:20}, (_,i) => ({
    id: `BATCH-${2024000+i+1}`,
    farm: farms[i%farms.length],
    tglPanen: `${String(rand(1,28)).padStart(2,'0')}/${String(rand(1,12)).padStart(2,'0')}/2024`,
    berat: rand(800,2500),
    ekor: rand(500,1500),
    suhu: randF(-2,4),
    kualitas: ['A','A','A','B','B'][rand(0,4)],
    status: statuses[rand(0,statuses.length-1)],
  }));
}

function genForecast(periods=12, futureMonths=6) {
  const base = 45000, history = [], forecast = [];
  for (let i=0;i<periods;i++) {
    const trend   = i*800;
    const season  = 5000*Math.sin(2*Math.PI*i/12);
    const noise   = rand(-2000,2000);
    const actual  = Math.max(base+trend+season+noise, 0);
    const fc      = actual + rand(-1500,1500);
    history.push({ label: months[(i)%12], actual: Math.round(actual), forecast: Math.round(fc),
      lo: Math.round(fc*0.88), hi: Math.round(fc*1.12) });
  }
  for (let i=0;i<futureMonths;i++) {
    const fc = base + (periods+i)*800 + 5000*Math.sin(2*Math.PI*(periods+i)/12) + rand(-1500,1500);
    forecast.push({ label: months[(periods+i)%12]+'*', actual: null,
      forecast: Math.round(fc), lo: Math.round(fc*0.85), hi: Math.round(fc*1.15) });
  }
  return [...history, ...forecast];
}

function genAccuracy() {
  return [
    { metode:'Moving Average (MA-3)',   mape:randF(8,14),  rmse:rand(3200,5800), mae:rand(2500,4500) },
    { metode:'Exponential Smoothing',   mape:randF(6,11),  rmse:rand(2800,4800), mae:rand(2100,3900) },
    { metode:'Holt-Winters',            mape:randF(5,9),   rmse:rand(2200,4200), mae:rand(1800,3500) },
    { metode:'ARIMA',                   mape:randF(4.5,8), rmse:rand(2000,3800), mae:rand(1600,3200) },
    { metode:'SARIMA',                  mape:randF(4,7),   rmse:rand(1800,3500), mae:rand(1500,3000) },
  ];
}

const MASTER = {
  farm: {
    cols:['ID','Nama','Lokasi','Kapasitas (ekor)','Pemilik','Status'],
    rows:[
      ['F001','Farm Sukamaju','Bogor','2,000','Budi Santoso','Aktif'],
      ['F002','Farm Ciawi','Bogor','1,800','Siti Rahayu','Aktif'],
      ['F003','Farm Cibinong','Depok','2,200','Ahmad Fauzi','Aktif'],
      ['F004','Farm Jonggol','Bekasi','1,500','Dewi Lestari','Aktif'],
    ]
  },
  distributor: {
    cols:['ID','Nama','Wilayah','Armada (unit)','Status'],
    rows:[
      ['D001','PT Distribusi Nusantara','Jakarta Utara & Timur','12','Aktif'],
      ['D002','CV Maju Bersama','Jakarta Selatan & Barat','8','Aktif'],
      ['D003','UD Segar Jaya','Bekasi & Karawang','6','Aktif'],
    ]
  },
  retailer: {
    cols:['ID','Nama','Tipe','Outlet','Status'],
    rows:[
      ['R001','Supermarket Chain A','Modern Trade','45','Aktif'],
      ['R002','Pasar Modern B','Modern Trade','32','Aktif'],
      ['R003','HoReCa Network','HoReCa','120','Aktif'],
      ['R004','Pasar Tradisional Mitra','Traditional Trade','85','Aktif'],
    ]
  }
};

const TIMELINE = [
  { stage:'Pemeliharaan Farm', lokasi:'Farm Sukamaju, Bogor', tanggal:'01/01/2024', durasi:'35 hari', status:'done', catatan:'DOC masuk, pakan standar' },
  { stage:'Panen & Penimbangan', lokasi:'Farm Sukamaju, Bogor', tanggal:'05/02/2024', durasi:'1 hari', status:'done', catatan:'Berat rata-rata 1.8 kg/ekor' },
  { stage:'Transportasi ke RPH', lokasi:'Jalan Raya Bogor–Jakarta', tanggal:'06/02/2024', durasi:'4 jam', status:'done', catatan:'Truk berpendingin 18°C' },
  { stage:'Pemotongan & Proses', lokasi:'RPH Sentral Cibinong', tanggal:'06/02/2024', durasi:'8 jam', status:'done', catatan:'Sertifikat Halal #2024-0156' },
  { stage:'Pengemasan & Labeling', lokasi:'RPH Sentral Cibinong', tanggal:'06/02/2024', durasi:'3 jam', status:'done', catatan:'Barcode & QR Code dicetak' },
  { stage:'Cold Storage', lokasi:'Cold Storage Cilincing, Jakarta', tanggal:'07/02/2024', durasi:'2 hari', status:'active', catatan:'Suhu 2°C — kapasitas 60%' },
  { stage:'Distribusi', lokasi:'Jakarta & Sekitarnya', tanggal:'09/02/2024', durasi:'1 hari', status:'waiting', catatan:'3 armada truk disiapkan' },
  { stage:'Retailer / Pasar', lokasi:'Supermarket & Pasar Modern', tanggal:'10/02/2024', durasi:'—', status:'waiting', catatan:'—' },
];

/* ═══════════════════════════
   PAGE NAVIGATION
═══════════════════════════ */
const pageMeta = {
  dashboard:   { title:'Dashboard Utama',      sub:'Ringkasan operasional supply chain agroindustri daging ayam' },
  traceability:{ title:'Sistem Traceability',  sub:'Lacak perjalanan setiap batch dari farm hingga konsumen' },
  forecasting: { title:'Demand Forecasting',   sub:'Prediksi permintaan dengan berbagai metode statistik' },
  supplychain: { title:'Peta Supply Chain',    sub:'Visualisasi alur dan utilisasi kapasitas rantai pasok' },
  inventory:   { title:'Manajemen Inventori',  sub:'Status stok dan kapasitas di setiap titik penyimpanan' },
  laporan:     { title:'Laporan & Analitik',   sub:'Ringkasan performa bulanan dan ekspor data' },
  masterdata:  { title:'Data Master',          sub:'Manajemen entitas farm, distributor, dan retailer' },
};

let activeCharts = {};

function destroyChart(id) {
  if (activeCharts[id]) { activeCharts[id].destroy(); delete activeCharts[id]; }
}

function showPage(pageId, linkEl) {
  // hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  // show target
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  if (linkEl) linkEl.classList.add('active');
  // update topbar
  const meta = pageMeta[pageId] || {};
  document.getElementById('pageTitle').textContent    = meta.title || pageId;
  document.getElementById('pageSubtitle').textContent = meta.sub   || '';
  // close sidebar on mobile
  document.getElementById('sidebar').classList.remove('open');
  // init page
  initPage(pageId);
  return false;
}

function initPage(pageId) {
  switch(pageId) {
    case 'dashboard':    initDashboard();    break;
    case 'traceability': initTraceability(); break;
    case 'forecasting':  initForecasting();  break;
    case 'supplychain':  initSupplyChain();  break;
    case 'inventory':    initInventory();    break;
    case 'laporan':      initLaporan();      break;
    case 'masterdata':   initMasterData('farm'); break;
  }
}

/* ═══════════════════════════
   SIDEBAR TOGGLE
═══════════════════════════ */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

function refreshPage() {
  const active = document.querySelector('.page.active');
  if (active) initPage(active.id.replace('page-',''));
}

/* ═══════════════════════════
   DASHBOARD
═══════════════════════════ */
function initDashboard() {
  // render monthly prod vs demand chart
  destroyChart('chartProduksi');
  destroyChart('chartChannel');
  const perf = genMonthlyPerformance();
  activeCharts['chartProduksi'] = new Chart(document.getElementById('chartProduksi'), {
    type:'line',
    data:{
      labels: perf.map(d=>d.bulan),
      datasets:[
        { label:'Produksi', data:perf.map(d=>d.produksi), borderColor:'#00d4aa', backgroundColor:'rgba(0,212,170,.07)', fill:true, tension:.4, pointRadius:3, pointBackgroundColor:'#00d4aa' },
        { label:'Penjualan', data:perf.map(d=>d.penjualan), borderColor:'#3b82f6', backgroundColor:'rgba(59,130,246,.07)', fill:true, tension:.4, pointRadius:3, pointBackgroundColor:'#3b82f6' },
      ]
    },
    options:{ responsive:true, plugins:{legend:{labels:{color:'#94a3b8',boxWidth:12}}},
      scales:{y:{grid:{color:'#1a2e50'},ticks:{color:'#4e6080'}},x:{grid:{color:'#1a2e50'},ticks:{color:'#4e6080'}}} }
  });

  // Channel doughnut
  const channelLabels  = ['Modern Trade','HoReCa','Traditional','E-Commerce','Lainnya'];
  const channelValues  = [38,28,22,8,4];
  const channelColors  = ['#00d4aa','#3b82f6','#8b5cf6','#f59e0b','#4e6080'];
  destroyChart('chartChannel');
  activeCharts['chartChannel'] = new Chart(document.getElementById('chartChannel'), {
    type:'doughnut',
    data:{ labels:channelLabels, datasets:[{ data:channelValues, backgroundColor:channelColors, borderWidth:0, hoverOffset:6 }] },
    options:{ responsive:true, plugins:{legend:{display:false}}, cutout:'65%' }
  });
  document.getElementById('channelLegend').innerHTML = channelLabels.map((l,i) =>
    `<div style="display:flex;justify-content:space-between;font-size:11.5px;margin-bottom:5px;">
      <span style="display:flex;align-items:center;gap:7px;color:var(--text2);">
        <span style="width:8px;height:8px;border-radius:50%;background:${channelColors[i]};display:inline-block"></span>${l}
      </span>
      <strong style="color:var(--text)">${channelValues[i]}%</strong>
    </div>`).join('');

  // Storage list
  const inv = genInventory();
  document.getElementById('storageList').innerHTML = inv.map(d =>
    `<div style="margin-bottom:13px">
      <div style="display:flex;justify-content:space-between;margin-bottom:5px">
        <span style="font-size:12px;color:var(--text2)">${d.nama}</span>
        <span style="font-size:12px;font-weight:700;color:var(--text)">${d.pct}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${d.pct>60?'green':d.pct>35?'amber':'red'}" style="width:${d.pct}%"></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:3px">
        <span style="font-size:10px;color:var(--text3)">${fmtNum(d.stok)} / ${fmtNum(d.kapasitas)} kg</span>
        <span class="badge badge-${d.status==='Aman'?'green':d.status==='Perhatian'?'amber':'red'}">${d.status}</span>
      </div>
    </div>`).join('');

  // Recent batches
  const batches = genBatches();
  const statusCls = { 'Di Farm':'badge-blue','Dalam Proses':'badge-amber','Cold Storage':'badge-purple','Distribusi':'badge-amber','Retailer':'badge-green','Terjual':'badge-green' };
  document.querySelector('#recentBatches tbody').innerHTML = batches.slice(0,8).map(b =>
    `<tr>
      <td><code style="font-size:11px;color:var(--primary)">${b.id}</code></td>
      <td style="font-size:11.5px;color:var(--text2)">${b.farm.split(' - ')[0]}</td>
      <td><span class="badge ${statusCls[b.status]||'badge-blue'}">${b.status}</span></td>
      <td style="font-weight:600">${fmtNum(b.berat)}</td>
    </tr>`).join('');
}

/* ═══════════════════════════
   TRACEABILITY
═══════════════════════════ */
let _batches = [];
function initTraceability() {
  _batches = genBatches();
  renderBatches(_batches);
}

function renderBatches(list) {
  const statusCls = { 'Di Farm':'badge-blue','Dalam Proses':'badge-amber','Cold Storage':'badge-purple','Distribusi':'badge-amber','Retailer':'badge-green','Terjual':'badge-green' };
  document.getElementById('traceBody').innerHTML = list.map(b =>
    `<tr>
      <td><code style="font-size:11px;color:var(--primary)">${b.id}</code></td>
      <td style="font-size:11.5px">${b.farm}</td>
      <td>${b.tglPanen}</td>
      <td style="font-weight:600">${fmtNum(b.berat)}</td>
      <td>${fmtNum(b.ekor)}</td>
      <td>${b.suhu}°C</td>
      <td><span class="badge ${b.kualitas==='A'?'badge-green':'badge-amber'}">${b.kualitas}</span></td>
      <td><span class="badge ${statusCls[b.status]||'badge-blue'}">${b.status}</span></td>
      <td><button class="btn btn-secondary btn-sm" onclick="showTimeline('${b.id}')"><i class="fas fa-route"></i> Timeline</button></td>
    </tr>`).join('');
}

function filterBatches() {
  const q   = document.getElementById('batchSearch').value.toLowerCase();
  const st  = document.getElementById('batchFilter').value;
  renderBatches(_batches.filter(b =>
    (!q  || b.id.toLowerCase().includes(q) || b.farm.toLowerCase().includes(q)) &&
    (!st || b.status === st)
  ));
}

function showTimeline(batchId) {
  document.getElementById('modalBatchId').textContent = batchId;
  document.getElementById('timelineContent').innerHTML =
    `<div class="timeline">` +
    TIMELINE.map(t =>
      `<div class="tl-item">
        <div class="tl-dot ${t.status}"></div>
        <div class="tl-stage">${t.stage}</div>
        <div class="tl-meta"><i class="fas fa-map-marker-alt" style="color:var(--primary);font-size:10px;margin-right:4px"></i>${t.lokasi} &nbsp;|&nbsp; 📅 ${t.tanggal} &nbsp;|&nbsp; ⏱ ${t.durasi}</div>
        ${t.catatan !== '—' ? `<div class="tl-note"><i class="fas fa-sticky-note" style="color:var(--text3);margin-right:5px"></i>${t.catatan}</div>` : ''}
      </div>`).join('') +
    `</div>`;
  document.getElementById('timelineModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('timelineModal').style.display = 'none';
}

/* ═══════════════════════════
   FORECASTING
═══════════════════════════ */
function initForecasting() {
  updateForecasting();
  renderAccuracy();
}

function updateForecasting() {
  const method  = document.getElementById('fcMethod')?.value || 'SARIMA';
  const periods = parseInt(document.getElementById('fcPeriods')?.value || 6);
  const el = document.getElementById('fcMethodLabel');
  if (el) el.textContent = method;

  const data = genForecast(12, periods);
  destroyChart('chartForecast');
  activeCharts['chartForecast'] = new Chart(document.getElementById('chartForecast'), {
    type:'line',
    data:{
      labels: data.map(d=>d.label),
      datasets:[
        { label:'Aktual', data:data.map(d=>d.actual), borderColor:'#00d4aa', backgroundColor:'rgba(0,212,170,.07)', fill:true, tension:.4, pointRadius:4, pointBackgroundColor:'#00d4aa', spanGaps:false },
        { label:'Forecast', data:data.map(d=>d.forecast), borderColor:'#f59e0b', backgroundColor:'rgba(245,158,11,.07)', fill:true, tension:.4, borderDash:[6,3], pointRadius:3, pointBackgroundColor:'#f59e0b' },
        { label:'Upper Bound', data:data.map(d=>d.hi), borderColor:'rgba(239,68,68,.3)', backgroundColor:'rgba(239,68,68,.04)', fill:'+1', tension:.4, pointRadius:0, borderDash:[2,4] },
        { label:'Lower Bound', data:data.map(d=>d.lo), borderColor:'rgba(239,68,68,.3)', backgroundColor:'rgba(239,68,68,.04)', fill:false, tension:.4, pointRadius:0, borderDash:[2,4] },
      ]
    },
    options:{
      responsive:true,
      plugins:{ legend:{ labels:{ color:'#94a3b8', boxWidth:12 } },
        tooltip:{ callbacks:{ label: ctx => `${ctx.dataset.label}: ${fmtNum(ctx.parsed.y)} kg` } } },
      scales:{y:{grid:{color:'#1a2e50'},ticks:{color:'#4e6080',callback:v=>fmtNum(v)}},x:{grid:{color:'#1a2e50'},ticks:{color:'#4e6080'}}}
    }
  });
}

function renderAccuracy() {
  const rows = genAccuracy();
  const best = rows.reduce((a,b) => a.mape < b.mape ? a : b).metode;
  document.getElementById('accBody').innerHTML = rows.map(r =>
    `<tr>
      <td style="font-weight:${r.metode===best?'700':'400'};color:${r.metode===best?'var(--primary)':'var(--text)'}">${r.metode}</td>
      <td style="font-weight:600;color:${r.mape<6?'var(--success)':r.mape<9?'var(--warning)':'var(--danger)'}">${r.mape}%</td>
      <td>${fmtNum(r.rmse)}</td>
      <td>${fmtNum(r.mae)}</td>
      <td>${r.metode===best ? '<span class="badge badge-green"><i class="fas fa-star"></i> Terbaik</span>' : '—'}</td>
    </tr>`).join('');
}

/* ═══════════════════════════
   SUPPLY CHAIN
═══════════════════════════ */
const scNodes = [
  { label:'Farm Sukamaju\nBogor',       type:'farm',        cap:2000, cur:1750 },
  { label:'Farm Ciawi\nBogor',          type:'farm',        cap:1800, cur:1600 },
  { label:'Farm Cibinong\nDepok',       type:'farm',        cap:2200, cur:1900 },
  { label:'RPH Sentral\nCibinong',      type:'processing',  cap:5000, cur:4200 },
  { label:'Cold Storage\nCilincing',    type:'storage',     cap:50000, cur:32000 },
  { label:'Distributor A\nJkt Utara',   type:'distributor', cap:10000, cur:7500 },
  { label:'Distributor B\nJkt Selatan', type:'distributor', cap:8000, cur:6200 },
  { label:'Supermarket\nChain A',       type:'retailer',    cap:3000, cur:2100 },
  { label:'Pasar Modern\nB',            type:'retailer',    cap:2500, cur:1800 },
  { label:'HoReCa\nJakarta',            type:'retailer',    cap:4000, cur:3200 },
];
const typeColor = { farm:'var(--primary)', processing:'var(--blue)', storage:'var(--purple)', distributor:'var(--accent)', retailer:'var(--success)' };

function initSupplyChain() {
  // Node cards
  document.getElementById('scNodes').innerHTML = scNodes.map(n => {
    const pct = Math.round(n.cur/n.cap*100);
    const col = typeColor[n.type];
    return `<div style="background:var(--bg3);border:1px solid var(--border);border-left:3px solid ${col};border-radius:8px;padding:10px 14px;margin-bottom:10px;display:flex;align-items:center;gap:12px">
      <div style="flex:1">
        <div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:2px">${n.label.replace('\n',' – ')}</div>
        <div style="font-size:10px;color:var(--text3)">${fmtNum(n.cur)} / ${fmtNum(n.cap)} unit</div>
        <div class="progress-bar" style="margin-top:5px"><div class="progress-fill ${pct>70?'green':pct>40?'amber':'red'}" style="width:${pct}%"></div></div>
      </div>
      <div style="font-family:'Syne',sans-serif;font-size:18px;font-weight:700;color:${col}">${pct}%</div>
    </div>`;
  }).join('');

  // Utilisasi chart
  destroyChart('chartUtilisasi');
  activeCharts['chartUtilisasi'] = new Chart(document.getElementById('chartUtilisasi'), {
    type:'bar',
    data:{
      labels: scNodes.map(n=>n.label.split('\n')[0]),
      datasets:[
        { label:'Utilisasi (%)', data:scNodes.map(n=>Math.round(n.cur/n.cap*100)),
          backgroundColor: scNodes.map(n=>{ const p=Math.round(n.cur/n.cap*100); return p>70?'rgba(0,212,170,.7)':p>40?'rgba(245,158,11,.7)':'rgba(239,68,68,.7)'; }),
          borderRadius:5, borderWidth:0 }
      ]
    },
    options:{ responsive:true, indexAxis:'y',
      plugins:{legend:{display:false}},
      scales:{x:{max:100,grid:{color:'#1a2e50'},ticks:{color:'#4e6080',callback:v=>v+'%'}},y:{grid:{display:false},ticks:{color:'#94a3b8',font:{size:10}}}}
    }
  });

  // Flow columns
  const cols = { farm:[], processing:[], storage:[], distributor:[], retailer:[] };
  scNodes.forEach(n => cols[n.type].push(n));
  const labels = { farm:'🌾 Farm', processing:'🔪 RPH', storage:'❄️ Cold Storage', distributor:'🚛 Distribusi', retailer:'🏪 Retailer' };
  document.getElementById('scFlowFull').innerHTML = Object.keys(cols).map(k =>
    `<div class="scf-col">
      <div class="scf-header">${labels[k]}</div>
      ${cols[k].map(n=>`<div class="scf-item"><div class="scf-item-name">${n.label.replace('\n',' ')}</div><div class="scf-item-sub">${fmtNum(n.cur)} / ${fmtNum(n.cap)}</div></div>`).join('')}
    </div>`).join('');
}

/* ═══════════════════════════
   INVENTORY
═══════════════════════════ */
function initInventory() {
  const inv = genInventory();
  const total = inv.reduce((a,b)=>a+b.stok,0);
  const totalCap = inv.reduce((a,b)=>a+b.kapasitas,0);
  const kritis = inv.filter(d=>d.status==='Kritis').length;

  document.getElementById('invKpi').innerHTML = `
    <div class="kpi-card green"><div class="kpi-icon green"><i class="fas fa-boxes"></i></div>
      <div class="kpi-value">${fmtNum(total)} kg</div><div class="kpi-label">Total Stok Tersedia</div>
      <div class="kpi-trend neutral"><i class="fas fa-minus"></i> ${inv.length} lokasi</div></div>
    <div class="kpi-card blue"><div class="kpi-icon blue"><i class="fas fa-percentage"></i></div>
      <div class="kpi-value">${Math.round(total/totalCap*100)}%</div><div class="kpi-label">Utilisasi Rata-rata</div>
      <div class="kpi-trend neutral"><i class="fas fa-minus"></i> dari total kapasitas</div></div>
    <div class="kpi-card amber"><div class="kpi-icon amber"><i class="fas fa-exclamation-triangle"></i></div>
      <div class="kpi-value">${kritis}</div><div class="kpi-label">Lokasi Kritis (< 30%)</div>
      <div class="kpi-trend ${kritis>0?'down':'up'}"><i class="fas fa-${kritis>0?'arrow-down':'check'}"></i> ${kritis>0?'Perlu restok segera':'Semua aman'}</div></div>
    <div class="kpi-card green"><div class="kpi-icon green"><i class="fas fa-warehouse"></i></div>
      <div class="kpi-value">${fmtNum(totalCap)} kg</div><div class="kpi-label">Total Kapasitas</div>
      <div class="kpi-trend neutral"><i class="fas fa-minus"></i> 5 fasilitas</div></div>`;

  document.getElementById('invTable').innerHTML = inv.map(d =>
    `<div style="margin-bottom:16px;padding:14px;background:var(--bg3);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div>
          <div style="font-weight:600;font-size:13px">${d.nama}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:2px">Kapasitas: ${fmtNum(d.kapasitas)} kg</div>
        </div>
        <span class="badge badge-${d.status==='Aman'?'green':d.status==='Perhatian'?'amber':'red'}">${d.status}</span>
      </div>
      <div class="progress-bar" style="height:8px;margin-bottom:6px">
        <div class="progress-fill ${d.pct>60?'green':d.pct>35?'amber':'red'}" style="width:${d.pct}%"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text3)">
        <span>Stok: <strong style="color:var(--text)">${fmtNum(d.stok)} kg</strong></span>
        <span>Utilisasi: <strong style="color:var(--text)">${d.pct}%</strong></span>
        <span>Sisa: <strong style="color:var(--text)">${fmtNum(d.kapasitas-d.stok)} kg</strong></span>
      </div>
    </div>`).join('');

  destroyChart('chartInventory');
  activeCharts['chartInventory'] = new Chart(document.getElementById('chartInventory'), {
    type:'bar',
    data:{
      labels: inv.map(d=>d.nama.split(',')[0]),
      datasets:[
        { label:'Stok (kg)', data:inv.map(d=>d.stok), backgroundColor:'rgba(0,212,170,.7)', borderRadius:4 },
        { label:'Kapasitas (kg)', data:inv.map(d=>d.kapasitas), backgroundColor:'rgba(30,48,80,.6)', borderRadius:4 },
      ]
    },
    options:{ responsive:true,
      plugins:{legend:{labels:{color:'#94a3b8',boxWidth:12}}},
      scales:{y:{grid:{color:'#1a2e50'},ticks:{color:'#4e6080',callback:v=>fmtNum(v)}},x:{grid:{display:false},ticks:{color:'#94a3b8'}}}
    }
  });
}

/* ═══════════════════════════
   LAPORAN
═══════════════════════════ */
let _perfData = [];
function initLaporan() {
  _perfData = genMonthlyPerformance();

  destroyChart('chartPerforma');
  destroyChart('chartWaste');
  activeCharts['chartPerforma'] = new Chart(document.getElementById('chartPerforma'), {
    type:'bar',
    data:{
      labels:_perfData.map(d=>d.bulan),
      datasets:[
        { label:'Produksi', data:_perfData.map(d=>d.produksi), backgroundColor:'rgba(0,212,170,.7)', borderRadius:4 },
        { label:'Penjualan', data:_perfData.map(d=>d.penjualan), backgroundColor:'rgba(59,130,246,.7)', borderRadius:4 },
      ]
    },
    options:{ responsive:true, plugins:{legend:{labels:{color:'#94a3b8',boxWidth:12}}},
      scales:{y:{grid:{color:'#1a2e50'},ticks:{color:'#4e6080',callback:v=>fmtNum(v)}},x:{grid:{display:false},ticks:{color:'#94a3b8'}}} }
  });

  activeCharts['chartWaste'] = new Chart(document.getElementById('chartWaste'), {
    type:'line',
    data:{
      labels:_perfData.map(d=>d.bulan),
      datasets:[{ label:'Food Waste (%)', data:_perfData.map(d=>d.waste), borderColor:'#ef4444', backgroundColor:'rgba(239,68,68,.08)', fill:true, tension:.4, pointRadius:4, pointBackgroundColor:'#ef4444' }]
    },
    options:{ responsive:true, plugins:{legend:{labels:{color:'#94a3b8',boxWidth:12}}},
      scales:{y:{grid:{color:'#1a2e50'},ticks:{color:'#4e6080',callback:v=>v+'%'}},x:{grid:{color:'#1a2e50'},ticks:{color:'#94a3b8'}}} }
  });

  document.getElementById('laporanBody').innerHTML = _perfData.map(d => {
    const selisih = d.produksi - d.penjualan;
    return `<tr>
      <td style="font-weight:600">${d.bulan}</td>
      <td>${fmtNum(d.produksi)}</td>
      <td>${fmtNum(d.penjualan)}</td>
      <td style="color:${selisih>0?'var(--warning)':'var(--success)'};font-weight:600">${selisih>0?'+':''}${fmtNum(selisih)}</td>
      <td style="color:${d.waste>4?'var(--danger)':d.waste>2.5?'var(--warning)':'var(--success)'};font-weight:600">${d.waste}%</td>
      <td style="color:${d.efisiensi>90?'var(--success)':d.efisiensi>85?'var(--warning)':'var(--danger)'};font-weight:600">${d.efisiensi}%</td>
    </tr>`;}).join('');
}

function exportCSV() {
  const rows = [['Bulan','Produksi (kg)','Penjualan (kg)','Selisih','Waste (%)','Efisiensi (%)']];
  _perfData.forEach(d => rows.push([d.bulan, d.produksi, d.penjualan, d.produksi-d.penjualan, d.waste, d.efisiensi]));
  const csv = rows.map(r => r.join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'laporan_agroindustri.csv';
  a.click();
}

/* ═══════════════════════════
   MASTER DATA
═══════════════════════════ */
const masterTitles = { farm:'🌾 Data Farm', distributor:'🚛 Data Distributor', retailer:'🏪 Data Retailer' };
function initMasterData(type) {
  const d = MASTER[type];
  document.getElementById('masterTitle').innerHTML = `<i class="fas fa-database"></i> ${masterTitles[type]}`;
  document.getElementById('masterHead').innerHTML  = `<tr>${d.cols.map(c=>`<th>${c}</th>`).join('')}<th>Aksi</th></tr>`;
  document.getElementById('masterBody').innerHTML  = d.rows.map(r =>
    `<tr>${r.map((v,i)=>i===r.length-1
      ? `<td><span class="badge badge-green">${v}</span></td>`
      : `<td>${v}</td>`).join('')}
    <td style="display:flex;gap:6px">
      <button class="btn btn-secondary btn-sm"><i class="fas fa-edit"></i></button>
      <button class="btn btn-secondary btn-sm" style="color:var(--danger);border-color:var(--danger)"><i class="fas fa-trash"></i></button>
    </td></tr>`).join('');
}

function switchTab(type, btn) {
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  initMasterData(type);
}

/* ─── BOOT ─── */
window.addEventListener('DOMContentLoaded', () => {
  initDashboard();
});
