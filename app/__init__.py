from flask import Flask
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'replace-with-secure-key'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///alyssa.db'
    db.init_app(app)

    with app.app_context():
        from . import routes  # noqa: F401
        db.create_all()

    return app
