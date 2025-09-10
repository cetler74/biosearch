# 🚀 BioSearch - Quick Start Guide

## 📋 **SETUP INSTRUCTIONS**

### **Prerequisites**
- Python 3.8+ installed
- Node.js 16+ installed
- Git installed

### **1. Clone and Setup Project**
```bash
# Clone the repository
git clone https://github.com/cetler74/biosearch.git
cd biosearch

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r backend/requirements.txt
```

### **2. Setup Database**
```bash
# Navigate to backend directory
cd backend

# Run the data import script to create database and populate with salon data
python ../scripts/import_data.py

# Verify database was created
ls -la ~/biosearch.db
```

### **3. Start Backend Server**
```bash
# From the backend directory
cd backend
python app.py
```
**Backend will start on:** http://localhost:5001

### **4. Start Frontend Application**
```bash
# Open new terminal, navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start development server
npm run dev
```
**Frontend will start on:** http://localhost:5173

### **5. Access the Application**
- **Main Website**: http://localhost:5173
- **Manager Dashboard**: http://localhost:5173/manager
- **API Health Check**: http://localhost:5001/api/health

---

## ✅ **SYSTEM STATUS: RUNNING**

Both servers are currently **live and operational**:

### Backend API Server
- **URL**: http://localhost:5001
- **Status**: ✅ Running
- **Database**: 1,181 salons loaded
- **Services**: 15 services (7 BIO Diamond)

### Frontend Application  
- **URL**: http://localhost:5173
- **Status**: ✅ Running  
- **Features**: Full UI with search, filtering, salon details

## 🌐 **HOW TO ACCESS YOUR WEBSITE**

### **1. Open Your Browser**
Navigate to: **http://localhost:5173**

You'll see the beautiful BioSearch homepage with:
- Clean, BookSolo-inspired design
- Search functionality
- BIO Diamond service highlighting
- Mobile-responsive layout

### **2. Test Key Features**

#### **Homepage Search**
- Use the main search bar to find salons
- Try searching for: "Lisboa", "Rita", "Porto"
- Filter by location or salon name

#### **Browse Salons**
- Click "Find Salons" to see all listings
- Use filters on the left sidebar
- Switch between List and Map view (Map coming soon)

#### **Salon Details**
- Click "View Details" on any salon card
- See complete information, services, and pricing
- Notice BIO Diamond services highlighted in orange

#### **BIO Diamond Section**
- Click "BIO Diamond" in the navigation
- See only salons offering premium Bio Sculpture services

## 📱 **MOBILE TESTING**

Open http://localhost:5173 on your phone or:
1. In Chrome/Safari: Right-click → Inspect → Toggle device toolbar
2. Test different screen sizes
3. Try the mobile navigation menu

## 🛠 **API TESTING**

You can directly test the API endpoints:

```bash
# Health check
curl http://localhost:5001/api/health

# Get all salons (first 5)
curl "http://localhost:5001/api/salons?per_page=5"

# Search salons in Lisboa
curl "http://localhost:5001/api/salons?cidade=Lisboa&per_page=3"

# Get all services
curl http://localhost:5001/api/services

# Get only BIO Diamond services
curl "http://localhost:5001/api/services?bio_diamond=true"

# Get specific salon details (ID 1)
curl http://localhost:5001/api/salons/1
```

## 🎯 **WHAT'S WORKING NOW**

✅ **Complete Salon Directory** - 1,181 salons from your Excel file  
✅ **Advanced Search & Filtering** - By name, location, services  
✅ **BIO Diamond Integration** - Premium service highlighting  
✅ **Mobile-Responsive Design** - Works on all devices  
✅ **Professional UI/UX** - BookSolo-inspired clean design  
✅ **Real-time API** - Fast, responsive backend  
✅ **Service Listings** - Complete with pricing and duration  

## 🛠 **TROUBLESHOOTING**

### **Common Issues**

#### **Backend Won't Start**
```bash
# Check if port 5001 is already in use
lsof -i :5001

# Kill any existing processes
pkill -f "python app.py"

# Restart backend
cd backend && python app.py
```

#### **Frontend Won't Start**
```bash
# Check if port 5173 is already in use
lsof -i :5173

# Kill any existing processes
pkill -f "vite"

# Restart frontend
cd frontend && npm run dev
```

#### **Database Issues**
```bash
# If database is corrupted, delete and recreate
rm ~/biosearch.db
cd backend && python ../scripts/import_data.py
```

#### **Permission Errors**
```bash
# Make sure you have write permissions
chmod 755 ~/biosearch.db
```

### **Network Access**
To access from other devices on your network:
- Backend: http://YOUR_IP:5001
- Frontend: http://YOUR_IP:5173

## 🎯 **CURRENT FEATURES**

✅ **Complete Salon Directory** - 1,181 salons from Excel import  
✅ **Advanced Search & Filtering** - By name, location, services  
✅ **BIO Diamond Integration** - Premium service highlighting  
✅ **Mobile-Responsive Design** - Works on all devices  
✅ **Professional UI/UX** - BookSolo-inspired clean design  
✅ **Real-time API** - Fast, responsive backend  
✅ **Service Listings** - Complete with pricing and duration  
✅ **Booking System** - Full appointment booking with time slots  
✅ **Manager Dashboard** - Salon owners can manage bookings and settings  
✅ **Authentication System** - Secure login for managers  
✅ **Configurable Opening Hours** - Per-salon business hours  
✅ **Salon Information Management** - Editable salon details  

## 🔄 **NEXT FEATURES TO IMPLEMENT**

1. **Interactive Maps** - Location pins and directions  
2. **Payment Integration** - Online booking payments
3. **Email Notifications** - Booking confirmations
4. **Advanced Analytics** - Booking reports for managers

## 📊 **CURRENT DATA**

- **Total Salons**: 1,181 active locations
- **Geographic Coverage**: Portugal (all regions)
- **Services**: 15 total (8 regular + 7 BIO Diamond)
- **Contact Info**: Phone, email, address for most salons
- **Pricing**: Realistic price ranges (€20-€95)

## 🎉 **READY FOR PRODUCTION**

The system is **production-ready** for:
- User testing and feedback
- Salon owner demonstrations  
- Client presentations
- Further development

---

## 🚀 **GET STARTED NOW**

**Open your browser and go to:** 
## **http://localhost:5173**

The BioSearch nail salon directory is ready to explore!
