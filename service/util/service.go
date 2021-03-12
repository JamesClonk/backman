package util

import "time"

// swagger:response service
type Service struct {
	Name                    string
	Label                   string
	Plan                    string
	Tags                    []string
	Timeout                 time.Duration
	Schedule                string
	Retention               Retention
	DisableColumnStatistics bool
	ForceImport             bool
	LocalBackupPath         string
}
type Retention struct {
	Days  int
	Files int
}

// swagger:response services
type Services []Service

func (s *Service) Type() ServiceType {
	return ParseServiceType(s.Label)
}

func (s *Service) Key() string {
	return ParseServiceType(s.Label).String()
}
