package redis

import (
	"net"
	"net/url"
	"strconv"
	"strings"

	"github.com/cloudfoundry-community/go-cfenv"
)

type Credentials struct {
	Hostname string
	Port     int
	Password string
}

func IsVCAPBinding(binding *cfenv.Service) bool {
	c := GetVCAPCredentials(binding)
	if len(c.Hostname) > 0 &&
		len(c.Password) > 0 &&
		c.Port > 0 {
		for key := range binding.Credentials {
			switch key {
			case "host", "hostname", "master", "database_uri", "jdbcUrl", "jdbc_url", "url", "uri":
				if uri, _ := binding.CredentialString(key); len(uri) > 0 && strings.Contains(uri, "redis://") {
					return true
				}
			}
		}
	}
	return false
}

func GetVCAPCredentials(binding *cfenv.Service) *Credentials {
	host, _ := binding.CredentialString("host")
	hostname, _ := binding.CredentialString("hostname")
	password, _ := binding.CredentialString("password")
	port, _ := binding.CredentialString("port")

	if len(port) == 0 {
		switch p := binding.Credentials["port"].(type) {
		case float64:
			port = strconv.Itoa(int(p))
		case int, int32, int64:
			port = strconv.Itoa(p.(int))
		}
	}
	if len(hostname) == 0 && !strings.Contains(host, ":") {
		hostname = host
	}

	// figure out hostname & port from host if still missing
	if len(hostname) == 0 || len(port) == 0 {
		if len(host) > 0 && strings.Contains(host, ":") {
			if u, err := url.Parse(host); err == nil {
				hostname = u.Hostname()
				port = u.Port()
			}
		}
	}

	// figure out credentials from URL if still missing
	for key := range binding.Credentials {
		switch key {
		case "host", "hostname", "master", "database_uri", "jdbcUrl", "jdbc_url", "url", "uri":
			if uri, _ := binding.CredentialString(key); len(uri) > 0 && strings.Contains(uri, "redis://") {
				if u, err := url.Parse(uri); err == nil {
					if len(password) == 0 {
						p, _ := u.User.Password()
						password = p
					}

					h, p, _ := net.SplitHostPort(u.Host)
					if len(hostname) == 0 {
						hostname = h
					}
					if len(port) == 0 {
						port = p
					}
				}
			}
		}
	}

	portnum, _ := strconv.Atoi(port)
	return &Credentials{
		Hostname: hostname,
		Port:     portnum,
		Password: password,
	}
}
