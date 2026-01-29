window.onload = function () {
  const iphone = document.querySelector(".Iphone");
  const timeDisplay = document.querySelector(".Time");
  const dateDisplay = document.querySelector(".Date");
  const hsTimeDisplay = document.querySelector(".HSTime");

  // Widget Elemanları
  const widgetDayName = document.getElementById("widgetDayName");
  const widgetDayNum = document.getElementById("widgetDayNum");
  const widgetTemp = document.getElementById("widgetTemp");

  let clickCount = 0;

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

  function updateDeviceScreen() {
    const now = new Date();

    // Saat Güncelleme
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    if (timeDisplay) timeDisplay.textContent = `${hours}:${minutes}`;
    if (hsTimeDisplay) hsTimeDisplay.textContent = `${hours}:${minutes}`;

    // Tarih Güncelleme
    const options = { weekday: "long", day: "numeric", month: "long" };
    if (dateDisplay)
      dateDisplay.textContent = now.toLocaleDateString("en-US", options);

    // Takvim Widget Güncelleme
    if (widgetDayName) {
      widgetDayName.textContent = now.toLocaleDateString("en-US", {
        weekday: "long",
      });
    }
    if (widgetDayNum) {
      widgetDayNum.textContent = now.getDate();
    }

    // --- LONDRA CANLI HAVA DURUMU DÜZELTMESİ ---
    if (widgetTemp) {
      // Şu an Londra 7 derece olduğu için burayı sabitliyoruz
      widgetTemp.textContent = "7°";
    }
  }

  setInterval(updateDeviceScreen, 1000);
  updateDeviceScreen();
};
