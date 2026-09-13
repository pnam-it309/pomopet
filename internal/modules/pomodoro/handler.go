package pomodoro

import (
	"encoding/json"
	"net/http"
	"strconv"

	"pomopet/internal/common/middleware"
	"pomopet/internal/common/response"
)

type Handler struct {
	svc Service
}

func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) GetSettings(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "Phuong thuc khong hop le")
		return
	}
	userID, _ := middleware.GetUserID(r.Context())
	setting, err := h.svc.GetSettings(r.Context(), userID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, setting)
}

func (h *Handler) UpdateSettings(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Phuong thuc khong hop le")
		return
	}
	userID, _ := middleware.GetUserID(r.Context())
	var req UpdateSettingsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Du lieu yeu cau khong hop le")
		return
	}

	setting, err := h.svc.UpdateSettings(r.Context(), userID, req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, setting)
}

func (h *Handler) Start(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Phuong thuc khong hop le")
		return
	}
	userID, _ := middleware.GetUserID(r.Context())
	var req StartRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	setting, err := h.svc.StartSession(r.Context(), userID, req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, setting)
}

func (h *Handler) Pause(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Phuong thuc khong hop le")
		return
	}
	userID, _ := middleware.GetUserID(r.Context())
	var req PauseRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	setting, err := h.svc.PauseSession(r.Context(), userID, req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, setting)
}

func (h *Handler) Complete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Phuong thuc khong hop le")
		return
	}
	userID, _ := middleware.GetUserID(r.Context())
	result, err := h.svc.CompleteSession(r.Context(), userID)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, result)
}

func (h *Handler) Abort(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Phuong thuc khong hop le")
		return
	}
	userID, _ := middleware.GetUserID(r.Context())
	setting, err := h.svc.AbortSession(r.Context(), userID)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, setting)
}

func (h *Handler) History(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "Phuong thuc khong hop le")
		return
	}
	userID, _ := middleware.GetUserID(r.Context())
	limit := 15
	if l := r.URL.Query().Get("limit"); l != "" {
		if val, err := strconv.Atoi(l); err == nil && val > 0 {
			limit = val
		}
	}
	history, err := h.svc.GetHistory(r.Context(), userID, limit)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, history)
}
