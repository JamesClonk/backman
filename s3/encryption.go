package s3

import (
	"crypto/md5"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"github.com/minio/minio-go/v6"
	"github.com/minio/sio"
	"github.com/swisscom/backman/log"
	"golang.org/x/crypto/hkdf"
	"golang.org/x/crypto/scrypt"
	"io"
	"path/filepath"
)

// header is the header identifying the encryption and kdf used
// The header looks like this with each one representing 1 byte
// | Magic | Version | Encryption | KDF |
type header [4]byte

func (h header) Version() byte    {return h[1]}
func (h header) Encryption() byte {return h[2]}
func (h header) KDF() byte        {return h[3]}
func (h header) Validate() error {
	if h[0] != magicByte {
		return fmt.Errorf("wrong magic bytes, expected %v, got %v", magicByte, h[0])
	}
	switch h.Version() {
	case versionV10:
		break
	default:
		return fmt.Errorf("unexpected version: %v", h.Version())
	}
	switch h.Encryption() {
	case sio.AES_256_GCM, sio.CHACHA20_POLY1305:
		break
	default:
		return fmt.Errorf("unexpected encryption: %v", h.Encryption())
	}
	switch h.KDF() {
	case KDFScrypt:
		break
	default:
		return fmt.Errorf("unexpected KDF %v", h.KDF())
	}
	return nil
}

const (
	// needed to not collide with underlying sio header
	magicByte byte = 0xBA
)

const (
	versionV10 = 0x10 // First KDF version with header
)

const (
	KDFScrypt = iota // N=32768, r=8 and p=1.
)


func getKeyPre123(password string) []byte {
	hasher := md5.New()
	hasher.Write([]byte(password))
	return []byte(hex.EncodeToString(hasher.Sum(nil)))
}

func getKey124(password, object string) []byte {
	nonce := filepath.Base(object)

	hasher := sha256.New()
	if n, err := hasher.Write([]byte(fmt.Sprintf("%s%s", password, nonce))); err != nil || n <= 0 {
		log.Fatalf("could not get salt: %v", err)
	}
	salt := hex.EncodeToString(hasher.Sum(nil))

	masterKey, err := scrypt.Key([]byte(password), []byte(salt), 32768, 8, 1, 32)
	if err != nil {
		log.Fatalf("could not get master key: %v", err)
	}

	// derive encryption key, using filename as nonce (filenames contain timestamps and are unique per backman deployment)
	var key [32]byte
	kdf := hkdf.New(sha256.New, []byte(masterKey), []byte(nonce)[:], nil)
	if _, err := io.ReadFull(kdf, key[:]); err != nil {
		log.Fatalf("failed to derive encryption key: %v", err)
	}
	return key[:]
}

func tryOldDecryption(key []byte, reader *minio.Object) error {
	// reset reader to read from beginning
	if _, err := reader.Seek(0, 0); err != nil {
		return err
	}
	decrypter, err := sio.DecryptReader(reader, sio.Config{Key: key, CipherSuites: []byte{sio.AES_256_GCM}})
	if err != nil {
		return err
	}
	peak := make([]byte, 8)
	if _, err := decrypter.Read(peak); err != nil {
		return err
	}
	return nil
}

func getKey(masterKey string, object string, hdr header) ([]byte, error) {
	switch hdr.KDF() {
	case KDFScrypt:
		return getKeyScrypt(masterKey, object)
	}
	return nil, errors.New("no valid encryption parameters found")
}

func getKeyScrypt(masterKey, object string) ([]byte, error) {
	nonce := filepath.Base(object)
	hasher := sha256.New()
	if n, err := hasher.Write([]byte(fmt.Sprintf("%s%s", masterKey, nonce))); err != nil || n <= 0 {
		return nil, fmt.Errorf("could not get salt: %v", err)
	}
	key, err := scrypt.Key([]byte(masterKey), hasher.Sum(nil), 32768, 8, 1, 32)
	if err != nil {
		return nil, fmt.Errorf("could not derive encryption key: %v", err)
	}
	return key, nil
}