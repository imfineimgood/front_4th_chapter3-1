import { screen } from '@testing-library/react';

import { EventList } from './EventList';
import { setup } from '../../__tests__/medium.integration.spec';
import { Event } from '../../types';

describe('EventList', () => {
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
    {
      id: '2',
      title: '점심 약속',
      date: '2024-02-21',
      startTime: '12:00',
      endTime: '13:00',
      description: '동료와 점심',
      location: '식당',
      category: '개인',
      repeat: { type: 'weekly', interval: 1, endDate: '2024-03-21' },
      notificationTime: 5,
    },
  ];

  const mockProps = {
    events: mockEvents,
    notifiedEvents: ['1'],
    onDelete: vi.fn(),
    onEdit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('모든 이벤트가 올바르게 렌더링된다', () => {
    setup(<EventList {...mockProps} />);

    expect(screen.getByText('팀 미팅')).toBeInTheDocument();
    expect(screen.getByText('점심 약속')).toBeInTheDocument();
  });

  it('반복 일정의 경우 반복 정보가 올바르게 표시된다', () => {
    setup(<EventList {...mockProps} />);

    expect(screen.getByText(/반복: 1주마다 \(종료: 2024-03-21\)/)).toBeInTheDocument();
  });

  it('검색어 입력 시 제목이나 설명이 일치하는 이벤트만 필터링되어 표시된다', async () => {
    const { user } = setup(<EventList {...mockProps} />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀');

    expect(screen.getByText('팀 미팅')).toBeInTheDocument();
    expect(screen.queryByText('점심 약속')).not.toBeInTheDocument();
  });

  it('검색 결과가 없을 경우 적절한 메시지가 표시된다', async () => {
    const { user } = setup(<EventList {...mockProps} />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '존재하지 않는 일정');

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('삭제 버튼 클릭 시 onDelete 함수가 호출된다', async () => {
    const { user } = setup(<EventList {...mockProps} />);

    const deleteButtons = screen.getAllByLabelText('Delete event');
    await user.click(deleteButtons[0]);

    expect(mockProps.onDelete).toHaveBeenCalledWith('1');
  });

  it('수정 버튼 클릭 시 onEdit 함수가 호출된다', async () => {
    const { user } = setup(<EventList {...mockProps} />);

    const editButtons = screen.getAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    expect(mockProps.onEdit).toHaveBeenCalledWith(mockEvents[0]);
  });

  it('각 이벤트의 시간 정보가 올바르게 표시된다', () => {
    setup(<EventList {...mockProps} />);

    expect(screen.getByText('10:00 - 11:00')).toBeInTheDocument();
    expect(screen.getByText('12:00 - 13:00')).toBeInTheDocument();
  });

  it('각 이벤트의 위치 정보가 올바르게 표시된다', () => {
    setup(<EventList {...mockProps} />);

    expect(screen.getByText('회의실 A')).toBeInTheDocument();
    expect(screen.getByText('식당')).toBeInTheDocument();
  });

  it('각 이벤트의 카테고리가 올바르게 표시된다', () => {
    setup(<EventList {...mockProps} />);

    expect(screen.getByText('카테고리: 업무')).toBeInTheDocument();
    expect(screen.getByText('카테고리: 개인')).toBeInTheDocument();
  });
});
