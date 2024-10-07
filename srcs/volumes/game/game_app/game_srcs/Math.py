from .Pong import Ball
from .Coord import Coordinates, Direction

def CollisionCirclePoint(point : Coordinates, ball : Ball) -> bool:
    d2 =  pow(point.x - Ball.position.x, 2) + pow(point.y - Ball.position.y, 2)
    if d2 > pow(ball.size, 2):
        return False
    else:
        return True

def CollisionCircleLine(A : Coordinates, B : Coordinates, ball : Ball):
    u = Direction(B.x - A.x, B.y - A.y)
    AC = Direction(ball.position.x - A.x, ball.position.y - A.y)
    num = abs(u.dx * AC.dy - u.y * AC.dx)
    den = pow(u.x * u .x + u.y * u.y, 0.5)
    CI = num / den
    if (CI < ball.size):
        return True
    else:
        return False

def CollisionCircleSegment(A : Coordinates, B : Coordinates, ball : Ball) -> bool:
    if CollisionCircleLine(A, B, ball) == False:
        return False
    pscal1 = (B.x - A.x) * (ball.position.x - A.x) + (B.y - A.y) * (ball.position.y - A.y)
    pscal2 = (A.x - B.x) * (ball.position.x - B.x) + (A.y - B.y) * (ball.position.y - B.y)
    if pscal1 >= 0 and pscal2 >= 0:
        return True
    elif CollisionCirclePoint(A,ball) == True:
        return True
    elif CollisionCirclePoint(B,ball) == True:
        return True
    return False

def ImpactProjection(A : Coordinates, B : Coordinates, C : Coordinates) -> Coordinates:
    u = Direction(B.x - A.x, B.y - A.y)
    AC = Direction(C.x - A.x, C.y - A.y)
    ti = (u.dx * AC.dx + u.dy * AC.dy) / (u.dx * u.dx + u.dy * u.dy)
    return Coordinates(int(A.x + ti * u.x), int(A.y + ti * u.y))

def GetNornale(A : Coordinates, B : Coordinates, C : Coordinates) -> Direction:
    u = Direction(B.x - A.x, B.y - A.y)
    AC = Direction(C.x - A.x, C.y - A.y)
    step = u.dx * AC.dy - u.y * AC.x
    N = Direction(-u.dy * step, u.dx * step)
    norme = pow(N.dx * N.dx + N.dy * N.dy, 0.5)
    return Direction(int(N.dx / norme), int(N.dy / norme))

def GetBounceDir(v : Direction, N : Direction) -> Direction:
    pscal = v.dx * N.dx + v.dy * N.dy
    v2 =  Direction(int(v.dx - 2 * pscal * N.dx), int(v.dy - 2 * pscal * N.dy))
    return v2
    

