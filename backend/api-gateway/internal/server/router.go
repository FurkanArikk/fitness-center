package server

import (
	"github.com/furkan/fitness-center/backend/api-gateway/internal/config"
	"github.com/furkan/fitness-center/backend/api-gateway/internal/proxy"
	"github.com/gin-gonic/gin"
)

// SetupRouter, API Gateway için tüm rotaları yapılandırır
func SetupRouter(router *gin.Engine, cfg *config.Config) {
	// Ana endpoint'leri gruplandırma
	apiV1 := router.Group("/api/v1")

	// Member Service yönlendirmeleri
	if memberSvc, ok := cfg.Services["member"]; ok {
		memberProxy := proxy.NewServiceProxy(memberSvc.URL, memberSvc.Timeout)
		memberGroup := apiV1.Group("/members")
		{
			memberGroup.Any("", memberProxy.ProxyRequest)
			memberGroup.Any("/*path", memberProxy.ProxyRequest)
		}

		// Üye-üyelik ilişkileri
		memberMembershipsGroup := apiV1.Group("/member-memberships")
		{
			memberMembershipsGroup.Any("", memberProxy.ProxyRequest)
			memberMembershipsGroup.Any("/*path", memberProxy.ProxyRequest)
		}

		// Üyelikler
		membershipsGroup := apiV1.Group("/memberships")
		{
			membershipsGroup.Any("", memberProxy.ProxyRequest)
			membershipsGroup.Any("/*path", memberProxy.ProxyRequest)
		}

		// Üyelik faydaları
		benefitsGroup := apiV1.Group("/benefits")
		{
			benefitsGroup.Any("", memberProxy.ProxyRequest)
			benefitsGroup.Any("/*path", memberProxy.ProxyRequest)
		}

		// Fitness değerlendirmeleri
		assessmentsGroup := apiV1.Group("/assessments")
		{
			assessmentsGroup.Any("", memberProxy.ProxyRequest)
			assessmentsGroup.Any("/*path", memberProxy.ProxyRequest)
		}
	}

	// Staff Service yönlendirmeleri
	if staffSvc, ok := cfg.Services["staff"]; ok {
		staffProxy := proxy.NewServiceProxy(staffSvc.URL, staffSvc.Timeout)
		staffGroup := apiV1.Group("/staff")
		{
			staffGroup.Any("", staffProxy.ProxyRequest)
			staffGroup.Any("/*path", staffProxy.ProxyRequest)
		}

		// Eğitmenler
		trainersGroup := apiV1.Group("/trainers")
		{
			trainersGroup.Any("", staffProxy.ProxyRequest)
			trainersGroup.Any("/*path", staffProxy.ProxyRequest)
		}

		// Personel yeterlilikleri
		qualificationsGroup := apiV1.Group("/qualifications")
		{
			qualificationsGroup.Any("", staffProxy.ProxyRequest)
			qualificationsGroup.Any("/*path", staffProxy.ProxyRequest)
		}

		// Kişisel antrenman seansları
		trainingSessionsGroup := apiV1.Group("/training-sessions")
		{
			trainingSessionsGroup.Any("", staffProxy.ProxyRequest)
			trainingSessionsGroup.Any("/*path", staffProxy.ProxyRequest)
		}
	}

	// Class Service yönlendirmeleri
	if classSvc, ok := cfg.Services["class"]; ok {
		classProxy := proxy.NewServiceProxy(classSvc.URL, classSvc.Timeout)

		// Sınıflar
		classesGroup := apiV1.Group("/classes")
		{
			classesGroup.Any("", classProxy.ProxyRequest)
			classesGroup.Any("/*path", classProxy.ProxyRequest)
		}

		// Programlar
		schedulesGroup := apiV1.Group("/schedules")
		{
			schedulesGroup.Any("", classProxy.ProxyRequest)
			schedulesGroup.Any("/*path", classProxy.ProxyRequest)
		}

		// Rezervasyonlar
		bookingsGroup := apiV1.Group("/bookings")
		{
			bookingsGroup.Any("", classProxy.ProxyRequest)
			bookingsGroup.Any("/*path", classProxy.ProxyRequest)
		}
	}

	// Facility Service yönlendirmeleri
	if facilitySvc, ok := cfg.Services["facility"]; ok {
		facilityProxy := proxy.NewServiceProxy(facilitySvc.URL, facilitySvc.Timeout)

		// Tesisler
		facilitiesGroup := apiV1.Group("/facilities")
		{
			facilitiesGroup.Any("", facilityProxy.ProxyRequest)
			facilitiesGroup.Any("/*path", facilityProxy.ProxyRequest)
		}

		// Ekipmanlar
		equipmentGroup := apiV1.Group("/equipment")
		{
			equipmentGroup.Any("", facilityProxy.ProxyRequest)
			equipmentGroup.Any("/*path", facilityProxy.ProxyRequest)
		}

		// Katılım
		attendanceGroup := apiV1.Group("/attendance")
		{
			attendanceGroup.Any("", facilityProxy.ProxyRequest)
			attendanceGroup.Any("/*path", facilityProxy.ProxyRequest)
		}
	}

	// Payment Service yönlendirmeleri
	if paymentSvc, ok := cfg.Services["payment"]; ok {
		paymentProxy := proxy.NewServiceProxy(paymentSvc.URL, paymentSvc.Timeout)

		// Ödemeler
		paymentsGroup := apiV1.Group("/payments")
		{
			paymentsGroup.Any("", paymentProxy.ProxyRequest)
			paymentsGroup.Any("/*path", paymentProxy.ProxyRequest)
		}

		// Ödeme türleri
		paymentTypesGroup := apiV1.Group("/payment-types")
		{
			paymentTypesGroup.Any("", paymentProxy.ProxyRequest)
			paymentTypesGroup.Any("/*path", paymentProxy.ProxyRequest)
		}

		// İşlemler
		transactionsGroup := apiV1.Group("/transactions")
		{
			transactionsGroup.Any("", paymentProxy.ProxyRequest)
			transactionsGroup.Any("/*path", paymentProxy.ProxyRequest)
		}
	}
}
