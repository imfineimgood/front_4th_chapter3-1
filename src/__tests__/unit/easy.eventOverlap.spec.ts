import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2024-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = '2024-07-01';
    const time = '14:30';
    const result = parseDateTime(date, time);

    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(6);
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2024-13-66';
    const time = '14:30';
    const result = parseDateTime(date, time);

    expect(result).toBeInstanceOf(Date);
    expect(result.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2024-07-01';
    const time = '25:30';
    const result = parseDateTime(date, time);

    expect(result).toBeInstanceOf(Date);
    expect(result.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = '';
    const time = '14:30';
    const result = parseDateTime(date, time);

    expect(result).toBeInstanceOf(Date);
    expect(result.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event = {
      id: '1',
      title: '회의',
      date: '2024-07-01',
      startTime: '14:30',
      endTime: '15:30',
    };

    const range = convertEventToDateRange(event as Event);

    expect(range.start).toBeInstanceOf(Date);
    expect(range.end).toBeInstanceOf(Date);
    expect(range.start.getHours()).toBe(14);
    expect(range.start.getMinutes()).toBe(30);
    expect(range.end.getHours()).toBe(15);
    expect(range.end.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = {
      id: '1',
      title: '회의',
      date: '2024-13-66',
      startTime: '14:30',
      endTime: '15:30',
    };

    const range = convertEventToDateRange(event as Event);

    expect(range.start.toString()).toBe('Invalid Date');
    expect(range.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = {
      id: '1',
      title: '회의',
      date: '2024-07-01',
      startTime: '25:30',
      endTime: '33:30',
    };

    const range = convertEventToDateRange(event as Event);

    expect(range.start.toString()).toBe('Invalid Date');
    expect(range.end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1 = {
      id: '1',
      title: '회의 1',
      date: '2024-07-01',
      startTime: '14:00',
      endTime: '15:00',
    };

    const event2 = {
      id: '2',
      title: '회의 2',
      date: '2024-07-01',
      startTime: '14:30',
      endTime: '15:30',
    };

    expect(isOverlapping(event1 as Event, event2 as Event)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = {
      id: '1',
      title: '회의 1',
      date: '2024-07-01',
      startTime: '14:00',
      endTime: '15:00',
    };

    const event2 = {
      id: '2',
      title: '회의 2',
      date: '2024-07-01',
      startTime: '15:30',
      endTime: '16:30',
    };

    expect(isOverlapping(event1 as Event, event2 as Event)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const existingEvents = [
    {
      id: '1',
      title: '회의 1',
      date: '2024-07-01',
      startTime: '14:00',
      endTime: '15:00',
    },
    {
      id: '2',
      title: '회의 2',
      date: '2024-07-01',
      startTime: '15:00',
      endTime: '16:00',
    },
    {
      id: '3',
      title: '회의 3',
      date: '2024-07-01',
      startTime: '10:30',
      endTime: '11:30',
    },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent = {
      id: '4',
      title: '새 회의',
      date: '2024-07-01',
      startTime: '14:45',
      endTime: '15:15',
    };

    const overlappingEvents = findOverlappingEvents(newEvent as Event, existingEvents as Event[]);
    expect(overlappingEvents).toHaveLength(2);
    expect(overlappingEvents.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent = {
      id: '4',
      title: '새 회의',
      date: '2024-07-01',
      startTime: '11:30',
      endTime: '12:30',
    };

    const overlappingEvents = findOverlappingEvents(newEvent as Event, existingEvents as Event[]);
    expect(overlappingEvents).toHaveLength(0);
  });
});
