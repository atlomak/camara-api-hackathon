package main

import (
	"catoverheater/camara-service/internal/ui"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"text/template"
)

func (app App) camaraCallback(w http.ResponseWriter, r *http.Request) {
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

func (app App) formHandler(w http.ResponseWriter, r *http.Request) {
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
