package database

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"pomopet/internal/common/config"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// InitMySQL initializes MySQL database connection pool via GORM
func InitMySQL(cfg *config.Config) (*gorm.DB, error) {
	// 1. Ensure target database exists
	rawDSN := fmt.Sprintf("%s:%s@tcp(%s:%d)/?charset=%s&parseTime=True&loc=Local",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBCharset,
	)

	rawDB, err := sql.Open("mysql", rawDSN)
	if err != nil {
		return nil, fmt.Errorf("failed to open raw MySQL connection: %w", err)
	}
	defer rawDB.Close()

	if err := rawDB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to reach MySQL server at %s:%d: %w", cfg.DBHost, cfg.DBPort, err)
	}

	createDBSQL := fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET %s COLLATE %s_unicode_ci;",
		cfg.DBName, cfg.DBCharset, cfg.DBCharset,
	)
	if _, err := rawDB.Exec(createDBSQL); err != nil {
		return nil, fmt.Errorf("failed to create database %s: %w", cfg.DBName, err)
	}

	// 2. Connect via GORM to target database
	targetDSN := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=%s&parseTime=True&loc=Local",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName, cfg.DBCharset,
	)

	gormLogLevel := logger.Warn
	if cfg.AppEnv == "development" {
		gormLogLevel = logger.Info
	}

	db, err := gorm.Open(mysql.Open(targetDSN), &gorm.Config{
		Logger: logger.Default.LogMode(gormLogLevel),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to initialize GORM with MySQL: %w", err)
	}

	// 3. Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve generic database pool: %w", err)
	}

	sqlDB.SetMaxOpenConns(cfg.DBMaxOpenConns)
	sqlDB.SetMaxIdleConns(cfg.DBMaxIdleConns)
	sqlDB.SetConnMaxLifetime(cfg.DBConnMaxLifetime)
	sqlDB.SetConnMaxIdleTime(10 * time.Minute)

	log.Printf("[INFO] Connected to MySQL database [%s] on %s:%d", cfg.DBName, cfg.DBHost, cfg.DBPort)
	return db, nil
}
