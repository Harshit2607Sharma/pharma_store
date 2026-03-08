from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class MedicineCreate(BaseModel):
    medicine_name: str
    generic_name: Optional[str] = None
    category: Optional[str] = None
    batch_no: Optional[str] = None
    expiry_date: Optional[date] = None
    quantity: int = 0
    cost_price: float = 0.0
    mrp: float = 0.0
    supplier: Optional[str] = None
    status: Optional[str] = "Active"

class MedicineUpdate(BaseModel):
    medicine_name: Optional[str] = None
    generic_name: Optional[str] = None
    category: Optional[str] = None
    batch_no: Optional[str] = None
    expiry_date: Optional[date] = None
    quantity: Optional[int] = None
    cost_price: Optional[float] = None
    mrp: Optional[float] = None
    supplier: Optional[str] = None
    status: Optional[str] = None

class MedicineResponse(BaseModel):
    id: int
    medicine_name: str
    generic_name: Optional[str]
    category: Optional[str]
    batch_no: Optional[str]
    expiry_date: Optional[date]
    quantity: int
    cost_price: float
    mrp: float
    supplier: Optional[str]
    status: str

    class Config:
        from_attributes = True