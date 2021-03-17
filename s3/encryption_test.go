package s3

import (
	"bytes"
	"github.com/minio/sio"
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
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := generateKey(tt.args.masterKey, tt.args.object, tt.args.hdr)
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

func TestEncryptionDecryption(t *testing.T) {
	tests := []struct{
		name string
		masterkey string
		object string
		hdr header
		writeHeader bool
	}{
		{
			name: "old md5 kdf",
			masterkey: "test",
			object: "some-bucket/my-file.ext",
			hdr: NewHeader(sio.AES_256_GCM, KDFOldMD5),
		},
		{
			name: "old scrypt kdf",
			masterkey: "test",
			object: "some-bucket/my-file.ext",
			hdr: NewHeader(sio.AES_256_GCM, KDFOldScryptHKDF),
		},
		{
			name: "new scrypt kdf",
			masterkey: "test",
			object: "some-bucket/my-file.ext",
			hdr: NewHeader(sio.AES_256_GCM, KDFScrypt),
			writeHeader: true,
		},
	}

	for _, tt := range tests{
		t.Run(tt.name, func(t *testing.T) {
			var testdata= []byte("testdata")
			var encBuf = &bytes.Buffer{}
			enckey, err := generateKey(tt.masterkey, tt.object, tt.hdr)
			if err != nil {
				t.Fatal(err)
			}
			_, err = sio.Encrypt(encBuf, bytes.NewBuffer(testdata), sio.Config{Key: enckey, CipherSuites: []byte{tt.hdr.Encryption()}})
			if err != nil {
				t.Fatal(err)
			}

			encData := encBuf.Bytes()
			if tt.writeHeader {
				encData = append(tt.hdr[:], encData...)
			}
			reader := bytes.NewReader(encData)
			hdr, err := readHeader(reader)
			if err != nil {
				t.Fatal(err)
			}
			decKey, err := getKey(tt.masterkey, tt.object, hdr, reader)
			if err != nil {
				t.Fatal(err)
			}
			if !bytes.Equal(decKey, enckey) {
				t.Fatalf("expected %s to be %s", decKey, enckey)
			}
			var outBuf = &bytes.Buffer{}
			_, err = sio.Decrypt(outBuf, reader, sio.Config{Key: decKey, CipherSuites: []byte{hdr.Encryption()}})
			if err != nil {
				t.Fatal(err)
			}
			if !bytes.Equal(outBuf.Bytes(), testdata) {
				t.Fatalf("expected %s to be %s", outBuf.Bytes(), testdata)
			}
		})
	}
}