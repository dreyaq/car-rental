package config

import (
	"fmt"
	"log"
	"os"

	"github.com/streadway/amqp"
)

var RabbitMQConn *amqp.Connection
var RabbitMQChannel *amqp.Channel

func ConnectRabbitMQ() {
	LoadEnv()

	rabbitMQHost := os.Getenv("RABBITMQ_HOST")
	rabbitMQPort := os.Getenv("RABBITMQ_PORT")
	rabbitMQUser := os.Getenv("RABBITMQ_USER")
	rabbitMQPassword := os.Getenv("RABBITMQ_PASSWORD")

	connectionString := fmt.Sprintf("amqp://%s:%s@%s:%s/",
		rabbitMQUser, rabbitMQPassword, rabbitMQHost, rabbitMQPort)

	var err error
	RabbitMQConn, err = amqp.Dial(connectionString)
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}

	RabbitMQChannel, err = RabbitMQConn.Channel()
	if err != nil {
		log.Fatalf("Failed to open a channel: %v", err)
	}

	queues := []string{"notifications", "rental_reminders"}
	for _, queue := range queues {
		_, err = RabbitMQChannel.QueueDeclare(
			queue,
			true,
			false,
			false,
			false,
			nil,
		)
		if err != nil {
			log.Fatalf("Failed to declare queue %s: %v", queue, err)
		}
	}

	log.Println("Connected to RabbitMQ successfully and queues are ready")
}

func CloseRabbitMQ() {
	if RabbitMQChannel != nil {
		RabbitMQChannel.Close()
	}
	if RabbitMQConn != nil {
		RabbitMQConn.Close()
	}
}
