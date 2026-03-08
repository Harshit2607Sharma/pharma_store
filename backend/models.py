from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Enum
from sqlalchemy.sql import func
from database import Base
import enum

class MedicineStatus(str, enum.Enum):
    active = "Active"
    low_stock = "Low Stock"
    expired = "Expired"
    out_of_stock = "Out of Stock"

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    medicine_name = Column(String, nullable=False)
    generic_name = Column(String)
    category = Column(String)
    batch_no = Column(String)
    expiry_date = Column(Date)
    quantity = Column(Integer, default=0)
    cost_price = Column(Float, default=0.0)
    mrp = Column(Float, default=0.0)
    supplier = Column(String)
    status = Column(String, default="Active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    invoice_no = Column(String, unique=True, nullable=False)
    customer_name = Column(String)
    items_count = Column(Integer, default=0)
    total_amount = Column(Float, default=0.0)
    payment_method = Column(String, default="Cash")
    status = Column(String, default="Completed")
    sale_date = Column(DateTime(timezone=True), server_default=func.now())

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_no = Column(String, unique=True, nullable=False)
    supplier = Column(String)
    total_amount = Column(Float, default=0.0)
    status = Column(String, default="Pending")
    order_date = Column(DateTime(timezone=True), server_default=func.now())