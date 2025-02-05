import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const sampleEvents = [
    {
      id: '1',
      title: '이벤트 1',
      description: '첫 번째 이벤트 설명',
      date: '2024-07-01',
      location: '회의실 A',
      startTime: '09:00',
      endTime: '10:00',
    },
    {
      id: '2',
      title: '이벤트 2',
      description: '두 번째 이벤트 설명',
      date: '2024-07-03',
      location: '회의실 B',
      startTime: '14:00',
      endTime: '15:00',
    },
    {
      id: '3',
      title: '미팅',
      description: '이벤트 2 후속 미팅',
      date: '2024-07-15',
      location: '회의실 C',
      startTime: '11:00',
      endTime: '12:00',
    },
    {
      id: '4',
      title: 'EVENT',
      description: '대문자 이벤트',
      date: '2024-06-01',
      location: '회의실 D',
      startTime: '16:00',
      endTime: '17:00',
    },
  ];
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const date = new Date('2024-07-01');
    const result = getFilteredEvents(sampleEvents as Event[], '이벤트 2', date, 'week');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    const date = new Date('2024-07-01');
    const result = getFilteredEvents(sampleEvents as Event[], '', date, 'week');

    expect(result).toHaveLength(2);
    expect(result.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    const date = new Date('2024-07-01');
    const result = getFilteredEvents(sampleEvents as Event[], '', date, 'month');

    expect(result).toHaveLength(3);
    expect(result.map((e) => e.id)).toEqual(['1', '2', '3']);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const date = new Date('2024-07-01');
    const result = getFilteredEvents(sampleEvents as Event[], '이벤트', date, 'week');

    expect(result).toHaveLength(2);
    expect(result.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const date = new Date('2024-07-01');
    const result = getFilteredEvents(sampleEvents as Event[], '', date, 'week');

    expect(result).toHaveLength(2);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const date = new Date('2024-05-30');
    const result = getFilteredEvents(sampleEvents as Event[], 'event', date, 'week');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('4');
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const date = new Date('2024-06-01');
    const result = getFilteredEvents(sampleEvents as Event[], '', date, 'month');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('4');
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const date = new Date('2024-07-01');
    const result = getFilteredEvents([], '', date, 'week');

    expect(result).toHaveLength(0);
  });
});
