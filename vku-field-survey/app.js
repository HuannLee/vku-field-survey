// --- QUẢN LÝ THÔNG BÁO VÀ MODAL ---

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

function openSuccessModal(title, desc) {
  const modal = document.getElementById("success-modal");
  if (!modal) return;

  if (title) document.getElementById("modal-title").textContent = title;
  if (desc) document.getElementById("modal-desc").textContent = desc;

  modal.classList.add("active");
}

function closeSuccessModal() {
  const modal = document.getElementById("success-modal");
  if (modal) {
    modal.classList.remove("active");
  }
}

// Bắt sự kiện đóng Modal
const modalEl = document.getElementById("success-modal");
const modalCloseBtn = document.getElementById("modal-close-btn");

if (modalCloseBtn) {
  modalCloseBtn.addEventListener("click", closeSuccessModal);
}

if (modalEl) {
  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) {
      closeSuccessModal();
    }
  });
}

// --- QUẢN LÝ TRẠNG THÁI MẠNG (RESONANCE INDICATOR) ---

const resonanceStatus = document.getElementById("network-status");
function updateResonanceNetwork() {
  if (!resonanceStatus) return;
  const resonanceRing = resonanceStatus.querySelector(".resonance-core");
  const statusTxt = resonanceStatus.querySelector(".status-txt");

  if (navigator.onLine) {
    if (statusTxt) statusTxt.textContent = "RESONANCE CONNECTED";
    resonanceStatus.style.color = "var(--online-green)";
    resonanceStatus.style.borderColor = "rgba(52, 211, 153, 0.25)";
    resonanceStatus.style.background = "rgba(52, 211, 153, 0.08)";
    if (resonanceRing) {
      resonanceRing.style.background = "var(--online-green)";
      resonanceRing.style.boxShadow = "0 0 8px var(--online-green)";
    }
  } else {
    if (statusTxt) statusTxt.textContent = "FREQUENCY INTERRUPTED (OFFLINE)";
    resonanceStatus.style.color = "var(--alert-red)";
    resonanceStatus.style.borderColor = "rgba(248, 113, 113, 0.25)";
    resonanceStatus.style.background = "rgba(248, 113, 113, 0.08)";
    if (resonanceRing) {
      resonanceRing.style.background = "var(--alert-red)";
      resonanceRing.style.boxShadow = "0 0 8px var(--alert-red)";
    }
  }
}

window.addEventListener("online", updateResonanceNetwork);
window.addEventListener("offline", updateResonanceNetwork);
updateResonanceNetwork();

// --- XỬ LÝ SUBMIT FORM KHẢO SÁT (SINGLE LISTENER) ---

const surveyForm = document.getElementById("survey-form");
const submitBtn = surveyForm ? surveyForm.querySelector(".wuwa-btn") : null;
const btnInner = submitBtn ? submitBtn.querySelector(".btn-inner") : null;
const originalBtnContent = btnInner ? btnInner.innerHTML : "";

// Tự động khôi phục tên Inspector đã lưu
const savedInspector = localStorage.getItem("vku_last_inspector");
if (savedInspector && document.getElementById("inspector")) {
  document.getElementById("inspector").value = savedInspector;
}

if (surveyForm) {
  surveyForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Khóa nút submit và bật trạng thái tải dữ liệu
    if (submitBtn) {
      submitBtn.disabled = true;
      btnInner.innerHTML = `<span class="spinner"></span> TRANSMITTING PACKET...`;
    }

    const inspectorName = document.getElementById("inspector").value.trim();
    const currentZone = document.getElementById("zone").value;
    const currentBuilding = document.getElementById("building").value.trim();

    localStorage.setItem("vku_last_inspector", inspectorName);

    const surveyData = {
      id: "VKU-" + Date.now(),
      timestamp: new Date().toISOString(),
      inspector: inspectorName,
      zone: currentZone,
      building: currentBuilding,
      room: document.getElementById("room").value.trim(),
      roomType: document.getElementById("roomType").value,
      equipmentCategory: document.getElementById("equipmentCategory").value,
      operationalStatus: document.getElementById("operationalStatus").value,
      priorityLevel: document.getElementById("priorityLevel").value,
      incidentDetail: document.getElementById("incidentDetail").value.trim(),
      synced: false
    };

    try {
      // 2. Lưu vào IndexedDB (Offline-First)
      if (typeof saveSurvey === "function") {
        await saveSurvey(surveyData);
      } else {
        throw new Error("Không tìm thấy hàm saveSurvey trong db.js!");
      }

      // 3. Xử lý đồng bộ dữ liệu và hiển thị phản hồi
      if (navigator.onLine) {
        if (typeof syncPendingSurveys === "function") {
          await syncPendingSurveys();
        }
        openSuccessModal(
          "TRANSMISSION COMPLETE",
          "Dữ liệu khảo sát hiện trường đã được đồng bộ lên Google Sheets thành công!"
        );
        showMessage("✦ TRANSMISSION COMPLETE // Đã đồng bộ Cloud!", "success");
      } else {
        openSuccessModal(
          "BUFFERED LOCALLY (OFFLINE)",
          "Mạng gián đoạn: Dữ liệu đã lưu an toàn vào IndexedDB. Hệ thống sẽ tự động đồng bộ khi có kết nối trở lại."
        );
        showMessage("✦ BUFFERED LOCALLY // Đã lưu vào bộ nhớ đệm thiết bị.", "warning");
      }

      // 4. Reset form nhưng giữ lại Inspector / Zone / Building
      surveyForm.reset();
      document.getElementById("inspector").value = inspectorName;
      document.getElementById("zone").value = currentZone;
      document.getElementById("building").value = currentBuilding;

    } catch (err) {
      console.error("Lỗi gửi biểu mẫu:", err);
      showMessage("TRANSMISSION FAILED: " + err.message, "error");
    } finally {
      // 5. Mở khóa nút bấm về trạng thái ban đầu
      if (submitBtn) {
        submitBtn.disabled = false;
        btnInner.innerHTML = originalBtnContent;
      }
    }
  });
}