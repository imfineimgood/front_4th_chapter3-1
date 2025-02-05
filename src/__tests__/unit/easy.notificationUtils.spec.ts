import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const baseEvent = [
    {
      id: '1',
      title: '회의',
      date: '2024-07-01',
      startTime: '14:30',
      notificationTime: 30,
      description: '',
      location: '',
    },
    {
      id: '2',
      title: '이벤트',
      date: '2024-07-01',
      startTime: '16:30',
      notificationTime: 30,
      description: '',
      location: '',
    },
  ];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2024-07-01T14:00');
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(baseEvent as Event[], now, notifiedEvents);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2024-07-01T14:00');
    const notifiedEvents: string[] = ['1'];

    const result = getUpcomingEvents(baseEvent as Event[], now, notifiedEvents);

    expect(result).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2024-07-01T13:59');
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(baseEvent as Event[], now, notifiedEvents);

    expect(result).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {});
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event = {
      id: '1',
      title: '팀 미팅',
      date: '2024-07-01',
      startTime: '14:30',
      notificationTime: 30,
      description: '',
      location: '',
    };

    const message = createNotificationMessage(event as Event);
    expect(message).toBe('30분 후 팀 미팅 일정이 시작됩니다.');
  });
});
