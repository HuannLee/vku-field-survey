const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwUNnUL0YfgvgqxLRdJRaMHyCTgkqZZHKi_IVkhnlyTT977CHBFxBeczXpG7wIbPKN7HQ/exec"; // Thay link /exec của bạn vào đây

let isSyncing = false;

async function syncPendingSurveys() {
  if (!navigator.onLine || isSyncing) return;

  if (typeof getUnsyncedSurveys !== "function") return;

  isSyncing = true;
  try {
    const pendingSurveys = await getUnsyncedSurveys();
    if (!pendingSurveys || pendingSurveys.length === 0) {
      isSyncing = false;
      return;
    }

    for (const survey of pendingSurveys) {
      try {
        await fetch(SCRIPT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8"
          },
          body: JSON.stringify(survey)
        });

        if (typeof markSurveyAsSynced === "function") {
          await markSurveyAsSynced(survey.id);
        }
      } catch (err) {
        console.error("Lỗi sync bản ghi:", survey.id, err);
        break; // Lỗi mạng thì dừng lại đợi lần sau
      }
    }
  } catch (e) {
    console.error("Lỗi tiến trình sync:", e);
  } finally {
    isSyncing = false;
  }
}

// Bật mạng lại là tự đẩy
window.addEventListener("online", () => {
  setTimeout(syncPendingSurveys, 1000);
});

// Quét định kỳ mỗi 15 giây
setInterval(() => {
  if (navigator.onLine) {
    syncPendingSurveys();
  }
}, 15000);