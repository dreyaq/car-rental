package routes

import (
	"car-rental/api/controllers"
	"car-rental/api/middleware"
	"car-rental/models"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {

	api := router.Group("/api")

	{

		api.POST("/register", controllers.RegisterUser)
		api.POST("/login", controllers.LoginUser)

		api.GET("/cars", controllers.GetCars)
		api.GET("/cars/:id", controllers.GetCarByID)
		api.GET("/features", controllers.GetCarFeatures)
	}

	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/profile", controllers.GetUserProfile)
		protected.PUT("/profile", controllers.UpdateUserProfile)
		protected.PUT("/profile/password", controllers.ChangePassword)

		protected.GET("/notifications", controllers.GetNotifications)
		protected.PATCH("/notifications/:id/read", controllers.MarkNotificationAsRead)

		protected.GET("/rentals", controllers.GetRentals)
		protected.GET("/rentals/:id", controllers.GetRentalByID)
		protected.POST("/rentals", controllers.CreateRental)
		protected.PATCH("/rentals/:id/status", controllers.UpdateRentalStatus)
	}
	ownerRoutes := api.Group("/owner")
	ownerRoutes.Use(middleware.AuthMiddleware(), middleware.RoleMiddleware(string(models.RoleOwner)))
	{
		ownerRoutes.GET("/cars", controllers.GetOwnerCars)
		ownerRoutes.GET("/cars/:id", controllers.GetOwnerCarById)
		ownerRoutes.POST("/cars", controllers.CreateCar)
		ownerRoutes.PUT("/cars/:id", controllers.UpdateCar)
		ownerRoutes.DELETE("/cars/:id", controllers.DeleteCar)
	}

	adminRoutes := router.Group("/api/admin")
	adminRoutes.Use(middleware.AuthMiddleware(), middleware.RoleMiddleware(string(models.RoleAdmin)))
	{

	}
}
