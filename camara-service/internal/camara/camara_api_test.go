package camara

import (
	"catoverheater/camara-service/internal/config"
	"log"
	"testing"
)

const testNumber string = "+33699901031"
const testLatitude = 48.80
const testLongitude = 2.29

var cfg *config.Config

func init() {
	cfg = config.NewConfig("../../.env")
}

func TestGetOauthOrangeToken(t *testing.T) {

	token, err := FetchOauthToken(cfg.Token)
	if err != nil {
		t.Fatal(err)
	}
	log.Println(token)
}

func TestCreateSubscription(t *testing.T) {
	token, err := FetchOauthToken(cfg.Token)
	if err != nil {
		t.Fatal(err)
	}

	sub := Subscription{
		phone:     testNumber,
		latitude:  testLatitude,
		longitude: testLongitude,
	}

	body, err := CreateSubscription(token, sub)
	if err != nil {
		t.Fatal(err)
	}
	log.Println(body)
}
