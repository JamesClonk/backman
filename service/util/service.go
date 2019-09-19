package util

import "time"

type Service struct {
	Name      string
	Label     string
	Plan      string
	Tags      []string
	Timeout   time.Duration
	Schedule  string
	Retention Retention
}
type Retention struct {
	Days  int
	Files int
}

func (s *Service) Type() ServiceType {
	return ParseServiceType(s.Label)
}

func (s *Service) Key() string {
	return ParseServiceType(s.Label).String()
}
