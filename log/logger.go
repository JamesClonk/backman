package log

import (
	"io"
	"log"
	"os"

	"github.com/sirupsen/logrus"
)

var (
	logger *logrus.Logger
)

func init() {
	logger = newLogger(os.Stdout)
}

func newLogger(writer io.Writer) *logrus.Logger {
	level := os.Getenv("LOG_LEVEL")
	if len(level) == 0 {
		level = "info"
	}
	logLevel, err := logrus.ParseLevel(level)
	if err != nil {
		log.Fatal(err)
	}

	logger := logrus.New()
	logger.SetOutput(writer)
	logger.SetLevel(logLevel)
	logger.SetFormatter(&logrus.TextFormatter{
		QuoteEmptyFields: true,
		DisableColors:    true,
		FullTimestamp:    false,
		DisableTimestamp: os.Getenv("ENABLE_LOGGING_TIMESTAMP") != "true",
	})
	return logger
}

func Printf(format string, args ...interface{}) {
	logger.Infof(format, args...)
}

func Println(args ...interface{}) {
	logger.Infoln(args...)
}

func Infof(format string, args ...interface{}) {
	logger.Infof(format, args...)
}

func Infoln(args ...interface{}) {
	logger.Infoln(args...)
}

func Warnf(format string, args ...interface{}) {
	logger.Warnf(format, args...)
}

func Warnln(args ...interface{}) {
	logger.Warnln(args...)
}

func Debugf(format string, args ...interface{}) {
	logger.Debugf(format, args...)
}

func Debugln(args ...interface{}) {
	logger.Debugln(args...)
}

func Errorf(format string, args ...interface{}) {
	logger.Errorf(format, args...)
}

func Errorln(args ...interface{}) {
	logger.Errorln(args...)
}

func Fatalf(format string, args ...interface{}) {
	logger.Fatalf(format, args...)
}

func Fatalln(args ...interface{}) {
	logger.Fatalln(args...)
}
