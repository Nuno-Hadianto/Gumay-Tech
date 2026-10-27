import { Part } from '../shared/types';
import db from '../database/db';
import {  spareParts, serviceItems  } from '../database/drizzleSchema';
import {  eq, like, or, and, isNull, asc, desc, sql  } from 'drizzle-orm';

function getParts(searchQuery: string = '', page: number = 1, limit: number = 15, sortBy: string = 'name_asc') {
    const offset = (page - 1) * limit;
    let query = db.drizzle.select().from(spareParts).$dynamic();
    let countQuery = db.drizzle.select({ count: sql`count(*)` }).from(spareParts).$dynamic();

    if (searchQuery) {
        const queryStr = `%${searchQuery}%`;
        const searchFilter = and(
            or(like(spareParts.name, queryStr), like(spareParts.part_code, queryStr)),
            isNull(spareParts.deleted_at)
        );
        query = query.where(searchFilter);
        countQuery = countQuery.where(searchFilter);
    } else {
        query = query.where(isNull(spareParts.deleted_at));
        countQuery = countQuery.where(isNull(spareParts.deleted_at));
    }
    
    let orderCondition;
    switch (sortBy) {
        case 'name_desc': orderCondition = desc(spareParts.name); break;
        case 'id_desc': orderCondition = desc(spareParts.id); break;
        case 'id_asc': orderCondition = asc(spareParts.id); break;
        case 'name_asc':
        default: orderCondition = asc(spareParts.name); break;
    }

    const data = query.orderBy(orderCondition).limit(limit).offset(offset).all();
    const totalResult = countQuery.get();
    const total = totalResult ? Number((totalResult as { count: number }).count) : 0;
    
    return { data, total };
}

function getPartById(id: number | string) {
    return db.drizzle.select().from(spareParts).where(and(eq(spareParts.id, Number(id)), isNull(spareParts.deleted_at))).get();
}

function addPart(data: Omit<Part, 'id'>) {
    return db.transaction(() => {
        const { part_code, name, category, buy_price, sell_price } = data as Part;
        const normalizedCode = (part_code && typeof part_code === 'string' && part_code.trim() !== '') ? part_code.trim() : null;
        const result = db.drizzle.insert(spareParts).values({
            part_code: normalizedCode, name, category, buy_price, sell_price
        }).run();
        const partId = result.lastInsertRowid;
        
        return partId;
    })();
}

function updatePart(id: number | string, data: Omit<Part, 'id'>) {
    return db.transaction(() => {
        const { part_code, name, category, buy_price, sell_price } = data as Part;
        const normalizedCode = (part_code && typeof part_code === 'string' && part_code.trim() !== '') ? part_code.trim() : null;
        
        db.drizzle.update(spareParts).set({
            part_code: normalizedCode, name, category, buy_price, sell_price, updated_at: sql`CURRENT_TIMESTAMP`
        }).where(eq(spareParts.id, Number(id))).run();
        
        return true;
    })();
}




function checkPartHasServiceItems(id: number | string) {
    const result = db.drizzle.select({ count: sql`count(*)` }).from(serviceItems)
        .where(eq(serviceItems.spare_part_id, Number(id))).get();
    return result.count > 0;
}

function deletePart(id: number | string) {
    db.drizzle.update(spareParts).set({ deleted_at: sql`CURRENT_TIMESTAMP` }).where(eq(spareParts.id, Number(id))).run();
    return true;
}

export { 
    getParts,
    getPartById,
    addPart,
    updatePart,
    checkPartHasServiceItems,
    deletePart
 };

