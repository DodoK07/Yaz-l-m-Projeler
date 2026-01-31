window.onload = function () {
  // --- Değişken Tanımlamaları ---
  const iphone = document.querySelector(".Iphone");
  const timeDisplay = document.querySelector(".Time");
  const dateDisplay = document.querySelector(".Date");
  const hsTimeDisplay = document.querySelector(".HSTime");

  // Widget Elemanları
  const widgetDayName = document.getElementById("widgetDayName");
  const widgetDayNum = document.getElementById("widgetDayNum");
  const widgetTemp = document.getElementById("widgetTemp");

  let clickCount = 0;

  // --- Telefon Açılış Mantığı ---
  iphone.addEventListener("click", () => {
    clickCount++;
    if (clickCount === 1) {
      iphone.classList.add("active");
    } else if (clickCount === 2) {
      iphone.classList.add("unlocked");
    } else {
      iphone.classList.remove("active", "unlocked");
      clickCount = 0;
    }
  });

  // --- Canlı Ekran ve Saat Mekanizması Güncelleme ---
  function updateDeviceScreen() {
    const now = new Date();

    // 1. Dijital Saat ve Tarih Güncelleme
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = now.getSeconds();

    if (timeDisplay) timeDisplay.textContent = `${hours}:${minutes}`;
    if (hsTimeDisplay) hsTimeDisplay.textContent = `${hours}:${minutes}`;

    const options = { weekday: "long", day: "numeric", month: "long" };
    if (dateDisplay)
      dateDisplay.textContent = now.toLocaleDateString("en-US", options);

    // 2. Takvim Widget Güncelleme
    if (widgetDayName) {
      widgetDayName.textContent = now.toLocaleDateString("en-US", {
        weekday: "long",
      });
    }
    if (widgetDayNum) {
      widgetDayNum.textContent = now.getDate();
    }

    // 3. Hava Durumu Güncelleme (Londra Sabit 7°)
    if (widgetTemp) {
      widgetTemp.textContent = "7°";
    }

    // 4. ANALOG SAAT İKONU MEKANİZMASI
    // Açı hesaplamaları (Makine mühendisliği hassasiyetiyle :)
    const secondDeg = seconds * 6; // 360 derece / 60 saniye
    const minuteDeg = minutes * 6 + seconds * 0.1; // Dakika + saniyenin etkisi
    const hourDeg = (now.getHours() % 12) * 30 + minutes * 0.5; // Saat + dakikanın etkisi

    const secHand = document.querySelector(".SecondHand");
    const minHand = document.querySelector(".MinuteHand");
    const hourHand = document.querySelector(".HourHand");

    if (secHand) secHand.style.transform = `rotate(${secondDeg}deg)`;
    if (minHand) minHand.style.transform = `rotate(${minuteDeg}deg)`;
    if (hourHand) hourHand.style.transform = `rotate(${hourDeg}deg)`;
  }

  // Fonksiyonu her saniye çalıştır
  setInterval(updateDeviceScreen, 1000);
  // İlk açılışta beklemeden çalıştır
  updateDeviceScreen();
};
