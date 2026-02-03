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

  // openApp fonksiyonuna 'event' parametresini ekliyoruz
  function openApp(name, event) {
    // Tıklama olayının yukarıdaki div'lere (iPhone'a) sıçramasını engeller.
    // Böylece telefonun kapanma komutu tetiklenmez.
    if (event) {
      event.stopPropagation();
    }

    const appWindow = document.getElementById("appWindow");
    const appNameDisplay = document.getElementById("appNameDisplay");

    if (appWindow && appNameDisplay) {
      appNameDisplay.textContent = name;
      appWindow.classList.add("active");
      console.log(name + " açıldı ve iPhone tıklama sayacı durduruldu.");
    }
  }

  // --- Telefon Açılış Mantığı ---
  // Telefona tıklandığında (click olayı) çalışacak olan kontrol ünitesi.
  iphone.addEventListener("click", () => {
    const appWindow = document.getElementById("appWindow");

    // Eğer bir uygulama penceresi ŞU AN AÇIKSA, telefonun kapanma sayacını çalıştırma
    if (appWindow.classList.contains("active")) {
      return; // Fonksiyonu burada bitir, aşağıya geçme
    }

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

/**
 * openApp - Uygulamayı açan ve içeriğini dinamik olarak yükleyen motor.
 * @param {string} name - Uygulamanın adı (Örn: 'Music', 'FaceTime')
 * @param {Event} event - Tıklama olayı (stopPropagation için kullanılır)
 */
function openApp(name, event) {
  // 1. Tıklama sinyalinin dışarıdaki iPhone div'ine yayılmasını durduruyoruz.
  // Bu sayede uygulama açılırken telefonun kilitlenmesini engelliyoruz.
  if (event) event.stopPropagation();

  const appWindow = document.getElementById("appWindow");
  const content = appWindow.querySelector(".AppContent");

  // 2. Önceki uygulamadan kalan CSS sınıflarını ve HTML içeriğini tamamen temizliyoruz.
  // Her açılışta "temiz bir sayfa" (reset) yapıyoruz.
  appWindow.className = "AppWindow active";
  content.innerHTML = "";

  // 3. Uygulama ismine göre mantık katmanına (Logic Layer) geçiyoruz:

  if (name === "Music") {
    appWindow.classList.add("music-bg"); // Kırmızımsı arka plan
    content.innerHTML = `
      <div class="music-player">
        <div class="album-art"></div>
        <div class="song-info">
          <h3 style="font-size: 18px; margin-bottom: 5px;">Küsme Çiçekleri</h3>
          <p style="opacity: 0.8;">Yalın</p>
        </div>
        <div class="controls">
          <span class="material-symbols-outlined">skip_previous</span>
          <span class="material-symbols-outlined" style="font-size: 50px;">play_circle</span>
          <span class="material-symbols-outlined">skip_next</span>
        </div>
      </div>
    `;
  } else if (name === "FaceTime") {
    appWindow.classList.add("facetime-bg"); // Yeşil arka plan
    content.innerHTML = `
      <div class="facetime-view">
        <span class="material-symbols-outlined" style="font-size: 80px; color: rgba(255,255,255,0.5);">videocam</span>
        <p style="margin-top: 15px; font-weight: bold;">FaceTime</p>
        <p style="font-size: 12px; opacity: 0.7;">No recent calls found</p>
      </div>
    `;
  } else if (name === "Photos") {
    appWindow.classList.add("photos-bg"); // Açık gri arka plan
    content.innerHTML = `
      <div class="photos-grid" style="width: 100%;">
        <h3 style="margin-bottom: 15px; font-size: 20px;">Library</h3>
        <div class="grid">
          <div class="photo-placeholder"></div>
          <div class="photo-placeholder"></div>
          <div class="photo-placeholder"></div>
          <div class="photo-placeholder"></div>
          <div class="photo-placeholder"></div>
          <div class="photo-placeholder"></div>
        </div>
      </div>
    `;
  } else if (name === "Safari") {
    appWindow.classList.add("safari-bg"); // Beyaz arka plan
    content.innerHTML = `
      <div class="safari-browser" style="width: 100%; text-align: center;">
        <div class="search-bar-top" style="background: #e5e5ea; padding: 8px; border-radius: 10px; margin-bottom: 20px; font-size: 12px; color: #666;">
           <span class="material-symbols-outlined" style="font-size: 12px; vertical-align: middle;">lock</span> apple.com
        </div>
        <h1 style="font-size: 24px; margin-top: 40px;">Safari</h1>
        <p style="font-size: 14px; color: #007aff; margin-top: 10px;">Favorites</p>
      </div>
    `;
  } else {
    // Tanımlanmamış diğer uygulamalar için standart boş sayfa
    content.innerHTML = `<h2 style="color: #888;">${name} Coming Soon</h2>`;
  }

  console.log(`${name} uygulaması başarıyla yüklendi.`);
}
