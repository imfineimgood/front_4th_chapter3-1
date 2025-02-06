import { screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Notification } from './Notification';
import { setup } from '../../__tests__/medium.integration.spec';
import * as notificationHooks from '../../hooks/useNotifications';
import { Event } from '../../types';

describe('Notification', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '팀 미팅',
      date: '2024-02-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  const mockNotifications = [
    { id: '1', message: '10분 후 팀 미팅 일정이 시작됩니다.' },
    { id: '2', message: '5분 후 점심 약속 일정이 시작됩니다.' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('알림이 없을 때는 아무것도 렌더링하지 않는다', () => {
    vi.spyOn(notificationHooks, 'useNotifications').mockReturnValue({
      notifications: [],
      notifiedEvents: [],
      setNotifications: vi.fn(),
      removeNotification: vi.fn(),
    });

    setup(<Notification events={mockEvents} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('알림이 있을 때 모든 알림을 올바르게 렌더링한다', () => {
    vi.spyOn(notificationHooks, 'useNotifications').mockReturnValue({
      notifications: mockNotifications,
      notifiedEvents: ['1'],
      setNotifications: vi.fn(),
      removeNotification: vi.fn(),
    });

    setup(<Notification events={mockEvents} />);

    mockNotifications.forEach((notification) => {
      expect(screen.getByText(notification.message)).toBeInTheDocument();
    });
    expect(screen.getAllByRole('alert')).toHaveLength(2);
  });

  it('닫기 버튼을 클릭하면 해당 알림이 제거된다', async () => {
    const mockSetNotifications = vi.fn();
    vi.spyOn(notificationHooks, 'useNotifications').mockReturnValue({
      notifications: mockNotifications,
      notifiedEvents: ['1'],
      setNotifications: mockSetNotifications,
      removeNotification: vi.fn(),
    });

    const { user } = setup(<Notification events={mockEvents} />);

    const closeButtons = screen.getAllByRole('button');
    await user.click(closeButtons[0]);

    expect(mockSetNotifications).toHaveBeenCalled();
    const filterFunction = mockSetNotifications.mock.calls[0][0];
    const previousNotifications = mockNotifications;
    const result = filterFunction(previousNotifications);
    expect(result).toEqual([mockNotifications[1]]);
  });
});
