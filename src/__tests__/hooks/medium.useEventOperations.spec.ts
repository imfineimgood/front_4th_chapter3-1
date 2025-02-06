import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?
const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

describe('useEventOperations', () => {
  beforeEach(() => {
    toastFn.mockClear();
  });

  it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.fetchEvents();
    });
    expect(result.current.events).toBeDefined();
    expect(result.current.events.length).toBeGreaterThan(0);
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    setupMockHandlerCreation();
    const { result } = renderHook(() => useEventOperations(false));

    const newEvent: Event = {
      id: '1',
      title: '새로운 회의',
      date: '2025-02-20',
      startTime: '14:00',
      endTime: '15:00',
      description: '신규 프로젝트 회의',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(newEvent);
    });

    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정이 추가되었습니다.',
        status: 'success',
      })
    );
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    setupMockHandlerUpdating();
    const { result } = renderHook(() => useEventOperations(true));

    const updatedEvent: Event = {
      id: '1',
      title: '팀 회의',
      date: '2025-02-20',
      startTime: '14:00',
      endTime: '15:00',
      description: '신규 프로젝트 회의',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    expect(result.current.events).toEqual(
      expect.arrayContaining([expect.objectContaining(updatedEvent)])
    );

    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정이 수정되었습니다.',
        status: 'success',
      })
    );
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    setupMockHandlerDeletion();
    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.fetchEvents();
    });

    expect(result.current.events).toHaveLength(1);
    await act(async () => {
      await result.current.deleteEvent('1');
    });
    expect(result.current.events).toHaveLength(0);

    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정이 삭제되었습니다.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      })
    );
  });

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(http.get('/api/events', () => new HttpResponse(null, { status: 500 })));

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.fetchEvents();
    });

    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '이벤트 로딩 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    );
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    setupMockHandlerUpdating();
    server.use(http.put('/api/events/2', () => new HttpResponse(null, { status: 404 })));

    const { result } = renderHook(() => useEventOperations(true));
    await act(async () => {
      await result.current.saveEvent({
        id: '2',
        title: '일정 저장 실패',
        date: '',
        startTime: '',
        endTime: '',
        description: '',
        location: '',
        category: '',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      });
    });

    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 저장 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    );
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    setupMockHandlerDeletion();
    server.use(http.delete('/api/events/:id', () => new HttpResponse(null, { status: 500 })));

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.fetchEvents();
    });
    expect(result.current.events).toHaveLength(1);
    await act(async () => {
      await result.current.deleteEvent('1');
    });

    expect(result.current.events).toHaveLength(1);
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 삭제 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    );
  });
});
