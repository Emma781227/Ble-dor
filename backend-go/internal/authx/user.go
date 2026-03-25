package authx

import "net/http"

func UserIDFromRequest(r *http.Request) (string, bool) {
	userID := r.Header.Get("X-User-Id")
	if userID == "" {
		return "", false
	}
	return userID, true
}
