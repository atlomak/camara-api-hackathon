package camara

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
)

const tokenURL string = "https://api.orange.com/oauth/v3/token"
const tokenReqBody string = "grant_type=client_credentials"

func FetchOauthToken(token string) (string, error) {

	req, _ := http.NewRequest(http.MethodPost, tokenURL, bytes.NewBufferString(tokenReqBody))
	req.Header.Set("Authorization", token)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")

	resp, err := http.DefaultClient.Do(req)

	if err != nil {
		log.Println(err)
		return "", err
	}

	defer resp.Body.Close()
	bb, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var body map[string]any
	err = json.Unmarshal(bb, &body)

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("Could not fetch token status code: %d, body: %s", resp.StatusCode, body)
	}

	respToken, ok := body["access_token"].(string)
	if !ok {
		return "", fmt.Errorf("Could not parse response body: %+v", body)
	}

	return respToken, nil
}
