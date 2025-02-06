import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

describe('useNotifications', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '테스트 회의',
      date: '2024-10-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 회의입니다',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10, // 10분 전 알림
    },
  ];
  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications(mockEvents));

    expect(result.current.notifications).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    vi.setSystemTime(new Date('2024-10-01T09:45:00'));
    const { result } = renderHook(() => useNotifications(mockEvents));

    // 5분 진행하여 9:50이 되도록 함 (이벤트 시작 10분 전)
    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toEqual({
      id: '1',
      message: '10분 후 테스트 회의 일정이 시작됩니다.',
    });
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    // 이벤트 시작 10분 전으로 시간 설정
    vi.setSystemTime(new Date('2024-10-01T09:50:00'));
    const { result } = renderHook(() => useNotifications(mockEvents));

    // 1초 진행하여 알림이 생성되도록 함
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);

    // 알림 제거
    act(() => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    // 이벤트 시작 10분 전으로 시간 설정
    vi.setSystemTime(new Date('2024-10-01T09:50:00'));
    const { result } = renderHook(() => useNotifications(mockEvents));

    // 1초 진행하여 첫 알림이 생성되도록 함
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);

    // 추가로 시간을 진행해도 중복 알림이 발생하지 않아야 함
    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toContain('1');
  });
});
