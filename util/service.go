package util

func IsValidServiceType(serviceType string) bool {
	switch serviceType {
	case "postgres":
		return true
	case "mariadb":
		return true
	case "mysql":
		return true
	case "mongodb":
		return true
	}
	return false
}
