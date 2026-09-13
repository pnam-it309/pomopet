package config

import (
	"bufio"
	"flag"
	"os"
	"strconv"
	"strings"
	"time"
)

// Config encapsulates all centralized application settings
type Config struct {
	// App
	AppName   string
	AppEnv    string
	Port      int
	Host      string
	NoBrowser bool

	// Database MySQL
	DBDriver          string
	DBHost            string
	DBPort            int
	DBUser            string
	DBPassword        string
	DBName            string
	DBCharset         string
	DBMaxOpenConns    int
	DBMaxIdleConns    int
	DBConnMaxLifetime time.Duration

	// JWT Security
	JWTSecret         string
	JWTExpirationHour int

	// Pomodoro Rules (Configurable, no hardcoding)
	PomoFocusMins         int
	PomoShortBreakMins    int
	PomoLongBreakMins     int
	PomoLongBreakInterval int
	PomoBaseExpSession    int
	PomoBaseCoinsSession  int

	// Pet Vitality Rules (Configurable, no hardcoding)
	PetMaxStat          int
	PetHungerDecayRate  int
	PetHappyDecayRate   int
	PetEnergyRecover    int
	PetBaseExpToNext    int
	PetExpScaleFactor   float64
}

// LoadConfig reads .env file, environment variables, and CLI flags
func LoadConfig() *Config {
	loadDotEnv(".env")

	cfg := &Config{
		AppName:               getEnv("APP_NAME", "PomoPet"),
		AppEnv:                getEnv("APP_ENV", "development"),
		Port:                  getEnvAsInt("APP_PORT", 8080),
		Host:                  getEnv("APP_HOST", "0.0.0.0"),
		NoBrowser:             getEnvAsBool("NO_BROWSER", false),
		DBDriver:              getEnv("DB_DRIVER", "mysql"),
		DBHost:                getEnv("DB_HOST", "127.0.0.1"),
		DBPort:                getEnvAsInt("DB_PORT", 3306),
		DBUser:                getEnv("DB_USER", "root"),
		DBPassword:            getEnv("DB_PASSWORD", "123456"),
		DBName:                getEnv("DB_NAME", "pomopet"),
		DBCharset:             getEnv("DB_CHARSET", "utf8mb4"),
		DBMaxOpenConns:        getEnvAsInt("DB_MAX_OPEN_CONNS", 25),
		DBMaxIdleConns:        getEnvAsInt("DB_MAX_IDLE_CONNS", 10),
		DBConnMaxLifetime:     time.Duration(getEnvAsInt("DB_CONN_MAX_LIFETIME_MINS", 30)) * time.Minute,
		JWTSecret:             getEnv("JWT_SECRET", "pomopet_default_jwt_secret_dev_2026"),
		JWTExpirationHour:     getEnvAsInt("JWT_EXPIRATION_HOURS", 72),
		PomoFocusMins:         getEnvAsInt("POMO_DEFAULT_FOCUS_MINS", 25),
		PomoShortBreakMins:    getEnvAsInt("POMO_DEFAULT_SHORT_BREAK_MINS", 5),
		PomoLongBreakMins:     getEnvAsInt("POMO_DEFAULT_LONG_BREAK_MINS", 15),
		PomoLongBreakInterval: getEnvAsInt("POMO_DEFAULT_LONG_BREAK_INTERVAL", 4),
		PomoBaseExpSession:    getEnvAsInt("POMO_BASE_EXP_PER_SESSION", 25),
		PomoBaseCoinsSession:  getEnvAsInt("POMO_BASE_COINS_PER_SESSION", 15),
		PetMaxStat:            getEnvAsInt("PET_MAX_STAT", 100),
		PetHungerDecayRate:    getEnvAsInt("PET_HUNGER_DECAY_RATE", 1),
		PetHappyDecayRate:     getEnvAsInt("PET_HAPPINESS_DECAY_RATE", 1),
		PetEnergyRecover:      getEnvAsInt("PET_ENERGY_RECOVER_RATE", 2),
		PetBaseExpToNext:      getEnvAsInt("PET_BASE_EXP_TO_NEXT", 100),
		PetExpScaleFactor:     getEnvAsFloat("PET_EXP_SCALE_FACTOR", 1.25),
	}

	// Support CLI flags override
	portFlag := flag.Int("port", 0, "HTTP server port")
	noBrowserFlag := flag.Bool("no-browser", false, "Do not auto open browser")
	dbHostFlag := flag.String("db-host", "", "MySQL DB host")
	dbUserFlag := flag.String("db-user", "", "MySQL DB user")
	dbPassFlag := flag.String("db-pass", "", "MySQL DB password")
	flag.Parse()

	if *portFlag > 0 {
		cfg.Port = *portFlag
	}
	if *noBrowserFlag {
		cfg.NoBrowser = true
	}
	if *dbHostFlag != "" {
		cfg.DBHost = *dbHostFlag
	}
	if *dbUserFlag != "" {
		cfg.DBUser = *dbUserFlag
	}
	if *dbPassFlag != "" {
		cfg.DBPassword = *dbPassFlag
	}

	return cfg
}

func loadDotEnv(filepath string) {
	file, err := os.Open(filepath)
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			k := strings.TrimSpace(parts[0])
			v := strings.TrimSpace(parts[1])
			v = strings.Trim(v, `"'`)
			if os.Getenv(k) == "" {
				os.Setenv(k, v)
			}
		}
	}
}

func getEnv(key, defaultVal string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return defaultVal
}

func getEnvAsInt(key string, defaultVal int) int {
	str := getEnv(key, "")
	if v, err := strconv.Atoi(str); err == nil {
		return v
	}
	return defaultVal
}

func getEnvAsBool(key string, defaultVal bool) bool {
	str := getEnv(key, "")
	if v, err := strconv.ParseBool(str); err == nil {
		return v
	}
	return defaultVal
}

func getEnvAsFloat(key string, defaultVal float64) float64 {
	str := getEnv(key, "")
	if v, err := strconv.ParseFloat(str, 64); err == nil {
		return v
	}
	return defaultVal
}
