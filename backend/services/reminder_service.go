package services

import (
	"encoding/json"
	"log"
	"time"

	"car-rental/config"
	"car-rental/models"

	"github.com/google/uuid"
	"github.com/streadway/amqp"
	"gorm.io/gorm"
)

type ReminderService struct {
	DB       *gorm.DB
	RabbitMQ *amqp.Channel
}

type RentalReminder struct {
	RentalID uuid.UUID `json:"rentalId"`
	UserID   uuid.UUID `json:"userId"`
	Title    string    `json:"title"`
	Message  string    `json:"message"`
	SendTime time.Time `json:"sendTime"`
}

func InitReminderService() {
	go checkRentalsForReminders()
}

func checkRentalsForReminders() {
	ticker := time.NewTicker(24 * time.Hour)
	defer ticker.Stop()

	sendReminderForUpcomingEndDates()

	for range ticker.C {
		sendReminderForUpcomingEndDates()
	}
}

func sendReminderForUpcomingEndDates() {
	log.Println("Checking for rentals that need end date reminders...")

	tomorrow := time.Now().Add(24 * time.Hour)
	dayAfterTomorrow := time.Now().Add(48 * time.Hour)

	var rentals []models.Rental
	if err := config.DB.Preload("Car").Preload("Tenant").
		Where("status = ? AND end_date BETWEEN ? AND ?",
			models.StatusActive, tomorrow, dayAfterTomorrow).
		Find(&rentals).Error; err != nil {
		log.Printf("Error checking for rentals ending soon: %v", err)
		return
	}

	log.Printf("Found %d rentals ending soon", len(rentals))

	for _, rental := range rentals {
		tenantNotification := models.Notification{
			UserID:   rental.TenantID,
			RentalID: rental.ID,
			Title:    "Rental Ending Soon",
			Message:  "Your rental for " + rental.Car.Brand + " " + rental.Car.Model + " is ending tomorrow. Please prepare to return the vehicle.",
			IsRead:   false,
			Type:     "rental_ending",
		}

		if err := config.DB.Create(&tenantNotification).Error; err != nil {
			log.Printf("Error creating tenant notification: %v", err)
			continue
		}

		sendNotificationViaRabbitMQ(tenantNotification)

		ownerNotification := models.Notification{
			UserID:   rental.Car.OwnerID,
			RentalID: rental.ID,
			Title:    "Rental Ending Soon",
			Message:  "The rental of your " + rental.Car.Brand + " " + rental.Car.Model + " is ending tomorrow.",
			IsRead:   false,
			Type:     "rental_ending",
		}

		if err := config.DB.Create(&ownerNotification).Error; err != nil {
			log.Printf("Error creating owner notification: %v", err)
			continue
		}

		sendNotificationViaRabbitMQ(ownerNotification)
	}
}

func sendNotificationViaRabbitMQ(notification models.Notification) {
	notificationData, err := json.Marshal(notification)
	if err != nil {
		log.Printf("Error marshaling notification: %v", err)
		return
	}

	err = config.RabbitMQChannel.Publish(
		"",
		"notifications",
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        notificationData,
		})

	if err != nil {
		log.Printf("Error publishing notification to RabbitMQ: %v", err)
	}
}
