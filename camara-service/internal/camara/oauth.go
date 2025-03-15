package camara

import (
	"bytes"
	"catoverheater/camara-service/internal/config"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sync"
	"time"
)

const tokenURL string = "https://api.orange.com/oauth/v3/token"
const tokenReqBody string = "grant_type=client_credentials"

type TokenCache struct {
	config      config.Config
	accessToken string
	expiresAt   time.Time
	rwMutex     sync.RWMutex
}

func NewTokenCache(config config.Config, accessToken string, expiresAt time.Time) *TokenCache {
	return &TokenCache{config: config, accessToken: accessToken, expiresAt: expiresAt, rwMutex: sync.RWMutex{}}
}

// GetToken retrieves the token if it's still valid
func (tc *TokenCache) GetToken() (string, error) {
	tc.rwMutex.RLock()
	defer tc.rwMutex.RUnlock()

	// Check if the token is expired
	if time.Now().After(tc.expiresAt) || len(tc.accessToken) == 0 {
		err := tc.updateToken()
		if err != nil {
			return "", err
		}
		return tc.accessToken, nil
	}
	return tc.accessToken, nil
}

// UpdateToken updates the token in memory if expired
func (tc *TokenCache) updateToken() error {
	tc.rwMutex.Lock()
	defer tc.rwMutex.Unlock()

	accessToken, expiresIn, err := fetchOauthToken(tc.config.Token)
	if err != nil {
		return err
	}

	tc.accessToken = accessToken
	tc.expiresAt = time.Now().Add(time.Duration(expiresIn) * time.Second)

	return nil
}

func fetchOauthToken(token string) (string, int, error) {

	req, _ := http.NewRequest(http.MethodPost, tokenURL, bytes.NewBufferString(tokenReqBody))
	req.Header.Set("Authorization", token)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")

	resp, err := http.DefaultClient.Do(req)

	if err != nil {
		log.Println(err)
		return "", 0, err
	}

	defer resp.Body.Close()
	bb, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", 0, err
	}

	var body map[string]any
	err = json.Unmarshal(bb, &body)

	if resp.StatusCode != http.StatusOK {
		return "", 0, fmt.Errorf("Could not fetch token status code: %d, body: %s", resp.StatusCode, body)
	}

	accessToken, ok := body["access_token"].(string)
	expiresIn, ok := body["expires_in"].(int)
	if !ok {
		return "", 0, fmt.Errorf("Could not parse response body: %+v", body)
	}

	return accessToken, expiresIn, nil
}
