const surveyForm = document.getElementById("survey-form");
const msgBox = document.getElementById("message");

if (surveyForm) {
  surveyForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const surveyData = {
      id: "SV-" + Date.now(),
      room: document.getElementById("room").value,
      facility: document.getElementById("facility").value,
      condition: document.getElementById("condition").value,
      description: document.getElementById("description").value,
      inspector: document.getElementById("inspector").value,
      createdAt: new Date().toISOString(),
      synced: false 
    };

    try {
      await saveSurvey(surveyData);
      console.log("Đã lưu an toàn vào IndexedDB:", surveyData.id);

      if (msgBox) msgBox.textContent = "Đã lưu vào máy, đang tải lên...";

      await syncPendingSurveys();

      if (msgBox) msgBox.textContent = "✅ Đã lưu và đồng bộ thành công!";
      surveyForm.reset();
    } catch (err) {
      console.error("Lỗi:", err);
      if (msgBox) msgBox.textContent = "⚠️ Đã lưu offline (sẽ tự tải lên khi có mạng).";
    }
  });
}