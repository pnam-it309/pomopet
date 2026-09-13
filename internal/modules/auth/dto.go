package auth

type RegisterRequest struct {
	Username       string `json:"username"`
	Password       string `json:"password"`
	DisplayName    string `json:"display_name"`
	InitialSpecies string `json:"initial_species"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type AuthResponse struct {
	User  *User  `json:"user"`
	Token string `json:"token"`
}
