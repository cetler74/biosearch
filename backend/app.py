from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta, time
import os
import sqlite3
import pandas as pd
import hashlib
import secrets
from functools import wraps

app = Flask(__name__)
CORS(app)

# Database configuration
# Use home directory to avoid permission issues with external drives
import os
home_dir = os.path.expanduser("~")
db_path = os.path.join(home_dir, "biosearch.db")
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Change this in production

db = SQLAlchemy(app)

# Authentication helpers
def hash_password(password):
    """Hash a password using SHA-256 with salt"""
    salt = secrets.token_hex(16)
    password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{password_hash}"

def verify_password(password, stored_hash):
    """Verify a password against its hash"""
    try:
        salt, password_hash = stored_hash.split(':')
        return hashlib.sha256((password + salt).encode()).hexdigest() == password_hash
    except:
        return False

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication required'}), 401
        
        token = auth_header.split(' ')[1]
        user = User.query.filter_by(auth_token=token).first()
        if not user:
            return jsonify({'error': 'Invalid token'}), 401
        
        request.current_user = user
        return f(*args, **kwargs)
    return decorated_function

def create_default_time_slots(salon_id):
    """Create default time slots for a salon"""
    time_slots = []
    
    # Monday to Friday (9 AM to 6 PM)
    for day in range(5):  # Monday to Friday (0-4)
        time_slots.append(TimeSlot(
            salon_id=salon_id,
            day_of_week=day,
            start_time=time(9, 0),
            end_time=time(18, 0),
            is_available=True
        ))
    
    # Saturday (10 AM to 4 PM)
    time_slots.append(TimeSlot(
        salon_id=salon_id,
        day_of_week=5,  # Saturday
        start_time=time(10, 0),
        end_time=time(16, 0),
        is_available=True
    ))
    
    # Sunday (closed - no time slots)
    
    for time_slot in time_slots:
        db.session.add(time_slot)
    
    return time_slots

# Database Models
class Salon(db.Model):
    __tablename__ = 'salons'
    
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(50), unique=True)
    nome = db.Column(db.String(200), nullable=False)
    pais = db.Column(db.String(100))
    nif = db.Column(db.String(50))
    estado = db.Column(db.String(20))
    telefone = db.Column(db.String(20))
    email = db.Column(db.String(100))
    website = db.Column(db.String(200))
    pais_morada = db.Column(db.String(100))
    regiao = db.Column(db.String(100))
    cidade = db.Column(db.String(100))
    rua = db.Column(db.String(200))
    porta = db.Column(db.String(20))
    cod_postal = db.Column(db.String(20))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Relationships
    owner = db.relationship('User', back_populates='salons')
    
    # Relationships
    services = db.relationship('SalonService', back_populates='salon', lazy='dynamic')
    bookings = db.relationship('Booking', back_populates='salon', lazy='dynamic')
    time_slots = db.relationship('TimeSlot', back_populates='salon', lazy='dynamic')
    reviews = db.relationship('Review', back_populates='salon', lazy='dynamic')
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    owner = db.relationship('User', back_populates='salons')

class Service(db.Model):
    __tablename__ = 'services'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50))
    description = db.Column(db.Text)
    is_bio_diamond = db.Column(db.Boolean, default=False)
    
    # Relationships
    salon_services = db.relationship('SalonService', back_populates='service', lazy='dynamic')

class SalonService(db.Model):
    __tablename__ = 'salon_services'
    
    id = db.Column(db.Integer, primary_key=True)
    salon_id = db.Column(db.Integer, db.ForeignKey('salons.id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    price = db.Column(db.Float)
    duration = db.Column(db.Integer)  # minutes
    
    # Relationships
    salon = db.relationship('Salon', back_populates='services')
    service = db.relationship('Service', back_populates='salon_services')

class TimeSlot(db.Model):
    __tablename__ = 'time_slots'
    
    id = db.Column(db.Integer, primary_key=True)
    salon_id = db.Column(db.Integer, db.ForeignKey('salons.id'), nullable=False)
    day_of_week = db.Column(db.Integer)  # 0=Monday, 6=Sunday
    start_time = db.Column(db.Time)
    end_time = db.Column(db.Time)
    is_available = db.Column(db.Boolean, default=True)
    
    # Relationships
    salon = db.relationship('Salon', back_populates='time_slots')

class Booking(db.Model):
    __tablename__ = 'bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    salon_id = db.Column(db.Integer, db.ForeignKey('salons.id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    customer_name = db.Column(db.String(100), nullable=False)
    customer_email = db.Column(db.String(100), nullable=False)
    customer_phone = db.Column(db.String(20))
    booking_date = db.Column(db.Date, nullable=False)
    booking_time = db.Column(db.Time, nullable=False)
    duration = db.Column(db.Integer)
    status = db.Column(db.String(20), default='confirmed')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    salon = db.relationship('Salon', back_populates='bookings')
    service = db.relationship('Service')

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    auth_token = db.Column(db.String(200), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    salons = db.relationship('Salon', back_populates='owner', lazy='dynamic')

class SalonManager(db.Model):
    __tablename__ = 'salon_managers'
    
    id = db.Column(db.Integer, primary_key=True)
    salon_id = db.Column(db.Integer, db.ForeignKey('salons.id'), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    salon_id = db.Column(db.Integer, db.ForeignKey('salons.id'), nullable=False)
    customer_name = db.Column(db.String(100), nullable=False)
    customer_email = db.Column(db.String(100), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    title = db.Column(db.String(200))
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_verified = db.Column(db.Boolean, default=False)
    
    # Relationships
    salon = db.relationship('Salon', back_populates='reviews')

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    required_fields = ['email', 'password', 'name']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'User already exists'}), 400
    
    # Create new user
    user = User(
        email=data['email'],
        password_hash=hash_password(data['password']),
        name=data['name'],
        auth_token=secrets.token_hex(32)
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'id': user.id,
        'email': user.email,
        'name': user.name,
        'token': user.auth_token
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    if not user or not verify_password(data['password'], user.password_hash):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    return jsonify({
        'id': user.id,
        'email': user.email,
        'name': user.name,
        'token': user.auth_token
    })

@app.route('/api/auth/me', methods=['GET'])
@require_auth
def get_current_user():
    return jsonify({
        'id': request.current_user.id,
        'email': request.current_user.email,
        'name': request.current_user.name
    })

# API Routes
@app.route('/api/salons', methods=['GET'])
def get_salons():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    cidade = request.args.get('cidade')
    regiao = request.args.get('regiao')
    search = request.args.get('search')
    
    query = Salon.query.filter(Salon.estado == 'Ativo')
    
    if cidade:
        query = query.filter(Salon.cidade.ilike(f'%{cidade}%'))
    if regiao:
        query = query.filter(Salon.regiao.ilike(f'%{regiao}%'))
    if search:
        query = query.filter(Salon.nome.ilike(f'%{search}%'))
    
    salons = query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'salons': [{
            'id': salon.id,
            'nome': salon.nome,
            'cidade': salon.cidade,
            'regiao': salon.regiao,
            'telefone': salon.telefone,
            'email': salon.email,
            'website': salon.website,
            'rua': salon.rua,
            'porta': salon.porta,
            'cod_postal': salon.cod_postal,
            'latitude': salon.latitude,
            'longitude': salon.longitude
        } for salon in salons.items],
        'total': salons.total,
        'pages': salons.pages,
        'current_page': page
    })

@app.route('/api/salons/<int:salon_id>', methods=['GET'])
def get_salon(salon_id):
    salon = Salon.query.get_or_404(salon_id)
    
    # Get salon services
    salon_services = db.session.query(SalonService, Service).join(Service).filter(
        SalonService.salon_id == salon_id
    ).all()
    
    services = [{
        'id': service.id,
        'name': service.name,
        'category': service.category,
        'description': service.description,
        'is_bio_diamond': service.is_bio_diamond,
        'price': salon_service.price,
        'duration': salon_service.duration
    } for salon_service, service in salon_services]
    
    # Get review summary
    reviews = Review.query.filter_by(salon_id=salon_id).all()
    avg_rating = sum(review.rating for review in reviews) / len(reviews) if reviews else 0
    total_reviews = len(reviews)
    
    return jsonify({
        'id': salon.id,
        'nome': salon.nome,
        'cidade': salon.cidade,
        'regiao': salon.regiao,
        'telefone': salon.telefone,
        'email': salon.email,
        'website': salon.website,
        'rua': salon.rua,
        'porta': salon.porta,
        'cod_postal': salon.cod_postal,
        'latitude': salon.latitude,
        'longitude': salon.longitude,
        'services': services,
        'reviews': {
            'average_rating': round(avg_rating, 1),
            'total_reviews': total_reviews
        }
    })

@app.route('/api/services', methods=['GET'])
def get_services():
    bio_diamond_only = request.args.get('bio_diamond', 'false').lower() == 'true'
    
    query = Service.query
    if bio_diamond_only:
        query = query.filter(Service.is_bio_diamond == True)
    
    services = query.all()
    
    return jsonify([{
        'id': service.id,
        'name': service.name,
        'category': service.category,
        'description': service.description,
        'is_bio_diamond': service.is_bio_diamond
    } for service in services])

@app.route('/api/salons/<int:salon_id>/availability', methods=['GET'])
def get_availability(salon_id):
    date_str = request.args.get('date')
    if not date_str:
        return jsonify({'error': 'Date parameter required'}), 400
    
    try:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
        day_of_week = date.weekday()  # 0=Monday, 6=Sunday
        
        # Get time slots for this day
        time_slots = TimeSlot.query.filter(
            TimeSlot.salon_id == salon_id,
            TimeSlot.day_of_week == day_of_week,
            TimeSlot.is_available == True
        ).all()
        
        # Get existing bookings for this date
        existing_bookings = Booking.query.filter(
            Booking.salon_id == salon_id,
            Booking.booking_date == date,
            Booking.status == 'confirmed'
        ).all()
        
        # Generate all time slots with availability status
        all_slots = []
        for slot in time_slots:
            current_time = datetime.combine(date, slot.start_time)
            end_time = datetime.combine(date, slot.end_time)
            
            while current_time + timedelta(minutes=30) <= end_time:
                slot_time = current_time.time()
                slot_time_str = slot_time.strftime('%H:%M')
                
                # Check if this slot is already booked
                is_booked = any(
                    booking.booking_time == slot_time 
                    for booking in existing_bookings
                )
                
                all_slots.append({
                    'time': slot_time_str,
                    'available': not is_booked
                })
                
                current_time += timedelta(minutes=30)
        
        return jsonify({
            'time_slots': all_slots,
            'available_slots': [slot['time'] for slot in all_slots if slot['available']]  # Keep for backward compatibility
        })
        
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

@app.route('/api/bookings', methods=['POST'])
def create_booking():
    data = request.get_json()
    
    required_fields = ['salon_id', 'service_id', 'customer_name', 'customer_email', 
                      'booking_date', 'booking_time']
    
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    try:
        booking_date = datetime.strptime(data['booking_date'], '%Y-%m-%d').date()
        booking_time = datetime.strptime(data['booking_time'], '%H:%M').time()
        
        # Check if slot is available
        existing_booking = Booking.query.filter(
            Booking.salon_id == data['salon_id'],
            Booking.booking_date == booking_date,
            Booking.booking_time == booking_time,
            Booking.status == 'confirmed'
        ).first()
        
        if existing_booking:
            return jsonify({'error': 'Time slot already booked'}), 400
        
        # Get service duration
        service = Service.query.get(data['service_id'])
        salon_service = SalonService.query.filter(
            SalonService.salon_id == data['salon_id'],
            SalonService.service_id == data['service_id']
        ).first()
        
        duration = salon_service.duration if salon_service else 60
        
        booking = Booking(
            salon_id=data['salon_id'],
            service_id=data['service_id'],
            customer_name=data['customer_name'],
            customer_email=data['customer_email'],
            customer_phone=data.get('customer_phone'),
            booking_date=booking_date,
            booking_time=booking_time,
            duration=duration
        )
        
        db.session.add(booking)
        db.session.commit()
        
        return jsonify({
            'id': booking.id,
            'message': 'Booking created successfully'
        }), 201
        
    except ValueError as e:
        return jsonify({'error': 'Invalid date or time format'}), 400

@app.route('/api/bookings/<int:booking_id>', methods=['GET'])
def get_booking(booking_id):
    booking = Booking.query.get_or_404(booking_id)
    
    return jsonify({
        'id': booking.id,
        'salon_id': booking.salon_id,
        'service_id': booking.service_id,
        'customer_name': booking.customer_name,
        'customer_email': booking.customer_email,
        'customer_phone': booking.customer_phone,
        'booking_date': booking.booking_date.isoformat(),
        'booking_time': booking.booking_time.strftime('%H:%M'),
        'duration': booking.duration,
        'status': booking.status,
        'created_at': booking.created_at.isoformat()
    })

# Review endpoints
@app.route('/api/salons/<int:salon_id>/reviews', methods=['GET'])
def get_salon_reviews(salon_id):
    """Get all reviews for a salon"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    reviews = Review.query.filter_by(salon_id=salon_id)\
        .order_by(Review.created_at.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)
    
    # Calculate average rating
    all_reviews = Review.query.filter_by(salon_id=salon_id).all()
    avg_rating = sum(review.rating for review in all_reviews) / len(all_reviews) if all_reviews else 0
    total_reviews = len(all_reviews)
    
    return jsonify({
        'reviews': [{
            'id': review.id,
            'customer_name': review.customer_name,
            'rating': review.rating,
            'title': review.title,
            'comment': review.comment,
            'created_at': review.created_at.isoformat(),
            'is_verified': review.is_verified
        } for review in reviews.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': reviews.total,
            'pages': reviews.pages
        },
        'summary': {
            'average_rating': round(avg_rating, 1),
            'total_reviews': total_reviews
        }
    })

@app.route('/api/salons/<int:salon_id>/reviews', methods=['POST'])
def create_review(salon_id):
    """Create a new review for a salon"""
    data = request.get_json()
    
    required_fields = ['customer_name', 'customer_email', 'rating']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Validate rating
    if not isinstance(data['rating'], int) or data['rating'] < 1 or data['rating'] > 5:
        return jsonify({'error': 'Rating must be an integer between 1 and 5'}), 400
    
    # Check if salon exists
    salon = Salon.query.get_or_404(salon_id)
    
    # Create review
    review = Review(
        salon_id=salon_id,
        customer_name=data['customer_name'],
        customer_email=data['customer_email'],
        rating=data['rating'],
        title=data.get('title', ''),
        comment=data.get('comment', '')
    )
    
    db.session.add(review)
    db.session.commit()
    
    return jsonify({
        'id': review.id,
        'customer_name': review.customer_name,
        'rating': review.rating,
        'title': review.title,
        'comment': review.comment,
        'created_at': review.created_at.isoformat(),
        'is_verified': review.is_verified
    }), 201

# Manager-specific routes
@app.route('/api/manager/salons', methods=['GET'])
@require_auth
def get_manager_salons():
    """Get all salons owned by the current user"""
    salons = Salon.query.filter_by(owner_id=request.current_user.id).all()
    
    return jsonify([{
        'id': salon.id,
        'nome': salon.nome,
        'cidade': salon.cidade,
        'regiao': salon.regiao,
        'telefone': salon.telefone,
        'email': salon.email,
        'website': salon.website,
        'rua': salon.rua,
        'porta': salon.porta,
        'cod_postal': salon.cod_postal,
        'estado': salon.estado,
        'created_at': salon.created_at.isoformat()
    } for salon in salons])

@app.route('/api/manager/salons', methods=['POST'])
@require_auth
def create_salon():
    """Create a new salon for the current user"""
    data = request.get_json()
    
    required_fields = ['nome', 'cidade', 'regiao', 'telefone', 'email']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    salon = Salon(
        nome=data['nome'],
        cidade=data['cidade'],
        regiao=data['regiao'],
        telefone=data['telefone'],
        email=data['email'],
        website=data.get('website'),
        rua=data.get('rua'),
        porta=data.get('porta'),
        cod_postal=data.get('cod_postal'),
        pais=data.get('pais', 'Portugal'),
        estado='Ativo',
        owner_id=request.current_user.id
    )
    
    db.session.add(salon)
    db.session.commit()
    
    # Create default time slots for the new salon
    create_default_time_slots(salon.id)
    db.session.commit()
    
    return jsonify({
        'id': salon.id,
        'nome': salon.nome,
        'message': 'Salon created successfully'
    }), 201

@app.route('/api/manager/salons/<int:salon_id>/bookings', methods=['GET'])
@require_auth
def get_salon_bookings(salon_id):
    """Get all bookings for a specific salon owned by the current user"""
    salon = Salon.query.filter_by(id=salon_id, owner_id=request.current_user.id).first()
    if not salon:
        return jsonify({'error': 'Salon not found or access denied'}), 404
    
    bookings = Booking.query.filter_by(salon_id=salon_id).order_by(Booking.booking_date.desc()).all()
    
    return jsonify([{
        'id': booking.id,
        'customer_name': booking.customer_name,
        'customer_email': booking.customer_email,
        'customer_phone': booking.customer_phone,
        'service_id': booking.service_id,
        'booking_date': booking.booking_date.isoformat(),
        'booking_time': booking.booking_time.strftime('%H:%M'),
        'duration': booking.duration,
        'status': booking.status,
        'created_at': booking.created_at.isoformat()
    } for booking in bookings])

@app.route('/api/manager/salons/<int:salon_id>/services', methods=['GET'])
@require_auth
def get_salon_services(salon_id):
    """Get all services for a specific salon owned by the current user"""
    salon = Salon.query.filter_by(id=salon_id, owner_id=request.current_user.id).first()
    if not salon:
        return jsonify({'error': 'Salon not found or access denied'}), 404
    
    salon_services = db.session.query(SalonService, Service).join(Service).filter(
        SalonService.salon_id == salon_id
    ).all()
    
    return jsonify([{
        'id': salon_service.id,
        'service_id': service.id,
        'name': service.name,
        'category': service.category,
        'description': service.description,
        'is_bio_diamond': service.is_bio_diamond,
        'price': salon_service.price,
        'duration': salon_service.duration
    } for salon_service, service in salon_services])

@app.route('/api/manager/salons/<int:salon_id>/opening-hours', methods=['GET'])
@require_auth
def get_salon_opening_hours(salon_id):
    """Get opening hours for a salon"""
    salon = Salon.query.filter_by(id=salon_id, owner_id=request.current_user.id).first()
    if not salon:
        return jsonify({'error': 'Salon not found'}), 404
    
    # Get all time slots for this salon
    time_slots = TimeSlot.query.filter_by(salon_id=salon_id).all()
    
    # Organize by day of week
    opening_hours = {}
    for day in range(7):  # 0=Monday, 6=Sunday
        day_slots = [slot for slot in time_slots if slot.day_of_week == day]
        if day_slots:
            # Get the earliest start and latest end for this day
            start_times = [slot.start_time for slot in day_slots if slot.start_time]
            end_times = [slot.end_time for slot in day_slots if slot.end_time]
            if start_times and end_times:
                opening_hours[day] = {
                    'start_time': min(start_times).strftime('%H:%M'),
                    'end_time': max(end_times).strftime('%H:%M'),
                    'is_open': True
                }
        else:
            opening_hours[day] = {
                'start_time': None,
                'end_time': None,
                'is_open': False
            }
    
    return jsonify({'opening_hours': opening_hours})

@app.route('/api/manager/salons/<int:salon_id>/opening-hours', methods=['PUT'])
@require_auth
def update_salon_opening_hours(salon_id):
    """Update opening hours for a salon"""
    salon = Salon.query.filter_by(id=salon_id, owner_id=request.current_user.id).first()
    if not salon:
        return jsonify({'error': 'Salon not found'}), 404
    
    data = request.get_json()
    opening_hours = data.get('opening_hours', {})
    
    # Delete existing time slots for this salon
    TimeSlot.query.filter_by(salon_id=salon_id).delete()
    
    # Create new time slots based on opening hours
    for day, hours in opening_hours.items():
        day = int(day)
        if hours.get('is_open') and hours.get('start_time') and hours.get('end_time'):
            try:
                start_time = datetime.strptime(hours['start_time'], '%H:%M').time()
                end_time = datetime.strptime(hours['end_time'], '%H:%M').time()
                
                time_slot = TimeSlot(
                    salon_id=salon_id,
                    day_of_week=day,
                    start_time=start_time,
                    end_time=end_time,
                    is_available=True
                )
                db.session.add(time_slot)
            except ValueError:
                return jsonify({'error': f'Invalid time format for day {day}'}), 400
    
    db.session.commit()
    return jsonify({'message': 'Opening hours updated successfully'})

@app.route('/api/manager/salons/<int:salon_id>', methods=['PUT'])
@require_auth
def update_salon(salon_id):
    """Update salon basic information"""
    salon = Salon.query.filter_by(id=salon_id, owner_id=request.current_user.id).first()
    if not salon:
        return jsonify({'error': 'Salon not found'}), 404
    
    data = request.get_json()
    
    # Update salon fields
    updatable_fields = ['nome', 'telefone', 'email', 'website', 'regiao', 'cidade', 'rua', 'porta', 'cod_postal']
    for field in updatable_fields:
        if field in data:
            setattr(salon, field, data[field])
    
    db.session.commit()
    return jsonify({'message': 'Salon updated successfully'})

@app.route('/api/manager/salons/<int:salon_id>/services', methods=['POST'])
@require_auth
def add_salon_service(salon_id):
    """Add a service to a salon owned by the current user"""
    salon = Salon.query.filter_by(id=salon_id, owner_id=request.current_user.id).first()
    if not salon:
        return jsonify({'error': 'Salon not found or access denied'}), 404
    
    data = request.get_json()
    
    required_fields = ['service_id', 'price', 'duration']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Check if service already exists for this salon
    existing = SalonService.query.filter_by(
        salon_id=salon_id, 
        service_id=data['service_id']
    ).first()
    
    if existing:
        return jsonify({'error': 'Service already exists for this salon'}), 400
    
    salon_service = SalonService(
        salon_id=salon_id,
        service_id=data['service_id'],
        price=data['price'],
        duration=data['duration']
    )
    
    db.session.add(salon_service)
    db.session.commit()
    
    return jsonify({
        'id': salon_service.id,
        'message': 'Service added successfully'
    }), 201

@app.route('/api/manager/salons/<int:salon_id>/services/<int:service_id>', methods=['PUT'])
@require_auth
def update_salon_service(salon_id, service_id):
    """Update a service for a salon owned by the current user"""
    salon = Salon.query.filter_by(id=salon_id, owner_id=request.current_user.id).first()
    if not salon:
        return jsonify({'error': 'Salon not found or access denied'}), 404
    
    salon_service = SalonService.query.filter_by(
        salon_id=salon_id, 
        id=service_id
    ).first()
    
    if not salon_service:
        return jsonify({'error': 'Service not found'}), 404
    
    data = request.get_json()
    
    if 'price' in data:
        salon_service.price = data['price']
    if 'duration' in data:
        salon_service.duration = data['duration']
    
    db.session.commit()
    
    return jsonify({'message': 'Service updated successfully'})

@app.route('/api/manager/salons/<int:salon_id>/services/<int:service_id>', methods=['DELETE'])
@require_auth
def delete_salon_service(salon_id, service_id):
    """Delete a service from a salon owned by the current user"""
    salon = Salon.query.filter_by(id=salon_id, owner_id=request.current_user.id).first()
    if not salon:
        return jsonify({'error': 'Salon not found or access denied'}), 404
    
    salon_service = SalonService.query.filter_by(
        salon_id=salon_id, 
        id=service_id
    ).first()
    
    if not salon_service:
        return jsonify({'error': 'Service not found'}), 404
    
    db.session.delete(salon_service)
    db.session.commit()
    
    return jsonify({'message': 'Service deleted successfully'})

@app.route('/api/manager/bookings/<int:booking_id>/status', methods=['PUT'])
@require_auth
def update_booking_status(booking_id):
    """Update the status of a booking"""
    booking = Booking.query.get_or_404(booking_id)
    
    # Check if the user owns the salon
    salon = Salon.query.filter_by(id=booking.salon_id, owner_id=request.current_user.id).first()
    if not salon:
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    if 'status' not in data:
        return jsonify({'error': 'Status is required'}), 400
    
    valid_statuses = ['confirmed', 'cancelled', 'completed']
    if data['status'] not in valid_statuses:
        return jsonify({'error': 'Invalid status'}), 400
    
    booking.status = data['status']
    db.session.commit()
    
    return jsonify({'message': 'Booking status updated successfully'})

@app.route('/api/manager/bookings/<int:booking_id>', methods=['DELETE'])
@require_auth
def delete_booking(booking_id):
    """Delete a booking"""
    booking = Booking.query.get_or_404(booking_id)
    
    # Check if the user owns the salon
    salon = Salon.query.filter_by(id=booking.salon_id, owner_id=request.current_user.id).first()
    if not salon:
        return jsonify({'error': 'Access denied'}), 403
    
    db.session.delete(booking)
    db.session.commit()
    
    return jsonify({'message': 'Booking deleted successfully'})

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("Database tables created successfully")
        print("Starting Flask server on http://localhost:5001")
    app.run(debug=True, host='0.0.0.0', port=5001)
