package config

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_Config_Get(t *testing.T) {
	os.Setenv("BACKMAN_PASSWORD", "McClane")
	os.Chdir("../")

	c := Get()

	assert := assert.New(t)
	assert.Equal("debug", c.LogLevel)                                      // .env specifies "debug", overriding "info" from config.json
	assert.Equal(true, c.LoggingTimestamp)                                 // .env specifies "true", overriding "false" from config.json
	assert.Equal("john", c.Username)                                       // .env specifies "true", overriding "false" from config.json
	assert.Equal("McClane", c.Password)                                    // ENV 'PASSWORD' overrides .env and config.json
	assert.Equal("dynstrg", c.S3.ServiceLabel)                             // from config.json
	assert.Equal("my-database-backups", c.S3.BucketName)                   // from config.json
	assert.Equal("13 37 0/6 * * *", c.Services["my_postgres_db"].Schedule) // from .env
	assert.Equal("2h0m0s", c.Services["my_postgres_db"].Timeout.String())  // from config.json
	assert.Equal(90, c.Services["my_postgres_db"].Retention.Days)          // from .env
	assert.Equal(20, c.Services["my_postgres_db"].Retention.Files)         // from .env
}
