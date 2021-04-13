package util

type ServiceType int

const (
	Postgres ServiceType = iota
	MySQL
	MongoDB
	Redis
	Elasticsearch
)

func ParseServiceType(serviceType string) ServiceType {
	switch serviceType {
	case "postgres", "pg", "psql", "postgresql", "elephantsql", "citusdb":
		return Postgres
	case "mysql", "mariadb", "mariadbent", "pxc", "galera", "mysql-database", "mariadb-k8s-database", "mysql-k8s", "mariadb-k8s":
		return MySQL
	case "mongo", "mongodb", "mongodb-2", "mongodbent", "mongodbent-database", "mangodb", "mongodb-k8s":
		return MongoDB
	case "redis", "redis-2", "redisent", "redis-enterprise", "redis-ha", "redis-k8s":
		return Redis
	case "elastic", "es", "elasticsearch", "ece":
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
	case Redis:
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
	case Redis:
		return "Redis"
	case Elasticsearch:
		return "Elasticsearch"
	}
	return ""
}
