package main

import (
	"catoverheater/camara-service/internal/ui"
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Ad struct {
	Longitude string
	Latitude  string
	ShopName  string
	AdText    string
}

func camaraCallback(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var data map[string]any
	if err := json.Unmarshal(body, &data); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	log.Print(data)
	w.WriteHeader(http.StatusOK)
}

func formHandler(w http.ResponseWriter, r *http.Request) {
	tmpl := template.Must(template.ParseFS(ui.TemplateFS, "template.html"))
	if r.Method == http.MethodPost {
		ad := Ad{
			Longitude: r.FormValue("longitude"),
			Latitude:  r.FormValue("latitude"),
			ShopName:  r.FormValue("shopname"),
			AdText:    r.FormValue("adtext"),
		}
		tmpl.Execute(w, ad)
		return
	}
	tmpl.Execute(w, nil)
}

func main() {
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	host := os.Getenv("HOST")
	if host == "" {
		host = "0.0.0.0"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/callback", camaraCallback)
	mux.HandleFunc("/ui", formHandler)

	server := &http.Server{
		Addr:         fmt.Sprintf("%s:%s", host, port),
		Handler:      mux,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	log.Printf("camara-service started on %s:%s", host, port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server error: %v", err)
	}
}
