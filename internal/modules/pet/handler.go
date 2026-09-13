package pet

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

func (h *Handler) GetPet(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "Phuong thuc khong hop le")
		return
	}
	userID, _ := middleware.GetUserID(r.Context())
	pet, err := h.svc.GetPet(r.Context(), userID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, pet)
}

func (h *Handler) Feed(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Phuong thuc khong hop le")
		return
	}
	userID, _ := middleware.GetUserID(r.Context())

	var req struct {
		ItemID        string `json:"item_id"`
		HungerGain    int    `json:"hunger_gain"`
		HappinessGain int    `json:"happiness_gain"`
		ExpGain       int    `json:"exp_gain"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)

	pet, err := h.svc.Feed(r.Context(), userID, req.ItemID, req.HungerGain, req.HappinessGain, req.ExpGain)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, pet)
}

func (h *Handler) Pat(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Phuong thuc khong hop le")
		return
	}
	userID, _ := middleware.GetUserID(r.Context())
	pet, err := h.svc.Pat(r.Context(), userID)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, pet)
}

func (h *Handler) Adopt(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Phuong thuc khong hop le")
		return
	}
	userID, _ := middleware.GetUserID(r.Context())

	var req struct {
		Species string `json:"species"`
		Name    string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Du lieu yeu cau khong hop le")
		return
	}

	pet, err := h.svc.CreateStarterPet(r.Context(), userID, req.Name, Species(req.Species))
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, pet)
}

func (h *Handler) EquipHat(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Phuong thuc khong hop le")
		return
	}
	userID, _ := middleware.GetUserID(r.Context())

	var req struct {
		HatID string `json:"hat_id"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)

	pet, err := h.svc.EquipHat(r.Context(), userID, req.HatID)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, pet)
}

func (h *Handler) SetTheme(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Phuong thuc khong hop le")
		return
	}
	userID, _ := middleware.GetUserID(r.Context())

	var req struct {
		ThemeID string `json:"theme_id"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)

	pet, err := h.svc.SetRoomTheme(r.Context(), userID, req.ThemeID)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, pet)
}

func (h *Handler) SetPose(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Phuong thuc khong hop le")
		return
	}
	userID, _ := middleware.GetUserID(r.Context())

	var req struct {
		State string `json:"state"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)

	pet, err := h.svc.SetPose(r.Context(), userID, req.State)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, pet)
}
