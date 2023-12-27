package service

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/swisscom/backman/config"
)

func Test_Service_MergeVCAPServices(t *testing.T) {
	config.SetConfigFile("_fixtures/config_without_bindings.json")

	os.Unsetenv("SERVICE_BINDING_ROOT")

	c := config.Get()
	mergeVCAPServices()

	assert.Equal(t, "postgres", c.Services["my_postgres_db"].Binding.Type)
	assert.Equal(t, "127.0.0.1", c.Services["my_postgres_db"].Binding.Host)
	assert.Equal(t, 5432, c.Services["my_postgres_db"].Binding.Port)
	assert.Equal(t, "dev-user", c.Services["my_postgres_db"].Binding.Username)
	assert.Equal(t, "dev-secret", c.Services["my_postgres_db"].Binding.Password)
	assert.Equal(t, "postgres://dev-user:dev-secret@127.0.0.1:5432/my_postgres_db?sslmode=disable", c.Services["my_postgres_db"].Binding.URI)
	assert.Equal(t, "https://0c061730-1b19-424b-8efd-349fd40957a0.yolo.elasticsearch.lyra-836.appcloud.swisscom.com:443", c.Services["my-elasticsearch"].Binding.URI)
}
