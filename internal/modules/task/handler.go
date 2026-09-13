package task

import (
	"encoding/json"
	"net/http"
	"strings"

	"pomopet/internal/common/middleware"
	"pomopet/internal/common/response"
)

type Handler struct {
	svc Service
}

func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) HandleTasks(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.GetUserID(r.Context())

	switch r.Method {
	case http.MethodGet:
		tasks, err := h.svc.GetTasks(r.Context(), userID)
		if err != nil {
			response.Error(w, http.StatusInternalServerError, err.Error())
			return
		}
		response.JSON(w, http.StatusOK, tasks)

	case http.MethodPost:
		var req CreateTaskRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.Error(w, http.StatusBadRequest, "Du lieu yeu cau khong hop le")
			return
		}
		task, err := h.svc.CreateTask(r.Context(), userID, req)
		if err != nil {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}
		response.JSON(w, http.StatusCreated, task)

	default:
		response.Error(w, http.StatusMethodNotAllowed, "Phuong thuc khong hop le")
	}
}

func (h *Handler) HandleTaskByID(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.GetUserID(r.Context())
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 3 {
		response.Error(w, http.StatusBadRequest, "Thieu task ID")
		return
	}
	taskID := parts[2]

	// Check if this is a toggle subpath: /api/tasks/{id}/toggle
	if len(parts) >= 4 && parts[3] == "toggle" && r.Method == http.MethodPost {
		task, err := h.svc.ToggleTask(r.Context(), userID, taskID)
		if err != nil {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}
		response.JSON(w, http.StatusOK, task)
		return
	}

	switch r.Method {
	case http.MethodDelete:
		if err := h.svc.DeleteTask(r.Context(), userID, taskID); err != nil {
			response.Error(w, http.StatusInternalServerError, err.Error())
			return
		}
		response.JSON(w, http.StatusOK, map[string]string{"status": "deleted"})

	default:
		response.Error(w, http.StatusMethodNotAllowed, "Phuong thuc khong hop le")
	}
}
