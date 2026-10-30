const { validateCreateTemplate } = require('../src/validators/template.validator');

describe('Template validators', () => {
  it('exposes create validator chain', () => {
    expect(Array.isArray(validateCreateTemplate)).toBe(true);
    expect(validateCreateTemplate.length).toBeGreaterThan(5);
  });
});
