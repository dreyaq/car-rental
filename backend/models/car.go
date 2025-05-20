package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BodyType string

const (
	Sedan       BodyType = "sedan"
	SUV         BodyType = "suv"
	Hatchback   BodyType = "hatchback"
	Convertible BodyType = "convertible"
	Coupe       BodyType = "coupe"
	Minivan     BodyType = "minivan"
	Pickup      BodyType = "pickup"
)

type TransmissionType string

const (
	Automatic TransmissionType = "automatic"
	Manual    TransmissionType = "manual"
)

type FuelType string

const (
	Petrol   FuelType = "petrol"
	Diesel   FuelType = "diesel"
	Electric FuelType = "electric"
	Hybrid   FuelType = "hybrid"
)

type Car struct {
	ID                 uuid.UUID        `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	OwnerID            uuid.UUID        `gorm:"type:uuid;not null" json:"ownerId"`
	Make               string           `gorm:"type:varchar(100);not null" json:"make"`
	Brand              string           `gorm:"type:varchar(50);not null" json:"brand"`
	Model              string           `gorm:"type:varchar(50);not null" json:"model"`
	Year               int              `gorm:"type:int;not null" json:"year"`
	RegistrationNumber string           `gorm:"type:varchar(20);unique;not null" json:"registrationNumber"`
	Category           string           `gorm:"type:varchar(50);not null" json:"category"`
	BodyType           BodyType         `gorm:"type:varchar(20);not null" json:"bodyType"`
	Color              string           `gorm:"type:varchar(30);not null" json:"color"`
	Seats              int              `gorm:"type:int;not null" json:"seats"`
	Doors              int              `gorm:"type:int;not null" json:"doors"`
	Location           string           `gorm:"type:varchar(255);not null" json:"location"`
	Transmission       TransmissionType `gorm:"type:varchar(20);not null" json:"transmission"`
	FuelType           FuelType         `gorm:"type:varchar(20);not null" json:"fuelType"`
	FuelConsumption    float64          `gorm:"type:decimal(5,2);not null" json:"fuelConsumption"`
	DriverIncluded     bool             `gorm:"default:false" json:"driverIncluded"`
	PricePerDay        float64          `gorm:"type:decimal(10,2);not null" json:"pricePerDay"`
	PricePerWeek       float64          `gorm:"type:decimal(10,2)" json:"pricePerWeek"`
	PricePerMonth      float64          `gorm:"type:decimal(10,2)" json:"pricePerMonth"`
	Description        string           `gorm:"type:text" json:"description"`
	IsAvailable        bool             `gorm:"default:true" json:"isAvailable"`
	Features           []CarFeature     `gorm:"many2many:car_to_features;" json:"features,omitempty"`
	Images             []CarImage       `gorm:"foreignKey:CarID" json:"images,omitempty"`
	Rentals            []Rental         `gorm:"foreignKey:CarID" json:"rentals,omitempty"`

	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type CarFeature struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"type:varchar(100);unique;not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type CarImage struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	CarID     uuid.UUID `gorm:"type:uuid;not null" json:"carId"`
	ImagePath string    `gorm:"type:varchar(255);not null" json:"imagePath"`
	IsMain    bool      `gorm:"default:false" json:"isMain"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
