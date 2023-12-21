package service

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/swisscom/backman/config"
)

func init() {
	_ = os.Chdir("../")
}

func Test_Service_ParseServiceBindings(t *testing.T) {
	config.SetConfigFile("_fixtures/config_without_bindings.json")

	os.Unsetenv("BACKMAN_CONFIG")
	os.Unsetenv("BACKMAN_USERNAME")
	os.Unsetenv("BACKMAN_PASSWORD")
	os.Setenv("SERVICE_BINDING_ROOT", "_fixtures/bindings")

	c := config.Get()
	mergeServiceBindings()

	assert.Equal(t, "info", c.LogLevel)                                             // from config.json
	assert.Equal(t, false, c.LoggingTimestamp)                                      // from config.json
	assert.Equal(t, "john", c.Username)                                             // from config.json
	assert.Equal(t, "doe", c.Password)                                              // from config.json
	assert.Equal(t, "127.0.0.1:9000", c.S3.Host)                                    // from service_binding_root/*
	assert.Equal(t, "6d611e2d-330b-4e52-a27c-59064d6e8a62", c.S3.AccessKey)         // from service_binding_root/*
	assert.Equal(t, "eW9sbywgeW91IGhhdmUganVzdCBiZWVuIHRyb2xsZWQh", c.S3.SecretKey) // from service_binding_root/*
	assert.Equal(t, "dynstrg", c.S3.ServiceLabel)                                   // from config.json
	assert.Equal(t, "my-database-backups", c.S3.BucketName)                         // from config.json
	assert.Equal(t, true, c.S3.DisableSSL)                                          // from config.json

	assert.Equal(t, "0 0 2 * * *", c.Services["my_postgres_db"].Schedule)                                                                     // from config.json
	assert.Equal(t, "2h0m0s", c.Services["my_postgres_db"].Timeout.String())                                                                  // from config.json
	assert.Equal(t, 60, c.Services["my_postgres_db"].Retention.Days)                                                                          // from config.json
	assert.Equal(t, 250, c.Services["my_postgres_db"].Retention.Files)                                                                        // from config.json
	assert.Equal(t, "postgres", c.Services["my_postgres_db"].Binding.Type)                                                                    // from service_binding_root/*
	assert.Equal(t, "docker container", c.Services["my_postgres_db"].Binding.Provider)                                                        // from service_binding_root/*
	assert.Equal(t, "127.0.0.1", c.Services["my_postgres_db"].Binding.Host)                                                                   // from service_binding_root/*
	assert.Equal(t, 5432, c.Services["my_postgres_db"].Binding.Port)                                                                          // from service_binding_root/*
	assert.Equal(t, "dev-user", c.Services["my_postgres_db"].Binding.Username)                                                                // from service_binding_root/*
	assert.Equal(t, "dev-secret", c.Services["my_postgres_db"].Binding.Password)                                                              // from service_binding_root/*
	assert.Equal(t, "postgres://dev-user:dev-secret@127.0.0.1:5432/my_postgres_db?sslmode=disable", c.Services["my_postgres_db"].Binding.URI) // from service_binding_root/*
}

func Test_Service_MergeVCAPServices(t *testing.T) {
	config.SetConfigFile("_fixtures/config_without_bindings.json")

	c := config.Get()
	mergeVCAPServices()

	assert.Equal(t, "postgres", c.Services["my_postgres_db"].Binding.Type)
	assert.Equal(t, "127.0.0.1", c.Services["my_postgres_db"].Binding.Host)
	assert.Equal(t, 5432, c.Services["my_postgres_db"].Binding.Port)
	assert.Equal(t, "dev-user", c.Services["my_postgres_db"].Binding.Username)
	assert.Equal(t, "dev-secret", c.Services["my_postgres_db"].Binding.Password)
	assert.Equal(t, "postgres://dev-user:dev-secret@127.0.0.1:5432/my_postgres_db?sslmode=disable", c.Services["my_postgres_db"].Binding.URI)
	assert.Equal(t, "https://0c061730-1b19-424b-8efd-349fd40957a0.yolo.elasticsearch.lyra-836.appcloud.swisscom.com:443", c.Services["my-elasticsearch"].Binding.URI)

	elasticsearchServiceConfig := c.Services["my-elasticsearch"]
	// without enrichBinding is port undefined
	assert.Equal(t, 0, elasticsearchServiceConfig.Binding.Port)
	// if port is defined in uri, it is determined from there
	elasticsearchServiceConfig.Binding = enrichBinding(elasticsearchServiceConfig.Binding)
	assert.Equal(t, 443, elasticsearchServiceConfig.Binding.Port)
	// if no port is defined in uri, it is determined by schema/protocol
	elasticsearchServiceConfig.Binding.Host = "https://0c061730-1b19-424b-8efd-349fd40957a0.yolo.elasticsearch.lyra-836.appcloud.swisscom.com"
	elasticsearchServiceConfig.Binding.URI = elasticsearchServiceConfig.Binding.Host
	elasticsearchServiceConfig.Binding.Port = 0
	elasticsearchServiceConfig.Binding = enrichBinding(elasticsearchServiceConfig.Binding)
	assert.Equal(t, 443, elasticsearchServiceConfig.Binding.Port)
}
