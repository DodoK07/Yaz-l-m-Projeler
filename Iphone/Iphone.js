window.onload = function () {
  // --- Değişken Tanımlamaları ---
  // DOM üzerindeki elemanları JavaScript nesneleri olarak hafızaya alıyoruz.
  // Bu sayede her seferinde tüm sayfayı taramak yerine bu kısa yolları kullanıyoruz.
  const iphone = document.querySelector(".Iphone");
  const timeDisplay = document.querySelector(".Time");
  const dateDisplay = document.querySelector(".Date");
  const hsTimeDisplay = document.querySelector(".HSTime");

  // Widget ve dinamik içerik alanlarını ID'leri üzerinden yakalıyoruz.
  const widgetDayName = document.getElementById("widgetDayName");
  const widgetDayNum = document.getElementById("widgetDayNum");
  const widgetTemp = document.getElementById("widgetTemp");

  let clickCount = 0; // Kilit ekranı tıklamalarını sayan bir sayaç (counter).

  // --- Telefon Açılış Mantığı ---
  // Telefona tıklandığında (click olayı) çalışacak olan kontrol ünitesi.
  iphone.addEventListener("click", () => {
    clickCount++;
    if (clickCount === 1) {
      // İlk tıklamada ekran kararık halden (brightness 0.5) normal hale geçer.
      iphone.classList.add("active");
    } else if (clickCount === 2) {
      // İkinci tıklamada kilit ekranı kaybolur ve ana ekran gelir.
      iphone.classList.add("unlocked");
    } else {
      // Üçüncü tıklamada sistemi başa döndürür (Reset).
      iphone.classList.remove("active", "unlocked");
      clickCount = 0;
    }
  });

  // --- Canlı Ekran Güncelleme Fonksiyonu ---
  // Saati, tarihi ve analog kolları güncelleyen ana motor.
  function updateDeviceScreen() {
    const now = new Date(); // Sistemin o anki zaman verisini alır.

    // 1. Dijital Saat: Sayıları metne çevirip 09:05 gibi görünmesi için formatlıyoruz.
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = now.getSeconds();

    if (timeDisplay) timeDisplay.textContent = `${hours}:${minutes}`;
    if (hsTimeDisplay) hsTimeDisplay.textContent = `${hours}:${minutes}`;

    // 2. Tarih: ABD İngilizcesi formatında gün ve ay ismini yazdırıyoruz.
    const options = { weekday: "long", day: "numeric", month: "long" };
    if (dateDisplay)
      dateDisplay.textContent = now.toLocaleDateString("en-US", options);

    // 3. Takvim Widget: Widget içindeki gün ismini ve numarasını güncelliyoruz.
    if (widgetDayName)
      widgetDayName.textContent = now.toLocaleDateString("en-US", {
        weekday: "long",
      });
    if (widgetDayNum) widgetDayNum.textContent = now.getDate();

    // 4. Hava Durumu: Simülasyon gereği Londra sıcaklığını sabitliyoruz.
    if (widgetTemp) widgetTemp.textContent = "7°";

    // 5. Analog Saat Mekanizması:
    // Her kolun 360 derecelik daire içindeki açısını (degree) hesaplıyoruz.
    const secondDeg = seconds * 6; // 60 saniye = 360 derece, yani 1 saniye = 6 derece.
    const minuteDeg = minutes * 6 + seconds * 0.1; // Yelkovanın saniyeye göre hafif kayması.
    const hourDeg = (now.getHours() % 12) * 30 + minutes * 0.5; // Akrebin dakikaya göre kayması.

    // HTML elemanlarını seçip CSS 'transform' özelliğine bu açıları basıyoruz.
    const secHand = document.querySelector(".SecondHand");
    const minHand = document.querySelector(".MinuteHand");
    const hourHand = document.querySelector(".HourHand");

    if (secHand) secHand.style.transform = `rotate(${secondDeg}deg)`;
    if (minHand) minHand.style.transform = `rotate(${minuteDeg}deg)`;
    if (hourHand) hourHand.style.transform = `rotate(${hourDeg}deg)`;
  }

  // Fonksiyonu her 1000 milisaniyede (1 saniye) bir tekrar çalıştırır.
  setInterval(updateDeviceScreen, 1000);
  updateDeviceScreen(); // İlk yüklemede saatin 1 saniye beklememesi için hemen çalıştırır.
};

// --- Uygulama Kontrol Fonksiyonları ---

// Uygulamayı açan fonksiyon: Dışarıdan isim (name) parametresi alır.
function openApp(name) {
  const appWindow = document.getElementById("appWindow");
  const appNameDisplay = document.getElementById("appNameDisplay");

  if (appWindow && appNameDisplay) {
    appNameDisplay.textContent = name; // Pencere başlığını tıklağımız app yapar.
    appWindow.classList.add("active"); // CSS'teki büyüme animasyonunu tetikler.
  }
}

// Uygulamayı kapatan fonksiyon: 'active' klasını sildiği için pencere küçülerek kaybolur.
function closeApp() {
  const appWindow = document.getElementById("appWindow");
  if (appWindow) {
    appWindow.classList.remove("active");
  }
}

// --- Klavye Dinleyici (Keyboard Listener) ---
// Belirlediğin tuşlara basıldığında closeApp motorunu tetikler.
document.addEventListener("keydown", function (event) {
  // q, Q veya Escape tuşlarından birine basılmışsa:
  if (event.key === "q" || event.key === "Q" || event.key === "Escape") {
    closeApp();
    console.log("Uygulamadan klavye kısayolu ile çıkıldı.");
  }
});
