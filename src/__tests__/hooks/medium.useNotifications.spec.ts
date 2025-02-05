import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '테스트 회의',
    date: formatDate(new Date()),
    startTime: parseHM(Date.now() + 5 * 60 * 1000), // 5분 후
    endTime: parseHM(Date.now() + 65 * 60 * 1000),
    description: '테스트 회의입니다',
    location: '회의실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 3, // 3분 전 알림
  },
];

describe('useNotifications', () => {
  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications(mockEvents));

    expect(result.current.notifications).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {});

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {});

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {});
});
