package mysql

import (
	"net"
	"net/url"
	"regexp"
	"strconv"
	"strings"

	"github.com/cloudfoundry-community/go-cfenv"
)

type Credentials struct {
	Hostname string
	Database string
	Username string
	Password string
	Port     int
}

func IsVCAPBinding(binding *cfenv.Service) bool {
	c := GetVCAPCredentials(binding)
	if len(c.Hostname) > 0 &&
		len(c.Database) > 0 &&
		len(c.Username) > 0 &&
		len(c.Password) > 0 &&
		c.Port > 0 {
		for key := range binding.Credentials {
			switch key {
			case "database_uri", "jdbcUrl", "jdbc_url", "url", "uri":
				if uri, _ := binding.CredentialString(key); len(uri) > 0 && strings.Contains(uri, "mysql://") {
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
	database, _ := binding.CredentialString("database")
	username, _ := binding.CredentialString("username")
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

	// figure out hostname & port from host if still missing
	if len(hostname) == 0 || len(port) == 0 {
		if len(host) > 0 && strings.Contains(host, ":") {
			if u, err := url.Parse(host); err == nil {
				hostname = u.Hostname()
				port = u.Port()
			}
		}
	}
	if len(hostname) == 0 && len(host) > 0 && !strings.Contains(host, ":") {
		hostname = host
	}

	// figure out credentials from URL if still missing
	for key := range binding.Credentials {
		switch key {
		case "database_uri", "jdbcUrl", "jdbc_url", "url", "uri":
			if uri, _ := binding.CredentialString(key); len(uri) > 0 && strings.Contains(uri, "mysql://") {
				if u, err := url.Parse(uri); err == nil {
					if len(username) == 0 {
						username = u.User.Username()
					}
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

					if len(database) == 0 {
						database = strings.TrimPrefix(u.Path, "/")
						rx := regexp.MustCompile(`([^\?]*)\?.*`) // trim connection options
						database = rx.ReplaceAllString(database, "${1}")
					}
				}
			}
		}
	}

	portnum, _ := strconv.Atoi(port)
	return &Credentials{
		Hostname: hostname,
		Database: database,
		Username: username,
		Password: password,
		Port:     portnum,
	}
}
