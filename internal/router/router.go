package router

import (
	"fmt"
	"net/http"

	"pomopet/internal/common/middleware"
	"pomopet/internal/common/response"
	"pomopet/internal/modules/auth"
	"pomopet/internal/modules/pet"
	"pomopet/internal/modules/pomodoro"
	"pomopet/internal/modules/shop"
	"pomopet/internal/modules/task"
)

type Router struct {
	authHandler *auth.Handler
	petHandler  *pet.Handler
	pomoHandler *pomodoro.Handler
	taskHandler *task.Handler
	shopHandler *shop.Handler
	authMw      *middleware.AuthMiddleware

	// Services for unified /api/state synchronization
	authSvc auth.Service
	petSvc  pet.Service
	pomoSvc pomodoro.Service
	taskSvc task.Service
	shopSvc shop.Service

	localIP string
	port    int
}

func NewRouter(
	authH *auth.Handler,
	petH *pet.Handler,
	pomoH *pomodoro.Handler,
	taskH *task.Handler,
	shopH *shop.Handler,
	authMw *middleware.AuthMiddleware,
	authSvc auth.Service,
	petSvc pet.Service,
	pomoSvc pomodoro.Service,
	taskSvc task.Service,
	shopSvc shop.Service,
	localIP string,
	port int,
) *Router {
	return &Router{
		authHandler: authH,
		petHandler:  petH,
		pomoHandler: pomoH,
		taskHandler: taskH,
		shopHandler: shopH,
		authMw:      authMw,
		authSvc:     authSvc,
		petSvc:      petSvc,
		pomoSvc:     pomoSvc,
		taskSvc:     taskSvc,
		shopSvc:     shopSvc,
		localIP:     localIP,
		port:        port,
	}
}

func (rt *Router) RegisterRoutes(mux *http.ServeMux) {
	// Public Auth Endpoints
	mux.HandleFunc("/api/auth/register", rt.authHandler.Register)
	mux.HandleFunc("/api/auth/login", rt.authHandler.Login)
	mux.HandleFunc("/api/auth/me", rt.authMw.RequireAuth(rt.authHandler.Me))

	// Mobile Info
	mux.HandleFunc("/api/mobile-info", func(w http.ResponseWriter, r *http.Request) {
		response.JSON(w, http.StatusOK, map[string]interface{}{
			"local_ip":   rt.localIP,
			"port":       rt.port,
			"mobile_url": fmt.Sprintf("http://%s:%d", rt.localIP, rt.port),
		})
	})

	// Unified State Sync (Protected)
	mux.HandleFunc("/api/state", rt.authMw.RequireAuth(rt.handleFullState))

	// Pet Endpoints (Protected)
	mux.HandleFunc("/api/pet", rt.authMw.RequireAuth(rt.petHandler.GetPet))
	mux.HandleFunc("/api/pet/feed", rt.authMw.RequireAuth(rt.petHandler.Feed))
	mux.HandleFunc("/api/pet/pat", rt.authMw.RequireAuth(rt.petHandler.Pat))
	mux.HandleFunc("/api/pet/adopt", rt.authMw.RequireAuth(rt.petHandler.Adopt))
	mux.HandleFunc("/api/pet/hat", rt.authMw.RequireAuth(rt.petHandler.EquipHat))
	mux.HandleFunc("/api/pet/theme", rt.authMw.RequireAuth(rt.petHandler.SetTheme))
	mux.HandleFunc("/api/pet/pose", rt.authMw.RequireAuth(rt.petHandler.SetPose))

	// Pomodoro Endpoints (Protected)
	mux.HandleFunc("/api/pomodoro/settings", rt.authMw.RequireAuth(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			rt.pomoHandler.UpdateSettings(w, r)
		} else {
			rt.pomoHandler.GetSettings(w, r)
		}
	}))
	mux.HandleFunc("/api/pomodoro/start", rt.authMw.RequireAuth(rt.pomoHandler.Start))
	mux.HandleFunc("/api/pomodoro/pause", rt.authMw.RequireAuth(rt.pomoHandler.Pause))
	mux.HandleFunc("/api/pomodoro/complete", rt.authMw.RequireAuth(rt.pomoHandler.Complete))
	mux.HandleFunc("/api/pomodoro/abort", rt.authMw.RequireAuth(rt.pomoHandler.Abort))
	mux.HandleFunc("/api/pomodoro/history", rt.authMw.RequireAuth(rt.pomoHandler.History))

	// Task Endpoints (Protected)
	mux.HandleFunc("/api/tasks", rt.authMw.RequireAuth(rt.taskHandler.HandleTasks))
	mux.HandleFunc("/api/tasks/", rt.authMw.RequireAuth(rt.taskHandler.HandleTaskByID))

	// Shop & Profile Endpoints
	mux.HandleFunc("/api/shop/catalog", rt.shopHandler.GetCatalog)
	mux.HandleFunc("/api/shop/profile", rt.authMw.RequireAuth(rt.shopHandler.GetProfile))
	mux.HandleFunc("/api/shop/buy", rt.authMw.RequireAuth(rt.shopHandler.Buy))
	mux.HandleFunc("/api/quests/claim", rt.authMw.RequireAuth(rt.shopHandler.ClaimQuest))
}

func (rt *Router) handleFullState(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, _ := middleware.GetUserID(ctx)

	user, _ := rt.authSvc.GetProfile(ctx, userID)
	petState, _ := rt.petSvc.GetPet(ctx, userID)
	timerState, _ := rt.pomoSvc.GetSettings(ctx, userID)
	tasks, _ := rt.taskSvc.GetTasks(ctx, userID)
	profile, _ := rt.shopSvc.GetProfile(ctx, userID)
	history, _ := rt.pomoSvc.GetHistory(ctx, userID, 15)
	catalog, _ := rt.shopSvc.GetCatalog(ctx)

	response.JSON(w, http.StatusOK, map[string]interface{}{
		"user":         user.Safe(),
		"pet":          petState,
		"timer":        timerState,
		"tasks":        tasks,
		"profile":      profile,
		"history":      history,
		"shop_catalog": catalog,
	})
}
