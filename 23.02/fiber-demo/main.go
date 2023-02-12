package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

type Q struct {
	A string `query:"a" json:"a" xml:"a" form:"a"`
	B string `query:"b" json:"b" xml:"b" form:"b"`
}

func main() {
	app := fiber.New()
	app.Use(logger.New())
	app.Use(cors.New())

	app.All("/", func(ctx *fiber.Ctx) error {
		q1 := new(Q)
		q2 := new(Q)
		ctx.QueryParser(q1)
		ctx.BodyParser(q2)
		return ctx.JSON(q2)
	})

	app.Listen(":3000")
}
