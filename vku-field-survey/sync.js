const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwUNnUL0YfgvgqxLRdJRaMHyCTgkqZZHKi_IVkhnlyTT977CHBFxBeczXpG7wIbPKN7HQ/exec"; // Thay link /exec của bạn vào đây

async function syncPendingSurveys() {
  if (!navigator.onLine) return;

  try {
    const pendingSurveys = await getUnsyncedSurveys();
    if (!pendingSurveys || pendingSurveys.length === 0) return;

    for (const survey of pendingSurveys) {
      await fetch(SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(survey)
      });

      await markSurveyAsSynced(survey.id);
    }
  } catch (error) {
    console.error("Lỗi khi sync ID " + survey.id, error);
  }
}

window.addEventListener("online", () => {
  syncPendingSurveys();
});