import { describe, it, expect } from 'vitest';
import { getErrorMessage } from './getErrorMessage';

describe('getErrorMessage', () => {
  it('an object with "status" takes the RTK path even if it also has "message"', () => {
    const err = { status: 500, message: 'ignored top-level message', data: 'from data' };
    expect(getErrorMessage(err)).toBe('from data');
  });

  it('data as a string is returned verbatim', () => {
    expect(getErrorMessage({ status: 400, data: 'Bad request' })).toBe('Bad request');
  });

  it('data.message is preferred when data is an object', () => {
    expect(getErrorMessage({ status: 400, data: { message: 'Nested message' } })).toBe(
      'Nested message',
    );
  });

  it('the "error" field wins over JSON.stringify(data) when data has no message', () => {
    expect(
      getErrorMessage({ status: 'FETCH_ERROR', error: 'Network down', data: { foo: 1 } }),
    ).toBe('Network down');
  });

  it('falls back to Unknown server error when data is undefined and no error field', () => {
    expect(getErrorMessage({ status: 500, data: undefined })).toBe('Unknown server error');
  });

  it('a real Error returns its message', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('an Error with an empty message falls back to the generic message', () => {
    expect(getErrorMessage(new Error(''))).toBe('An unknown error occurred');
  });

  it('a plain object with a string message field is used directly', () => {
    expect(getErrorMessage({ message: 'plain message' })).toBe('plain message');
  });

  it('a primitive falls back to the generic message', () => {
    expect(getErrorMessage('just a string')).toBe('An unknown error occurred');
    expect(getErrorMessage(null)).toBe('An unknown error occurred');
    expect(getErrorMessage(42)).toBe('An unknown error occurred');
  });
});
