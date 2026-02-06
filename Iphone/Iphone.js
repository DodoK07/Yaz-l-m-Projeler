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
  const video = document.getElementById("cameraStream");

  // 1. Saat Sayacını Durdur (CPU yormaması için)
  if (window.clockInterval) {
    clearInterval(window.clockInterval);
    window.clockInterval = null; // Belleği tamamen serbest bırak
    console.log("Saat motoru durduruldu.");
  }

  // 2. Kamera Akışını Durdur (Işığın sönmesi ve gizlilik için)
  if (video && video.srcObject) {
    const tracks = video.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
    console.log("Kamera erişimi kapatıldı.");
  }

  // --- Görsel Kapanış ---
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
    appWindow.classList.add("photos-bg"); // Beyaz/Açık gri arka plan
    content.innerHTML = `
    <div class="photos-app-container">
      <div class="photos-nav-top">
        <span class="material-symbols-outlined plus-icon">add</span>
      </div>

      <div class="photos-header">
        <h1>Albums</h1>
      </div>

      <div class="albums-section">
        <div class="section-header">
          <h2>My Albums</h2>
          <a href="#">See All</a>
        </div>

        <div class="albums-grid">
          <div class="album-item">
            <div class="album-cover">
              <img src="https://picsum.photos/id/237/200/200" alt="Recents">
            </div>
            <div class="album-info">
              <span class="album-name">Recents</span>
              <span class="album-count">26,992</span>
            </div>
          </div>
          <div class="album-item">
            <div class="album-cover">
              <img src="https://picsum.photos/id/1/200/200" alt="CapCut">
            </div>
            <div class="album-info">
              <span class="album-name">CapCut</span>
              <span class="album-count">31</span>
            </div>
          </div>
          <div class="album-item">
            <div class="album-cover">
              <div class="heart-badge"><span class="material-symbols-outlined">favorite</span></div>
              <img src="https://picsum.photos/id/10/200/200" alt="Favorites">
            </div>
            <div class="album-info">
              <span class="album-name">Favorites</span>
              <span class="album-count">237</span>
            </div>
          </div>
          <div class="album-item">
            <div class="album-cover">
              <img src="https://picsum.photos/id/20/200/200" alt="Reels">
            </div>
            <div class="album-info">
              <span class="album-name">Reels</span>
              <span class="album-count">3</span>
            </div>
          </div>
        </div>
      </div>

      <div class="albums-section">
        <div class="section-header">
          <h2>Shared Albums</h2>
          <a href="#">See All</a>
        </div>
      </div>

      <div class="photos-tab-bar">
        <div class="p-tab"><span class="material-symbols-outlined">image</span><span>Library</span></div>
        <div class="p-tab"><span class="material-symbols-outlined">rectangle_stack</span><span>For You</span></div>
        <div class="p-tab p-active"><span class="material-symbols-outlined">auto_awesome_motion</span><span>Albums</span></div>
        <div class="p-tab"><span class="material-symbols-outlined">search</span><span>Search</span></div>
      </div>
    </div>
    `;
  } else if (name === "CameraApp") {
    appWindow.classList.add("camera-bg"); // Siyah arka plan
    content.innerHTML = `
      <div class="camera-app-container">
        <video id="cameraStream" autoplay playsinline></video>
        
        <div class="camera-ui-top">
          <span class="material-symbols-outlined">flash_off</span>
          <span class="material-symbols-outlined">hdr_on</span>
        </div>

        <div class="camera-ui-bottom">
          <div class="camera-modes">
            <span>VIDEO</span>
            <span class="active-mode">PHOTO</span>
            <span>PORTRAIT</span>
          </div>
          <div class="shutter-row">
            <div class="last-photo"></div>
            <div class="shutter-button"></div>
            <span class="material-symbols-outlined flip-icon">cameraswitch</span>
          </div>
        </div>
      </div>
    `;

    // Kamera Erişim Mekanizması
    const video = document.getElementById("cameraStream");

    // Bilgisayarın medya cihazlarına (kamera) erişim isteği
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        video.srcObject = stream; // Kamera akışını video elementine bağla
      })
      .catch((err) => {
        console.error("Kamera erişimi reddedildi: ", err);
        content.innerHTML += `<p style="color:white; margin-top:20px;">Camera Access Denied</p>`;
      });

    // Uygulama kapandığında kamerayı da kapatmak için bir dinleyici ekleyelim
    // Bu, bilgisayarın kamerasının gereksiz yere açık kalmasını (ışığının yanmasını) önler.
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
  } else if (name === "Mail") {
    appWindow.classList.add("mail-bg"); // Beyaz arka plan
    content.innerHTML = `
    <div class="mail-app-container">
      <div class="mail-nav-top">
        <span class="material-symbols-outlined nav-back">chevron_left</span>
        <div class="nav-right">
          <button class="select-btn">Select</button>
          <span class="material-symbols-outlined">more_horiz</span>
        </div>
      </div>

      <div class="mail-header">
        <h1>Inbox</h1>
      </div>

      <div class="mail-tabs">
        <button class="mail-tab active-mail-tab">
          <span class="material-symbols-outlined">person</span> Primary
        </button>
        <button class="mail-tab"><span class="material-symbols-outlined">shopping_cart</span></button>
        <button class="mail-tab"><span class="material-symbols-outlined">chat_bubble</span></button>
        <button class="mail-tab"><span class="material-symbols-outlined">campaign</span></button>
      </div>

      <div class="email-list">
        <div class="email-item">
          <div class="unread-dot"></div>
          <div class="sender-avatar" style="background-image: url('https://i.pravatar.cc/150?u=darla')"></div>
          <div class="email-details">
            <div class="email-row-1">
              <span class="sender-name">Darla Davidson</span>
              <span class="email-time">9:27 AM <span class="material-symbols-outlined" style="font-size:12px;">chevron_right</span></span>
            </div>
            <div class="email-subject">Tickets for tonight</div>
            <div class="email-preview">Hey! Attaching your tickets here in case we end up going at different times...</div>
          </div>
        </div>

        <div class="email-item">
          <div class="unread-dot"></div>
          <div class="sender-avatar" style="background-color: #003087; color: white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold;">UA</div>
          <div class="email-details">
            <div class="email-row-1">
              <span class="sender-name">United Airlines</span>
              <span class="email-time">9:10 AM <span class="material-symbols-outlined" style="font-size:12px;">chevron_right</span></span>
            </div>
            <div class="email-subject">Quick reminder about your upcoming...</div>
            <div class="email-preview">Here's your very own checklist with what you'll need to do before your flight...</div>
          </div>
        </div>

        <div class="email-item">
          <div class="unread-dot"></div>
          <div class="sender-avatar" style="background-image: url('https://i.pravatar.cc/150?u=group')"></div>
          <div class="email-details">
            <div class="email-row-1">
              <span class="sender-name">Liz, Kristina & Melody</span>
              <span class="email-time">8:58 AM <span class="material-symbols-outlined" style="font-size:12px;">chevron_right</span></span>
            </div>
            <div class="email-subject">Friday dinner</div>
            <div class="email-preview">Wow, I love the formality of this invite. Should we dress up? I can pull out my prom dress...</div>
          </div>
        </div>
      </div>

      <div class="mail-toolbar">
        <span class="material-symbols-outlined">filter_list</span>
        <div class="updated-text">Updated Just Now<br><span style="font-size:9px; font-weight:normal;">12 Unread</span></div>
        <span class="material-symbols-outlined">edit_square</span>
      </div>
    </div>
    `;
  } else if (name === "Books") {
    appWindow.classList.add("books-bg");
    content.innerHTML = `
    <div class="books-container">
      <div class="books-header">
        <h1>Reading Now</h1>
        <div class="profile-pic"></div>
      </div>

      <div class="main-book-card">
        <div class="book-cover-large">
          <img src="https://m.media-amazon.com/images/I/71Jzezm8CBL._SY466_.jpg" alt="Game of Thrones">
        </div>
        <div class="book-info-main">
          <h3>A Game of Thrones</h3>
          <p class="author">George R.R. Martin</p>
          <div class="progress-bar-container">
            <div class="progress-fill" style="width: 46%;"></div>
          </div>
          <span class="progress-text">46% completed</span>
        </div>
      </div>

      <div class="section-title">
        <h2>RECENTLY OPENED</h2>
      </div>

      <div class="books-horizontal-scroll">
        <div class="book-item">
          <div class="book-thumb"><img src="https://m.media-amazon.com/images/I/518ICrLrtiL._SY445_SX342_ML2_.jpg" alt="Origin"></div>
          <span>25%</span>
        </div>
        <div class="book-item">
          <div class="book-thumb"><img src="https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1491493625i/33590210.jpg" alt="Marriage"></div>
          <span>14%</span>
        </div>
        <div class="book-item">
          <div class="book-thumb"><img src="https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1488552336i/34454589.jpg" alt="Handmaid"></div>
          <span>43%</span>
        </div>
      </div>
      
      <div class="books-tab-bar">
        <div class="tab active-tab"><span class="material-symbols-outlined">book_5</span><span>Reading Now</span></div>
        <div class="tab"><span class="material-symbols-outlined">library_books</span><span>Library</span></div>
        <div class="tab"><span class="material-symbols-outlined">shopping_bag</span><span>Store</span></div>
        <div class="tab"><span class="material-symbols-outlined">search</span><span>Search</span></div>
      </div>
    </div>
    `;
  } else if (name === "Notes") {
    appWindow.classList.add("notes-bg");
    content.innerHTML = `
    <div class="notes-app-container">
      <div class="notes-nav-top">
        <span class="material-symbols-outlined nav-back">chevron_left</span>
        <span class="nav-title">Folders</span>
        <span class="nav-edit">Edit</span>
      </div>

      <div class="notes-header">
        <h1>Notes</h1>
      </div>

      <div class="notes-search">
        <span class="material-symbols-outlined">search</span>
        <input type="text" placeholder="Search">
      </div>

      <div class="notes-list">
        <div class="notes-item">
          <div class="notes-details">
            <span class="note-title">Shopping List</span>
            <div class="note-meta">
              <span class="note-date">Yesterday</span>
              <span class="note-preview">Milk, Eggs, Bread, Coffee...</span>
            </div>
          </div>
          <span class="material-symbols-outlined arrow">chevron_right</span>
        </div>

        <div class="notes-item">
          <div class="notes-details">
            <span class="note-title">Project Ideas</span>
            <div class="note-meta">
              <span class="note-date">Tuesday</span>
              <span class="note-preview">Create a fully functional iPhone clone using CSS...</span>
            </div>
          </div>
          <span class="material-symbols-outlined arrow">chevron_right</span>
        </div>

        <div class="notes-item">
          <div class="notes-details">
            <span class="note-title">Meeting Notes</span>
            <div class="note-meta">
              <span class="note-date">15/01/2026</span>
              <span class="note-preview">Discuss the new UI layout with the team...</span>
            </div>
          </div>
          <span class="material-symbols-outlined arrow">chevron_right</span>
        </div>
      </div>

      <div class="notes-toolbar">
        <div class="notes-count">3 Notes</div>
        <span class="material-symbols-outlined new-note-btn">edit_square</span>
      </div>
    </div>
    `;
  } else if (name === "Reminders") {
    appWindow.classList.add("reminders-bg");
    content.innerHTML = `
    <div class="reminders-app-container">
      <div class="reminders-nav-top">
        <span class="material-symbols-outlined" style="color: #007aff;">chevron_left</span>
        <span style="color: #007aff; font-weight: 500;">Lists</span>
      </div>

      <div class="reminders-search">
        <span class="material-symbols-outlined">search</span>
        <input type="text" placeholder="Search">
      </div>

      <div class="reminders-grid">
        <div class="reminders-grid-item">
          <div class="grid-top"><span class="material-symbols-outlined" style="background:#007aff;">calendar_today</span> <span class="count">0</span></div>
          <span class="label">Today</span>
        </div>
        <div class="reminders-grid-item">
          <div class="grid-top"><span class="material-symbols-outlined" style="background:#ff3b30;">schedule</span> <span class="count">2</span></div>
          <span class="label">Scheduled</span>
        </div>
        <div class="reminders-grid-item">
          <div class="grid-top"><span class="material-symbols-outlined" style="background:#1d1d1f;">inventory_2</span> <span class="count">5</span></div>
          <span class="label">All</span>
        </div>
        <div class="reminders-grid-item">
          <div class="grid-top"><span class="material-symbols-outlined" style="background:#ff9500;">flag</span> <span class="count">0</span></div>
          <span class="label">Flagged</span>
        </div>
      </div>

      <div class="reminders-list-header">
        <h2>My Lists</h2>
      </div>

      <div class="reminders-list-box">
        <div class="reminders-item">
          <div class="reminder-check"></div>
          <div class="reminder-text">
            <span class="rem-title">Buy groceries</span>
            <span class="rem-sub">Today, 6:00 PM</span>
          </div>
        </div>
        <div class="reminders-item">
          <div class="reminder-check"></div>
          <div class="reminder-text">
            <span class="rem-title">Gym workout</span>
            <span class="rem-sub">Tomorrow, 8:00 AM</span>
          </div>
        </div>
      </div>

      <div class="reminders-toolbar">
        <div class="new-reminder">
          <span class="material-symbols-outlined">add_circle</span>
          <span>New Reminder</span>
        </div>
        <span style="color: #007aff; font-size: 14px;">Add List</span>
      </div>
    </div>
    `;
  } else if (name === "Clock") {
    appWindow.className = "AppWindow active clock-light-mode";

    // Önce iskeleti kuruyoruz (worldClockList div'i burada olmalı)
    content.innerHTML = `
    <div class="clock-app-container">
      <div class="clock-nav-top">
        <span class="nav-edit">Edit</span>
        <span class="material-symbols-outlined nav-plus">add</span>
      </div>

      <div class="clock-header">
        <h1>World Clock</h1>
      </div>

      <div class="clock-list" id="worldClockList"></div>

      <div class="clock-tab-bar">
        <div class="c-tab c-active">
          <span class="material-symbols-outlined">public</span>
          <span>World Clock</span>
        </div>
        <div class="c-tab">
          <span class="material-symbols-outlined">alarm</span>
          <span>Alarm</span>
        </div>
        <div class="c-tab">
          <span class="material-symbols-outlined">timer</span>
          <span>Stopwatch</span>
        </div>
        <div class="c-tab">
          <span class="material-symbols-outlined">hourglass_empty</span>
          <span>Timer</span>
        </div>
      </div>
    </div>
    `;

    // Şehirleri ve UTC farklarını tanımlıyoruz
    const cities = [
      { name: "London", offset: 0 },
      { name: "Istanbul", offset: 3 },
      { name: "New York", offset: -5 },
      { name: "Tokyo", offset: 9 },
    ];

    function refreshWorldClocks() {
      const listContainer = document.getElementById("worldClockList");
      if (!listContainer) return;

      const now = new Date();
      // UTC zamanını milisaniye olarak hesapla
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;

      let html = "";
      cities.forEach((city) => {
        // Her şehrin kendi saatini hesapla
        const cityTime = new Date(utc + 3600000 * city.offset);
        const hours = String(cityTime.getHours()).padStart(2, "0");
        const minutes = String(cityTime.getMinutes()).padStart(2, "0");

        // Gün farkını hesapla
        const dayText =
          cityTime.getDate() > now.getDate()
            ? "Tomorrow"
            : cityTime.getDate() < now.getDate()
              ? "Yesterday"
              : "Today";

        const diffText =
          city.offset >= 0 ? `+${city.offset}HRS` : `${city.offset}HRS`;

        html += `
          <div class="clock-item">
            <div class="location-info">
              <span class="time-diff">${dayText}, ${diffText}</span>
              <span class="city-name">${city.name}</span>
            </div>
            <div class="digital-time">${hours}:${minutes}</div>
          </div>
        `;
      });
      listContainer.innerHTML = html;
    }

    // Fonksiyonu hemen çalıştır ve her saniye güncellemesi için interval kur
    refreshWorldClocks();
    window.clockInterval = setInterval(refreshWorldClocks, 1000);
  } else if (name.toLowerCase() === "appletv") {
    appWindow.className = "AppWindow active apptv-theme";
    content.innerHTML = `
    <div class="apptv-container" style="height: 100%; width: 100%; display: flex; flex-direction: column; background-color: #000; position: relative;">
      
      <div class="apptv-scroll-view" style="flex: 1; overflow-y: auto; padding-bottom: 90px;">
        
        <div class="apptv-main-header">
          <h1>Home</h1>
          <div class="apptv-user-avatar"></div>
        </div>

        <div class="apptv-hero-card">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3BhmmGlOgd0AMzN4URjRBtxD86Snm-1BNagvcOIgyOCpd784-HyCix7WkmRIV7mEAYecWvYZvxsYaoLXmf8q0DRw4VM6_zvi_QqRnAun2Ew&s=10" alt="Morning Show">
          <div class="apptv-hero-info">
            <span class="apptv-badge">APPLE TV+ ORIGINALS</span>
            <h2>The Morning Show</h2>
            <p>S4 • Drama</p>
          </div>
        </div>

        <div class="apptv-section">
          <div class="apptv-section-title">
            <h2>Channels & Apps</h2>
          </div>
          <div class="apptv-horizontal-list">
            <div class="apptv-channel-item" style="background: #1a1a1a; border: 1px solid #333;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Apple_TV_Plus_Logo.svg/1200px-Apple_TV_Plus_Logo.svg.png" style="width: 55%;">
            </div>
            <div class="apptv-channel-item" style="background: #000; border: 1px solid #333;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/MLS_Season_Pass_logo.png" style="width: 70%;">
            </div>
            <div class="apptv-channel-item" style="background: #0047ff;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Max_logo.svg/1280px-Max_logo.svg.png" style="width: 60%;">
            </div>
          </div>
        </div>

        <div class="apptv-section">
          <div class="apptv-section-title">
            <h2>Top Chart: Apple TV+</h2>
            <span class="material-symbols-outlined">chevron_right</span>
          </div>
          <div class="apptv-horizontal-list">
            <div class="apptv-chart-item">
              <img src="https://is1-ssl.mzstatic.com/image/thumb/Video126/v4/4a/5e/52/4a5e5264-5e5d-7592-3f14-4113337f7d1f/AMGT_S1_Key_Art_16_9_Logo_Bottom_Left_English.lsr/600x337.jpg" class="apptv-chart-img">
              <div class="apptv-chart-info">
                <span class="apptv-rank">1</span>
                <div class="apptv-meta">
                  <span class="apptv-m-title">Monarch</span>
                  <span class="apptv-m-sub">Adventure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="apptv-bottom-tab" style="position: absolute; bottom: 0; left: 0; width: 100%; background: rgba(20, 20, 20, 0.95); backdrop-filter: blur(20px); border-top: 0.5px solid #333; z-index: 100;">
        <div class="apptv-tab active"><span class="material-symbols-outlined">play_circle</span><span>Home</span></div>
        <div class="apptv-tab"><span class="material-symbols-outlined">tv</span><span>Apple TV+</span></div>
        <div class="apptv-tab"><span class="material-symbols-outlined">shopping_bag</span><span>Store</span></div>
        <div class="apptv-tab"><span class="material-symbols-outlined">search</span><span>Search</span></div>
      </div>

    </div>
    `;
  } else if (name === "Podcast") {
    appWindow.className = "AppWindow active podcast-playing-mode";
    content.innerHTML = `
    <div class="podcast-app-container">
      <div class="podcast-drag-handle"></div>

      <div class="podcast-art-container">
        <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw0PDQ0NDQ0NDQ0NDQ0NDw0NDg8NDQ0OFREWFxURFhYYHSggGRooHRMTITEhJSkrOi8uFx8zODMtNygtLisBCgoKDg0NFQ8PFzceICUrLi43Ky0tLS0tKystLS0tLSstKy0rLS0tKy8tLSstLSstLS0tLS0tLSstLS0rLSstLf/AABEIAOEA4QMBEQACEQEDEQH/xAAbAAEBAAIDAQAAAAAAAAAAAAAAAQYHAwQFAv/EAEoQAAEDAgMEBAoFCQUJAAAAAAEAAgMEEQUGEgchMVETIkGRFDVSYXFzdIGyswgydaGxIzM0NkKEtMTSFSVDwtEkU2ODk6LBw/D/xAAaAQEBAAMBAQAAAAAAAAAAAAAAAQIEBQMG/8QAMBEBAAIBAgQDBgYDAQAAAAAAAAECAwQRBRIhMVFxgRMiMjNBYTSRocHR8BRCsRX/2gAMAwEAAhEDEQA/ANLoCAgICAgKAqCCoCAgICAgICAgIIgICAgICAgICAgICAgICgICoqAgILZAsgIFkCyBZEEUsgiAgIIgICAgICAgICAgICAgqIIoiKEUQVEEURCyBZFLIgiiIiKIIgICCICAgICAgICAgIKgICCoKiCKqAiCKqCIggICKlkBAQSyCICCICAgICAgICIqKIKiKgWRVRBBUCyAgICKIggIIgWQRAIQRFRAQRAQEBAQEBBUFsiKgtkUQVARFQEFQEEQLICAioiCoiiogIIgiAgiAgICAgqChBUBEVBUVUQQVAQEBAQEBAQEEQRBECyCIIiogiAgICCoAQVBQiKgqChBUBAQEFQQlBnmUMl6tNTXM6p3x0zha48qQf5e/kuPreI8u+PFPXx/hv6fS7+9f8no5nyVDMzpKNkcE7R+bYBHDMORA3Nd5+/mNfR8RtSeXLO8eP1h659LFo3p0lrWaJ7Huje1zHscWuY4Wc1w7CF36zExvDmTExO0vhUEQQRBEURHyUVEERBFRAQEFQUIKgqIqKqCoggIKgIK1pJDWguc4hoa0EucTuAAHEpM7dZWI37NkZQycINNTVtDqjc5kRs5kHInm/8AD071wNdxHn3x4p6ePi6Wn0vL71+7MlyG6IPAzTliKtbrbaKqYLMltuePIfzHn4jvB39HrrYJ2nrX+9mvn08ZI3ju1VXUcsEroZmGORh3tPLsIPaDzC+kx5K5Kxas7w5NqzWdpddZsRAQRBEEKKiCIIiIiiCoCChBQgqIqChBUBBVQUHJTU8kr2xRMdJI86WsaLlx/wDu1Y2tFYm1p2hlETM7Q2llPKkdGBLLpkqyPrcWQg8Ws8/N3/hfO63Xzm9ynSv/AF1MGminW3dkq5raYpmDO8FNI6CGM1MrDZ51dHEx3a3VY3I7QB77rqabhl8lea88sfq1MurrSdq9XTwzaHG94bVQdA0kDpY3mVrfO4WBA84uvXNwiYjfHbf7S86a2Jna0M2a4EAgggi4I3gg8CFx5iYnaW/E7vKzFgEFdFok6krb9FM0XfGeXnae0fgd62tLq74Lbx1jweObDXJHVqbF8KnpJjDO3S7i1w3skb5TT2j8F9NhzUzU5qS5OTHak7WdJerzEEQRARUKCIPlAQRUVQEH0iKgqChBQgICCoBQbdyjgEFJAyRtpJ5o2PfMbHc4A6W8m/jxK+Y12rvlvNZ6RH0djT4a0rzfWXvrQbDiqQ8xyCMhshY8Mc76rX2NifNeyzxzEXjm7JbfadmpMwZZnoo2SyzQyiR+jqOcX6rE6iCN43Hf5xzX1Gn1lM8zFazG3i4+XBOON5nd1sBwWStlfFFJFGWM1kyuIuL23AAk8V6ajURhrFpjfyY4sU5J2htXLdDLTUkVPNIyR0Wpocy5bo1Etbv5A29y+a1eSuTLN6xtu62Ck0pETL01qvV0cYwmCshMM7bji17dz4neU09h/HtXvp9RfBfmrPp4vPLirkrtLTFbT9FNNDqD+ilki1jcHaXFt/uX1tLc1Yt4uLaNpmHAsmIgiCIIUERUKCICAgoQUIioKEFCKqIIKgICD3csYtVsqaOBtRKITUQs6LUSzQ54BbY8BYngtPV4Mdsd7TWN9u7Yw5LxesRPTdt5fKuw4a9jTDMHxumYYpA6Jou6Vuk3YN43nhx7V6Yt+eu07de/gxv8M7xu1hmympWRRGHC6mhcZCDLMNLHt0nqfWdv3A9nAr6PR2vNrc2WL/aHLzxWIjakw6eVYYHzPE9DNXtEd2xw3JjNx1iLjd2cV66ubRSOW8U695eeCIm3Wu7aGX4o2U4bDSSUbNb/AMhKLPBvvdxPH0r5zVTacnvW5vvDq4dor0jZ6K1nq1zn/F6uKt6GKolij8HjOiNxZvcX3Nxv7AvoOG4MdsHNau87y5uqyXjJtEsKXWaKICCIIgiKhREKCIogIKEFCCoihBUFQEFQEBB6GXv0+i9rp/mNXjqfk38peuL5lfNuxfHu21rilJMMUrmsq6ppgp5cQi/KF15AGvEdju03cRa3ABfR4clZ02OZrHWYrLl3rPtbRE/djmI41WVLWsqKh8rGu1hpDGgOsRfqgX3E963cWnxYpmaV2a98t79LTu4sOxKopnF9PK6Jzm6XFoadTb3sQQQssuGmSNrxvCUvak71nZ7E5qZ4aKplrKgyVdWaQhrhGGxtcG6mhthe7itasY8dr460jasbvaea0VtNu87NrxM0ta27naWhupxu51ha5PaV8xad5mXWiNo2au2keMv3aH4nr6Phf4b1ly9Z830Yuui1EQEEQEEQfJQQoqIgiiIqKoRFQVBQgqAgqAgIPQy9+nUXtdP8wLx1Pyb+UvXD8yvm3Wvj3bYfnGCSmqafFomdIyJvQVUY/ahNxc+aznC/YdK6+gvXJitp7TtPePNpais1vGSPViNdl15Bnw8Gro3b29F1pof+HIz61x711KaqI9zN7tvv2n7xLTthmfep1hw0WW6yTrSROpYW75KiqBgjjb2mzrE+77llk1eOvSJ5p8I6pXDee/SPGWSYDSsrK2mFO139nYSLRveLGecnUXnzl1nW7A0cNS0dTk9hhtz/AB3/AEhs4q+0vG3w1/VsBcB0WrNpHjL92h+J6+l4X+G9ZcrWfN9GLrotQQRAKCIqIIiPlFQoCAiKEVQg+kQQVBUFQEBAQdzBp2x1dLI86WR1ED3O8loeCT3LyzVm2O1Y+sSzxzteJnxbrbURkAiRhBFwQ9pBHNfIzjvHSYdvnr4jpIyCC5hBBBBc0gjkrFbxO8RJvWfq13nXCqei6KooZJIHzSFjmQylrQNJNxbeN/Ze3mXe0GfJmiaZo328Yc7U4649rUl52V6YYhVdFXVFRJGyJ0oD53nU4OaLXcTYdY8LHzr21d50+PmxVjfyeeGPaW2vLadHTxRRtjgYxkTRZrWAaR/r6V83kve9pm/d1aVrEbV7OdebJqvaR4y/dofievpeF/hvWXK1nzfRi66LUQoCAgiCIIUV8lBEQQEVQiKEGR5CyyMVrxROnNODDLMZGsEh6lt1iR5SDm2hZUGEVsdI2odUh9NHUa3RiNw1Pe3TYE+Rx86KyXLOytlbhDMTNe+Jz4qiUQina9o6Nz2gatQO/R96DF8h5SnxiqNPE9sLI4+mmne0vEbCbABtxqcTwFxwPJEbSZsJo7b8RqyeYihA7rIrDdoezGTCYBWQ1JqqbpGxya4xHLCXbmuNjZzSbC+6xI3doI58gbLmYtQeGurn05M0sQjbA2QWYQLklwRWCYXQdPWU9Jr0dPVw0vSab6dcoZqtffa97XRGWbSsgMwZlI9tW6pFS+ZpD4hFo0BpvcON+KK93KWxbwqkhq62rdTmojZMyCGFrnsY4Xbrc79ogg2tu5q7j1a3YLT6HeD4hKJbdXp4I3Rk8jpsR6d/oUGuMq5QdV4v/ZM7/BJGOqWSvawSFroQ64AuLglvHkg2Odg0J44pKf3Vn9aDF81YPPlmppWU1W6qiqo5JHxSx9HH1HAEWBNj1uItw7eC19RpseeNr/n9XrizWxz0ZDl/MNNWt/Ju0StF3wPt0jfOPKb5x9y+c1OjyYJ69Y8XUw565I6d2B7SPGX7tD8T12uF/ho85aGs+axddFqBQRBEEQEHyUEKKiAgIKEFCI2FsL8eD2Kp/FiK7W37xxT/AGbD8+dBsjZr+qsHstf82ZBiH0bx1sVPaI8PHeZ/9EGM7VMwYgzHMRbHXVkTIXxtjZFUzRMjAgYeq1rgBvJPpJQbX2nvMmVal7zdz6fD5HHm4zwuv3oOHYN4jb7ZVfEEGjcs+OcP+1qP+KYg2l9JD9Hw31tX8tiDK9p1ZNTZbmkppXwSBlFGJInFj2tdLG11nDeLgkbuaDE9gGLVU8uJR1FTUTsZHSvYJ5pJtDi6QEt1E2vYdwQdfBWgZ+qreVUn3mkaSgu3fGq2nrqJlLWVdMx1I97mU9RLA1zulIuQwi5sg1NiGJVNQWvqqmoqXMBa11TNJOWN4kAvJsER7uH5LxMiOeMxQP3PZrmfHMzkeq02Pmuudl4jp4maW6+nRtU0uXpaOjp5lwevgcJq1wlMrtPTNkMgLgNzTcAjcDYW7F7aXUYckcuLpt9OzDNiyV63/N1sEwKprTIKcR/kgwvMjywda9rbjf6pWefU48ERzz3Y48Nsm/K4MWwyakmME4aJA1r+o7U0tdwIPes8OWmWnPTsxyUmluWz08LyfXVMTZo2xMjeLsMshaXt8oAA7vStfNr8OK3Laev2etNNkvG8OLF8q1tK1r5Wxujc9rNcTy9rXE2AdcAi/NZYdbhyzMVlMmnvSN5dw5CxHlTf9Y/0ry/9PT+M/kz/AMTI8jG8FqKJ0bajo7yNc5vRu1iwIBvuHMLZwaimaJmn0eOTFbHMRZ5hXuwRBEBAQVBURsLYX48HsdT+LEVk+2HJ2KV+JQz0VG6oibRRRF4lgZaQSyuLbPcDwc3vQZtkvDKijy5HS1UZhnipa3XGXNcW3fK4b2kjg4dvagwX6N3HFfV4d/MIMG2s+PcW9az5EaDdG0b9UpvZMO+bAiOPYN4jb7ZVfEEVo3LPjjD/ALWo/wCKYiNqfSNF4MMHOaqH/YxFZRg0tPmHLng7pA18lMynntvdT1cQaQ4tvw1Na8DtBCDTFHiOMZarKmnDIop5Gsa/pYzNFNG0kskjNxdpud/uIBFgR7Gy3FJqzNMdXUFpmqGVT3ljdDb9BpFh2bgEVlW2nKOJ4hWUctDSOqI46V8b3NkhZpeZCbWe4diDT9bhVRSVgpKuIwzskhEkTi1xAdpI3tJBuHDtWNvhnyI7wzjaRilTT+CNp5nwiQ1BeYzpc7T0dhfl1yuHwvDTJzzeN+zpau9q8vLOzizHO+XL9PLK7XI8Uj3OPEuJAJ9O8rLS1imvvWvSOrHNM200TP2fey+K1NUyHdqqAy53bmxtP+cqcXnfJSseC6KNq2l4+1CHTWQyf7ymDfex7v6wtnhNt8Mx4S8dbG14n7PbzTWzU+EUTqaR0Rd4LGXM3EM6BxsD2b2tWrpMdMmryc8b9/8Ar2zWmuGvLO3Zwmrlmy5JLM90kul3Xd9YllTZpvzGkb/MsvZ1pxCK1jaPD0OabaaZl2MgYnUVFPUuqJnSuZMGtc+1wNANtw5rDiOGlMlIrG2/8rpclrUtNpa5rcSqKnQ6omfM5rbNLrdUHeQLLuUxUx7xSNnPve1vind1Ss2KIiICAiiD6RGwdhh/vwex1P4sRWwdo+0iowmtipYaSCZr6VlQXyve0hzpJG6QG9nUHegyXL+OPxHA/DpI2xPnpasmNhLmt0mRm4nf+zf3oNe/Rv44t6vDv5hBg21jx7i3rm/IjQbo2jfqlN7Jh3zoEHHsH8Rt9sqviCDRuWfHGH/a1H/FNRG1PpF/mcL9dVfAxFawynmStwmpFVThwa6zZYnhwhqY+Ol3n42cN4vyJBI3xVU2G5pwkPZ1XjUI5CAZ6CqAF2u5jeLjg4EHkQVqnZFSSQZmjp5m6ZYBXQyN7A9kbmm3MXCI2RtO2iVGEVNNBBSwTiaB0xdK97S0h+mw0orSeP4/JiWJmuljZE+aSmBjjLixoYGMG87/ANlY3+GfIjvDINq31qH0Vf8A6lx+D9snp+7f13+rEpsZqn0zaN8t6dmgNj0Riwb9XrAX+9dSunx1yTkiOrTnLaa8m/RldLIafLT5Ruc+QuHnJqQ0fcxc28e04hEeEfs26+7pt/73cu1KIFlFMPKmj9zmtcPgKx4TO1slV1sdKy+8t11PiNB/ZlSdMscbWNsbOexn1JGHyhYXHm5FTVYr6bP/AJGPtK4bVy4/Z27sSxyiraJxpJZZegddzA2R4p5m3uSG3te53jsJ9BPSwZcWePaVjr+sNTLS+P3JnoyvZj+i1frx8sLm8U+bj/v1bWj+CzXLOA9AXbc8RUQEBBEFQUINg7DfHY9jqfxYg7W3s/3vT/Z0Pz5kGx9m36q0/slf82ZBiX0b+OK+rw7+YQYPtY8e4r61nyI0G6No36pz+yYd82BBx7B/EbPbKr4gg0blnxxh/wBrUf8AFMRG0vpIfo+G+tq/lsQe5to/Vz/m0HxBFY99HOV18XjudA8BeG9gcenBPc1vcEHFgjQM/VQAsNVSfeaRpKDp/SG8Y0HsT/nFBq+k/Ow+ti+MLG/wz5Fe8M32rfWofRV/jCuPwftk9P3b+u/1dPFMIpWYFT1bIWtqHNpi6W7tRLndbde3avbDqMltbfHM9I36ML4qxgi23V70mX6uswnD8OpIw+aVkD3Bx0MYxsRkc5x7Bq0j0uHNeWl97XZbeG/8Ms3TT1q62donuwWnfKxzJYTTOkY4EOZJoMb2kcw5xHuWOi9zW5Kef8stR72nrbyY9j2X2UVLR1kM83SyviO/SOjJiL7tIF7ghbmn1U5st8dq9I/Xq8MmGMdK2iWQY1L4bgDamUDpWtZLqAtaRsnRuI5XGrvWlgr7DXTjr2l75J9pp+ae7i2ZH/Zav14+WFlxT5mP+/VNH8FmuWcB6Au00FQREEUQRBUgVBn2xGQNxtpcWt/2OpHWIAJ6m5B2tu8jXYvAWuDgMOhHVIP+NMg2Ls4qIxlaAGRgIpa+4L2ix6WZBgOwTHaelq6mmqJGw+GwwdE97gxjpYnOtHc9pEhtz025INl5g2X4TiFXJWz+EiWbQZGwzNbFIWtDb2LSRuaOBQebtqxmlgwZ+HtkZ09Q6mjjga4F7Io5WPLiOIbaO2/tKDobAsep/ApsPfKxlRHUyTRxvcGulie1u9t+NnB1wOFxzQZBRbKcHhrWVzBU64pxUsidMDA2QO1NNtN7A2IF+xBgX0gMcp6iajooJWSupm1D5yxwc2N8mgNYSP2rNcSOy45oNj0DsOzDgsUL5A9kkUHTRxSBs9NUR6SWnkQR2jeDyKDsZZythmBQ1L4pXRsl0PnqKuZn1WA6RewAA1O70GqskYxHV5zlrGuAinfWmNzurqjEJaw7+0hoNkRtPNeTMKxWWKatLy+GMxMMVR0Y0l194HnRWmdquWqDCaqhFAZHNkjfNI183TG7JG2tyvv7lJjeJgju9vMOCRYrHTyxVIa1mtzHtaJWua8NvcXFj1QvnNNqL6S162pvv+zq5ccZoiYl5OdmRU+FQYe2QOkJgiYDYPLWcXkdguB3rY0HNk1N88xtHV5ajauKuOJfG0aufCKKGCV8RDZSTDI5jtLQxoBLTw49y9eF1nmyXmPqw1kxtSsPps3hOW5OkdqkbHKXFzrvLo5y4Ek7ySGjvWE1mnEYnbpP7wyiYtpZh3ZMPixXDKRjJxGY2xOJaBJokbGWOY5txzPcF4xkvpNTeZrvu9JrGbFWIlwZjjiocGNGZQ95a2Nl7NfITLrcQ2/Ab1npZtn1ntdtoY5dseDk3dXZo8Cmq7kD8sDvNv8ADC9OJ1mcmPaP7ux0kxFLNds4D0BdloBQEEQFAVFQECwPHegoFuG5A0jjYdyD6QTo28h3IPpoA4AD0IikA8QD6UE6NvkjuRX0BbhuREc0HiAfcggY3yR3BB9EX470Hz0bfJHcEFDQOAA9AsgWHIIAA7BxVEAA4AD0KCFo42F/QgEDkEEsB2IIWg8QEUQRAQRAQEBBUBBQgqCoKiCAgoQW6CIKgICCXQEEQEEQCgiCIqICCIgiiAgICCoCChBUFugIioCAgqAgICKiIIogiIIqIiIqICCICAgIgiiAgIKgIKiKgIqoggIqoggIogiIICCICCIIiiCICAgICAgICAgIKgIF0FuiKgICKIhdFLoF0BARBBEVEBAQRAQEBAQEBAQEBAQEBAQVARFugXRS6AiCAiiBdBEBAQEREBFEBAQEBQFQQEBAQEBAQVAQEBAQEBAQEBAQEEQEBQFQQEBAQEBAQEBAQEBAQEFQEBAQEBAQEBARBBEUQFAVBAQEBAQf/9k=" alt="Housecast">
      </div>

      <div class="podcast-info">
        <div class="podcast-date">29 MAY 2023</div>
        <div class="podcast-title-row">
          <h2 class="podcast-title">Game... (ft Jack Simm) Apr & May Lo</h2>
          <span class="material-symbols-outlined podcast-more">more_horiz</span>
        </div>
      </div>

      <div class="podcast-progress-container">
        <div class="podcast-slider-base">
          <div class="podcast-slider-fill" style="width: 40%;"></div>
          <div class="podcast-slider-knob" style="left: 40%;"></div>
        </div>
        <div class="podcast-time-row">
          <span>21:45</span>
          <span>-37:47</span>
        </div>
      </div>

      <div class="podcast-controls">
        <span class="material-symbols-outlined">replay_5</span>
        <span class="material-symbols-outlined">pause</span>
        <span class="material-symbols-outlined">forward_30</span>
      </div>

      <div class="podcast-volume-container">
        <span class="material-symbols-outlined vol-icon">volume_down</span>
        <div class="podcast-slider-base volume-slider">
          <div class="podcast-slider-fill" style="width: 60%;"></div>
          <div class="podcast-slider-knob" style="left: 60%;"></div>
        </div>
        <span class="material-symbols-outlined vol-icon">volume_up</span>
      </div>

      <div class="podcast-footer">
        <span class="footer-text">1x</span>
        <span class="material-symbols-outlined footer-icon active">podcasts</span>
        <span class="material-symbols-outlined footer-icon">bedtime</span>
      </div>
    </div>
    `;
  } else if (name === "Store") {
    appWindow.className = "AppWindow active store-light-mode";
    appWindow.style.backgroundColor = "#f2f2f7";

    content.innerHTML = `
    <div class="store-app-container" style="height: 100%; width: 100%; display: flex; flex-direction: column; background-color: #f2f2f7; position: relative;">
      
      <div class="store-scroll-view" style="flex: 1; overflow-y: auto; padding: 10px 20px 90px 20px;">
        
        <div class="store-top-header" style="margin-bottom: 20px; padding-top: 10px;">
          <span style="color: #8e8e93; font-size: 13px; font-weight: 600; text-transform: uppercase;">Friday, 6 February</span>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h1 style="font-size: 34px; font-weight: bold; margin: 0; color: #000;">Today</h1>
            <div style="width: 35px; height: 35px; border-radius: 50%; background: url('https://i.pravatar.cc/100?u=tech') center/cover; border: 1px solid #ddd;"></div>
          </div>
        </div>

        <div class="store-hero-card" style="background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.1); margin-bottom: 25px;">
          <img src="https://picsum.photos/id/103/400/500" style="width: 100%; height: 300px; object-fit: cover;">
          <div style="padding: 15px;">
            <span style="color: #8e8e93; font-size: 12px; font-weight: bold; text-transform: uppercase;">App of the Day</span>
            <h2 style="font-size: 24px; margin: 5px 0; color: #000;">Minecraft</h2>
            <p style="color: #666; font-size: 14px; margin: 0;">Build, explore, and survive in an infinite world.</p>
          </div>
        </div>

        <div class="store-section-header" style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 15px;">
          <h2 style="font-size: 20px; font-weight: bold; margin: 0; color: #000;">Must-Have Apps</h2>
          <span style="color: #007aff; font-size: 16px;">See All</span>
        </div>

        <div class="store-app-list" style="display: flex; flex-direction: column; gap: 15px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 55px; height: 55px; background: #000; border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Logo_of_YouTube_%282015-2017%29.svg" style="width: 70%;">
            </div>
            <div style="flex: 1; border-bottom: 0.5px solid #e5e5ea; padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="display: block; font-weight: 600; font-size: 15px;">YouTube</span>
                <span style="color: #8e8e93; font-size: 12px;">Watch, Listen, Stream</span>
              </div>
              <button style="background: #f0f0f7; color: #007aff; border: none; border-radius: 15px; padding: 5px 15px; font-weight: bold; font-size: 13px;">GET</button>
            </div>
          </div>
          
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 55px; height: 55px; background: #1da1f2; border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
              <img src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg" style="width: 60%; filter: brightness(0) invert(1);">
            </div>
            <div style="flex: 1; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="display: block; font-weight: 600; font-size: 15px;">Twitter</span>
                <span style="color: #8e8e93; font-size: 12px;">See what's happening</span>
              </div>
              <button style="background: #f0f0f7; color: #007aff; border: none; border-radius: 15px; padding: 5px 15px; font-weight: bold; font-size: 13px;">GET</button>
            </div>
          </div>
        </div>

      </div>

      <div class="store-bottom-tab" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 75px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-top: 0.5px solid #d1d1d6; display: flex; justify-content: space-around; align-items: center; padding-bottom: 15px; z-index: 100;">
        <div style="text-align: center; color: #007aff; font-size: 10px; display: flex; flex-direction: column; align-items: center;">
          <span class="material-symbols-outlined" style="font-size: 24px !important;">auto_awesome_motion</span>Today
        </div>
        <div style="text-align: center; color: #8e8e93; font-size: 10px; display: flex; flex-direction: column; align-items: center;">
          <span class="material-symbols-outlined" style="font-size: 24px !important;">rocket_launch</span>Apps
        </div>
        <div style="text-align: center; color: #8e8e93; font-size: 10px; display: flex; flex-direction: column; align-items: center;">
          <span class="material-symbols-outlined" style="font-size: 24px !important;">search</span>Search
        </div>
      </div>

    </div>
    `;
  } else if (name === "Maps") {
    appWindow.className = "AppWindow active maps-mode";
    appWindow.style.backgroundColor = "#e5e3df";

    content.innerHTML = `
    <div class="maps-app-container" style="height: 100%; width: 100%; position: relative; overflow: hidden; cursor: grab; background-color: #e5e3df;">
      
      <div id="mapCanvas" style="position: absolute; top: 0; left: 0; width: 2000px; height: 1000px; background-image: url('https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg'); background-size: cover; transform-origin: 0 0; transition: transform 0.1s ease-out;">
        </div>

      <div id="zoomLevel" style="position: absolute; top: 90px; right: 15px; background: rgba(0,0,0,0.5); color: white; padding: 2px 8px; border-radius: 5px; font-size: 10px; z-index: 20;">100%</div>

      <div style="position: absolute; top: 40px; width: 90%; left: 5%; background: white; border-radius: 10px; padding: 10px; display: flex; align-items: center; gap: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 15;">
        <span class="material-symbols-outlined" style="color: #8e8e93;">search</span>
        <span style="color: #8e8e93; font-size: 14px;">Search for a place</span>
      </div>

      <div style="position: absolute; bottom: 0; width: 100%; height: 70px; background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); border-top: 1px solid #ccc; display: flex; justify-content: space-around; align-items: center; padding-bottom: 15px; z-index: 15;">
        <div style="color: #007aff; text-align: center;"><span class="material-symbols-outlined">explore</span><br><span style="font-size: 10px;">Explore</span></div>
        <div style="color: #8e8e93; text-align: center;"><span class="material-symbols-outlined">commute</span><br><span style="font-size: 10px;">Commute</span></div>
        <div style="color: #8e8e93; text-align: center;"><span class="material-symbols-outlined">saved_search</span><br><span style="font-size: 10px;">Saved</span></div>
      </div>
    </div>
    `;

    // --- Harita Motoru Verileri ---
    const map = document.getElementById("mapCanvas");
    const container = map.parentElement;
    const zoomText = document.getElementById("zoomLevel");

    let isDragging = false;
    let startX, startY;
    let posX = -500,
      posY = -250; // Başlangıç konumu
    let scale = 1; // Başlangıç büyüklüğü

    // Güncelleme Fonksiyonu
    function updateMapTransform() {
      map.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
      zoomText.textContent = `${Math.round(scale * 100)}%`;
    }

    // İlk yerleşim
    updateMapTransform();

    // --- ZOOM (Büyütme/Küçültme) ---
    container.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const zoomSpeed = 0.1;
        if (e.deltaY < 0) {
          scale = Math.min(scale + zoomSpeed, 3); // Maksimum 3 kat büyüme
        } else {
          scale = Math.max(scale - zoomSpeed, 0.3); // Minimum %30 küçülme
        }
        updateMapTransform();
      },
      { passive: false },
    );

    // --- DRAG (Sürükleme) ---
    container.addEventListener("mousedown", (e) => {
      isDragging = true;
      container.style.cursor = "grabbing";
      startX = e.clientX - posX;
      startY = e.clientY - posY;
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      posX = e.clientX - startX;
      posY = e.clientY - startY;
      updateMapTransform();
    });

    window.addEventListener("mouseup", () => {
      isDragging = false;
      container.style.cursor = "grab";
    });

    // --- PIN BIRAKMA ---
    map.addEventListener("click", (e) => {
      // Sürükleme yapılırken pin bırakılmasını engellemek için küçük bir gecikme kontrolü
      const oldPin = document.getElementById("mapPin");
      if (oldPin) oldPin.remove();

      // Mouse'un harita üzerindeki gerçek koordinatlarını hesapla (Scale dikkate alınarak)
      const rect = map.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;

      const pin = document.createElement("div");
      pin.id = "mapPin";
      pin.innerHTML =
        '<span class="material-symbols-outlined" style="color: #ff3b30; font-size: 30px; position: absolute; transform: translate(-50%, -100%);">location_on</span>';
      pin.style.position = "absolute";
      pin.style.left = `${x}px`;
      pin.style.top = `${y}px`;

      map.appendChild(pin);
    });
  } else if (name === "Health") {
    appWindow.className = "AppWindow active health-mode";
    appWindow.style.backgroundColor = "#f2f2f7"; // Standart iOS sistem gri arka planı

    content.innerHTML = `
    <div class="health-app-container" style="height: 100%; width: 100%; display: flex; flex-direction: column; background-color: #f2f2f7; font-family: -apple-system, sans-serif;">
      
      <div class="health-scroll-view" style="flex: 1; overflow-y: auto; padding: 10px 20px 90px 20px;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-top: 20px;">
          <h1 style="font-size: 34px; font-weight: bold; margin: 0; color: #000;">Summary</h1>
          <div style="width: 35px; height: 35px; border-radius: 50%; background: url('https://i.pravatar.cc/100?u=health') center/cover; border: 1px solid #ddd;"></div>
        </div>

        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">Favorites</h2>

        <div class="health-cards-grid" style="display: flex; flex-direction: column; gap: 15px;">
          
          <div style="background: white; border-radius: 12px; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="material-symbols-outlined" style="color: #ff2d55; font-size: 20px;">favorite</span>
                <span style="font-weight: 600; color: #ff2d55; font-size: 14px;">Heart Rate</span>
              </div>
              <span style="color: #8e8e93; font-size: 12px;">12:45 PM</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 4px;">
              <span style="font-size: 28px; font-weight: bold;">72</span>
              <span style="color: #8e8e93; font-size: 14px;">BPM</span>
            </div>
          </div>

          <div style="background: white; border-radius: 12px; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="material-symbols-outlined" style="color: #ff9500; font-size: 20px;">steps</span>
                <span style="font-weight: 600; color: #ff9500; font-size: 14px;">Steps</span>
              </div>
              <span style="color: #8e8e93; font-size: 12px;">Today</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 4px;">
              <span style="font-size: 28px; font-weight: bold;">6,432</span>
              <span style="color: #8e8e93; font-size: 14px;">Steps</span>
            </div>
          </div>

          <div style="background: white; border-radius: 12px; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="material-symbols-outlined" style="color: #5856d6; font-size: 20px;">bedtime</span>
                <span style="font-weight: 600; color: #5856d6; font-size: 14px;">Sleep</span>
              </div>
              <span style="color: #8e8e93; font-size: 12px;">Last Night</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 4px;">
              <span style="font-size: 28px; font-weight: bold;">7</span>
              <span style="color: #8e8e93; font-size: 14px;">hr 20 min</span>
            </div>
          </div>

        </div>

        <div style="margin-top: 30px; background: #fff; border-radius: 12px; padding: 15px;">
           <p style="font-size: 13px; color: #666; margin: 0; line-height: 1.4;">Health data is being encrypted and synced securely with your iCloud account.</p>
        </div>

      </div>

      <div class="health-bottom-tab" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 75px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-top: 0.5px solid #d1d1d6; display: flex; justify-content: space-around; align-items: center; padding-bottom: 15px; z-index: 100;">
        <div style="text-align: center; color: #ff2d55; font-size: 10px; display: flex; flex-direction: column; align-items: center;">
          <span class="material-symbols-outlined" style="font-size: 24px !important; font-variation-settings: 'FILL' 1;">favorite</span>Summary
        </div>
        <div style="text-align: center; color: #8e8e93; font-size: 10px; display: flex; flex-direction: column; align-items: center;">
          <span class="material-symbols-outlined" style="font-size: 24px !important;">grid_view</span>Sharing
        </div>
        <div style="text-align: center; color: #8e8e93; font-size: 10px; display: flex; flex-direction: column; align-items: center;">
          <span class="material-symbols-outlined" style="font-size: 24px !important;">search</span>Browse
        </div>
      </div>

    </div>
    `;
  } else {
    // Tanımlanmamış diğer uygulamalar için standart boş sayfa
    content.innerHTML = `<h2 style="color: #888;">${name} Coming Soon</h2>`;
  }

  console.log(`${name} uygulaması başarıyla yüklendi.`);
}
