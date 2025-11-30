from flask import render_template, request, redirect, url_for
from . import db
from .models import Client, Appointment, PaymentInfo, Message
from datetime import datetime
from flask import current_app as app


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/schedule', methods=['GET', 'POST'])
def schedule():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        style = request.form['style']
        date = request.form['date']

        client = Client.query.filter_by(email=email).first()
        if not client:
            client = Client(name=name, email=email)
            db.session.add(client)
            db.session.commit()

        appointment = Appointment(
            client_id=client.id,
            style=style,
            start_time=datetime.fromisoformat(date)
        )
        db.session.add(appointment)
        db.session.commit()
        return redirect(url_for('index'))
    return render_template('schedule.html')


@app.route('/payment', methods=['GET', 'POST'])
def payment():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        card = request.form['card_number']
        expiration = request.form['expiration']

        client = Client.query.filter_by(email=email).first()
        if not client:
            client = Client(name=name, email=email)
            db.session.add(client)
            db.session.commit()

        payment_info = PaymentInfo.query.filter_by(client_id=client.id).first()
        if not payment_info:
            payment_info = PaymentInfo(
                client_id=client.id,
                card_last4=card[-4:],
                expiration=expiration,
            )
            db.session.add(payment_info)
        else:
            payment_info.card_last4 = card[-4:]
            payment_info.expiration = expiration
        db.session.commit()
        return redirect(url_for('portal'))
    return render_template('payment.html')


@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        content = request.form['message']

        client = Client.query.filter_by(email=email).first()
        if not client:
            client = Client(name=name, email=email)
            db.session.add(client)
            db.session.commit()

        msg = Message(
            client_id=client.id,
            content=content,
            timestamp=datetime.utcnow(),
            sender='client',
        )
        db.session.add(msg)
        db.session.commit()
        return redirect(url_for('contact'))

    messages = Message.query.order_by(Message.timestamp.desc()).all()
    return render_template('contact.html', messages=messages)


@app.route('/update_notes/<int:client_id>', methods=['POST'])
def update_notes(client_id):
    notes = request.form['notes']
    client = Client.query.get_or_404(client_id)
    client.notes = notes
    db.session.commit()
    return redirect(url_for('portal'))


@app.route('/portal')
def portal():
    clients = Client.query.all()
    return render_template('portal.html', clients=clients)
