package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port    int
	Host    string
	Token   string
	SinkURL string
}

func NewConfig(filenames ...string) *Config {
	err := godotenv.Load(filenames...)
	if err != nil {
		log.Printf("Error loading .env file: %s", err)
	}

	port, err := strconv.Atoi(getEnv("PORT", "8080"))
	if err != nil {
		log.Printf("Error parsing PORT: %s: using 8080", err)
		port = 8080
	}

	host := getEnv("HOST", "localhost")
	token := getEnv("TOKEN", "")
	sinkURL := getEnv("SINK_URL", "")

	return &Config{
		Port:    port,
		Host:    host,
		Token:   token,
		SinkURL: sinkURL,
	}
}

func getEnv(env, def string) string {
	if value := os.Getenv(env); value == "" {
		return def
	} else {
		return value
	}
}
