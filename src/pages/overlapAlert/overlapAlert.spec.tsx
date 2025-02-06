import { screen } from '@testing-library/react';
import { createRef } from 'react';

import { OverlapAlert } from './OverlapAlert';
import { setup } from '../../__tests__/medium.integration.spec';
import { Event } from '../../types';

describe('OverlapAlert', () => {
  const mockOverlappingEvents: Event[] = [
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
    {
      id: '2',
      title: '프로젝트 회의',
      date: '2024-02-20',
      startTime: '10:30',
      endTime: '11:30',
      description: '프로젝트 진행 상황 회의',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    overlappingEvents: mockOverlappingEvents,
    cancelRef: createRef<HTMLButtonElement>(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('AlertDialog가 열려있을 때 경고 메시지와 겹치는 일정들을 표시한다', () => {
    setup(<OverlapAlert {...mockProps} />);

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();

    mockOverlappingEvents.forEach((event) => {
      expect(
        screen.getByText(`${event.title} (${event.date} ${event.startTime}-${event.endTime})`)
      ).toBeInTheDocument();
    });
    const dialogBody = screen.getByRole('alertdialog').textContent;
    expect(dialogBody).toContain('다음 일정과 겹칩니다:');
  });

  it('AlertDialog가 닫혀있을 때는 아무것도 표시하지 않는다', () => {
    setup(<OverlapAlert {...mockProps} isOpen={false} />);

    expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
  });

  it('취소 버튼 클릭 시 onClose 함수가 호출된다', async () => {
    const { user } = setup(<OverlapAlert {...mockProps} />);

    const cancelButton = screen.getByText('취소');
    await user.click(cancelButton);

    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('계속 진행 버튼 클릭 시 onConfirm 함수가 호출된다', async () => {
    const { user } = setup(<OverlapAlert {...mockProps} />);

    const confirmButton = screen.getByText('계속 진행');
    await user.click(confirmButton);

    expect(mockProps.onConfirm).toHaveBeenCalledTimes(1);
  });
});
