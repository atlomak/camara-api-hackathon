package camara

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
)

const subscriptionURL = "https://api.orange.com/camara/geofencing/orange-lab/v0/subscriptions/simulated"
const sinkURL = "https://camara-service-1041191131324.europe-central2.run.app/callback"
const geofencingID = "org.camaraproject.geofencing-subscriptions.v0.area-entered"

type Subscription struct {
	phone     string
	latitude  float64
	longitude float64
}

func CreateSubscription(token string, sub Subscription) (string, error) {
	reqBody, err := json.Marshal(map[string]any{
		"protocol": "HTTP",
		"sink":     sinkURL,
		"types": []string{
			geofencingID,
		},
		"config": map[string]any{
			"subscriptionDetail": map[string]any{
				"device": map[string]string{
					"phoneNumber": sub.phone,
				},
				"area": map[string]any{
					"areaType": "CIRCLE",
					"center": map[string]any{
						"latitude":  sub.latitude,
						"longitude": sub.longitude,
					},
					"radius": 2000,
				},
			},
			"initialEvent":           true,
			"subscriptionMaxEvents":  10,
			"subscriptionExpireTime": "2025-03-22T05:40:58.469Z",
		},
	})
	if err != nil {
		return "", err
	}

	req, _ := http.NewRequest(http.MethodPost, subscriptionURL, bytes.NewBuffer(reqBody))
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := http.DefaultClient.Do(req)

	if err != nil {
		log.Println(err)
		return "", err
	}

	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	return string(body), nil
}
