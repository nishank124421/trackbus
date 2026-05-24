// Unit Tests for Reporting Page
// Run with: npm test

describe('Bus Number Validation', () => {

    // This is the exact same regex used in your validateReport middleware
    const busPattern = /^[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{4}$/;

    test('should accept valid bus number PB-01-B-2946', () => {
        expect(busPattern.test('PB-01-B-2946')).toBe(true);
    });

    test('should accept valid bus number HR-45-GV-1234', () => {
        expect(busPattern.test('HR-45-GV-1234')).toBe(true);
    });

    test('should reject lowercase bus number pb-01-b-2946', () => {
        expect(busPattern.test('pb-01-b-2946')).toBe(false);
    });

    test('should reject bus number without dashes', () => {
        expect(busPattern.test('PB01B2946')).toBe(false);
    });

    test('should reject empty string', () => {
        expect(busPattern.test('')).toBe(false);
    });

    test('should reject bus number with wrong format', () => {
        expect(busPattern.test('PB-01-B-29')).toBe(false);
    });
});

describe('Report Required Fields Validation', () => {

    // Recreating the validation logic from validateReport middleware
    function validateFields(body) {
        const required = ['reportType', 'busNumber', 'location', 'date', 'time', 'description', 'severity'];
        for (const field of required) {
            if (!body[field]) return false;
        }
        return true;
    }

    test('should pass when all fields are present', () => {
        const body = {
            reportType: 'Rash Driving',
            busNumber: 'PB-01-B-2946',
            location: 'Ludhiana Bus Stand',
            date: '2025-05-23',
            time: '10:00',
            description: 'Driver was driving very rashly on the highway',
            severity: 'high'
        };
        expect(validateFields(body)).toBe(true);
    });

    test('should fail when busNumber is missing', () => {
        const body = {
            reportType: 'Rash Driving',
            location: 'Ludhiana',
            date: '2025-05-23',
            time: '10:00',
            description: 'Driver was driving rashly',
            severity: 'high'
        };
        expect(validateFields(body)).toBe(false);
    });

    test('should fail when severity is missing', () => {
        const body = {
            reportType: 'Bus Condition',
            busNumber: 'PB-01-B-2946',
            location: 'Ludhiana',
            date: '2025-05-23',
            time: '10:00',
            description: 'Bus brakes are not working properly'
        };
        expect(validateFields(body)).toBe(false);
    });

    test('should fail when description is missing', () => {
        const body = {
            reportType: 'Driver Behavior',
            busNumber: 'HR-45-GV-1234',
            location: 'Chandigarh',
            date: '2025-05-23',
            time: '11:00',
            severity: 'medium'
        };
        expect(validateFields(body)).toBe(false);
    });
});

describe('Severity Level Validation', () => {

    const validSeverities = ['low', 'medium', 'high'];

    test('should accept low severity', () => {
        expect(validSeverities.includes('low')).toBe(true);
    });

    test('should accept medium severity', () => {
        expect(validSeverities.includes('medium')).toBe(true);
    });

    test('should accept high severity', () => {
        expect(validSeverities.includes('high')).toBe(true);
    });

    test('should reject invalid severity "critical"', () => {
        expect(validSeverities.includes('critical')).toBe(false);
    });

    test('should reject invalid severity "urgent"', () => {
        expect(validSeverities.includes('urgent')).toBe(false);
    });
});

describe('Report Type Validation', () => {

    const validTypes = ['Rash Driving', 'Bus Condition', 'Driver Behavior', 'Other Issue'];

    test('should accept Rash Driving', () => {
        expect(validTypes.includes('Rash Driving')).toBe(true);
    });

    test('should accept Bus Condition', () => {
        expect(validTypes.includes('Bus Condition')).toBe(true);
    });

    test('should reject unknown type', () => {
        expect(validTypes.includes('Something Random')).toBe(false);
    });
});

describe('File Type Validation', () => {

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf'];

    test('should accept image/jpeg', () => {
        expect(allowedTypes.includes('image/jpeg')).toBe(true);
    });

    test('should accept application/pdf', () => {
        expect(allowedTypes.includes('application/pdf')).toBe(true);
    });

    test('should reject application/exe', () => {
        expect(allowedTypes.includes('application/exe')).toBe(false);
    });

    test('should reject text/html', () => {
        expect(allowedTypes.includes('text/html')).toBe(false);
    });
});