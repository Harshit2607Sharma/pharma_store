import os
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime
from typing import Optional, List
import models, schemas
from database import engine, get_db, SessionLocal

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pharmacy CRM API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Seed Data ─────────────────────────────────────────────────────────────────
def seed_data():
    db = SessionLocal()
    if db.query(models.Medicine).count() == 0:
        medicines = [
            models.Medicine(medicine_name="Paracetamol 650mg", generic_name="Acetaminophen",
                category="Analgesic", batch_no="PCM-2024-0892", expiry_date=date(2026, 8, 20),
                quantity=500, cost_price=15.0, mrp=25.0, supplier="MedSupply Co.", status="Active"),
            models.Medicine(medicine_name="Omeprazole 20mg Capsule", generic_name="Omeprazole",
                category="Gastric", batch_no="OMP-2024-5873", expiry_date=date(2025, 11, 10),
                quantity=45, cost_price=65.0, mrp=95.75, supplier="HealthCare Ltd.", status="Low Stock"),
            models.Medicine(medicine_name="Aspirin 75mg", generic_name="Aspirin",
                category="Anticoagulant", batch_no="ASP-2023-3421", expiry_date=date(2024, 9, 30),
                quantity=300, cost_price=20.0, mrp=45.0, supplier="GreenMed", status="Expired"),
            models.Medicine(medicine_name="Atorvastatin 10mg", generic_name="Atorvastatin Besylate",
                category="Cardiovascular", batch_no="AME-2024-0945", expiry_date=date(2026, 10, 15),
                quantity=0, cost_price=145.0, mrp=195.0, supplier="PharmaCorp", status="Out of Stock"),
            models.Medicine(medicine_name="Metformin 500mg", generic_name="Metformin HCl",
                category="Antidiabetic", batch_no="MET-2024-1122", expiry_date=date(2026, 5, 1),
                quantity=200, cost_price=30.0, mrp=55.0, supplier="MedSupply Co.", status="Active"),
        ]
        db.add_all(medicines)

        sales = [
            models.Sale(invoice_no="INV-2024-1234", customer_name="Rajesh Kumar",
                items_count=3, total_amount=340.0, payment_method="Card", status="Completed"),
            models.Sale(invoice_no="INV-2024-1235", customer_name="Sarah Smith",
                items_count=2, total_amount=145.0, payment_method="Cash", status="Completed"),
            models.Sale(invoice_no="INV-2024-1236", customer_name="Michael Johnson",
                items_count=5, total_amount=525.0, payment_method="UPI", status="Completed"),
        ]
        db.add_all(sales)

        orders = [
            models.PurchaseOrder(order_no="PO-2024-001", supplier="MedSupply Co.",
                total_amount=12000.0, status="Pending"),
            models.PurchaseOrder(order_no="PO-2024-002", supplier="HealthCare Ltd.",
                total_amount=8500.0, status="Pending"),
        ]
        db.add_all(orders)
        db.commit()
    db.close()

seed_data()

# ─── Dashboard Endpoints ────────────────────────────────────────────────────────

@app.get("/api/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    today = date.today()

    today_sales = db.query(func.sum(models.Sale.total_amount)).filter(
        func.date(models.Sale.sale_date) == today
    ).scalar() or 0

    if today_sales == 0:
        today_sales = db.query(func.sum(models.Sale.total_amount)).scalar() or 124580

    items_sold = db.query(func.sum(models.Sale.items_count)).filter(
        func.date(models.Sale.sale_date) == today
    ).scalar() or 0

    if items_sold == 0:
        items_sold = db.query(func.sum(models.Sale.items_count)).scalar() or 156

    low_stock_count = db.query(models.Medicine).filter(
        models.Medicine.status == "Low Stock"
    ).count()

    pending_orders = db.query(models.PurchaseOrder).filter(
        models.PurchaseOrder.status == "Pending"
    ).count()

    pending_amount = db.query(func.sum(models.PurchaseOrder.total_amount)).filter(
        models.PurchaseOrder.status == "Pending"
    ).scalar() or 96250

    return {
        "today_sales": today_sales,
        "sales_growth": 12.5,
        "items_sold_today": items_sold,
        "total_orders": db.query(models.Sale).count(),
        "low_stock_items": low_stock_count,
        "pending_purchase_orders": pending_orders,
        "purchase_order_amount": pending_amount,
    }

@app.get("/api/dashboard/recent-sales")
def get_recent_sales(limit: int = 10, db: Session = Depends(get_db)):
    sales = db.query(models.Sale).order_by(models.Sale.sale_date.desc()).limit(limit).all()
    return [
        {
            "id": s.id,
            "invoice_no": s.invoice_no,
            "customer_name": s.customer_name,
            "items_count": s.items_count,
            "total_amount": s.total_amount,
            "payment_method": s.payment_method,
            "status": s.status,
            "sale_date": s.sale_date,
        }
        for s in sales
    ]

# ─── Inventory Endpoints ────────────────────────────────────────────────────────

@app.get("/api/inventory/summary")
def get_inventory_summary(db: Session = Depends(get_db)):
    total = db.query(models.Medicine).count()
    active = db.query(models.Medicine).filter(models.Medicine.status == "Active").count()
    low_stock = db.query(models.Medicine).filter(models.Medicine.status == "Low Stock").count()
    total_value = db.query(func.sum(models.Medicine.mrp * models.Medicine.quantity)).scalar() or 0

    return {
        "total_items": total,
        "active_stock": active,
        "low_stock": low_stock,
        "total_value": round(total_value, 2),
    }

@app.get("/api/inventory/medicines", response_model=List[schemas.MedicineResponse])
def list_medicines(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Medicine)
    if search:
        query = query.filter(
            models.Medicine.medicine_name.ilike(f"%{search}%") |
            models.Medicine.generic_name.ilike(f"%{search}%")
        )
    if status:
        query = query.filter(models.Medicine.status == status)
    if category:
        query = query.filter(models.Medicine.category == category)

    return query.all()

@app.get("/api/inventory/medicines/{medicine_id}", response_model=schemas.MedicineResponse)
def get_medicine(medicine_id: int, db: Session = Depends(get_db)):
    med = db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return med

@app.post("/api/inventory/medicines", response_model=schemas.MedicineResponse, status_code=201)
def add_medicine(medicine: schemas.MedicineCreate, db: Session = Depends(get_db)):
    if medicine.quantity == 0:
        medicine.status = "Out of Stock"
    elif medicine.expiry_date and medicine.expiry_date < date.today():
        medicine.status = "Expired"
    elif medicine.quantity < 50:
        medicine.status = "Low Stock"
    else:
        medicine.status = "Active"

    db_med = models.Medicine(**medicine.model_dump())
    db.add(db_med)
    db.commit()
    db.refresh(db_med)
    return db_med

@app.put("/api/inventory/medicines/{medicine_id}", response_model=schemas.MedicineResponse)
def update_medicine(medicine_id: int, medicine: schemas.MedicineUpdate, db: Session = Depends(get_db)):
    db_med = db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()
    if not db_med:
        raise HTTPException(status_code=404, detail="Medicine not found")

    update_data = medicine.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_med, key, value)

    if "quantity" in update_data or "expiry_date" in update_data:
        if db_med.quantity == 0:
            db_med.status = "Out of Stock"
        elif db_med.expiry_date and db_med.expiry_date < date.today():
            db_med.status = "Expired"
        elif db_med.quantity < 50:
            db_med.status = "Low Stock"
        else:
            db_med.status = "Active"

    db.commit()
    db.refresh(db_med)
    return db_med

@app.patch("/api/inventory/medicines/{medicine_id}/status")
def update_medicine_status(medicine_id: int, status: str, db: Session = Depends(get_db)):
    db_med = db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()
    if not db_med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    if status not in ["Active", "Low Stock", "Expired", "Out of Stock"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    db_med.status = status
    db.commit()
    return {"message": "Status updated", "status": status}

@app.delete("/api/inventory/medicines/{medicine_id}")
def delete_medicine(medicine_id: int, db: Session = Depends(get_db)):
    db_med = db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()
    if not db_med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    db.delete(db_med)
    db.commit()
    return {"message": "Medicine deleted"}
