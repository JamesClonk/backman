package service

type ServiceType int

const (
	Postgres ServiceType = iota
	MySQL
	MongoDB
)

func ParseServiceType(serviceType string) ServiceType {
	switch serviceType {
	case "postgres", "pg", "postgresql", "elephantsql", "citusdb":
		return Postgres
	case "mysql", "mariadb", "mariadbent", "pxc":
		return MySQL
	case "mongo", "mongodb", "mongodbent", "mangodb":
		return MongoDB
	}
	return -1
}

func IsValidServiceType(serviceType string) bool {
	switch ParseServiceType(serviceType) {
	case Postgres:
		return true
	case MySQL:
		return true
	case MongoDB:
		return true
	}
	return false
}
