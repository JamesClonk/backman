package s3

import (
	"reflect"
	"testing"
)

func Test_getKey(t *testing.T) {
	type args struct {
		masterKey string
		object    string
		hdr       header
	}
	tests := []struct {
		name    string
		args    args
		want    []byte
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := getKey(tt.args.masterKey, tt.args.object, tt.args.hdr)
			if (err != nil) != tt.wantErr {
				t.Errorf("getKey() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("getKey() got = %v, want %v", got, tt.want)
			}
		})
	}
}
