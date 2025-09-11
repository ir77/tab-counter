import { mainUpdater } from './background.js';
import * as common from './common.js';
import { chrome } from 'jest-chrome';

// Mock the common module
jest.mock('./common.js');

describe('mainUpdater', () => {
  beforeEach(() => {
    // Reset mocks before each test
    chrome.storage.local.clear();
    chrome.action.setBadgeText.mockClear();
    common.getTabCount.mockClear();
  });

  test('should set badge text with the current tab count', async () => {
    // Arrange
    common.getTabCount.mockResolvedValue(5);
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({});
    });
    chrome.storage.local.set.mockImplementation(() => {});


    // Act
    await mainUpdater();

    // Assert
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '5' });
  });

  test('should initialize daily stats on the first run of a day', async () => {
    // Arrange
    common.getTabCount.mockResolvedValue(10);
    const today = new Date().toLocaleDateString('sv-SE');
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({}); // Simulate empty storage
    });
    const setSpy = jest.spyOn(chrome.storage.local, 'set');

    // Act
    await mainUpdater();

    // Assert
    expect(setSpy).toHaveBeenCalledWith({
      tabCount: 10,
      dailyStats: {
        date: today,
        high: 10,
        low: 10,
      },
    });
  });

  test('should update high and low counts for the same day', async () => {
    // Arrange
    const today = new Date().toLocaleDateString('sv-SE');
    const initialStats = {
      tabCount: 10,
      dailyStats: { date: today, high: 15, low: 5 },
    };
    common.getTabCount.mockResolvedValue(20); // New high
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback(initialStats);
    });
    const setSpy = jest.spyOn(chrome.storage.local, 'set');

    // Act
    await mainUpdater();

    // Assert
    expect(setSpy).toHaveBeenCalledWith(expect.objectContaining({
      dailyStats: { date: today, high: 20, low: 5 },
    }));

    // Arrange for new low
    common.getTabCount.mockResolvedValue(3); // New low
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({
        ...initialStats,
        dailyStats: { date: today, high: 20, low: 5 }
      });
    });

    // Act
    await mainUpdater();

    // Assert
    expect(setSpy).toHaveBeenCalledWith(expect.objectContaining({
      dailyStats: { date: today, high: 20, low: 3 },
    }));
  });

  test('should reset stats and store previous day count on a new day', async () => {
    // Arrange
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toLocaleDateString('sv-SE');

    const previousDayStats = {
      tabCount: 12, // This was the last count of yesterday
      dailyStats: { date: yesterdayString, high: 20, low: 10 },
      previousDayTabCount: 8, // some old value
    };
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback(previousDayStats);
    });
    common.getTabCount.mockResolvedValue(5); // First count of the new day
    const setSpy = jest.spyOn(chrome.storage.local, 'set');
    const today = new Date().toLocaleDateString('sv-SE');

    // Act
    await mainUpdater();

    // Assert
    expect(setSpy).toHaveBeenCalledWith({
      tabCount: 5,
      dailyStats: {
        date: today,
        high: 5,
        low: 5,
      },
      previousDayTabCount: 12, // Should be updated to yesterday's last count
    });
  });
});
