package camara

import (
	"catoverheater/camara-service/internal/config"
	"log"
	"sync"
	"testing"
)

const testNumber string = "+33699901031"
const testLatitude = 48.80
const testLongitude = 2.29

var cfg *config.Config
var tokenCache TokenCache

func init() {
	cfg = config.NewConfig("../../.env")
	tokenCache = TokenCache{config: *cfg, rwMutex: sync.RWMutex{}}
}

func TestGetOauthOrangeToken(t *testing.T) {

	token, expiresIn, err := fetchOauthToken(cfg.Token)
	if err != nil {
		t.Fatal(err)
	}
	log.Println(token)
	log.Println(expiresIn)
}

func TestCreateSubscription(t *testing.T) {
	token, err := tokenCache.GetToken()

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
