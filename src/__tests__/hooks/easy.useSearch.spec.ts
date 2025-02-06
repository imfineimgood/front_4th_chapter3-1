import { act, renderHook } from '@testing-library/react';

import { events } from '../../__mocks__/response/realEvents.json' assert { type: 'json' };
import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const mockEvents: Event[] = events as Event[];

describe('useSearch', () => {
  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-02-20'), 'month'));

    expect(result.current.searchTerm).toBe('');
    expect(result.current.filteredEvents).toHaveLength(4);
    expect(result.current.filteredEvents).toEqual(events);
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-02-20'), 'month'));

    act(() => {
      result.current.setSearchTerm('회의');
    });

    expect(result.current.searchTerm).toBe('회의');
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].title).toBe('팀 회의');
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-02-20'), 'month'));

    act(() => {
      result.current.setSearchTerm('회의실');
    });

    expect(result.current.searchTerm).toBe('회의실');
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].title).toBe('팀 회의');
  });

  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-02-20'), 'month'));

    expect(result.current.filteredEvents).toHaveLength(4);
    expect(result.current.filteredEvents.some((event) => event.date.startsWith('2025-02'))).toBe(
      true
    );
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-02-20'), 'month'));
    act(() => {
      result.current.setSearchTerm('회의');
    });

    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].title).toBe('팀 회의');

    act(() => {
      result.current.setSearchTerm('점심');
    });

    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].title).toBe('점심 약속');
  });
});
