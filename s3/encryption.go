package s3

import (
	"crypto/md5"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
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

func (h header) Version() byte    { return h[1] }
func (h header) Encryption() byte { return h[2] }
func (h header) KDF() byte        { return h[3] }

// Validate validates the headers content
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
	case kdfScrypt:
		break
	default:
		return fmt.Errorf("unexpected KDF %v", h.KDF())
	}
	return nil
}

// newHeader creates a new header for the given encryption and kdf
func newHeader(encryption, kdf byte) header {
	return header{magicByte, versionV10, encryption, kdf}
}

const (
	// needed to not collide with underlying sio header
	magicByte byte = 0xBA
)

const (
	versionV10 = 0x10 // First KDF version with header
)

const (
	kdfUnknown byte = iota
	kdfOldMD5       // needed for backwards compatibility
	kdfOldScryptHKDF // needed for backwards compatibility
	kdfScrypt = 0x10 // N=32768, r=8 and p=1.
)

// getKey returns a key derived from the given masterKey, object and header
// when the kdf is unknown or one of the old methods, it needs to peek in the reader and thus reset it before returning
func getKey(masterKey string, object string, hdr header, reader io.ReadSeeker) ([]byte, error) {
	switch hdr.KDF() {
	case kdfScrypt:
		return generateKeyScrypt(masterKey, object)
	case kdfUnknown, kdfOldMD5, kdfOldScryptHKDF:
		// this is only for backwards compatibility
		key := generateKeyPre123(masterKey)
		if err := tryOldDecryption(key, reader); err != nil {
			key = generateKey124(masterKey, object)
			if err := tryOldDecryption(key, reader); err != nil {
				return nil, fmt.Errorf("couldn't get key for headerless encryption: %v", err)
			}
			return key, nil
		}
		return key, nil
	}
	return nil, fmt.Errorf("no valid kdf: %v", hdr.KDF())
}

// generateKey derives a key from the given masterKey, object and header
func generateKey(masterKey string, object string, hdr header) ([]byte, error) {
	switch hdr.KDF() {
	case kdfScrypt:
		return generateKeyScrypt(masterKey, object)
	case kdfOldMD5:
		return generateKeyPre123(masterKey), nil
	case kdfOldScryptHKDF:
		return generateKey124(masterKey, object), nil
	}
	return nil, fmt.Errorf("no valid kdf: %v", hdr.KDF())
}

// generateKeyScrypt derives the key from the given masterKey and object with the scrypt KDF
func generateKeyScrypt(masterKey, object string) ([]byte, error) {
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

// generateKeyPre123 derives the key via md5 hashing masterKey
// This is not secure and mainly kept for being able to decrypt old backups
func generateKeyPre123(masterKey string) []byte {
	hasher := md5.New()
	hasher.Write([]byte(masterKey))
	return []byte(hex.EncodeToString(hasher.Sum(nil)))
}

// generateKey124 derives the key from the given masterKey and object via scrypt and hkdf and using the hash(mk,o) as salt
// This is overly complicated without providing a real improvement in security
// It is mainly kept for being able to decrypt old backups
func generateKey124(masterKey, object string) []byte {
	nonce := filepath.Base(object)

	hasher := sha256.New()
	if n, err := hasher.Write([]byte(fmt.Sprintf("%s%s", masterKey, nonce))); err != nil || n <= 0 {
		log.Fatalf("could not get salt: %v", err)
	}
	salt := hex.EncodeToString(hasher.Sum(nil))

	intKey, err := scrypt.Key([]byte(masterKey), []byte(salt), 32768, 8, 1, 32)
	if err != nil {
		log.Fatalf("could not get master key: %v", err)
	}

	// derive encryption key, using filename as nonce (filenames contain timestamps and are unique per backman deployment)
	var key [32]byte
	kdf := hkdf.New(sha256.New, intKey, []byte(nonce)[:], nil)
	if _, err := io.ReadFull(kdf, key[:]); err != nil {
		log.Fatalf("failed to derive encryption key: %v", err)
	}
	return key[:]
}

// tryOldDecryption peeks in the given reader and tries to decrypt with the given key
// This is used to decrypt backups which don't have a header and therefore have no information about the used kdf/encryption
func tryOldDecryption(key []byte, reader io.ReadSeeker) error {
	// reset reader to read from beginning
	if _, err := reader.Seek(0, 0); err != nil {
		return err
	}
	decrypter, err := sio.DecryptReader(reader, sio.Config{Key: key, CipherSuites: []byte{sio.AES_256_GCM}})
	if err != nil {
		return err
	}
	peek := make([]byte, 8)
	if _, err := decrypter.Read(peek); err != nil {
		return err
	}
	// reset again
	if _, err := reader.Seek(0, 0); err != nil {
		return err
	}
	return nil
}

// readHeader reads and validates the header from the given reader
func readHeader(reader io.Reader) (header, error) {
	hdr := header{}
	if _, err := reader.Read(hdr[:]); err != nil {
		return hdr, fmt.Errorf("couldn't read header: %v", err)
	}
	if err := hdr.Validate(); err != nil {
		// try old method
		hdr = newHeader(sio.AES_256_GCM, kdfUnknown)
	}
	return hdr, nil
}
