const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwUNnUL0YfgvgqxLRdJRaMHyCTgkqZZHKi_IVkhnlyTT977CHBFxBeczXpG7wIbPKN7HQ/exec"; // Thay link /exec của bạn vào đây

let isSyncing = false;

// Hàm kiểm tra mạng thực tế bằng cách ping nhẹ
async function checkInternetConnection() {
  if (!navigator.onLine) return false;
  try {
    // Thử kết nối nhanh với Google để xác nhận có mạng thực sự
    await fetch("https://www.google.com/favicon.ico", { mode: "no-cors", cache: "no-store" });
    return true;
  } catch (e) {
    return false;
  }
}

async function syncPendingSurveys() {
  if (isSyncing) return;

  // Kiểm tra IndexedDB xem có hàm lấy dữ liệu chưa
  if (typeof getUnsyncedSurveys !== "function") {
    console.warn("getUnsyncedSurveys chưa sẵn sàng!");
    return;
  }

  try {
    const pendingSurveys = await getUnsyncedSurveys();
    if (!pendingSurveys || pendingSurveys.length === 0) return;

    // Kiểm tra xem đã có Internet thực sự chưa
    const hasNet = await checkInternetConnection();
    if (!hasNet) {
      console.log("Đã bật mạng nhưng chưa có kết nối Internet thực tế. Chờ thử lại...");
      return;
    }

    isSyncing = true;
    console.log(`Đang đồng bộ ${pendingSurveys.length} bản ghi tồn đọng...`);

    let syncedCount = 0;

    for (const survey of pendingSurveys) {
      try {
        await fetch(SCRIPT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8"
          },
          body: JSON.stringify(survey)
        });

        // Đánh dấu bản ghi đã đồng bộ
        if (typeof markSurveyAsSynced === "function") {
          await markSurveyAsSynced(survey.id);
          syncedCount++;
        }
      } catch (postErr) {
        console.error("Lỗi khi gửi bản ghi ID:", survey.id, postErr);
        // Nếu lỗi mạng giữa chừng thì ngắt vòng lặp để lần sau thử tiếp
        break;
      }
    }

    if (syncedCount > 0) {
      console.log(`Đã đồng bộ thành công ${syncedCount} bản ghi.`);
      if (typeof showMessage === "function") {
        showMessage(`✦ AUTO-SYNC // Đã đồng bộ ngầm ${syncedCount} bản ghi lên Google Sheets!`, "success");
      }
    }

  } catch (err) {
    console.error("Lỗi tiến trình Auto-Sync:", err);
  } finally {
    isSyncing = false;
  }
}

// 1. Lắng nghe sự kiện bật mạng: Đợi 2 giây cho sóng ổn định rồi mới sync
window.addEventListener("online", () => {
  console.log("Phát hiện có mạng trở lại, chuẩn bị đồng bộ...");
  setTimeout(() => {
    syncPendingSurveys();
  }, 2000);
});

// 2. Cơ chế Polling: Quét tự động mỗi 15 giây để không bao giờ bỏ sót dữ liệu offline
setInterval(() => {
  if (navigator.onLine) {
    syncPendingSurveys();
  }
}, 15000);

// 3. Quét ngay khi vừa mở trang web
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    syncPendingSurveys();
  }, 1500);
});