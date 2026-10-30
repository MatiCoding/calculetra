// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDailyLetters } from '../../domain/letras/challengeLetras';
import LettersGame from './LettersGame';

// The letters depend on today's date, so the tests fix the date.
const TODAY = new Date('2026-10-14T10:00:00Z');

let letters: Array<string>;

// Renders the game with a fake dictionary and waits until it is loaded.
async function renderGame(words: Array<string> = []) {
    render(<LettersGame loadWords={async () => new Set(words)} />);
    await waitFor(() => expect(screen.queryByText('Cargando diccionario…')).toBeNull());
}

function letterButtons() {
    return within(screen.getByRole('list', { name: 'Letras' })).getAllByRole('button');
}

function clickLetter(index: number) {
    fireEvent.click(letterButtons()[index]);
}

function clickLetters(...indexes: Array<number>) {
    indexes.forEach(clickLetter);
}

function clickButton(name: string) {
    fireEvent.click(screen.getByRole('button', { name }));
}

function button(name: string) {
    return screen.getByRole('button', { name });
}

function shownWord() {
    return screen.getByRole('status', { name: 'Tu palabra' }).textContent;
}

function isDisabled(element: HTMLElement) {
    return (element as HTMLButtonElement).disabled;
}

// The values of the result, in order: word, valid, letters, points.
function resultValues() {
    const result = screen.getByRole('region', { name: 'Resultado' });
    return Array.from(result.querySelectorAll('dd')).map((dd) => dd.textContent);
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

    it("shows today's 9 letters", async () => {
        await renderGame();

        expect(letterButtons().map((b) => b.textContent)).toEqual(letters);
    });

    it('starts with an empty word', async () => {
        await renderGame();

        expect(shownWord()).toBe('');
    });

    it('adds the clicked letters to the word, in order', async () => {
        await renderGame();

        clickLetters(2, 0, 5);

        expect(shownWord()).toBe(letters[2] + letters[0] + letters[5]);
    });

    it('disables a letter once it is used, and only that one', async () => {
        await renderGame();

        clickLetter(3);

        expect(isDisabled(letterButtons()[3])).toBe(true);
        expect(letterButtons().filter(isDisabled)).toHaveLength(1);
    });

    it('removes the last letter and makes it available again', async () => {
        await renderGame();
        clickLetters(0, 1);

        clickButton('Borrar letra');

        expect(shownWord()).toBe(letters[0]);
        expect(isDisabled(letterButtons()[1])).toBe(false);
    });

    it('clears the whole word', async () => {
        await renderGame();
        clickLetters(0, 1);

        clickButton('Borrar todo');

        expect(shownWord()).toBe('');
        expect(letterButtons().some(isDisabled)).toBe(false);
    });

    it('disables the delete buttons while the word is empty', async () => {
        await renderGame();

        expect(isDisabled(button('Borrar letra'))).toBe(true);
        expect(isDisabled(button('Borrar todo'))).toBe(true);

        clickLetter(0);

        expect(isDisabled(button('Borrar letra'))).toBe(false);
        expect(isDisabled(button('Borrar todo'))).toBe(false);
    });

    describe('sending the word', () => {
        it('cannot send a word shorter than 3 letters', async () => {
            await renderGame();

            clickLetters(0, 1);
            expect(isDisabled(button('Enviar'))).toBe(true);

            clickLetter(2);
            expect(isDisabled(button('Enviar'))).toBe(false);
        });

        it('shows the result of a word in the dictionary', async () => {
            const word = letters[0] + letters[1] + letters[2] + letters[3];
            await renderGame([word]);
            clickLetters(0, 1, 2, 3);

            clickButton('Enviar');

            expect(resultValues()).toEqual([word, 'Sí, está en el diccionario', '4', '4']);
        });

        it('gives 18 points for a word with all 9 letters', async () => {
            await renderGame([letters.join('')]);
            clickLetters(0, 1, 2, 3, 4, 5, 6, 7, 8);

            clickButton('Enviar');

            expect(resultValues()).toEqual([letters.join(''), 'Sí, está en el diccionario', '9', '18']);
        });

        it('gives 0 points for a word that is not in the dictionary', async () => {
            await renderGame([]);
            clickLetters(0, 1, 2);

            clickButton('Enviar');

            expect(resultValues()).toEqual([letters.slice(0, 3).join(''), 'No está en el diccionario', '3', '0']);
        });

        it('ends the game after sending: every button is disabled', async () => {
            await renderGame([]);
            clickLetters(0, 1, 2);

            clickButton('Enviar');

            expect(screen.getAllByRole('button').every(isDisabled)).toBe(true);
        });

        it('does not show a result before sending', async () => {
            await renderGame();

            expect(screen.queryByRole('region', { name: 'Resultado' })).toBeNull();
        });
    });

    describe('loading the dictionary', () => {
        it('cannot send while the dictionary is loading', () => {
            // A promise that never resolves: the dictionary never arrives.
            render(<LettersGame loadWords={() => new Promise(() => {})} />);
            clickLetters(0, 1, 2);

            expect(screen.getByText('Cargando diccionario...')).toBeTruthy();
            expect(isDisabled(button('Enviar'))).toBe(true);
        });

        it('shows an error when the dictionary cannot be loaded', async () => {
            render(<LettersGame loadWords={() => Promise.reject(new Error('404'))} />);

            expect((await screen.findByRole('alert')).textContent).toContain('No se ha podido cargar el diccionario');
            expect(isDisabled(button('Enviar'))).toBe(true);
        });
    });
});
