const { replacePlaceholders, walkBind } = require('../src/services/template.binding.service');

describe('Template binding service', () => {
  it('replaces placeholder tokens in text', () => {
    const input = 'Student: {{studentName}} / {{admissionNumber}}';
    const output = replacePlaceholders(input, { studentName: 'Aarav', admissionNumber: 'ADM-1' });
    expect(output).toBe('Student: Aarav / ADM-1');
  });

  it('binds nested template JSON tree', () => {
    const node = {
      objects: [
        { type: 'textbox', text: 'Name {{studentName}}' },
        { type: 'textbox', text: 'Class {{class}}-{{section}}' },
      ],
    };
    const bound = walkBind(node, { studentName: 'Aarav', class: '10', section: 'A' });
    expect(bound.objects[0].text).toBe('Name Aarav');
    expect(bound.objects[1].text).toBe('Class 10-A');
  });
});
