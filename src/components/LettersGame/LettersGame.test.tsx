// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDailyLetters } from '../../domain/letras/challengeLetras';
import LettersGame from './LettersGame';

// The letters depend on today's date, so the tests fix the date.
const TODAY = new Date('2026-10-14T10:00:00Z');

let letters: Array<string>;

function letterButtons() {
    return within(screen.getByRole('list', { name: 'Letras' })).getAllByRole('button');
}

function clickLetter(index: number) {
    fireEvent.click(letterButtons()[index]);
}

function clickButton(name: string) {
    fireEvent.click(screen.getByRole('button', { name }));
}

function shownWord() {
    return screen.getByRole('status', { name: 'Tu palabra' }).textContent;
}

function isDisabled(button: HTMLElement) {
    return (button as HTMLButtonElement).disabled;
}

describe('LettersGame', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(TODAY);
        letters = getDailyLetters(TODAY);
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    it("shows today's 9 letters", () => {
        render(<LettersGame />);

        expect(letterButtons().map((button) => button.textContent)).toEqual(letters);
    });

    it('starts with an empty word', () => {
        render(<LettersGame />);

        expect(shownWord()).toBe('');
    });

    it('adds the clicked letters to the word, in order', () => {
        render(<LettersGame />);

        clickLetter(2);
        clickLetter(0);
        clickLetter(5);

        expect(shownWord()).toBe(letters[2] + letters[0] + letters[5]);
    });

    it('disables a letter once it is used, and only that one', () => {
        render(<LettersGame />);

        clickLetter(3);

        expect(isDisabled(letterButtons()[3])).toBe(true);
        expect(letterButtons().filter(isDisabled)).toHaveLength(1);
    });

    it('removes the last letter and makes it available again', () => {
        render(<LettersGame />);
        clickLetter(0);
        clickLetter(1);

        clickButton('Borrar letra');

        expect(shownWord()).toBe(letters[0]);
        expect(isDisabled(letterButtons()[1])).toBe(false);
    });

    it('clears the whole word', () => {
        render(<LettersGame />);
        clickLetter(0);
        clickLetter(1);

        clickButton('Borrar todo');

        expect(shownWord()).toBe('');
        expect(letterButtons().some(isDisabled)).toBe(false);
    });

    it('disables the delete buttons while the word is empty', () => {
        render(<LettersGame />);

        expect(isDisabled(screen.getByRole('button', { name: 'Borrar letra' }))).toBe(true);
        expect(isDisabled(screen.getByRole('button', { name: 'Borrar todo' }))).toBe(true);

        clickLetter(0);

        expect(isDisabled(screen.getByRole('button', { name: 'Borrar letra' }))).toBe(false);
        expect(isDisabled(screen.getByRole('button', { name: 'Borrar todo' }))).toBe(false);
    });
});
