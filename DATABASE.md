# Diagram Skema Database (ERD)

Aplikasi **Gumay Tech** menggunakan **SQLite** sebagai database lokal, yang diorkestrasikan menggunakan **Drizzle ORM** untuk menjamin *Type-Safety*.
Di bawah ini adalah ilustrasi **Entity Relationship Diagram (ERD)** dari skema database:

```mermaid
erDiagram
    CUSTOMERS {
        int id PK "autoIncrement"
        text name "notNull"
        text phone "notNull"
        text address
        text notes
        text created_at
        text updated_at
        text deleted_at "Soft delete flag"
    }
    
    DEVICES {
        int id PK "autoIncrement"
        int customer_id FK "Cascade Delete"
        text device_type "notNull"
        text brand
        text model
        text serial_number
        text color
        text notes
        text created_at
        text updated_at
        text deleted_at "Soft delete flag"
    }

    SERVICE_ORDERS {
        int id PK "autoIncrement"
        text ticket_number "notNull, Unique"
        int customer_id FK
        int device_id FK
        text received_date
        text estimated_completion_date
        text customer_complaint
        text accessories
        text physical_condition
        text diagnosis_result
        text actions_taken
        text technician_notes
        real total_cost
        text service_status "Default: Diterima"
        text payment_status "Default: Belum Bayar"
        text completed_date
        text warranty_end_date
        text created_at
        text updated_at
        text deleted_at "Soft delete flag"
    }

    SERVICE_STATUS_HISTORY {
        int id PK "autoIncrement"
        int service_order_id FK "Cascade Delete"
        text status "notNull"
        text notes
        text created_at
    }
    
    SERVICE_ITEMS {
        int id PK "autoIncrement"
        int service_order_id FK "Cascade Delete"
        text item_type "notNull (Jasa/Sparepart)"
        int spare_part_id FK
        text description "notNull"
        int quantity "Default: 1"
        real price "notNull"
        real cost_price "Default: 0"
        real total "notNull"
        text created_at
    }

    SPARE_PARTS {
        int id PK "autoIncrement"
        text part_code "Unique"
        text name "notNull"
        text category
        real buy_price "Default: 0"
        real sell_price "Default: 0"
        text created_at
        text updated_at
        text deleted_at "Soft delete flag"
    }

    PAYMENTS {
        int id PK "autoIncrement"
        int service_order_id FK "Cascade Delete"
        text payment_number "notNull, Unique"
        text payment_date
        real amount "notNull"
        text payment_method "notNull"
        text notes
        text created_at
    }

    SETTINGS {
        int id PK "autoIncrement"
        text key "notNull, Unique"
        text value
        text updated_at
    }

    %% Relationships
    CUSTOMERS ||--o{ DEVICES : "Mempunyai (1:N)"
    CUSTOMERS ||--o{ SERVICE_ORDERS : "Meminta Servis (1:N)"
    DEVICES ||--o{ SERVICE_ORDERS : "Diservis (1:N)"
    
    SERVICE_ORDERS ||--o{ SERVICE_STATUS_HISTORY : "Memiliki Riwayat (1:N)"
    SERVICE_ORDERS ||--o{ SERVICE_ITEMS : "Rincian Biaya/Sparepart (1:N)"
    SERVICE_ORDERS ||--o{ PAYMENTS : "Memiliki Pembayaran (1:N)"
    
    SPARE_PARTS |o--o{ SERVICE_ITEMS : "Digunakan (1:N)"
```

## Penjelasan Relasi (Relationships)

1. **Pelanggan & Perangkat (1:N)**: Satu `Customer` dapat mendaftarkan banyak `Device`. Penghapusan Pelanggan bersifat *Soft Delete*, sehingga perangkat tetap terhubung di database namun disembunyikan.
2. **Servis & Perangkat**: Setiap `Service_Order` wajib merujuk kepada 1 `Customer` dan 1 `Device` tertentu. Data kelengkapan (`accessories`) dan kondisi fisik (`physical_condition`) dicatat per-servis, bukan per-perangkat.
3. **Servis & Item/Sparepart**: Setiap Servis bisa memiliki banyak Rincian Biaya (`Service_Items`), baik itu berupa "Jasa" maupun "Sparepart".
4. **Riwayat Status & Pembayaran**: Sistem akan mencatat riwayat perubahan status (`Service_Status_History`) dan terminasi pembayaran (`Payments`) secara terpisah.

File skema Drizzle ORM dapat ditemukan di `database/drizzleSchema.ts`.
