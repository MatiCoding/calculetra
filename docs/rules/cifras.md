# Cifras rules

Cifras is a daily numbers challenge. You get 6 numbers and a target, and you combine the numbers with `+`, `−`, `×` and `÷` to reach the target or get as close as possible.

## The daily challenge

- The 6 numbers are drawn from a bag of 14 tiles: the numbers 1 to 10 twice each, plus 25, 50, 75 and 100 once each. A tile cannot be drawn twice, so the six numbers are always different.
- The target is a whole number between 101 and 999 (both included).
- Everyone gets the same challenge on the same day. The challenge depends only on the date, so no server is needed.
- The day changes at midnight Madrid time (`Europe/Madrid`), wherever you are playing from.
- Not every challenge can be solved exactly. In our tests about 99% of them can. When the target cannot be reached, getting close still scores points.

## How to play

1. Pick a number, then an operator, then a second number.
2. The result replaces both numbers on the board and can be used in later operations.

The rules for each operation:

- **Each number is used once.** Once a number is part of an operation it leaves the board. You do not have to use all of them.
- **Order matters.** The first number you pick goes on the left: picking 10, `−`, 3 gives `10 − 3 = 7`, but picking 3, `−`, 10 is rejected.
- **Only positive results.** A subtraction that gives 0 or less is rejected.
- **Only exact divisions.** `50 ÷ 2 = 25` is allowed. `50 ÷ 3` is rejected.

When an operation is rejected, the board does not change, an error message is shown and the selection is cleared.

Picking the selected number again deselects it.

## Buttons

- **Deshacer (Undo)** removes the last operation and puts its two numbers back on the board. You can undo step by step back to the start.
- **Reiniciar (Reset)** goes back to the original 6 numbers and clears all operations. It works even after the game has finished.
- **Terminar (Finish)** ends the game with the numbers you have.

## End of the game

The game ends when:

- you reach the target exactly (it finishes on its own), or
- you press **Terminar**.

Once the game has finished you cannot undo or keep playing. You can only reset.

> **Not implemented yet:** the game does not finish on its own when only one number is left on the board. You have to press **Terminar**. This is planned for a future version.

### Which number counts

Only the numbers that are **still on the board** when the game ends count, whether they are results or original numbers you did not use. A result you already used in another operation no longer counts.

The number closest to the target is your result. If two numbers are equally close, the **smaller** one counts (for a target of 433, between 428 and 438 the result is 428).

## Score

| Distance to the target | Points |
| ---------------------- | -----: |
| 0 (exact)              |     10 |
| 1 to 5                 |      7 |
| 6 to 10                |      5 |
| more than 10           |      0 |

## Worked example

This challenge is made up for the example. It is not the challenge of any real day.

Numbers: `75` `50` `8` `6` `3` `2`. Target: **433**.

| Step | Operation      | Board after the step     |
| ---- | -------------- | ------------------------ |
| 1    | `75 × 6 = 450` | 50, 8, 3, 2, **450**     |
| 2    | `50 ÷ 2 = 25`  | 8, 3, 450, **25**        |
| 3    | `450 − 25 = 425` | 8, 3, **425**          |
| 4    | `425 + 8 = 433` | 3, **433**              |

Step 4 reaches 433, so the game finishes on its own: distance 0, **10 points**. The `3` was never used, and that is fine.

Some moves that would have been rejected along the way:

- `50 ÷ 3`: the division is not exact.
- `25 − 450` (picking 25 first): the result would be negative.

If the player had pressed **Terminar** after step 3, the board would be `8`, `3`, `425`. The closest number to 433 is 425, at a distance of 8, so the score would be **5 points**.
