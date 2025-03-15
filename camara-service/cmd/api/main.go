package main

import (
	"catoverheater/camara-service/internal/config"
	"fmt"
	"log"
	"net/http"
	"time"
)

type Ad struct {
	Longitude string
	Latitude  string
	ShopName  string
	AdText    string
}

type App struct {
	cfg *config.Config
}

func main() {

	app := App{config.NewConfig()}

	mux := http.NewServeMux()
	mux.HandleFunc("/callback", app.camaraCallback)
	mux.HandleFunc("/ui", app.formHandler)

	server := &http.Server{
		Addr:         fmt.Sprintf("%s:%d", app.cfg.Host, app.cfg.Port),
		Handler:      mux,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	log.Printf("camara-service started on %s:%d", app.cfg.Host, app.cfg.Port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server error: %v", err)
	}
}
