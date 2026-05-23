// Grafik Forecasting Permintaan
const ctx = document.getElementById('forecastChart');
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

console.log("Website hasil penelitian siap ditampilkan!");
