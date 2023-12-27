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

func Test_Service_EnrichBinding(t *testing.T) {
	config.SetConfigFile("_fixtures/config_without_bindings.json")

	c := config.Get()
	mergeVCAPServices()

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

	// if no port is defined in uri, it is determined by schema/protocol
	elasticsearchServiceConfig.Binding.Host = "http://0c061730-1b19-424b-8efd-349fd40957a0.yolo.elasticsearch.lyra-836.appcloud.swisscom.com"
	elasticsearchServiceConfig.Binding.URI = elasticsearchServiceConfig.Binding.Host
	elasticsearchServiceConfig.Binding.Port = 0
	elasticsearchServiceConfig.Binding = enrichBinding(elasticsearchServiceConfig.Binding)
	assert.Equal(t, 80, elasticsearchServiceConfig.Binding.Port)

	// if no port is defined in uri, it is determined by schema/protocol
	elasticsearchServiceConfig.Binding.Host = "nonehttp://0c061730-1b19-424b-8efd-349fd40957a0.yolo.elasticsearch.lyra-836.appcloud.swisscom.com"
	elasticsearchServiceConfig.Binding.URI = elasticsearchServiceConfig.Binding.Host
	elasticsearchServiceConfig.Binding.Port = 0
	elasticsearchServiceConfig.Binding = enrichBinding(elasticsearchServiceConfig.Binding)
	assert.Equal(t, 0, elasticsearchServiceConfig.Binding.Port)
}
