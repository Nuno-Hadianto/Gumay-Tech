"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParts = getParts;
exports.getPartById = getPartById;
exports.addPart = addPart;
exports.updatePart = updatePart;
exports.checkPartHasServiceItems = checkPartHasServiceItems;
exports.deletePart = deletePart;
const db_1 = __importDefault(require("../database/db"));
const drizzleSchema_1 = require("../database/drizzleSchema");
const drizzle_orm_1 = require("drizzle-orm");
function getParts(searchQuery = '', page = 1, limit = 15, sortBy = 'name_asc') {
    const offset = (page - 1) * limit;
    let query = db_1.default.drizzle.select().from(drizzleSchema_1.spareParts).$dynamic();
    let countQuery = db_1.default.drizzle.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(drizzleSchema_1.spareParts).$dynamic();
    if (searchQuery) {
        const queryStr = `%${searchQuery}%`;
        const searchFilter = (0, drizzle_orm_1.and)((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(drizzleSchema_1.spareParts.name, queryStr), (0, drizzle_orm_1.like)(drizzleSchema_1.spareParts.part_code, queryStr)), (0, drizzle_orm_1.isNull)(drizzleSchema_1.spareParts.deleted_at));
        query = query.where(searchFilter);
        countQuery = countQuery.where(searchFilter);
    }
    else {
        query = query.where((0, drizzle_orm_1.isNull)(drizzleSchema_1.spareParts.deleted_at));
        countQuery = countQuery.where((0, drizzle_orm_1.isNull)(drizzleSchema_1.spareParts.deleted_at));
    }
    let orderCondition;
    switch (sortBy) {
        case 'name_desc':
            orderCondition = (0, drizzle_orm_1.desc)(drizzleSchema_1.spareParts.name);
            break;
        case 'id_desc':
            orderCondition = (0, drizzle_orm_1.desc)(drizzleSchema_1.spareParts.id);
            break;
        case 'id_asc':
            orderCondition = (0, drizzle_orm_1.asc)(drizzleSchema_1.spareParts.id);
            break;
        case 'name_asc':
        default:
            orderCondition = (0, drizzle_orm_1.asc)(drizzleSchema_1.spareParts.name);
            break;
    }
    const data = query.orderBy(orderCondition).limit(limit).offset(offset).all();
    const totalResult = countQuery.get();
    const total = totalResult ? Number(totalResult.count) : 0;
    return { data, total };
}
function getPartById(id) {
    return db_1.default.drizzle.select().from(drizzleSchema_1.spareParts).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(drizzleSchema_1.spareParts.id, Number(id)), (0, drizzle_orm_1.isNull)(drizzleSchema_1.spareParts.deleted_at))).get();
}
function addPart(data) {
    return db_1.default.transaction(() => {
        const { part_code, name, category, buy_price, sell_price } = data;
        const normalizedCode = (part_code && typeof part_code === 'string' && part_code.trim() !== '') ? part_code.trim() : null;
        const result = db_1.default.drizzle.insert(drizzleSchema_1.spareParts).values({
            part_code: normalizedCode, name, category, buy_price, sell_price
        }).run();
        const partId = result.lastInsertRowid;
        return partId;
    })();
}
function updatePart(id, data) {
    return db_1.default.transaction(() => {
        const { part_code, name, category, buy_price, sell_price } = data;
        const normalizedCode = (part_code && typeof part_code === 'string' && part_code.trim() !== '') ? part_code.trim() : null;
        db_1.default.drizzle.update(drizzleSchema_1.spareParts).set({
            part_code: normalizedCode, name, category, buy_price, sell_price, updated_at: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`
        }).where((0, drizzle_orm_1.eq)(drizzleSchema_1.spareParts.id, Number(id))).run();
        return true;
    })();
}
function checkPartHasServiceItems(id) {
    const result = db_1.default.drizzle.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(drizzleSchema_1.serviceItems)
        .where((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceItems.spare_part_id, Number(id))).get();
    return result.count > 0;
}
function deletePart(id) {
    db_1.default.drizzle.update(drizzleSchema_1.spareParts).set({ deleted_at: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP` }).where((0, drizzle_orm_1.eq)(drizzleSchema_1.spareParts.id, Number(id))).run();
    return true;
}
