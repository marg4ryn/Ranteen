import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database';

// Load environment variables
dotenv.config();

// Function to drop all collections
const dropAllCollections = async () => {
  try {
    // Connect to database
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not defined');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Połączono z MongoDB.');

    // Get database instance
    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error('Nie udało się uzyskać dostępu do bazy danych');
    }
    
    // Get all collection names
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(collection => collection.name);
    
    if (collectionNames.length === 0) {
      console.log('ℹ️  Baza danych jest już pusta - brak kolekcji do usunięcia.');
      return;
    }

    console.log(`📋 Znaleziono ${collectionNames.length} kolekcji:`);
    collectionNames.forEach(name => {
      console.log(`   - ${name}`);
    });

    console.log('\n🗑️  Rozpoczynanie usuwania kolekcji...');

    // Drop each collection
    const dropPromises = collectionNames.map(async (collectionName) => {
      try {
        await db.collection(collectionName).drop();
        console.log(`   ✅ Usunięto kolekcję: ${collectionName}`);
        return { name: collectionName, status: 'success' };
      } catch (error: any) {
        console.log(`   ❌ Błąd przy usuwaniu kolekcji ${collectionName}: ${error.message}`);
        return { name: collectionName, status: 'error', error: error.message };
      }
    });

    // Wait for all drops to complete
    const results = await Promise.all(dropPromises);

    // Summary
    const successful = results.filter(r => r.status === 'success');
    const failed = results.filter(r => r.status === 'error');

    console.log('\n📊 Podsumowanie:');
    console.log(`   ✅ Pomyślnie usunięto: ${successful.length} kolekcji`);
    
    if (failed.length > 0) {
      console.log(`   ❌ Nie udało się usunąć: ${failed.length} kolekcji`);
      failed.forEach(f => {
        console.log(`      - ${f.name}: ${f.error}`);
      });
    }

    if (successful.length === collectionNames.length) {
      console.log('\n🎉 Wszystkie kolekcje zostały pomyślnie usunięte!');
      console.log('💡 Baza danych jest teraz pusta i gotowa do ponownego seedowania.');
    }

  } catch (error: any) {
    console.error('❌ Błąd podczas usuwania kolekcji:', error.message);
    
    if (error.message.includes('MONGO_URI')) {
      console.error('💡 Upewnij się, że zmienna MONGO_URI jest ustawiona w pliku .env');
    } else if (error.message.includes('authentication')) {
      console.error('💡 Sprawdź dane uwierzytelniające w MONGO_URI');
    } else if (error.message.includes('network')) {
      console.error('💡 Sprawdź połączenie sieciowe i dostępność MongoDB');
    }
    
    process.exit(1);
  } finally {
    // Always disconnect from database
    await mongoose.disconnect();
    console.log('🔌 Rozłączono z MongoDB.');
  }
};

// Function to show confirmation prompt (in production)
const confirmDrop = (): boolean => {
  const args = process.argv.slice(2);
  const forceFlag = args.includes('--force') || args.includes('-f');
  const yesFlag = args.includes('--yes') || args.includes('-y');
  
  if (forceFlag || yesFlag) {
    return true;
  }

  // In development, we'll proceed without confirmation for convenience
  // In production, you might want to add a proper confirmation prompt
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  if (nodeEnv === 'development') {
    console.log('⚠️  UWAGA: Ta operacja usunie WSZYSTKIE dane z bazy!');
    console.log('🔧 Tryb development - kontynuowanie bez potwierdzenia...');
    console.log('💡 Użyj --force lub --yes aby pominąć to ostrzeżenie w przyszłości.\n');
    return true;
  }

  console.log('❌ Operacja anulowana.');
  console.log('💡 Aby wymusić usunięcie, użyj flagi --force lub --yes');
  return false;
};

// Main execution
const main = async () => {
  console.log('🗑️  SKRYPT USUWANIA WSZYSTKICH KOLEKCJI');
  console.log('=====================================\n');

  // Check for confirmation
  if (!confirmDrop()) {
    process.exit(0);
  }

  await dropAllCollections();
};

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Nieoczekiwany błąd:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (error: any) => {
  console.error('❌ Nieobsłużone odrzucenie:', error.message);
  process.exit(1);
});

// Run the script
main();
