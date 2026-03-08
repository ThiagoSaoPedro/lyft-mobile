import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import ExecutionScreen from '../ExecutionScreen';
import { Alert } from 'react-native';

jest.mock('@expo/vector-icons', () => ({
    MaterialCommunityIcons: 'MaterialCommunityIcons'
}));

jest.spyOn(Alert, 'alert');

describe('ExecutionScreen', () => {
    let mockNavigation: any;

    beforeEach(() => {
        jest.useFakeTimers();
        mockNavigation = {
            goBack: jest.fn(),
            navigate: jest.fn(),
        };
        jest.clearAllMocks();
    });

    afterEach(() => {
        act(() => { jest.runOnlyPendingTimers(); });
        jest.useRealTimers();
    });

    it('starts with default workout and timer is 00:00, then starts workout', () => {
        const { getByTestId, getByText, queryByTestId } = render(
            <ExecutionScreen route={{ params: {} }} navigation={mockNavigation} />
        );

        expect(getByText('Pronto para iniciar?')).toBeTruthy();

        const startBtn = getByTestId('start-workout-btn');
        act(() => { fireEvent.press(startBtn); });

        const totalTimer = getByTestId('total-timer');
        expect(totalTimer.props.children).toBe('00:00');

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(totalTimer.props.children).toBe('00:05');

        act(() => { fireEvent.press(getByTestId('end-workout-btn')); });
    });

    it('toggles view modes (carousel vs list) and tests accordion', () => {
        const { getByTestId, queryByTestId, getByText } = render(
            <ExecutionScreen route={{ params: {} }} navigation={mockNavigation} />
        );

        act(() => { fireEvent.press(getByTestId('start-workout-btn')); });
        expect(queryByTestId('accordion-toggle-0')).toBeNull();

        act(() => { fireEvent.press(getByTestId('mode-list')); });

        const accordion0 = getByTestId('accordion-toggle-0');
        expect(accordion0).toBeTruthy();

        const accordion1 = getByTestId('accordion-toggle-1');
        act(() => { fireEvent.press(accordion1); });

        expect(getByTestId('check-btn-1-0')).toBeTruthy();
        act(() => { fireEvent.press(getByTestId('end-workout-btn')); });
    });

    it('handles set completion, triggers rest timer, and concludes workout', () => {
        const { getByTestId, getByText } = render(
            <ExecutionScreen route={{ params: {} }} navigation={mockNavigation} />
        );

        act(() => { fireEvent.press(getByTestId('start-workout-btn')); });

        const weightInput = getByTestId('weight-input-0-0');
        const repsInput = getByTestId('reps-input-0-0');
        const effortInput = getByTestId('effort-input-0-0');
        const checkBtn = getByTestId('check-btn-0-0');

        // Attempt empty check
        act(() => { fireEvent.press(checkBtn); });
        let restTimer = getByTestId('rest-timer');
        expect(restTimer.props.children).toEqual('--:--');

        // Fill data
        act(() => {
            fireEvent.changeText(weightInput, '40');
            fireEvent.changeText(repsInput, '10');
            fireEvent.changeText(effortInput, '8');
        });

        act(() => { fireEvent.press(checkBtn); });
        expect(restTimer.props.children).toEqual('01:00');

        act(() => { jest.advanceTimersByTime(20000); });
        expect(restTimer.props.children).toEqual('00:40');

        act(() => { fireEvent.press(getByTestId('end-workout-btn')); });

        expect(Alert.alert).toHaveBeenCalledWith(
            "Encerrar Treino",
            "Deseja finalizar o treino?",
            expect.any(Array)
        );
    });
});
