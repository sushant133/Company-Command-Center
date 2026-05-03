import { parseCommand, findCompanyByName, generateAIChatResponse, handleGreeting, handleHelp } from '../../services/ai.service.js';
import Company from '../../models/Company.js';
import mongoose from 'mongoose';

// Mock mongoose
jest.mock('../../models/Company.js');

describe('AI Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseCommand', () => {
    test('should parse greeting command', () => {
      const result = parseCommand('Hello');
      expect(result.type).toBe('GREETING');
      expect(result.confidence).toBe(0.85);
    });

    test('should parse help command', () => {
      const result = parseCommand('help');
      expect(result.type).toBe('HELP');
    });

    test('should parse company details command', () => {
      const result = parseCommand('show details about Apple company');
      expect(result.type).toBe('COMPANY_DETAILS');
      expect(result.context).toBe('Apple');
    });

    test('should fallback to GENERAL_QUERY', () => {
      const result = parseCommand('random text');
      expect(result.type).toBe('GENERAL_QUERY');
    });
  });

  describe('handleGreeting', () => {
    test('should return random greeting', () => {
      const greetings = [
        expect.stringContaining('Hello there'),
        expect.stringContaining('Hi!'),
        expect.stringContaining('Hey there!'),
        expect.stringContaining('Greetings!')
      ];
      const result = handleGreeting('hi');
      expect(greetings.some(g => result.match(g))).toBe(true);
    });
  });

  describe('handleHelp', () => {
    test('should return comprehensive help text', () => {
      const result = handleHelp();
      expect(result).toContain('Welcome to AI Chatbot');
      expect(result).toContain('Company Insights');
      expect(result).toContain('Tips');
    });
  });

  describe('findCompanyByName', () => {
    test('should return null for empty fragment', async () => {
      const result = await findCompanyByName('');
      expect(result).toBeNull();
    });

    test('should find company with fuzzy match', async () => {
      const mockCompany = { _id: '1', name: 'Test Company' };
      Company.find.mockResolvedValue([mockCompany]);
      
      const result = await findCompanyByName('Test');
      expect(result).toEqual(mockCompany);
      expect(Company.find).toHaveBeenCalledWith({
        name: { $regex: 'Test', $options: 'i' }
      });
    });

    test('should return null if no match', async () => {
      Company.find.mockResolvedValue([]);
      const result = await findCompanyByName('Nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('generateAIChatResponse', () => {
    test('should handle greeting', async () => {
      const result = await generateAIChatResponse('hello');
      expect(result.isError).toBe(false);
      expect(result.content).toContain('AI Chatbot');
    });

    test('should handle help', async () => {
      const result = await generateAIChatResponse('help');
      expect(result.isError).toBe(false);
      expect(result.content).toContain('Welcome to AI Chatbot');
    });

    test('should handle company details with no company', async () => {
      Company.find.mockImplementationOnce(() => []); // for findCompanyByName
      Company.find.mockResolvedValue([]); // for available companies
      
      const result = await generateAIChatResponse('tell me about fakecompany');
      expect(result.isError).toBe(true);
      expect(result.content).toContain('Available companies are');
    });
  });
});

