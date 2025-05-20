package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRole string

const (
	RoleAdmin  UserRole = "admin"
	RoleOwner  UserRole = "owner"
	RoleTenant UserRole = "tenant"
)

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Email        string    `gorm:"type:varchar(100);unique;not null" json:"email"`
	PasswordHash string    `gorm:"column:password_hash;type:varchar(255);not null" json:"-"`
	FirstName    string    `gorm:"type:varchar(100);not null" json:"firstName"`
	LastName     string    `gorm:"type:varchar(100);not null" json:"lastName"`
	Phone        string    `gorm:"type:varchar(20);not null" json:"phone"`
	Role         UserRole  `gorm:"type:varchar(20);not null" json:"role"`

	PaymentCards []PaymentCard `gorm:"foreignKey:UserID" json:"paymentCards,omitempty"`

	OwnedCars []Car    `gorm:"foreignKey:OwnerID" json:"ownedCars,omitempty"`
	Rentals   []Rental `gorm:"foreignKey:TenantID" json:"rentals,omitempty"`

	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type PaymentCard struct {
	ID             uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID         uuid.UUID `gorm:"type:uuid;not null" json:"userId"`
	CardNumber     string    `gorm:"type:varchar(20);not null" json:"cardNumber"`
	CardholderName string    `gorm:"type:varchar(100);not null" json:"cardholderName"`
	ExpiryMonth    int       `gorm:"type:int;not null" json:"expiryMonth"`
	ExpiryYear     int       `gorm:"type:int;not null" json:"expiryYear"`
	CVV            string    `gorm:"type:varchar(10);not null" json:"-"`
	IsDefault      bool      `gorm:"default:false" json:"isDefault"`

	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
