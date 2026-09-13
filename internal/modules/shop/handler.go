package shop

import (
	"encoding/json"
	"net/http"

	"pomopet/internal/common/middleware"
	"pomopet/internal/common/response"
)

type Handler struct {
	svc Service
}

func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) GetCatalog(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "Phuong thuc khong hop le")
		return
	}
	catalog, err := h.svc.GetCatalog(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, catalog)
}

func (h *Handler) GetProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "Phuong thuc khong hop le")
		return
	}
	userID, _ := middleware.GetUserID(r.Context())
	profile, err := h.svc.GetProfile(r.Context(), userID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, profile)
}

func (h *Handler) Buy(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Phuong thuc khong hop le")
		return
	}
	userID, _ := middleware.GetUserID(r.Context())

	var req BuyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Du lieu yeu cau khong hop le")
		return
	}

	profile, err := h.svc.BuyItem(r.Context(), userID, req.ItemID)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, profile)
}

func (h *Handler) ClaimQuest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Phuong thuc khong hop le")
		return
	}
	userID, _ := middleware.GetUserID(r.Context())

	var req ClaimQuestRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Du lieu yeu cau khong hop le")
		return
	}

	quest, coins, exp, err := h.svc.ClaimQuest(r.Context(), userID, req.QuestID)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, map[string]interface{}{
		"quest":        quest,
		"reward_coins": coins,
		"reward_exp":   exp,
	})
}
