const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateProfileSetup() {
  try {
    console.log('🔄 Starting profile setup migration...');

    // Check if columns already exist
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('profileSetup', 'gameSetup', 'onboardingComplete')
    `;

    if (result.length === 0) {
      console.log('📝 Adding profile setup columns to users table...');
      
      // Add new columns to users table one by one
      try {
        await prisma.$executeRaw`ALTER TABLE "users" ADD COLUMN "profileSetup" BOOLEAN DEFAULT false`;
        console.log('✅ Added profileSetup column');
      } catch (error) {
        if (!error.message.includes('already exists')) {
          throw error;
        }
        console.log('ℹ️  profileSetup column already exists');
      }

      try {
        await prisma.$executeRaw`ALTER TABLE "users" ADD COLUMN "gameSetup" BOOLEAN DEFAULT false`;
        console.log('✅ Added gameSetup column');
      } catch (error) {
        if (!error.message.includes('already exists')) {
          throw error;
        }
        console.log('ℹ️  gameSetup column already exists');
      }

      try {
        await prisma.$executeRaw`ALTER TABLE "users" ADD COLUMN "onboardingComplete" BOOLEAN DEFAULT false`;
        console.log('✅ Added onboardingComplete column');
      } catch (error) {
        if (!error.message.includes('already exists')) {
          throw error;
        }
        console.log('ℹ️  onboardingComplete column already exists');
      }

      console.log('✅ Profile setup columns added successfully');
    } else {
      console.log('ℹ️  Profile setup columns already exist');
    }

    // Check if game_profiles table exists
    const tableExists = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'game_profiles'
    `;

    if (tableExists.length === 0) {
      console.log('📝 Creating game_profiles table...');
      
      // Create game_profiles table
      await prisma.$executeRaw`
        CREATE TABLE "game_profiles" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "gameId" TEXT NOT NULL,
          "gameName" TEXT NOT NULL,
          "gameUID" TEXT NOT NULL,
          "inGameName" TEXT NOT NULL,
          "isPrimary" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "game_profiles_pkey" PRIMARY KEY ("id")
        )
      `;

      // Add unique constraint
      await prisma.$executeRaw`
        ALTER TABLE "game_profiles" 
        ADD CONSTRAINT "game_profiles_userId_gameId_key" 
        UNIQUE ("userId", "gameId")
      `;

      // Add foreign key constraint
      await prisma.$executeRaw`
        ALTER TABLE "game_profiles" 
        ADD CONSTRAINT "game_profiles_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `;

      console.log('✅ Game profiles table created successfully');
    } else {
      console.log('ℹ️  Game profiles table already exists');
    }

    // Update existing users to have completed onboarding if they have basic profile data
    const updateResult = await prisma.$executeRaw`
      UPDATE "users" 
      SET "onboardingComplete" = true 
      WHERE ("firstName" IS NOT NULL AND "firstName" != '') 
      OR ("avatar" IS NOT NULL AND "avatar" != '')
    `;

    console.log(`✅ Updated ${updateResult} existing users with onboarding status`);

    console.log('🎉 Profile setup migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateProfileSetup()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateProfileSetup };