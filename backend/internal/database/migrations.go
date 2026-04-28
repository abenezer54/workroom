package database

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"gorm.io/gorm"
)

type schemaMigration struct {
	Version   string    `gorm:"primaryKey;type:text"`
	AppliedAt time.Time `gorm:"type:timestamptz;not null"`
}

func (schemaMigration) TableName() string {
	return "schema_migrations"
}

func RunMigrations(db *gorm.DB, migrationsDir string) error {
	if err := db.AutoMigrate(&schemaMigration{}); err != nil {
		return fmt.Errorf("create schema_migrations table: %w", err)
	}

	files, err := filepath.Glob(filepath.Join(migrationsDir, "*.sql"))
	if err != nil {
		return fmt.Errorf("find migration files: %w", err)
	}

	for _, file := range files {
		version := filepath.Base(file)

		applied, err := migrationApplied(db, version)
		if err != nil {
			return err
		}
		if applied {
			continue
		}

		sql, err := os.ReadFile(file)
		if err != nil {
			return fmt.Errorf("read migration %s: %w", version, err)
		}

		if err := db.Transaction(func(tx *gorm.DB) error {
			if err := tx.Exec(string(sql)).Error; err != nil {
				return fmt.Errorf("execute migration %s: %w", version, err)
			}

			return tx.Create(&schemaMigration{
				Version:   version,
				AppliedAt: time.Now().UTC(),
			}).Error
		}); err != nil {
			return err
		}

		log.Printf("applied database migration %s", version)
	}

	return nil
}

func migrationApplied(db *gorm.DB, version string) (bool, error) {
	var count int64
	if err := db.Model(&schemaMigration{}).Where("version = ?", version).Count(&count).Error; err != nil {
		return false, fmt.Errorf("check migration %s: %w", version, err)
	}

	return count > 0, nil
}
