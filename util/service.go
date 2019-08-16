package util

func IsValidServiceType(serviceType string) bool {
	switch serviceType {
	case "postgres", "pg", "postgresql", "elephantsql", "citusdb":
		return true
	case "mysql", "mariadb", "mariadbent", "pxc":
		return true
	case "mongodb", "mangodb", "mongo":
		return true
	}
	return false
}
