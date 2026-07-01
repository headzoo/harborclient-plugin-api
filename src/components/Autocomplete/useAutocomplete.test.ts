import { describe, expect, it } from '@jest/globals';
import { filterAutocompleteItems } from './useAutocomplete.js';

describe('filterAutocompleteItems', () => {
  it('treats undefined and null values as empty', () => {
    expect(filterAutocompleteItems(['Authorization', 'Accept'], undefined)).toEqual([
      'Authorization',
      'Accept'
    ]);
    expect(filterAutocompleteItems(['Authorization', 'Accept'], null)).toEqual([
      'Authorization',
      'Accept'
    ]);
  });

  it('excludes an exact case-insensitive match from suggestions', () => {
    expect(filterAutocompleteItems(['Authorization', 'Accept'], 'accept')).toEqual([]);
  });

  it('filters by substring when the input has content', () => {
    expect(filterAutocompleteItems(['Content-Type', 'Accept', 'Authorization'], 'auth')).toEqual([
      'Authorization'
    ]);
  });
});
