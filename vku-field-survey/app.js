// Hàm hiển thị thông báo ra giao diện
function showMessage(text, type = "success") {
  const msgBox = document.getElementById("message");
  if (!msgBox) return;

  msgBox.textContent = text;
  if (type === "error") {
    msgBox.style.color = "var(--alert-red)";
    msgBox.style.borderColor = "rgba(248, 113, 113, 0.35)";
    msgBox.style.background = "rgba(248, 113, 113, 0.08)";
  } else {
    msgBox.style.color = "var(--gold-soft)";
    msgBox.style.borderColor = "rgba(226, 194, 133, 0.35)";
    msgBox.style.background = "rgba(226, 194, 133, 0.08)";
  }
}

// Xử lý sự kiện gửi Form
document.getElementById("survey-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const surveyData = {
    id: "VKU-" + Date.now(),
    timestamp: new Date().toISOString(),
    inspector: document.getElementById("inspector").value.trim(),
    zone: document.getElementById("zone").value,
    building: document.getElementById("building").value.trim(),
    room: document.getElementById("room").value.trim(),
    roomType: document.getElementById("roomType").value,
    equipmentCategory: document.getElementById("equipmentCategory").value,
    operationalStatus: document.getElementById("operationalStatus").value,
    priorityLevel: document.getElementById("priorityLevel").value,
    incidentDetail: document.getElementById("incidentDetail").value.trim(),
    synced: false
  };

  try {
    // Tự động nhận diện tên hàm lưu trong db.js (saveSurvey / addSurvey / saveSurveyToIndexedDB)
    if (typeof saveSurvey === "function") {
      await saveSurvey(surveyData);
    } else if (typeof addSurvey === "function") {
      await addSurvey(surveyData);
    } else if (typeof saveSurveyToIndexedDB === "function") {
      await saveSurveyToIndexedDB(surveyData);
    } else {
      throw new Error("Không tìm thấy hàm lưu IndexedDB trong db.js!");
    }

    // Kiểm tra mạng và đồng bộ
    if (navigator.onLine) {
      if (typeof syncPendingSurveys === "function") {
        await syncPendingSurveys();
      }
      showMessage("Audit packet synced successfully to Google Sheets!", "success");
    } else {
      showMessage("Cached locally in IndexedDB (Offline mode).", "warning");
    }

    e.target.reset();
  } catch (err) {
    console.error("Lỗi khi gửi form:", err);
    showMessage("Lỗi: " + err.message, "error");
  }
});