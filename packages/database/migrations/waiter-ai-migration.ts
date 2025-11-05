/**
 * WaiterAi Migration Script
 * 
 * Migrates from Drizzle ORM to Prisma unified schema
 * 
 * Usage:
 *   tsx migrations/waiter-ai-migration.ts
 */

import { PrismaClient, TableStatus, OrderStatus, DietaryType } from '@prisma/client';

// Note: This assumes you have the old Drizzle database connection available
// You'll need to import your Drizzle setup here
// import { db as drizzleDb } from '../old-drizzle-setup';

const newDb = new PrismaClient();

async function migrateWaiterAi() {
  console.log('🔄 Starting WaiterAi migration from Drizzle to Prisma...');

  try {
    // Step 1: Get or create organization
    console.log('📋 Step 1: Setting up organization...');
    
    const org = await newDb.organization.upsert({
      where: { slug: 'waiter-ai-migrated' },
      update: {},
      create: {
        name: 'WaiterAi Migrated Organization',
        slug: 'waiter-ai-migrated',
        plan: 'PRO',
        status: 'ACTIVE',
      },
    });
    console.log(`✅ Organization ready: ${org.name}`);

    // Step 2: Migrate restaurants
    console.log('📋 Step 2: Migrating restaurants...');
    
    // Example: Fetch from old Drizzle database
    // const oldRestaurants = await drizzleDb.select().from(restaurantsTable);
    
    // For demonstration, using raw query approach
    // You'll need to adapt this to your Drizzle setup
    const oldRestaurants: any[] = []; // Replace with actual Drizzle query
    
    const restaurantMap = new Map<string, string>(); // old ID -> new ID
    
    for (const oldRest of oldRestaurants) {
      const newRest = await newDb.restaurant.create({
        data: {
          organizationId: org.id,
          name: oldRest.name,
          description: oldRest.description,
          address: oldRest.address,
          phone: oldRest.phone,
          email: oldRest.email,
          settings: oldRest.settings || {},
          createdAt: oldRest.created_at,
          updatedAt: oldRest.updated_at,
        },
      });
      restaurantMap.set(oldRest.id, newRest.id);
    }
    console.log(`✅ Migrated ${oldRestaurants.length} restaurants`);

    // Step 3: Migrate menus
    console.log('📋 Step 3: Migrating menus...');
    
    const oldMenus: any[] = []; // Replace with actual Drizzle query
    const menuMap = new Map<string, string>();
    
    for (const oldMenu of oldMenus) {
      const newRestId = restaurantMap.get(oldMenu.restaurant_id);
      if (!newRestId) continue;
      
      const newMenu = await newDb.menu.create({
        data: {
          restaurantId: newRestId,
          name: oldMenu.name,
          description: oldMenu.description,
          isActive: oldMenu.is_active ?? true,
          createdAt: oldMenu.created_at,
          updatedAt: oldMenu.updated_at,
        },
      });
      menuMap.set(oldMenu.id, newMenu.id);
    }
    console.log(`✅ Migrated ${oldMenus.length} menus`);

    // Step 4: Migrate menu items
    console.log('📋 Step 4: Migrating menu items...');
    
    const oldMenuItems: any[] = []; // Replace with actual Drizzle query
    const menuItemMap = new Map<string, string>();
    
    for (const oldItem of oldMenuItems) {
      const newRestId = restaurantMap.get(oldItem.restaurant_id);
      const newMenuId = oldItem.menu_id ? menuMap.get(oldItem.menu_id) : undefined;
      
      if (!newRestId) continue;
      
      // Parse dietary types from old schema
      let dietary: DietaryType[] = [];
      if (oldItem.dietary) {
        if (Array.isArray(oldItem.dietary)) {
          dietary = oldItem.dietary
            .map((d: string) => d.toUpperCase().replace('-', '_'))
            .filter((d: string) => Object.values(DietaryType).includes(d as DietaryType));
        }
      }
      
      // Handle translations - ensure it's proper JSON
      let translations = {};
      if (oldItem.translations) {
        try {
          translations = typeof oldItem.translations === 'string' 
            ? JSON.parse(oldItem.translations) 
            : oldItem.translations;
        } catch (e) {
          console.warn(`Failed to parse translations for item ${oldItem.id}`);
        }
      }
      
      const newItem = await newDb.menuItem.create({
        data: {
          restaurantId: newRestId,
          menuId: newMenuId,
          name: oldItem.name,
          description: oldItem.description,
          aiDescription: oldItem.ai_description,
          price: oldItem.price,
          category: oldItem.category || 'Uncategorized',
          dietary,
          allergens: oldItem.allergens || [],
          translations,
          imageUrl: oldItem.image_url,
          isAvailable: oldItem.is_available ?? true,
          createdAt: oldItem.created_at,
          updatedAt: oldItem.updated_at,
        },
      });
      menuItemMap.set(oldItem.id, newItem.id);
    }
    console.log(`✅ Migrated ${oldMenuItems.length} menu items`);

    // Step 5: Migrate tables
    console.log('📋 Step 5: Migrating tables...');
    
    const oldTables: any[] = []; // Replace with actual Drizzle query
    const tableMap = new Map<string, string>();
    
    for (const oldTable of oldTables) {
      const newRestId = restaurantMap.get(oldTable.restaurant_id);
      if (!newRestId) continue;
      
      // Map old status to new enum
      let status = TableStatus.AVAILABLE;
      if (oldTable.status) {
        const statusUpper = oldTable.status.toUpperCase();
        if (Object.values(TableStatus).includes(statusUpper as TableStatus)) {
          status = statusUpper as TableStatus;
        }
      }
      
      const newTable = await newDb.table.create({
        data: {
          restaurantId: newRestId,
          number: oldTable.number || oldTable.table_number,
          capacity: oldTable.capacity,
          status,
          createdAt: oldTable.created_at,
          updatedAt: oldTable.updated_at,
        },
      });
      tableMap.set(oldTable.id, newTable.id);
    }
    console.log(`✅ Migrated ${oldTables.length} tables`);

    // Step 6: Migrate orders
    console.log('📋 Step 6: Migrating orders...');
    
    const oldOrders: any[] = []; // Replace with actual Drizzle query
    const orderMap = new Map<string, string>();
    
    for (const oldOrder of oldOrders) {
      const newRestId = restaurantMap.get(oldOrder.restaurant_id);
      const newTableId = oldOrder.table_id ? tableMap.get(oldOrder.table_id) : undefined;
      
      if (!newRestId) continue;
      
      // Map old status to new enum
      let status = OrderStatus.PENDING;
      if (oldOrder.status) {
        const statusUpper = oldOrder.status.toUpperCase();
        if (Object.values(OrderStatus).includes(statusUpper as OrderStatus)) {
          status = statusUpper as OrderStatus;
        }
      }
      
      const newOrder = await newDb.order.create({
        data: {
          restaurantId: newRestId,
          tableId: newTableId,
          customerName: oldOrder.customer_name,
          total: oldOrder.total,
          status,
          notes: oldOrder.notes,
          createdAt: oldOrder.created_at,
          updatedAt: oldOrder.updated_at,
        },
      });
      orderMap.set(oldOrder.id, newOrder.id);
    }
    console.log(`✅ Migrated ${oldOrders.length} orders`);

    // Step 7: Migrate order items
    console.log('📋 Step 7: Migrating order items...');
    
    const oldOrderItems: any[] = []; // Replace with actual Drizzle query
    
    for (const oldOrderItem of oldOrderItems) {
      const newOrderId = orderMap.get(oldOrderItem.order_id);
      const newMenuItemId = menuItemMap.get(oldOrderItem.menu_item_id);
      
      if (!newOrderId || !newMenuItemId) continue;
      
      await newDb.orderItem.create({
        data: {
          orderId: newOrderId,
          menuItemId: newMenuItemId,
          quantity: oldOrderItem.quantity,
          price: oldOrderItem.price,
          customizations: oldOrderItem.customizations,
          createdAt: oldOrderItem.created_at,
        },
      });
    }
    console.log(`✅ Migrated ${oldOrderItems.length} order items`);

    console.log('✅ WaiterAi migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await newDb.$disconnect();
  }
}

// Run migration
if (require.main === module) {
  migrateWaiterAi()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migrateWaiterAi };
