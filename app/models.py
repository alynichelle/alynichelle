from . import db


class Client(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    phone = db.Column(db.String(20))
    notes = db.Column(db.Text)

    def __repr__(self):
        return f"<Client {self.name}>"


class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=False)
    style = db.Column(db.String(50), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)

    client = db.relationship('Client', backref=db.backref('appointments', lazy=True))

    def __repr__(self):
        return f"<Appointment {self.style} at {self.start_time}>"


class PaymentInfo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=False)
    card_last4 = db.Column(db.String(4), nullable=False)
    expiration = db.Column(db.String(5), nullable=False)

    client = db.relationship('Client', backref=db.backref('payment_info', lazy=True, uselist=False))

    def __repr__(self):
        return f"<PaymentInfo ****{self.card_last4}>"


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)
    sender = db.Column(db.String(20), default='client')

    client = db.relationship('Client', backref=db.backref('messages', lazy=True))

    def __repr__(self):
        return f"<Message from {self.client.name} at {self.timestamp}>"
