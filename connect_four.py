from board import Board


def main() -> None:
    board = Board(6,7)
    board.start()
    # if board.put_disk(0,"X") == 0:
        # print("Couldn't put disk, game is over")
    print(board)
    return


if __name__ == "__main__":
    main()
