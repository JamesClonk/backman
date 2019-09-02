package config

import (
	"log"
	"sync"
	"time"

	"github.com/kelseyhightower/envconfig"
)

var (
	config Config
	once   sync.Once
)

type Config struct {
	LogLevel         string `default:"info" split_words:"true"`
	LoggingTimestamp bool   `split_words:"true"`
	Username         string `required:"true"`
	Password         string `required:"true"`
	S3               struct {
		ServiceLabel string `default:"dynstrg" split_words:"true"`
		BucketName   string `split_words:"true"`
	}
	Backup struct {
		Schedules map[string]string
		Timeouts  map[string]time.Duration
		Retention struct {
			Days  map[string]int
			Files map[string]int
		}
	}
}

func Get() *Config {
	once.Do(func() {
		if err := envconfig.Process("backman", &config); err != nil {
			log.Fatal(err.Error())
		}
	})
	return &config
}
