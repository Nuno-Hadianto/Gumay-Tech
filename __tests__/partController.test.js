/* eslint-disable @typescript-eslint/no-require-imports */
const db = require('../database/db').default;
const partController = require('../controllers/partController');

describe('partController (White-box testing)', () => {
    // Clear all parts before testing
    beforeEach(() => {
        db.exec('DELETE FROM spare_parts');
    });

    test('addPart should insert a new spare part', () => {
        const data = {
            part_code: 'P-001',
            name: 'LCD 14 Inch',
            category: 'Layar',

            buy_price: 500000,
            sell_price: 650000
        };

        const result = partController.addPart(data);
        expect(typeof result).toBe('number');

        const parts = partController.getParts('');
        expect(parts.data.length).toBe(1);
        expect(parts.data[0].part_code).toBe('P-001');

    });

});
