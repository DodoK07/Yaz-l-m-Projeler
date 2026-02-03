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
  } else {
    // Tanımlanmamış diğer uygulamalar için standart boş sayfa
    content.innerHTML = `<h2 style="color: #888;">${name} Coming Soon</h2>`;
  }

  console.log(`${name} uygulaması başarıyla yüklendi.`);
}
