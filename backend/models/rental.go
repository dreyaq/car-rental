package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RentalStatus string

const (
	StatusPending   RentalStatus = "pending"
	StatusConfirmed RentalStatus = "confirmed"
	StatusActive    RentalStatus = "active"
	StatusCompleted RentalStatus = "completed"
	StatusCancelled RentalStatus = "cancelled"
)

type Rental struct {
	ID             uuid.UUID    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	CarID          uuid.UUID    `gorm:"type:uuid;not null" json:"carId"`
	TenantID       uuid.UUID    `gorm:"type:uuid;not null" json:"tenantId"`
	RenterID       uuid.UUID    `gorm:"type:uuid;not null" json:"-"`
	StartDate      time.Time    `gorm:"not null" json:"startDate"`
	EndDate        time.Time    `gorm:"not null" json:"endDate"`
	TotalPrice     float64      `gorm:"type:decimal(10,2);not null" json:"totalPrice"`
	Status         RentalStatus `gorm:"type:varchar(20);not null" json:"status"`
	WithDriver     bool         `gorm:"default:false" json:"withDriver"`
	PaymentStatus  string       `gorm:"type:varchar(20);default:'unpaid'" json:"paymentStatus"`
	PickupLocation string       `gorm:"type:varchar(255)" json:"pickupLocation"`
	ReturnLocation string       `gorm:"type:varchar(255)" json:"returnLocation"`
	Notes          string       `gorm:"type:text" json:"notes"`

	Car    Car  `json:"car,omitempty"`
	Tenant User `json:"tenant,omitempty"`

	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Notification struct {
	ID       uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID   uuid.UUID `gorm:"type:uuid;not null" json:"userId"`
	RentalID uuid.UUID `gorm:"type:uuid" json:"rentalId"`
	Title    string    `gorm:"type:varchar(100);not null" json:"title"`
	Message  string    `gorm:"type:text;not null" json:"message"`
	IsRead   bool      `gorm:"default:false" json:"isRead"`
	Type     string    `gorm:"type:varchar(50);not null" json:"type"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
