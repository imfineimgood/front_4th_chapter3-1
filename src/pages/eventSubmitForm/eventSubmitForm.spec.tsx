import { screen, within } from '@testing-library/react';

import { EventSubmitForm } from './EventSubmitForm';
import { setup } from '../../__tests__/medium.integration.spec';

describe('EventSubmitForm', () => {
  const mockProps = {
    addOrUpdateEvent: vi.fn(),
    title: '',
    setTitle: vi.fn(),
    date: '',
    setDate: vi.fn(),
    startTime: '',
    endTime: '',
    description: '',
    setDescription: vi.fn(),
    location: '',
    setLocation: vi.fn(),
    category: '',
    setCategory: vi.fn(),
    isRepeating: false,
    setIsRepeating: vi.fn(),
    repeatType: 'none' as const,
    setRepeatType: vi.fn(),
    repeatInterval: 1,
    setRepeatInterval: vi.fn(),
    repeatEndDate: '',
    setRepeatEndDate: vi.fn(),
    notificationTime: 10,
    setNotificationTime: vi.fn(),
    startTimeError: null,
    endTimeError: null,
    handleStartTimeChange: vi.fn(),
    handleEndTimeChange: vi.fn(),
    editingEvent: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('일정 추가 모드일 때 적절한 헤더와 버튼 텍스트를 보여준다', () => {
    setup(<EventSubmitForm {...mockProps} editingEvent={null} />);

    const addEventElements = screen.getByTestId('event-submit-button');
    expect(within(addEventElements).getByText('일정 추가')).toBeInTheDocument();
  });

  it('일정 수정 모드일 때 적절한 헤더와 버튼 텍스트를 보여준다', () => {
    setup(
      <EventSubmitForm
        {...mockProps}
        editingEvent={{ id: '1', ...mockProps, repeat: { type: 'none', interval: 0 } }}
      />
    );
    const addEventElements = screen.getByTestId('event-submit-button');
    expect(within(addEventElements).getByText('일정 수정')).toBeInTheDocument();
  });

  it('시작 시간 변경 시 handleStartTimeChange가 호출된다', async () => {
    const { user } = setup(<EventSubmitForm {...mockProps} />);

    await user.type(screen.getByLabelText('시작 시간'), '10:00');

    expect(mockProps.handleStartTimeChange).toHaveBeenCalled();
  });

  it('반복 설정 체크박스 클릭 시 관련 입력 필드들이 표시된다', async () => {
    const { user } = setup(<EventSubmitForm {...mockProps} />);

    await user.click(screen.getByLabelText('반복 일정'));

    expect(mockProps.setIsRepeating).toHaveBeenCalledWith(true);
  });

  it('알림 설정 변경 시 setNotificationTime이 호출된다', async () => {
    const { user } = setup(<EventSubmitForm {...mockProps} />);

    await user.selectOptions(screen.getByLabelText('알림 설정'), '60');

    expect(mockProps.setNotificationTime).toHaveBeenCalledWith(60);
  });

  it('시간 에러가 있을 때 툴팁이 표시된다', () => {
    setup(
      <EventSubmitForm
        {...mockProps}
        startTimeError="시작 시간 에러"
        endTimeError="종료 시간 에러"
      />
    );

    expect(screen.getByText('시작 시간 에러')).toBeInTheDocument();
    expect(screen.getByText('종료 시간 에러')).toBeInTheDocument();
  });

  it('제출 버튼 클릭 시 addOrUpdateEvent가 호출된다', async () => {
    const { user } = setup(<EventSubmitForm {...mockProps} />);

    await user.click(screen.getByTestId('event-submit-button'));

    expect(mockProps.addOrUpdateEvent).toHaveBeenCalled();
  });

  it('필수 필드를 모두 입력했을 때 일정이 정상적으로 추가된다', async () => {
    const { user } = setup(<EventSubmitForm {...mockProps} />);

    await user.type(screen.getByLabelText('제목'), '테스트 일정');
    await user.type(screen.getByLabelText('날짜'), '2024-02-20');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.type(screen.getByLabelText('설명'), '테스트 설명');
    await user.type(screen.getByLabelText('위치'), '테스트 장소');
    await user.selectOptions(screen.getByLabelText('카테고리'), '업무');

    await user.click(screen.getByTestId('event-submit-button'));

    expect(mockProps.addOrUpdateEvent).toHaveBeenCalled();
  });
});
