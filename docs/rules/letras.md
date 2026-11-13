# Letras rules

Letras is a daily letters challenge. You get 9 letters and you build the longest Spanish word you can with them. You only get one answer.

## The daily challenge

- The 9 letters are drawn from two weighted bags, one of vowels and one of consonants. Common letters like E, A, S or N come up more often than rare ones like Q, X or Z. K and W are not in the bags, and Ñ is.
- Each day has between 3 and 5 vowels, so there is always something to build.
- A letter can come up more than once, for example two A's.
- Everyone gets the same letters on the same day. The letters depend only on the date, so no server is needed.
- The day changes at midnight Madrid time (`Europe/Madrid`), wherever you are playing from.

## How to play

1. Tap the letters, or type them on your keyboard. Each one fills the next free slot of the board.
2. When you have your word, press **Enviar** (or Enter).

The rules for the word:

- **At least 3 letters.** The counter under the board shows how many you have, and "mínimo 3" until you get there.
- **Each letter is used once.** If a letter comes up twice, you can use it twice.
- **Accents do not matter.** CAMIÓN and CAMION are the same word. Ñ is its own letter, not an N.
- **It has to be in the dictionary.** The dictionary is the word list of [an-array-of-spanish-words](https://www.npmjs.com/package/an-array-of-spanish-words) (MIT), with every word of 3 to 9 letters. It includes plurals and verb forms, so POLICÍAS or LÁPICES count.

**Enviar** is only enabled when the word has at least 3 letters and uses the hint letters on the board (see [Pistas](#pistas-hints)). You only have one answer: if the word is not in the dictionary, it scores 0.

The dictionary is only downloaded when you open Letras. While it loads, the game shows "Cargando diccionario...".

## Pistas (hints)

The **Pista** button puts one letter of the longest word of the day in its slot on the board. You can use up to 3 hints a day.

- The longest word is the longest one in the dictionary that can be built with the day's letters. If there is more than one, the first in alphabetical order is used.
- The slots of the hints are random, but they are the same for every player on the same day, and a slot never gets two hints.
- Before each hint a message says what it costs and asks you to confirm. If you had written something, the message warns you that it will be erased. The letters of earlier hints stay.
- Your word has to reach every hint letter on the board. For example, with a hint in slot 5, a word of 4 letters can not be sent.
- The button is disabled when you have no hints left.

After your first hint, a second button appears next to it:

- **Quitar pistas** takes the hint letters off the board, so you can send a shorter word that does not use them. Your letters stay. The hints are still paid.
- **Ver pistas** puts them back. If you had written something, it asks first, because it will be erased.

A new hint also puts back the hint letters you took off.

## Buttons

- **Borrar letra** removes the last letter you wrote (also Backspace).
- **Borrar todo** removes all the letters you wrote. Hint letters stay.
- **Enviar** sends your word (also Enter).
- **Pista** gives a hint (see [Pistas](#pistas-hints)).
- **Quitar pistas / Ver pistas** takes the hint letters off the board or puts them back.
- **Volver a jugar** appears after sending. It starts again with the same letters, without hints.

## Score

| Word                          | Points                |
| ----------------------------- | --------------------: |
| Not in the dictionary         |                     0 |
| 3 to 8 letters                | 1 point per letter    |
| All 9 letters                 | 18 (double)           |

Each hint costs one point more than the one before: 1 point for the first, 2 for the second and 3 for the third (6 in total). The points are taken from the score of the word, and it never goes below 0. The result shows them as "−N por pistas".

## Worked example

These letters are made up for the example. They are not the letters of any real day.

Letters: `A` `L` `O` `P` `E` `C` `I` `A` `S`.

| Word        | Letters | Points        |
| ----------- | ------: | ------------: |
| PELO        |       4 |             4 |
| ESPACIO     |       7 |             7 |
| ALOPECIAS   |       9 | 18 (all nine) |
| CAPAS       |       5 |             5 (there are two A's) |
| PAPEL       |         | not allowed: there is only one P |

If the player used 2 hints (1 + 2 = 3 points) and then sent ALOPECIAS, the score would be 18 − 3 = **15 points**.
