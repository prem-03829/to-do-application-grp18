from datetime import datetime
from app.database import db


class Category(db.Model):
    __tablename__ = "categories"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    __table_args__ = (db.UniqueConstraint("user_id", "name"),)


class Task(db.Model):
    __tablename__ = "tasks"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default="")
    status = db.Column(db.String(20), nullable=False, default="pending")
    priority = db.Column(db.String(10), nullable=False, default="medium")
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id", ondelete="SET NULL"))
    category_obj = db.relationship("Category")
    due_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "userId": str(self.user_id),
            "title": self.title,
            "description": self.description or "",
            "status": self.status,
            "priority": self.priority,
            "category": self.category_obj.name if self.category_obj else None,
            "dueDate": self.due_date.isoformat() if self.due_date else "",
            "createdAt": self.created_at.isoformat(),
        }
