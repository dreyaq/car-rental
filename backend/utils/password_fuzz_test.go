package utils

import (
	"testing"
	"unicode/utf8"
)

func FuzzHashPassword(f *testing.F) {
	f.Add("password123")
	f.Add("")
	f.Add("a")
	f.Add("very_long_password_that_might_cause_issues_with_memory_or_processing_time")
	f.Add("пароль_с_русскими_символами")
	f.Add("password with spaces")
	f.Add("!@#$%^&*()_+-=[]{}|;:,.<>?")
	f.Add("password\nwith\nnewlines")
	f.Add("password\twith\ttabs")

	f.Fuzz(func(t *testing.T, password string) {
		if !utf8.ValidString(password) {
			t.Skip("Invalid UTF-8 string")
		}

		if len(password) > 10000 {
			t.Skip("Password too long")
		}
		hash, err := HashPassword(password)

		if len(password) > 72 {
			if err == nil {
				t.Errorf("HashPassword should fail for passwords longer than 72 bytes, but succeeded for %q", password)
			}
			return
		}

		if err != nil {
			t.Errorf("HashPassword failed for input %q: %v", password, err)
			return
		}

		if len(hash) == 0 {
			t.Errorf("HashPassword returned empty hash for input %q", password)
			return
		}

		if password != "" && len(password) > 3 {
			if contains := bytesContain([]byte(hash), []byte(password)); contains {
				t.Errorf("Hash contains original password for input %q", password)
			}
		}
		if CheckPassword(password, hash) != true {
			t.Errorf("CheckPassword failed for correct password %q", password)
		}

		wrongPassword := password + "wrong"
		if CheckPassword(wrongPassword, hash) != false {
			t.Errorf("CheckPassword should fail for wrong password %q", wrongPassword)
		}
	})
}

func FuzzCheckPasswordHash(f *testing.F) {
	f.Add("password123", "$2a$10$example.hash.that.might.be.valid")
	f.Add("", "")
	f.Add("test", "invalid_hash")
	f.Add("password", "$2a$10$")
	f.Add("test", "$2a$invalid$hash")

	f.Fuzz(func(t *testing.T, password, hash string) {
		if !utf8.ValidString(password) || !utf8.ValidString(hash) {
			t.Skip("Invalid UTF-8 string")
		}

		if len(password) > 1000 || len(hash) > 1000 {
			t.Skip("Input too long")
		}
		// Тестируем проверку пароля
		// Функция не должна паниковать на любых входных данных
		result := CheckPassword(password, hash)

		// Результат должен быть boolean
		_ = result
	})
}

func bytesContain(haystack, needle []byte) bool {
	if len(needle) == 0 {
		return true
	}
	if len(needle) > len(haystack) {
		return false
	}

	for i := 0; i <= len(haystack)-len(needle); i++ {
		match := true
		for j := 0; j < len(needle); j++ {
			if haystack[i+j] != needle[j] {
				match = false
				break
			}
		}
		if match {
			return true
		}
	}
	return false
}
