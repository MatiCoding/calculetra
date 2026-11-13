// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDailyLetters } from '../../domain/letras/challengeLetras';
import { getHintPositions } from '../../domain/letras/hintsLetras';
import { fakeDialog } from '../../test/fakeDialog';
import LettersGame from './LettersGame';

// The letters depend on today's date, so the tests fix the date.
const TODAY = new Date('2026-10-14T10:00:00Z');

let letters: Array<string>;

// Renders the game with a fake dictionary, and waits until it is loaded and the letters stop spinning.
async function renderGame(words: Array<string> = []) {
    render(<LettersGame loadWords={async () => new Set(words)} />);
    await waitFor(() => expect(screen.queryByText('Cargando diccionario...')).toBeNull());
    finishAnimations();
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

function board() {
    return screen.getByRole('status', { name: 'Tu palabra' });
}

// The letter in each of the 9 slots, '' for an empty slot. The "+1" is not part of the letter.
function slotLetters() {
    return within(board())
        .getAllByTestId('slot')
        .map((slot) => slot.firstElementChild?.textContent ?? '');
}

function shownWord() {
    return slotLetters().join('');
}

function counter() {
    return screen.getByTestId('counter').textContent;
}

// Lets every spin, hop, "+1" and point count finish.
function finishAnimations() {
    act(() => {
        vi.advanceTimersByTime(5000);
    });
}

// Sends the word and waits until the result is shown.
function send() {
    clickButton('Enviar');
    finishAnimations();
}

function isDisabled(element: HTMLElement) {
    return (element as HTMLButtonElement).disabled;
}

// The lines of the result card, in order: heading, points, "N puntos con WORD" and the countdown.
function resultLines() {
    const result = screen.getByRole('region', { name: 'Resultado' });
    return Array.from(result.querySelectorAll('p')).map((p) => p.textContent);
}

describe('LettersGame', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'], shouldAdvanceTime: true });
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

    it('does not keep the focus on the delete buttons after a mouse click', async () => {
        await renderGame();
        clickLetters(0, 1);

        expect(fireEvent.mouseDown(button('Borrar letra'))).toBe(false);
        expect(fireEvent.mouseDown(button('Borrar todo'))).toBe(false);
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

    describe('spinning the letters', () => {
        it('disables every letter while they spin', () => {
            render(<LettersGame loadWords={async () => new Set()} />);

            expect(letterButtons().every(isDisabled)).toBe(true);
        });

        it('names each key with its letter while it spins', () => {
            render(<LettersGame loadWords={async () => new Set()} />);

            expect(letterButtons().map((b) => b.getAttribute('aria-label'))).toEqual(letters);
        });

        it('stops the keys from left to right', () => {
            render(<LettersGame loadWords={async () => new Set()} />);

            act(() => {
                vi.advanceTimersByTime(700);
            });

            expect(letterButtons()[0].textContent).toBe(letters[0]);
            expect(letterButtons()[8].textContent).not.toBe(letters[8]);
        });

        it('ignores the keyboard while they spin', () => {
            render(<LettersGame loadWords={async () => new Set()} />);

            fireEvent.keyDown(window, { key: letters[0] });

            expect(shownWord()).toBe('');
        });

        it('enables the letters once they stop', async () => {
            await renderGame();

            expect(letterButtons().some(isDisabled)).toBe(false);
        });
    });

    describe('entrance from the home page', () => {
        function magnets() {
            return screen.queryAllByTestId('intro-magnet');
        }

        it('has no blue circles by default', () => {
            render(<LettersGame loadWords={async () => new Set()} />);

            expect(magnets()).toHaveLength(0);
        });

        it('puts one blue circle on each key, each one a bit later than the one before', () => {
            render(<LettersGame loadWords={async () => new Set()} intro />);

            expect(magnets().map((magnet) => magnet.style.animationDelay))
                .toEqual(['0ms', '40ms', '80ms', '120ms', '160ms', '200ms', '240ms', '280ms', '320ms']);
        });

        it('removes the circles when the entrance ends', () => {
            render(<LettersGame loadWords={async () => new Set()} intro />);

            act(() => {
                vi.advanceTimersByTime(1069);
            });
            expect(magnets()).toHaveLength(9);

            act(() => {
                vi.advanceTimersByTime(1);
            });
            expect(magnets()).toHaveLength(0);
        });

        it('starts spinning the keys only when the entrance ends', () => {
            render(<LettersGame loadWords={async () => new Set()} intro />);
            act(() => {
                vi.advanceTimersByTime(1070);
            });

            act(() => {
                vi.advanceTimersByTime(649);
            });
            expect(letterButtons()[0].textContent).not.toBe(letters[0]);

            act(() => {
                vi.advanceTimersByTime(1);
            });
            expect(letterButtons()[0].textContent).toBe(letters[0]);
        });
    });

    describe('board', () => {
        it('shows 9 empty slots at the start', async () => {
            await renderGame();

            expect(slotLetters()).toEqual(['', '', '', '', '', '', '', '', '']);
        });

        it('puts each picked letter in the next empty slot', async () => {
            await renderGame();

            clickLetters(4, 1);

            expect(slotLetters()).toEqual([letters[4], letters[1], '', '', '', '', '', '', '']);
        });

        it('empties the slots from the right when removing letters', async () => {
            await renderGame();
            clickLetters(0, 1, 2);

            clickButton('Borrar letra');
            expect(slotLetters()).toEqual([letters[0], letters[1], '', '', '', '', '', '', '']);

            clickButton('Borrar todo');
            expect(slotLetters()).toEqual(['', '', '', '', '', '', '', '', '']);
        });

        it('starts in the playing state', async () => {
            await renderGame();

            expect(board().dataset.status).toBe('playing');
        });
    });

    describe('counter', () => {
        it('is empty while there are no letters', async () => {
            await renderGame();

            expect(counter()).toBe('');
        });

        it('shows the minimum while the word is too short', async () => {
            await renderGame();

            clickLetter(0);
            expect(counter()).toBe('1 letra · mínimo 3');

            clickLetter(1);
            expect(counter()).toBe('2 letras · mínimo 3');
        });

        it('hides the minimum once the word is long enough', async () => {
            await renderGame();

            clickLetters(0, 1, 2, 3);

            expect(counter()).toBe('4 letras');
        });
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

            send();

            expect(resultLines().slice(0, 3)).toEqual(['¡Vale!', '4', `4 puntos con ${word}`]);
        });

        it('gives 18 points for a word with all 9 letters', async () => {
            await renderGame([letters.join('')]);
            clickLetters(0, 1, 2, 3, 4, 5, 6, 7, 8);

            send();

            expect(resultLines().slice(0, 3)).toEqual(['¡Las nueve!', '18', `18 puntos con ${letters.join('')}`]);
        });

        it('gives 0 points for a word that is not in the dictionary', async () => {
            await renderGame([]);
            clickLetters(0, 1, 2);

            send();

            expect(resultLines().slice(0, 3)).toEqual(['No está en el diccionario', '0', `0 puntos con ${letters.slice(0, 3).join('')}`]);
        });

        it('ends the game after sending: every button is disabled', async () => {
            await renderGame([]);
            clickLetters(0, 1, 2);

            clickButton('Enviar');

            expect(screen.getAllByRole('button').every(isDisabled)).toBe(true);
        });

        it('hides the letters, the buttons and the counter once the result is shown', async () => {
            await renderGame([]);
            clickLetters(0, 1, 2);

            send();

            expect(screen.queryByRole('list', { name: 'Letras' })).toBeNull();
            expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['Volver a jugar']);
            expect(screen.queryByTestId('counter')).toBeNull();
        });

        it('plays again from the start with the same letters', async () => {
            await renderGame([]);
            clickLetters(0, 1, 2);
            send();

            clickButton('Volver a jugar');

            expect(screen.queryByRole('region', { name: 'Resultado' })).toBeNull();
            expect(board().dataset.status).toBe('playing');
            expect(shownWord()).toBe('');
            expect(counter()).toBe('');
        });

        it('spins the letters again when playing again', async () => {
            await renderGame([]);
            clickLetters(0, 1, 2);
            send();

            clickButton('Volver a jugar');

            expect(letterButtons().every(isDisabled)).toBe(true);
            finishAnimations();
            expect(letterButtons().map((b) => b.textContent)).toEqual(letters);
            expect(letterButtons().some(isDisabled)).toBe(false);
        });

        it('shows how long until the next letters', async () => {
            await renderGame([]);
            clickLetters(0, 1, 2);

            send();

            expect(resultLines()[3]).toMatch(/^Nuevas letras en \d{2}:\d{2}:\d{2}$/);
        });

        it('waits for the tiles to hop before showing the result', async () => {
            const word = letters.slice(0, 3).join('');
            await renderGame([word]);
            clickLetters(0, 1, 2);

            clickButton('Enviar');

            expect(screen.queryByRole('region', { name: 'Resultado' })).toBeNull();
            finishAnimations();
            expect(screen.getByRole('region', { name: 'Resultado' })).toBeTruthy();
        });

        it('marks a valid word and counts the points up', async () => {
            const word = letters.slice(0, 4).join('');
            await renderGame([word]);
            clickLetters(0, 1, 2, 3);

            clickButton('Enviar');

            expect(board().dataset.status).toBe('valid');
            expect(counter()).toBe('0 puntos');
            // 4 points, one every 150 ms, before the result appears.
            act(() => {
                vi.advanceTimersByTime(600);
            });
            expect(counter()).toBe('4 puntos');
        });

        it('keeps the word in the slots after sending', async () => {
            const word = letters.slice(0, 4).join('');
            await renderGame([word]);
            clickLetters(0, 1, 2, 3);

            send();

            expect(shownWord()).toBe(word);
        });

        it('marks a word with all 9 letters', async () => {
            await renderGame([letters.join('')]);
            clickLetters(0, 1, 2, 3, 4, 5, 6, 7, 8);

            clickButton('Enviar');
            // 18 points, one every 75 ms, before the result appears.
            act(() => {
                vi.advanceTimersByTime(1350);
            });

            expect(board().dataset.status).toBe('full');
            expect(counter()).toBe('18 puntos');
        });

        it('marks a word that is not in the dictionary', async () => {
            await renderGame([]);
            clickLetters(0, 1, 2);

            clickButton('Enviar');

            expect(board().dataset.status).toBe('invalid');
            expect(counter()).toBe('No está en el diccionario');
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
            finishAnimations();
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

    describe('keyboard', () => {
        function press(key: string, target: Window | HTMLElement = window) {
            fireEvent.keyDown(target, { key });
        }

        it('types the letters of the day', async () => {
            await renderGame();

            press(letters[4].toLowerCase());
            press(letters[0]);

            expect(shownWord()).toBe(letters[4] + letters[0]);
        });

        it('ignores letters that are not available and other keys', async () => {
            await renderGame();
            const missing = 'ABCDEFGHIJLMNÑOPQRSTUVXYZ'.split('').find((l) => !letters.includes(l))!;

            press(missing);
            press('1');
            press('Shift');

            expect(shownWord()).toBe('');
        });

        it('ignores shortcuts like Ctrl+R', async () => {
            await renderGame();

            fireEvent.keyDown(window, { key: letters[0], ctrlKey: true });

            expect(shownWord()).toBe('');
        });

        it('removes the last letter with Backspace', async () => {
            await renderGame();
            press(letters[0]);
            press(letters[1]);

            press('Backspace');

            expect(shownWord()).toBe(letters[0]);
        });

        it('sends the word with Enter', async () => {
            const word = letters.slice(0, 3).join('');
            await renderGame([word]);
            letters.slice(0, 3).forEach((letter) => press(letter));

            press('Enter');
            finishAnimations();

            expect(resultLines().slice(0, 3)).toEqual(['¡Vale!', '3', `3 puntos con ${word}`]);
        });

        it('does not send with Enter while the word is too short', async () => {
            await renderGame();
            press(letters[0]);

            press('Enter');

            expect(screen.queryByRole('region', { name: 'Resultado' })).toBeNull();
        });

        it('does not send when Enter is pressed on a focused button', async () => {
            await renderGame();
            clickLetters(0, 1, 2);

            press('Enter', button('Borrar todo'));

            expect(screen.queryByRole('region', { name: 'Resultado' })).toBeNull();
        });
    });

    describe('hints', () => {
        // The fake dictionary only has one word: the first 5 letters of the day, so it is the longest one.
        let longest: string;
        let positions: Array<number>;

        beforeAll(fakeDialog);

        beforeEach(() => {
            longest = letters.slice(0, 5).join('');
            positions = getHintPositions(TODAY, longest.length);
        });

        function hintButton() {
            return screen.getByRole('button', { name: /Pista/ });
        }

        function dialog() {
            return screen.queryByRole('dialog');
        }

        // Clicks "Pista" and accepts the dialog.
        function askHint() {
            fireEvent.click(hintButton());
            clickButton('Usar pista');
        }

        it('shows 3 hints left', async () => {
            await renderGame([longest]);

            expect(hintButton().textContent).toContain('quedan 3');
        });

        it('asks first, saying what the hint costs', async () => {
            await renderGame([longest]);

            fireEvent.click(hintButton());

            expect(dialog()?.textContent).toContain('¿Usar una pista? Te restará 1 punto.');
            expect(slotLetters().every((letter) => letter === '')).toBe(true);
        });

        it('makes each hint cost one point more', async () => {
            await renderGame([longest]);
            askHint();

            fireEvent.click(hintButton());

            expect(dialog()?.textContent).toContain('Te restará 2 puntos.');
        });

        it('does nothing when the player cancels', async () => {
            await renderGame([longest]);

            fireEvent.click(hintButton());
            clickButton('Cancelar');

            expect(dialog()).toBeNull();
            expect(slotLetters().every((letter) => letter === '')).toBe(true);
            expect(hintButton().textContent).toContain('quedan 3');
        });

        it('only warns about erasing when there are letters written', async () => {
            await renderGame([longest]);

            fireEvent.click(hintButton());

            expect(dialog()?.textContent).not.toContain('Se borrará lo que has escrito.');
        });

        it('warns that the written letters will be erased, and erases them', async () => {
            await renderGame([longest]);
            clickLetters(0, 1);

            fireEvent.click(hintButton());
            expect(dialog()?.textContent).toContain('Se borrará lo que has escrito.');
            clickButton('Usar pista');

            const expected = Array<string>(9).fill('');
            expected[positions[0]] = longest[positions[0]];
            expect(slotLetters()).toEqual(expected);
        });

        it('ignores the keyboard while the dialog is open', async () => {
            await renderGame([longest]);

            fireEvent.click(hintButton());
            fireEvent.keyDown(window, { key: letters[0] });

            expect(shownWord()).toBe('');
        });

        it('puts a letter of the longest word in its slot', async () => {
            await renderGame([longest]);

            askHint();

            const expected = Array<string>(9).fill('');
            expected[positions[0]] = longest[positions[0]];
            expect(slotLetters()).toEqual(expected);
            expect(hintButton().textContent).toContain('quedan 2');
        });

        it('marks the hint letter as a hint and disables its key', async () => {
            await renderGame([longest]);

            askHint();

            const slot = within(board()).getAllByTestId('slot')[positions[0]];
            expect(slot.firstElementChild?.getAttribute('data-hint')).toBe('true');
            expect(letterButtons().filter(isDisabled)).toHaveLength(1);
        });

        it('fills the other slots around the hint', async () => {
            await renderGame([longest]);
            askHint();

            // The free keys, in order, fill the free slots in order.
            const free = letterButtons().map((_, index) => index).filter((index) => !isDisabled(letterButtons()[index]));
            clickLetters(...free.slice(0, 3));

            expect(slotLetters().filter((letter) => letter !== '')).toHaveLength(4);
            expect(slotLetters()[positions[0]]).toBe(longest[positions[0]]);
        });

        it('cannot delete a hint letter', async () => {
            await renderGame([longest]);

            askHint();

            expect(isDisabled(button('Borrar letra'))).toBe(true);
            expect(isDisabled(button('Borrar todo'))).toBe(true);
        });

        it('gives 3 hints at most, each one in a different slot', async () => {
            await renderGame([longest]);

            askHint();
            askHint();
            askHint();

            expect(slotLetters().filter((letter) => letter !== '')).toHaveLength(3);
            expect(isDisabled(hintButton())).toBe(true);
            expect(hintButton().textContent).toContain('quedan 0');
        });

        it('only shows the button to take the hints off once there is a hint', async () => {
            await renderGame([longest]);

            expect(screen.queryByRole('button', { name: 'Quitar pistas' })).toBeNull();
            askHint();
            expect(button('Quitar pistas')).toBeTruthy();
        });

        it('takes the hint letters off the board and puts them back', async () => {
            await renderGame([longest]);
            askHint();

            clickButton('Quitar pistas');

            expect(shownWord()).toBe('');
            expect(letterButtons().some(isDisabled)).toBe(false);

            clickButton('Ver pistas');

            expect(slotLetters()[positions[0]]).toBe(longest[positions[0]]);
            expect(letterButtons().filter(isDisabled)).toHaveLength(1);
        });

        it('asks before putting the hints back over written letters', async () => {
            await renderGame([longest]);
            askHint();
            clickButton('Quitar pistas');
            clickLetters(0, 1);

            clickButton('Ver pistas');
            expect(dialog()?.textContent).toContain('Se borrará lo que has escrito.');
            clickButton('Poner pistas');

            expect(slotLetters().filter((letter) => letter !== '')).toEqual([longest[positions[0]]]);
        });

        it('does not give the hint back for free: the count stays the same', async () => {
            await renderGame([longest]);
            askHint();

            clickButton('Quitar pistas');

            expect(hintButton().textContent).toContain('quedan 2');
        });

        it('does not keep the focus on the hint buttons after a mouse click, so Enter sends the word', async () => {
            await renderGame([longest]);
            askHint();

            // fireEvent returns false when the component called preventDefault().
            expect(fireEvent.mouseDown(hintButton())).toBe(false);
            expect(fireEvent.mouseDown(button('Quitar pistas'))).toBe(false);
        });

        it('starts again without hints when playing again', async () => {
            await renderGame([longest]);
            askHint();
            // Fills every free slot, so the word reaches the hint and can be sent.
            const free = letterButtons().map((_, index) => index).filter((index) => !isDisabled(letterButtons()[index]));
            clickLetters(...free);
            send();

            clickButton('Volver a jugar');
            finishAnimations();

            expect(slotLetters().every((letter) => letter === '')).toBe(true);
            expect(hintButton().textContent).toContain('quedan 3');
        });

        it('tells screen readers which letter the hint gave and where', async () => {
            await renderGame([longest]);

            askHint();

            const letter = longest[positions[0]];
            expect(screen.getByText(`Pista: ${letter} en la casilla ${positions[0] + 1}`).getAttribute('role')).toBe('status');
        });

        it('shows the points taken away for hints in the result', async () => {
            await renderGame([longest]);
            askHint();
            askHint();
            // Fills every free slot, so the word reaches the hints and can be sent.
            const free = letterButtons().map((_, index) => index).filter((index) => !isDisabled(letterButtons()[index]));
            clickLetters(...free);
            send();

            expect(screen.getByText('-3 por pistas')).toBeTruthy();
        });

        it('does not talk about hints in the result when none were used', async () => {
            await renderGame([longest]);
            clickLetters(0, 1, 2);
            send();

            expect(screen.queryByText(/por pistas/)).toBeNull();
        });

        it('cannot ask for a hint while the dictionary is loading', () => {
            render(<LettersGame loadWords={() => new Promise(() => {})} />);
            finishAnimations();

            expect(isDisabled(hintButton())).toBe(true);
        });

        it('cannot ask for a hint when no word can be made', async () => {
            await renderGame([]);

            expect(isDisabled(hintButton())).toBe(true);
        });
    });    
});
