function openTab(evt, tabName) {
  // Sembunyikan semua tab
  let tabcontent = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Hapus status aktif dari semua tombol
  let tablinks = document.getElementsByClassName("tablinks");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Tampilkan tab yang dipilih
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

// Buka tab default saat halaman pertama kali load
document.getElementById("defaultOpen").click();

// Chart Forecasting
const ctx = document.getElementById('forecastChart');
if (ctx) {
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
      datasets: [{
        label: 'Prediksi Permintaan Ekspor (Ton)',
        data: [120, 135, 150, 165, 180, 200],
        borderColor: '#004b23',
        backgroundColor: 'rgba(0,75,35,0.2)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Forecasting Permintaan Daging Sapi Ekspor' }
      }
    }
  });
}
