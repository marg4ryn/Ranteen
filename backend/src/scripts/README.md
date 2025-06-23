# Database Seeding Scripts

This directory contains scripts for populating the database with sample data.

## Available Scripts

### 1. seedDB.ts

The original seeding script with basic sample data.

### 2. seedTimeRange.ts

**NEW** - Comprehensive seeding script for the period **June 1, 2025 - July 14, 2025**.

### 3. dropCollections.ts

**NEW** - Script to drop all collections from the database for cleanup purposes.

## seedTimeRange.ts Features

### 📅 Date Range

- **Start Date**: June 1, 2025
- **End Date**: July 14, 2025
- **Total Days**: 44 days of menus

### 🍽️ Polish Dishes (30+ dishes)

The script includes authentic Polish dishes across all categories:

#### Dania główne (Main Dishes)

- Kotlet schabowy z ziemniakami
- Pierogi ruskie
- Bigos
- Gołąbki
- Kurczak w sosie czosnkowym
- Kotlety mielone
- Ryba w sosie koperkowym
- Schab pieczony
- Placki ziemniaczane
- Kluski śląskie z sosem mięsnym

#### Zupy (Soups)

- Żurek
- Rosół z makaronem
- Zupa pomidorowa
- Krupnik
- Zupa ogórkowa
- Kapuśniak
- Zupa grzybowa

#### Wegetariańskie (Vegetarian)

- Kotlety z soczewicy
- Pierogi z kapustą i grzybami
- Leczo wegetariańskie
- Kasza gryczana z warzywami
- Naleśniki ze szpinakiem

#### Dodatki (Sides)

- Surówka z białej kapusty
- Surówka z czerwonej kapusty
- Mizeria
- Surówka z marchewki
- Ziemniaki gotowane
- Ziemniaki z masłem i koperkiem

#### Desery (Desserts)

- Sernik na zimno
- Makowiec
- Naleśniki z dżemem
- Budyń waniliowy
- Jabłecznik

#### Napoje (Drinks)

- Kompot z owoców sezonowych
- Herbata czarna
- Herbata zielona

### 👥 Users (15 users)

Polish student names with university email addresses:

- Anna Kowalska
- Piotr Nowak
- Maria Wiśniewska
- Jan Kowalczyk
- Katarzyna Zielińska
- ... and more

### 📋 Menu Generation

- **4-6 dishes per day**
- **Balanced selection**: Always includes at least one main dish and one soup
- **Random variety**: Different combinations each day
- **Realistic portions**: Appropriate number of sides and drinks

### ⭐ Ratings System

- **3-8 ratings per dish** on each day it's served
- **Weighted towards higher ratings** (realistic distribution)
- **Rating scale**: 1-5 stars
- **Distribution**:
  - 1 star: 10%
  - 2 stars: 10%
  - 3 stars: 15%
  - 4 stars: 30%
  - 5 stars: 35%

### 💬 Comments in Polish

- **30-50% of dishes** receive comments
- **1-3 comments per dish** when comments are added
- **Status distribution**:
  - 85% approved
  - 10% pending
  - 5% rejected
- **Sample comments**:
  - "Bardzo smakowite danie, polecam!"
  - "Świetny smak, idealnie doprawione."
  - "Tradycyjny smak, jak u babci."
  - "Doskonały stosunek jakości do ceny."
  - ... and more authentic Polish feedback

## How to Run

### Prerequisites

1. Make sure MongoDB is running
2. Ensure `.env` file is configured with `MONGO_URI`
3. Install dependencies: `npm install`

### Running the Script

```bash
# Navigate to backend directory
cd backend

# Run the time range seeder
npm run seed-timerange
```

### What Happens During Seeding

1. **🔗 Database Connection**: Connects to MongoDB using environment variables
2. **👥 User Creation**: Creates 15 Polish student accounts (if not already present)
3. **🍽️ Dish Creation**: Adds 30+ Polish dishes (skips existing ones)
4. **📋 Menu Generation**: Creates daily menus for 44 days (June 1 - July 14, 2025)
5. **⭐ Rating Generation**: Adds realistic ratings (3-8 per dish per day)
6. **💬 Comment Generation**: Adds Polish comments (30-50% coverage)
7. **📊 Statistics Update**: Updates average ratings and rating counts for all dishes

### Output Example

```
✅ Seedowanie zakończone pomyślnie!
📅 Zakres dat: 1 czerwca 2025 - 14 lipca 2025
🍽️  Łączna liczba dań: 33
👥 Łączna liczba użytkowników: 15
📋 Menu w zakresie dat: 44
```

## Safety Features

- **Non-destructive**: Won't overwrite existing data
- **Duplicate prevention**: Checks for existing dishes, users, and menus
- **Date validation**: Only creates menus for the specified date range
- **Error handling**: Comprehensive error catching and reporting

## Database Schema Compliance

The script respects all model constraints:

- ✅ Unique dish names
- ✅ Valid category enums
- ✅ User role validation
- ✅ Rating range validation (1-5)
- ✅ Comment length limits
- ✅ Date normalization
- ✅ Proper ObjectId references

## Customization

You can easily modify the script to:

- Change the date range
- Add more dishes
- Adjust rating distributions
- Modify comment templates
- Change user demographics
- Alter menu composition rules

## Troubleshooting

### Common Issues

1. **Connection Error**: Ensure MongoDB is running and `MONGO_URI` is correct
2. **Permission Error**: Make sure the database user has write permissions
3. **Memory Issues**: The script handles large datasets efficiently
4. **Duplicate Key Errors**: The script prevents duplicates automatically

### Debug Mode

Add `console.log` statements in the script for detailed debugging information.

## dropCollections.ts Features

### 🗑️ Database Cleanup

Complete removal of all collections from the MongoDB database.

### 🔍 Collection Discovery

- **Automatic detection**: Finds all existing collections in the database
- **Detailed listing**: Shows all collections before deletion
- **Safe validation**: Checks if database is already empty

### 🛡️ Safety Features

- **Confirmation prompts**: Requires confirmation in production mode
- **Force flags**: Use `--force` or `--yes` to skip confirmation
- **Development mode**: Automatic proceed in development environment
- **Error handling**: Comprehensive error catching and reporting
- **Connection safety**: Always disconnects properly from database

### 📊 Detailed Reporting

- **Progress tracking**: Shows real-time deletion progress
- **Success/failure summary**: Reports on each collection deletion
- **Error details**: Specific error messages for failed operations
- **Final statistics**: Complete summary of the operation

## How to Run Drop Script

### Prerequisites

1. Make sure MongoDB is running
2. Ensure `.env` file is configured with `MONGO_URI`
3. **⚠️ WARNING**: This will permanently delete ALL data!

### Running the Script

```bash
# Navigate to backend directory
cd backend

# Run with confirmation (development mode proceeds automatically)
npm run drop-collections

# Force run without confirmation
npm run drop-collections -- --force
# or
npm run drop-collections -- --yes
```

### Command Line Options

- `--force` or `-f`: Skip confirmation prompt
- `--yes` or `-y`: Skip confirmation prompt (alias for --force)

### Output Example

```
🗑️  SKRYPT USUWANIA WSZYSTKICH KOLEKCJI
=====================================

✅ Połączono z MongoDB.
📋 Znaleziono 5 kolekcji:
   - users
   - dishes
   - menus
   - ratings
   - comments

🗑️  Rozpoczynanie usuwania kolekcji...
   ✅ Usunięto kolekcję: users
   ✅ Usunięto kolekcję: dishes
   ✅ Usunięto kolekcję: menus
   ✅ Usunięto kolekcję: ratings
   ✅ Usunięto kolekcję: comments

📊 Podsumowanie:
   ✅ Pomyślnie usunięto: 5 kolekcji

🎉 Wszystkie kolekcje zostały pomyślnie usunięte!
💡 Baza danych jest teraz pusta i gotowa do ponownego seedowania.
🔌 Rozłączono z MongoDB.
```

### Use Cases

1. **Development Reset**: Clean database before testing
2. **Fresh Start**: Remove all data before new seeding
3. **Testing**: Clean state for integration tests
4. **Migration**: Clear old data before schema changes

### Complete Workflow Example

```bash
# 1. Drop all existing data
npm run drop-collections

# 2. Seed with new data for the specified time range
npm run seed-timerange
```

## Error Handling

The drop script includes comprehensive error handling for common issues:

- **Connection errors**: Database connectivity problems
- **Authentication errors**: Invalid credentials
- **Permission errors**: Insufficient database permissions
- **Network errors**: Connection timeouts or network issues
- **Invalid collections**: Collections that can't be dropped

### Troubleshooting

1. **Permission Error**: Ensure database user has drop permissions
2. **Connection Error**: Check if MongoDB is running and accessible
3. **Authentication Error**: Verify MONGO_URI credentials
4. **Partial Failure**: Some collections dropped, others failed - check specific error messages
