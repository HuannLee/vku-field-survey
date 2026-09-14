const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwUNnUL0YfgvgqxLRdJRaMHyCTgkqZZHKi_IVkhnlyTT977CHBFxBeczXpG7wIbPKN7HQ/exec";

console.log("Sync module loaded.");

async function syncPendingSurveys() {
  if (!navigator.onLine) {
    console.log("Thiết bị đang Offline. Dữ liệu vẫn an toàn trong máy.");
    return;
  }

  try {
    const allSurveys = await getAllSurveys();
    const pendingList = allSurveys.filter(item => item.synced === false);

    if (pendingList.length === 0) {
      console.log("Không có dữ liệu chờ đồng bộ.");
      return;
    }

    console.log(`Đang đồng bộ ${pendingList.length} khảo sát lên Google Sheet...`);

    for (const item of pendingList) {
      try {
        const res = await fetch(SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(item)
        });

        const result = await res.json();

        if (result.success) {
          item.synced = true;
          await saveSurvey(item);
          console.log(`✅ Đồng bộ thành công bản ghi ID: ${item.id}`);
        }
      } catch (err) {
        console.error(`❌ Lỗi kết nối khi gửi ID: ${item.id}`, err);
        break; // Mạng chập chờn thì tạm dừng, chờ lần kết nối tiếp
      }
    }
  } catch (error) {
    console.error("Lỗi khi đọc dữ liệu để sync:", error);
  }
}

window.addEventListener("online", () => {
  console.log("🟢 Đã có mạng trở lại! Tự động kích hoạt đồng bộ...");
  syncPendingSurveys();
});