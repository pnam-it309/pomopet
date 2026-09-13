package main

import (
	"context"
	"embed"
	"fmt"
	"io/fs"
	"log"
	"net"
	"net/http"
	"os/exec"
	"runtime"
	"time"

	"pomopet/internal/common/config"
	"pomopet/internal/common/database"
	"pomopet/internal/common/eventbus"
	"pomopet/internal/common/jwt"
	"pomopet/internal/common/middleware"
	"pomopet/internal/modules/auth"
	"pomopet/internal/modules/pet"
	"pomopet/internal/modules/pomodoro"
	"pomopet/internal/modules/shop"
	"pomopet/internal/modules/task"
	"pomopet/internal/router"
	"strings"
)

//go:embed all:frontend/out
var webFS embed.FS

func getLocalIP() string {
	conn, err := net.Dial("udp", "8.8.8.8:80")
	if err != nil {
		return "127.0.0.1"
	}
	defer conn.Close()
	localAddr := conn.LocalAddr().(*net.UDPAddr)
	return localAddr.IP.String()
}

func openBrowser(url string) {
	var cmd string
	var args []string

	switch runtime.GOOS {
	case "windows":
		cmd = "rundll32"
		args = []string{"url.dll,FileProtocolHandler", url}
	case "darwin":
		cmd = "open"
		args = []string{url}
	default:
		cmd = "xdg-open"
		args = []string{url}
	}
	_ = exec.Command(cmd, args...).Start()
}

func main() {
	cfg := config.LoadConfig()
	localIP := getLocalIP()

	fmt.Println("==================================================================")
	fmt.Println("   POMOPET MOBILE - CLEAN MODULAR ARCHITECTURE (GORM & MYSQL)     ")
	fmt.Println("==================================================================")

	// 1. Initialize MySQL via GORM
	db, err := database.InitMySQL(cfg)
	if err != nil {
		log.Fatalf("[FATAL] MySQL Connection failed: %v", err)
	}

	// 2. AutoMigrate all GORM Entities (Zero native query)
	err = db.AutoMigrate(
		&auth.User{},
		&pet.Pet{},
		&pomodoro.PomodoroSetting{},
		&pomodoro.PomodoroSession{},
		&task.Task{},
		&shop.ShopItem{},
		&shop.UserProfile{},
		&shop.UserInventoryItem{},
		&shop.UserUnlockedItem{},
		&shop.DailyQuest{},
	)
	if err != nil {
		log.Fatalf("[FATAL] GORM AutoMigrate failed: %v", err)
	}
	log.Println("[INFO] Database schema migration completed successfully")

	// 3. Initialize Shared Kernel
	bus := eventbus.GetBus()
	jwtManager := jwt.NewJWTManager(cfg.JWTSecret, cfg.JWTExpirationHour)
	authMw := middleware.NewAuthMiddleware(jwtManager)

	// 4. Initialize Feature Modules (Strict decoupling via EventBus)
	authRepo := auth.NewRepository(db)
	authSvc := auth.NewService(authRepo, jwtManager, bus)
	authH := auth.NewHandler(authSvc)

	petRepo := pet.NewRepository(db)
	petSvc := pet.NewService(petRepo, cfg, bus)
	petH := pet.NewHandler(petSvc)
	pet.RegisterListeners(bus, petSvc)

	pomoRepo := pomodoro.NewRepository(db)
	pomoSvc := pomodoro.NewService(pomoRepo, cfg, bus)
	pomoH := pomodoro.NewHandler(pomoSvc)

	taskRepo := task.NewRepository(db)
	taskSvc := task.NewService(taskRepo)
	taskH := task.NewHandler(taskSvc)
	task.RegisterListeners(bus, taskSvc)

	shopRepo := shop.NewRepository(db)
	shopSvc := shop.NewService(shopRepo, cfg, bus)
	shopH := shop.NewHandler(shopSvc)
	shop.RegisterListeners(bus, shopSvc)

	// 5. Auto seed default demo user if no users exist
	count, _ := authRepo.Count(context.Background())
	if count == 0 {
		_, _, _ = authSvc.Register(context.Background(), auth.RegisterRequest{
			Username:       "demo",
			Password:       "123456",
			DisplayName:    "Mochi Friend",
			InitialSpecies: "cat",
		})
		log.Println("[INFO] Seeded demo user: username='demo' | password='123456'")
	}

	// 6. Router & Handlers
	appRouter := router.NewRouter(
		authH, petH, pomoH, taskH, shopH,
		authMw,
		authSvc, petSvc, pomoSvc, taskSvc, shopSvc,
		localIP, cfg.Port,
	)

	mux := http.NewServeMux()
	appRouter.RegisterRoutes(mux)

	// 7. Static web assets (Next.js pre-rendered SSG export)
	subFS, err := fs.Sub(webFS, "frontend/out")
	if err != nil {
		log.Fatalf("[FATAL] Failed to load embedded web assets: %v", err)
	}
	fileServer := http.FileServer(http.FS(subFS))
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		p := r.URL.Path
		// If path is root or matches a file
		f, err := subFS.Open(strings.TrimPrefix(p, "/"))
		if err == nil {
			f.Close()
			fileServer.ServeHTTP(w, r)
			return
		}
		// If requested without trailing slash (e.g. /tasks -> /tasks/index.html)
		if !strings.HasSuffix(p, "/") {
			fIndex, errIndex := subFS.Open(strings.TrimPrefix(p, "/") + "/index.html")
			if errIndex == nil {
				fIndex.Close()
				r.URL.Path = p + "/"
				fileServer.ServeHTTP(w, r)
				return
			}
		}
		fileServer.ServeHTTP(w, r)
	})

	// CORS wrapper for dev mode & mobile clients
	corsHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		mux.ServeHTTP(w, r)
	})

	addr := fmt.Sprintf("%s:%d", cfg.Host, cfg.Port)
	localURL := fmt.Sprintf("http://localhost:%d", cfg.Port)
	mobileURL := fmt.Sprintf("http://%s:%d", localIP, cfg.Port)

	fmt.Println("------------------------------------------------------------------")
	fmt.Printf("[INFO] Server listening on : %s\n", addr)
	fmt.Printf("[INFO] Local Computer      : %s\n", localURL)
	fmt.Printf("[INFO] Mobile Device (Wi-Fi): %s\n", mobileURL)
	fmt.Println("==================================================================")

	if !cfg.NoBrowser {
		go func() {
			time.Sleep(600 * time.Millisecond)
			openBrowser(localURL)
		}()
	}

	server := &http.Server{
		Addr:         addr,
		Handler:      corsHandler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("[FATAL] HTTP server error: %v", err)
	}
}
