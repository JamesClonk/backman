package config

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"
)

type Service struct {
	Name                    string
	Schedule                string
	Timeout                 TimeoutDuration
	Retention               ServiceRetention `json:"retention"`
	DirectS3                bool             `json:"direct_s3"`
	DisableColumnStatistics bool             `json:"disable_column_statistics"`
	LogStdErr               bool             `json:"log_stderr"`
	ForceImport             bool             `json:"force_import"`
	LocalBackupPath         string           `json:"local_backup_path"`
	IgnoreTables            []string         `json:"ignore_tables"`
	BackupOptions           []string         `json:"backup_options"`
	RestoreOptions          []string         `json:"restore_options"`
	// optional, backman will lookup binding from SERVICE_BINDING_ROOT/<service> or VCAP_SERVICES if not defined here
	// order of precedence: SERVICE_BINDING_ROOT > VCAP_SERVICES > Config.Services.Binding
	Binding ServiceBinding `json:"service_binding"` // optional
}
type ServiceBinding struct {
	Type     string
	Provider string
	Plan     string
	Host     string
	Port     int
	URI      string
	Username string
	Password string
	Database string
}
type ServiceRetention struct {
	Days  int
	Files int
}

type TimeoutDuration struct {
	time.Duration
}

func (td TimeoutDuration) MarshalJSON() ([]byte, error) {
	return json.Marshal(td.String())
}

func (td *TimeoutDuration) UnmarshalJSON(b []byte) error {
	var v interface{}
	if err := json.Unmarshal(b, &v); err != nil {
		return err
	}
	switch value := v.(type) {
	case float64:
		td.Duration = time.Duration(value)
		return nil
	case string:
		var err error
		td.Duration, err = time.ParseDuration(value)
		if err != nil {
			return err
		}
		return nil
	default:
		return errors.New("invalid duration")
	}
}

func (s *Service) Type() ServiceType {
	return ParseServiceType(s.Binding.Type)
}
func (s *Service) Key() string {
	return fmt.Sprintf("%s:%s", s.Binding.Type, s.Name)
}

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
	case "postgres", "pg", "psql", "postgresql", "elephantsql", "citusdb", "aurora", "rds":
		return Postgres
	case "mysql", "mariadb", "mariadbent", "pxc", "galera", "mysql-database", "mariadb-k8s-database", "mysql-k8s", "mariadb-k8s", "percona-xtradb":
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
	case Postgres, MySQL, MongoDB, Redis, Elasticsearch:
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
