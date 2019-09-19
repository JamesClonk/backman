package util

type ServiceType int

const (
	Postgres ServiceType = iota
	MySQL
	MongoDB
	Elasticsearch
)

func ParseServiceType(serviceType string) ServiceType {
	switch serviceType {
	case "postgres", "pg", "postgresql", "elephantsql", "citusdb":
		return Postgres
	case "mysql", "mariadb", "mariadbent", "pxc", "galera":
		return MySQL
	case "mongo", "mongodb", "mongodb-2", "mongodbent", "mangodb":
		return MongoDB
	case "elastic", "es", "elasticsearch":
		return Elasticsearch
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
	case Elasticsearch:
		return true
	}
	return false
}

func (s ServiceType) String() string {
	switch s {
	case Postgres:
		return "PostgreSQL"
	case MySQL:
		return "MySQL"
	case MongoDB:
		return "MongoDB"
	case Elasticsearch:
		return "Elasticsearch"
	}
	return ""
}
