# Fitness Center Mikroservis Mimarisi - Backend

Bu proje, bir fitness merkezi yönetim sistemi için mikroservis mimarisi kullanarak geliştirilmiştir.

## Mikroservisler

- **API Gateway**: Tüm servislerin tek noktadan erişim noktası
- **Member Service**: Üyelik yönetimi
- **Staff Service**: Personel ve eğitmen yönetimi
- **Class Service**: Dersler ve rezervasyonlar
- **Facility Service**: Tesis ve ekipman yönetimi
- **Payment Service**: Ödeme işlemleri

## Başlangıç

```bash
# Docker ile çalıştır
docker-compose up -d
```

## API Dokümantasyonu

Her servis için API dokümantasyonu:

- API Gateway: http://localhost:8000/swagger/index.html
- Member Service: http://localhost:8001/swagger/index.html
- Staff Service: http://localhost:8002/swagger/index.html
- Class Service: http://localhost:8003/swagger/index.html
- Facility Service: http://localhost:8004/swagger/index.html
- Payment Service: http://localhost:8005/swagger/index.html
